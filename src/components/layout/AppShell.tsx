import { useEffect, useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { getVisibleNodeIds } from "../../utils/graphFilter";
import { usePersistence } from "../../hooks/usePersistence";
import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopShell from "./DesktopShell";
import MobileShell from "./MobileShell";
import NodeFormModal from "../panels/NodeFormModal";
import CommandPalette from "../panels/CommandPalette";

/** 应用根:持久化 + 全局键盘 + 选择桌面 / 手机外壳 + 全局模态 */
export default function AppShell() {
  usePersistence();

  const isMobile = useIsMobile();

  const nodes = useGraphStore((s) => s.nodes);
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes);
  const activeTags = useGraphStore((s) => s.activeTags);
  const timeWindow = useGraphStore((s) => s.timeWindow);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const currentView = useGraphStore((s) => s.currentView);

  const visibleIds = useMemo(
    () => getVisibleNodeIds(nodes, hiddenTypes, activeTags, timeWindow),
    [nodes, hiddenTypes, activeTags, timeWindow]
  );

  // 仅在星图视图:选中的星若被筛选隐藏则取消选中(列表视图不受图筛选影响)
  useEffect(() => {
    if (currentView !== "graph") return;
    if (selectedNodeId && !visibleIds.has(selectedNodeId)) selectNode(null);
  }, [currentView, visibleIds, selectedNodeId, selectNode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectNode]);

  return (
    <div className="ag-root">
      {isMobile ? <MobileShell /> : <DesktopShell />}
      <NodeFormModal />
      <CommandPalette />
    </div>
  );
}
