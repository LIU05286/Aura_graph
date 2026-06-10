import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { getMatchedNodeIds } from "../../utils/graphSearch";
import StarScene from "./scene/StarScene";

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
  const focusNodeId = useGraphStore((s) => s.focusNodeId);
  const focusNonce = useGraphStore((s) => s.focusNonce);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags),
    [nodes, hiddenTypes, activeTags]
  );
  const matchedIds = useMemo(
    () => getMatchedNodeIds(nodes, searchTerm),
    [nodes, searchTerm]
  );
  const hasSearch = searchTerm.trim() !== "";

  return (
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
  );
}
