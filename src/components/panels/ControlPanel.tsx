import { useMemo, useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { computeLayout } from "../../utils/graphLayout";
import { t } from "../../i18n";
import SearchPanel from "./SearchPanel";
import TypeFilterPanel from "./TypeFilterPanel";
import TagFilterPanel from "./TagFilterPanel";
import GraphIOPanel from "./GraphIOPanel";
import GalaxyPanel from "./GalaxyPanel";

/** 左侧控制面板:品牌 + 搜索 + 类型筛选 + 星座筛选 + 状态行(可折叠) */
export default function ControlPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const edges = useGraphStore((s) => s.edges);
  const openCreateNode = useGraphStore((s) => s.openCreateNode);
  const setNodePositions = useGraphStore((s) => s.setNodePositions);

  // 折叠状态:纯 UI 本地状态,不进 store
  const [collapsed, setCollapsed] = useState(false);

  const visibleCount = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags).size,
    [nodes, hiddenTypes, activeTags]
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

        <div className="ag-brand">
          <span className="ag-brand-mark" />
          <div>
            <div className="ag-brand-name">AURA GRAPH</div>
            <div className="ag-brand-sub">memory universe</div>
          </div>
        </div>

        <GalaxyPanel />

        <div className="ag-section ag-actions">
          <button type="button" className="ag-chip ag-chip-primary" onClick={openCreateNode}>
            {t("control.newNode")}
          </button>
          <button type="button" className="ag-chip ag-chip-primary" onClick={handleRelayout}>
            {t("control.relayout")}
          </button>
        </div>

        <SearchPanel />
        <TypeFilterPanel />
        <TagFilterPanel />
        <GraphIOPanel />

        <div className="ag-footer">
          {t("control.footer", { count: visibleCount })}
        </div>
      </div>
    </>
  );
}
