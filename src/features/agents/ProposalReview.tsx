import { useMemo, useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import type { AgentProposal, ProposedRelation } from "../../agents/types";
import type { MemoryNodeType, Intensity } from "../../types/graph";
import { NODE_TYPES } from "../../types/graph";
import { TYPE_LABEL, EDGE_TYPE_LABEL } from "../../data/visualMappings";
import { createCapturedNode } from "../../utils/nodeFactory";
import { formatShort } from "../../utils/dateLabel";
import { t } from "../../i18n";

type NodeAction = "create" | "merge" | "reject";

interface EditableNode {
  tempId: string;
  title: string;
  content: string;
  type: MemoryNodeType;
  tags: string[];
  importance: Intensity;
  action: NodeAction;
  mergeCandidateId?: string;
  mergeCandidateTitle?: string;
  mergeCandidateDate?: string;
}

interface EditableRelation extends ProposedRelation {
  accepted: boolean;
}

export default function ProposalReview({
  proposal,
  onApplied,
  onCancel,
}: {
  proposal: AgentProposal;
  onApplied: () => void;
  onCancel: () => void;
}) {
  const allNodes = useGraphStore((s) => s.nodes);
  const addNode = useGraphStore((s) => s.addNode);
  const addEdge = useGraphStore((s) => s.addEdge);
  const updateNode = useGraphStore((s) => s.updateNode);

  const [nodes, setNodes] = useState<EditableNode[]>(() =>
    proposal.nodes.map((n) => ({
      tempId: n.tempId,
      title: n.title,
      content: n.content,
      type: n.type,
      tags: [...n.tags],
      importance: n.importance,
      action: n.mergeCandidateId ? "merge" : "create",
      mergeCandidateId: n.mergeCandidateId,
      mergeCandidateTitle: n.mergeCandidateTitle,
      mergeCandidateDate: n.mergeCandidateDate,
    }))
  );
  const [relations, setRelations] = useState<EditableRelation[]>(() =>
    proposal.relations.map((r) => ({ ...r, accepted: true }))
  );
  const [tagDraft, setTagDraft] = useState<Record<string, string>>({});

  const titleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of allNodes) m.set(n.id, n.title);
    return m;
  }, [allNodes]);

  const patchNode = (tempId: string, patch: Partial<EditableNode>) =>
    setNodes((prev) => prev.map((n) => (n.tempId === tempId ? { ...n, ...patch } : n)));

  const removeTag = (tempId: string, tag: string) =>
    setNodes((prev) =>
      prev.map((n) => (n.tempId === tempId ? { ...n, tags: n.tags.filter((x) => x !== tag) } : n))
    );

  const addTag = (tempId: string) => {
    const d = (tagDraft[tempId] ?? "").trim();
    if (!d) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.tempId === tempId && !n.tags.includes(d) ? { ...n, tags: [...n.tags, d] } : n
      )
    );
    setTagDraft((prev) => ({ ...prev, [tempId]: "" }));
  };

  const apply = () => {
    const realIdByTemp = new Map<string, string>();

    for (const n of nodes) {
      if (n.action === "reject") continue;
      if (n.action === "merge" && n.mergeCandidateId) {
        const target = allNodes.find((x) => x.id === n.mergeCandidateId);
        if (target) {
          const mergedTags = Array.from(new Set([...target.tags, ...n.tags]));
          const mergedContent = [target.content, n.content].filter(Boolean).join("\n\n");
          updateNode(target.id, { content: mergedContent, tags: mergedTags });
          realIdByTemp.set(n.tempId, target.id);
          continue;
        }
      }
      const created = createCapturedNode({
        title: n.title,
        content: n.content,
        type: n.type,
        tags: n.tags,
        importance: n.importance,
        status: "processed",
      });
      addNode(created);
      realIdByTemp.set(n.tempId, created.id);
    }

    for (const r of relations) {
      if (!r.accepted) continue;
      const sourceId = realIdByTemp.get(r.sourceTempId);
      if (!sourceId) continue;
      if (!allNodes.some((x) => x.id === r.targetId)) continue;
      addEdge({
        id: crypto.randomUUID(),
        source: sourceId,
        target: r.targetId,
        type: r.type,
        strength: 3,
        createdAt: new Date().toISOString(),
      });
    }

    onApplied();
  };

  const acceptedCount = nodes.filter((n) => n.action !== "reject").length;

  return (
    <div className="review">
      <div className="review-head">{t("review.title")}</div>

      <div className="review-section-title">{t("review.nodes")}</div>
      {nodes.map((n) => (
        <div key={n.tempId} className={`review-node${n.action === "reject" ? " is-rejected" : ""}`}>
          <input
            className="review-input"
            value={n.title}
            onChange={(e) => patchNode(n.tempId, { title: e.target.value })}
          />
          <textarea
            className="review-textarea"
            rows={2}
            value={n.content}
            onChange={(e) => patchNode(n.tempId, { content: e.target.value })}
          />
          <div className="review-row">
            <select
              className="review-select"
              value={n.type}
              onChange={(e) => patchNode(n.tempId, { type: e.target.value as MemoryNodeType })}
            >
              {NODE_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {TYPE_LABEL[tp]}
                </option>
              ))}
            </select>
            <select
              className="review-select"
              value={n.importance}
              onChange={(e) => patchNode(n.tempId, { importance: Number(e.target.value) as Intensity })}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  {t("review.importance", { value: v })}
                </option>
              ))}
            </select>
          </div>

          <div className="review-tags">
            {n.tags.map((tag) => (
              <button key={tag} type="button" className="review-tag" onClick={() => removeTag(n.tempId, tag)}>
                #{tag} ×
              </button>
            ))}
            <input
              className="review-tag-input"
              value={tagDraft[n.tempId] ?? ""}
              placeholder={t("review.addTag")}
              onChange={(e) => setTagDraft((p) => ({ ...p, [n.tempId]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(n.tempId);
                }
              }}
            />
          </div>

          <div className="review-actions">
            {n.mergeCandidateId && (
              <button
                type="button"
                className={`review-chip${n.action === "merge" ? " is-active" : ""}`}
                onClick={() => patchNode(n.tempId, { action: "merge" })}
              >
                {t("review.merge", { title: n.mergeCandidateTitle ?? "" })}
                {n.mergeCandidateDate ? ` · ${formatShort(n.mergeCandidateDate)}` : ""}
              </button>
            )}
            <button
              type="button"
              className={`review-chip${n.action === "create" ? " is-active" : ""}`}
              onClick={() => patchNode(n.tempId, { action: "create" })}
            >
              {t("review.create")}
            </button>
            <button
              type="button"
              className={`review-chip${n.action === "reject" ? " is-active" : ""}`}
              onClick={() => patchNode(n.tempId, { action: "reject" })}
            >
              {t("review.reject")}
            </button>
          </div>
        </div>
      ))}

      {relations.length > 0 && (
        <>
          <div className="review-section-title">{t("review.relations")}</div>
          {relations.map((r, i) => {
            const sourceNode = nodes.find((n) => n.tempId === r.sourceTempId);
            return (
              <label key={i} className="review-relation">
                <input
                  type="checkbox"
                  checked={r.accepted}
                  onChange={(e) =>
                    setRelations((prev) => prev.map((x, j) => (j === i ? { ...x, accepted: e.target.checked } : x)))
                  }
                />
                <span>
                  {(sourceNode?.title || "?")} — {EDGE_TYPE_LABEL[r.type]} → {titleById.get(r.targetId) ?? r.targetId}
                </span>
                {r.reason && <span className="review-relation-reason">{r.reason}</span>}
              </label>
            );
          })}
        </>
      )}

      <div className="review-footer">
        <button type="button" className="review-cancel" onClick={onCancel}>
          {t("review.cancel")}
        </button>
        <button type="button" className="review-apply" onClick={apply} disabled={acceptedCount === 0}>
          {t("review.apply", { count: acceptedCount })}
        </button>
      </div>
    </div>
  );
}
