import { useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getIncidentEdges } from "../../utils/graphRelations";
import { EDGE_TYPE_LABEL } from "../../data/visualMappings";
import type { MemoryNode, MemoryEdge, MemoryEdgeType } from "../../types/graph";
import { deepseekChat } from "../../ai/deepseek";
import { t } from "../../i18n";

const EDGE_TYPES: MemoryEdgeType[] = [
  "related",
  "causes",
  "supports",
  "contradicts",
  "source",
  "similar",
  "extends",
];

interface Suggestion {
  targetId: string;
  type: MemoryEdgeType;
  reason: string;
}

/** AI 关系建议:只建议,用户点 Add 才真正连线 */
export default function AiSuggestRelations({ node }: { node: MemoryNode }) {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const addEdge = useGraphStore((s) => s.addEdge);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  const suggest = async () => {
    setLoading(true);
    setError("");
    setSuggestions(null);
    try {
      const connectedIds = new Set<string>();
      for (const e of getIncidentEdges(edges, node.id)) {
        connectedIds.add(e.source === node.id ? e.target : e.source);
      }
      const candidates = nodes.filter((n) => n.id !== node.id && !connectedIds.has(n.id));
      if (candidates.length === 0) {
        setError(t("ai.noCandidates"));
        return;
      }

      const system =
        "You suggest relationships between knowledge-graph nodes. " +
        "Allowed relation types: " + EDGE_TYPES.join(", ") + ". " +
        "Only use targetId values from the provided candidate list. " +
        "Return at most 5 of the most meaningful suggestions. " +
        'Reply ONLY as JSON: {"suggestions":[{"targetId":"...","type":"related","reason":"short reason"}]}';

      const focal = { title: node.title, type: node.type, content: node.content };
      const candidateList = candidates.map((candidate) => ({
        targetId: candidate.id,
        title: candidate.title,
        type: candidate.type,
      }));
      const user =
        "Focal node:\n" + JSON.stringify(focal) +
        "\n\nCandidate nodes:\n" + JSON.stringify(candidateList);

      const raw = await deepseekChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { json: true }
      );

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`AI returned invalid JSON: ${raw.slice(0, 200)}`);
      }

      const validIds = new Set(candidateList.map((candidate) => candidate.targetId));
      const cleaned: Suggestion[] = [];
      const list =
        parsed && typeof parsed === "object" && Array.isArray((parsed as { suggestions?: unknown }).suggestions)
          ? (parsed as { suggestions: unknown[] }).suggestions
          : [];
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const rec = item as Record<string, unknown>;
        const targetId = rec.targetId;
        const type = rec.type;
        const reason = rec.reason;
        if (
          typeof targetId === "string" &&
          validIds.has(targetId) &&
          typeof type === "string" &&
          (EDGE_TYPES as string[]).includes(type)
        ) {
          cleaned.push({
            targetId,
            type: type as MemoryEdgeType,
            reason: typeof reason === "string" ? reason : "",
          });
        }
      }
      setSuggestions(cleaned);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  };

  const accept = (s: Suggestion) => {
    const edge: MemoryEdge = {
      id: crypto.randomUUID(),
      source: node.id,
      target: s.targetId,
      type: s.type,
      strength: 3,
      createdAt: new Date().toISOString(),
    };
    addEdge(edge);
    setSuggestions((prev) => (prev ? prev.filter((x) => x !== s) : prev));
  };

  const titleOf = (id: string) => nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="ag-ai">
      <button type="button" className="ag-chip ag-ai-btn" onClick={suggest} disabled={loading}>
        {loading ? t("ai.suggesting") : t("ai.suggest")}
      </button>

      {error && <div className="ag-ai-error">{error}</div>}

      {suggestions && suggestions.length === 0 && !error && (
        <div className="ag-ai-empty">{t("ai.none")}</div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="ag-ai-list">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="ag-ai-item">
              <div className="ag-ai-item-main">
                <span className="ag-ai-type">{EDGE_TYPE_LABEL[suggestion.type]}</span>
                <span className="ag-ai-target">{titleOf(suggestion.targetId)}</span>
              </div>
              {suggestion.reason && <div className="ag-ai-reason">{suggestion.reason}</div>}
              <button type="button" className="ag-chip ag-ai-add" onClick={() => accept(suggestion)}>
                {t("ai.add")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
