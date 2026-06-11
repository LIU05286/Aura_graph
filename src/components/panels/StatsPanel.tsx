import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getAllTags } from "../../utils/graphFilter";
import { NODE_TYPES } from "../../types/graph";
import { TYPE_LABEL } from "../../data/visualMappings";
import TypeDot from "../ui/TypeDot";
import { t } from "../../i18n";

/** 星图概览:星 / 链 / 星座 / 孤星 四个总数 + 按类型分布(纯派生,不改 store） */
export default function StatsPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  const stats = useMemo(() => {
    const degree = new Map<string, number>();
    for (const e of edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }
    const isolated = nodes.filter((n) => (degree.get(n.id) ?? 0) === 0).length;
    const byType = NODE_TYPES.map((type) => ({
      type,
      count: nodes.filter((n) => n.type === type).length,
    })).filter((row) => row.count > 0);
    return {
      stars: nodes.length,
      links: edges.length,
      constellations: getAllTags(nodes).length,
      isolated,
      byType,
    };
  }, [nodes, edges]);

  if (nodes.length === 0) return null;

  return (
    <div className="ag-section ag-stats">
      <label className="ag-eyebrow">{t("stats.label")}</label>
      <div className="ag-stats-grid">
        <div className="ag-stat">
          <span className="ag-stat-num">{stats.stars}</span>
          <span className="ag-stat-label">{t("stats.stars")}</span>
        </div>
        <div className="ag-stat">
          <span className="ag-stat-num">{stats.links}</span>
          <span className="ag-stat-label">{t("stats.links")}</span>
        </div>
        <div className="ag-stat">
          <span className="ag-stat-num">{stats.constellations}</span>
          <span className="ag-stat-label">{t("stats.constellations")}</span>
        </div>
        <div className="ag-stat">
          <span className="ag-stat-num">{stats.isolated}</span>
          <span className="ag-stat-label">{t("stats.isolated")}</span>
        </div>
      </div>
      <div className="ag-stats-types">
        {stats.byType.map((row) => (
          <div key={row.type} className="ag-stats-type-row">
            <TypeDot type={row.type} />
            <span className="ag-stats-type-name">{TYPE_LABEL[row.type]}</span>
            <span className="ag-stats-type-count">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
