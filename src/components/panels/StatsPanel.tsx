import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds, getAllTags } from "../../utils/graphFilter";
import { NODE_TYPES } from "../../types/graph";
import { TYPE_LABEL } from "../../data/visualMappings";
import TypeDot from "../ui/TypeDot";
import { t } from "../../i18n";

/** 星图概览:统计“当前可见”的星 —— 跟随类型 / 星座 / 时间轴筛选实时变化 */
export default function StatsPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const timeWindow = useGraphStore((s) => s.timeWindow);

  const stats = useMemo(() => {
    const visibleIds = getVisibleNodeIds(nodes, hiddenTypes, activeTags, timeWindow);
    const visibleNodes = nodes.filter((n) => visibleIds.has(n.id));
    // 只统计两端都可见的边
    const visibleEdges = edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
    const degree = new Map<string, number>();
    for (const e of visibleEdges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }
    const isolated = visibleNodes.filter((n) => (degree.get(n.id) ?? 0) === 0).length;
    const byType = NODE_TYPES.map((type) => ({
      type,
      count: visibleNodes.filter((n) => n.type === type).length,
    })).filter((row) => row.count > 0);
    return {
      stars: visibleNodes.length,
      links: visibleEdges.length,
      constellations: getAllTags(visibleNodes).length,
      isolated,
      byType,
    };
  }, [nodes, edges, hiddenTypes, activeTags, timeWindow]);

  if (nodes.length === 0) return null;

  return (
    <div className="ag-section">
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
