import { useMemo, useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { computeLayout } from "../../utils/graphLayout";
import { t } from "../../i18n";
import SearchPanel from "./SearchPanel";
import TypeFilterPanel from "./TypeFilterPanel";
import TagFilterPanel from "./TagFilterPanel";
import TimelinePanel from "./TimelinePanel";
import AiClusterPanel from "./AiClusterPanel";
import StatsPanel from "./StatsPanel";

/** 星图控制面板(瘦身版):仅图探索工具。星系切换 / 导入导出 / AI 设置已迁出。 */
export default function ControlPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const timeWindow = useGraphStore((s) => s.timeWindow);
  const edges = useGraphStore((s) => s.edges);
  const openCreateNode = useGraphStore((s) => s.openCreateNode);
  const setNodePositions = useGraphStore((s) => s.setNodePositions);

  const [collapsed, setCollapsed] = useState(false);

  const visibleCount = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags, timeWindow).size,
    [nodes, hiddenTypes, activeTags, timeWindow]
  );

  const handleRelayout = () => {
    const positions = computeLayout(nodes, edges);
    setNodePositions(positions);
  };

  return (
    <>
      {collapsed && (
        <button
          type="button"
          className="ag-rail"
          onClick={() => setCollapsed(false)}
          aria-label={t("control.expand")}
        >
          ☰
        </button>
      )}

      <div className={`ag-panel ag-left${collapsed ? " ag-collapsed" : ""}`}>
        <button
          type="button"
          className="ag-collapse"
          onClick={() => setCollapsed(true)}
          aria-label={t("control.collapse")}
        >
          ‹
        </button>
        <StatsPanel />

        <div className="ag-section ag-actions">
          <button type="button" className="ag-chip ag-chip-primary" onClick={openCreateNode}>
            {t("control.newNode")}
          </button>
          <button type="button" className="ag-chip ag-chip-primary" onClick={handleRelayout}>
            {t("control.relayout")}
          </button>
        </div>

        <SearchPanel />
        <AiClusterPanel />
        <TypeFilterPanel />
        <TagFilterPanel />
        <TimelinePanel />

        <div className="ag-footer">
          {t("control.footer", { count: visibleCount })}
        </div>
      </div>
    </>
  );
}
