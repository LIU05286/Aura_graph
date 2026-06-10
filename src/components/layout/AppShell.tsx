import { useEffect, useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { usePersistence } from "../../hooks/usePersistence";
import GraphCanvas from "../graph/GraphCanvas";
import ControlPanel from "../panels/ControlPanel";
import DetailPanel from "../panels/DetailPanel";
import NodeFormModal from "../panels/NodeFormModal";

/** 应用骨架:组合 3D 画布 + 左侧控制面板 + 右侧详情面板 */
export default function AppShell() {
  usePersistence();

  const nodes = useGraphStore((s) => s.nodes);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags),
    [nodes, hiddenTypes, activeTags]
  );

  // 选中的节点被筛选隐藏时,自动取消选中
  useEffect(() => {
    if (selectedNodeId && !visibleIds.has(selectedNodeId)) selectNode(null);
  }, [visibleIds, selectedNodeId, selectNode]);

  // Esc 取消选中
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectNode]);

  return (
    <div className="ag-root">
      <GraphCanvas />
      <ControlPanel />
      <DetailPanel />
      <NodeFormModal />
    </div>
  );
}
