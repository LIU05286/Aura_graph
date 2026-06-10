import { useEffect, useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { usePersistence } from "../../hooks/usePersistence";
import GraphCanvas from "../graph/GraphCanvas";
import ControlPanel from "../panels/ControlPanel";
import DetailPanel from "../panels/DetailPanel";
import NodeFormModal from "../panels/NodeFormModal";
import QuickCapture from "../panels/QuickCapture";
import EmptyState from "../panels/EmptyState";
import AiPing from "../AiPing";

/** 应用骨架:3D 画布 + 空状态卡 + 顶部快速记录 + 左右面板 + 弹窗(+ 临时 AI 自测) */
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

  useEffect(() => {
    if (selectedNodeId && !visibleIds.has(selectedNodeId)) selectNode(null);
  }, [visibleIds, selectedNodeId, selectNode]);

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
      <EmptyState />
      <QuickCapture />
      <ControlPanel />
      <DetailPanel />
      <NodeFormModal />
      <AiPing />
    </div>
  );
}
