import { lazy, Suspense, useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { getMatchedNodeIds } from "../../utils/graphSearch";

// 懒加载整棵 3D 场景子树(StarScene 及其 three / @react-three / three-stdlib 依赖),
// 让 three 全家桶离开入口 chunk、按需加载。fallback 复用画布外壳类,加载期保持深色背景连续。
const StarScene = lazy(() => import("./scene/StarScene"));

/**
 * 适配器:从 Zustand 读状态,计算派生数据,喂给纯渲染组件 StarScene。
 * StarScene 因此完全不依赖 store。
 */
export default function GraphCanvas() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const searchTerm = useGraphStore((s) => s.searchTerm);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const timeWindow = useGraphStore((s) => s.timeWindow);
  const focusNodeId = useGraphStore((s) => s.focusNodeId);
  const focusNonce = useGraphStore((s) => s.focusNonce);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags, timeWindow),
    [nodes, hiddenTypes, activeTags, timeWindow]
  );
  const matchedIds = useMemo(
    () => getMatchedNodeIds(nodes, searchTerm),
    [nodes, searchTerm]
  );
  const hasSearch = searchTerm.trim() !== "";

  return (
    <Suspense fallback={<div className="ag-canvas-wrap" />}>
      <StarScene
        nodes={nodes}
        edges={edges}
        visibleIds={visibleIds}
        matchedIds={matchedIds}
        hasSearch={hasSearch}
        selectedNodeId={selectedNodeId}
        focusNodeId={focusNodeId}
        focusNonce={focusNonce}
        onSelect={selectNode}
        onFocus={requestFocusNode}
      />
    </Suspense>
  );
}
