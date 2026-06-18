import { useGraphStore } from "../../store/graphStore";
import ActiveView from "../../views/ActiveView";
import MobileTabBar from "./MobileTabBar";
import DetailPanel from "../panels/DetailPanel";
import BottomSheet from "../ui/BottomSheet";
import { t } from "../../i18n";

/** 手机端:主内容 + 底部 Tab;选中记忆用底部弹层展示详情 */
export default function MobileShell() {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);

  return (
    <div className="ms-shell">
      <div className="ms-main">
        <ActiveView />
      </div>

      <MobileTabBar />

      <BottomSheet
        open={selectedNodeId !== null}
        onClose={() => selectNode(null)}
        title={t("inspector.title")}
      >
        <DetailPanel />
      </BottomSheet>
    </div>
  );
}
