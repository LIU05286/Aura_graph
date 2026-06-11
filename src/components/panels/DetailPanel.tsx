import { useMemo, useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getNodeById, getConnectedNodes, getIncidentEdges } from "../../utils/graphRelations";
import { EDGE_TYPE_LABEL, TYPE_LABEL } from "../../data/visualMappings";
import type { MemoryEdgeType, MemoryEdge } from "../../types/graph";
import TypeDot from "../ui/TypeDot";
import Stars from "../ui/Stars";
import Chip from "../ui/Chip";
import { t } from "../../i18n";
import AiSuggestRelations from "./AiSuggestRelations";
import AiSuggestTags from "./AiSuggestTags";
import RichText from "../ui/RichText";

/** 右侧详情:选中节点的内容、星级、星座、关联节点(可点击跳转) */
export default function DetailPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const deleteNode = useGraphStore((s) => s.deleteNode);
  const addEdge = useGraphStore((s) => s.addEdge);
  const deleteEdge = useGraphStore((s) => s.deleteEdge);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);
  const openEditNode = useGraphStore((s) => s.openEditNode);
  const [targetId, setTargetId] = useState("");
  const [edgeType, setEdgeType] = useState<MemoryEdgeType>("related");

  const node = useMemo(
    () => getNodeById(nodes, selectedNodeId),
    [nodes, selectedNodeId]
  );
  const connected = useMemo(
    () => (node ? getConnectedNodes(nodes, edges, node.id) : []),
    [node, nodes, edges]
  );
  const incidentEdges = useMemo(
    () => (node ? getIncidentEdges(edges, node.id) : []),
    [edges, node]
  );

  if (!node) return null;

  const pick = (id: string) => {
    selectNode(id);
    requestFocusNode(id);
  };

  return (
    <div className="ag-panel ag-right">
      <button className="ag-close" onClick={() => selectNode(null)} aria-label={t("detail.close")}>
        ×
      </button>

      <div className="ag-detail-type">
        <TypeDot type={node.type} />
        {TYPE_LABEL[node.type]}
      </div>
      <button type="button" className="ag-chip ag-detail-edit" onClick={() => openEditNode(node.id)}>
        {t("detail.edit")}
      </button>
      <h2 className="ag-detail-title">{node.title}</h2>
      <Stars value={node.importance} />
      <div className="ag-detail-meta">
        <span>{t("detail.created", { date: new Date(node.createdAt).toLocaleDateString() })}</span>
        <span>{t("detail.updated", { date: new Date(node.updatedAt).toLocaleDateString() })}</span>
      </div>
      {node.content.trim() !== "" && (
        <div className="ag-detail-content">
          <RichText text={node.content} />
        </div>
      )}

      <div className="ag-detail-block">
        <div className="ag-eyebrow">{t("detail.tags")}</div>
        {node.tags.length > 0 && (
          <div className="ag-chips">
            {node.tags.map((tag) => (
              <Chip key={tag} tag isStatic>
                #{tag}
              </Chip>
            ))}
          </div>
        )}
        <AiSuggestTags node={node} />
      </div>

      {connected.length > 0 && (
        <div className="ag-detail-block">
          <div className="ag-eyebrow">{t("detail.connected", { count: connected.length })}</div>
          <div className="ag-connected">
            {connected.map((n) => (
              <button key={n.id} className="ag-result" onClick={() => pick(n.id)}>
                <TypeDot type={n.type} />
                <span className="ag-result-title">{n.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ag-detail-block">
        <div className="ag-eyebrow">{t("detail.relations")}</div>
        <div className="ag-relations-form">
          <select
            className="ag-select"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">{t("detail.selectTarget")}</option>
            {nodes
              .filter((n) => n.id !== node.id)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
          </select>
          <select
            className="ag-select"
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value as MemoryEdgeType)}
          >
            {(Object.entries(EDGE_TYPE_LABEL) as [MemoryEdgeType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
          <button
            type="button"
            className="ag-chip"
            onClick={() => {
              if (!targetId) {
                window.alert(t("detail.alertSelectTarget"));
                return;
              }
              const edge: MemoryEdge = {
                id: crypto.randomUUID(),
                source: node.id,
                target: targetId,
                type: edgeType,
                strength: 3,
                createdAt: new Date().toISOString(),
              };
              addEdge(edge);
              setTargetId("");
            }}
          >
            {t("detail.addRelation")}
          </button>
        </div>

        <div className="ag-relation-list">
          {incidentEdges.map((edge) => {
            const otherId = edge.source === node.id ? edge.target : edge.source;
            const otherNode = getNodeById(nodes, otherId);
            if (!otherNode) return null;

            return (
              <div key={edge.id} className="ag-relation-row">
                <button type="button" className="ag-result ag-relation-item" onClick={() => pick(otherNode.id)}>
                  <span className="ag-result-title">
                    {EDGE_TYPE_LABEL[edge.type]} · {otherNode.title}
                  </span>
                </button>
                <button
                  type="button"
                  className="ag-relation-remove"
                  onClick={() => deleteEdge(edge.id)}
                  aria-label={t("detail.deleteRelation")}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <AiSuggestRelations node={node} />
      </div>

      <button
        type="button"
        className="ag-danger"
        onClick={() => {
          if (
            window.confirm(
              t("detail.confirmDeleteNode", { title: node.title })
            )
          ) {
            deleteNode(node.id);
          }
        }}
      >
        {t("detail.deleteNode")}
      </button>
    </div>
  );
}
