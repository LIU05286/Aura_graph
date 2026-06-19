import { useState } from "react";
import GraphCanvas from "../components/graph/GraphCanvas";
import EmptyState from "../components/panels/EmptyState";
import ControlPanel from "../components/panels/ControlPanel";
import BottomSheet from "../components/ui/BottomSheet";
import { useIsMobile } from "../hooks/useIsMobile";
import { t } from "../i18n";

/** 星图视图:复用现有 3D 星图。桌面端控制面板浮在左上;移动端收进底部弹层。 */
export default function GraphView() {
  const isMobile = useIsMobile();
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <div className="graph-view">
      <GraphCanvas />
      <EmptyState />

      {!isMobile && <ControlPanel />}

      {isMobile && (
        <>
          <button
            type="button"
            className="graph-controls-fab"
            onClick={() => setControlsOpen(true)}
          >
            {t("graph.openControls")}
          </button>
          <BottomSheet
            open={controlsOpen}
            onClose={() => setControlsOpen(false)}
            title={t("graph.controlsTitle")}
          >
            <ControlPanel />
          </BottomSheet>
        </>
      )}
    </div>
  );
}
