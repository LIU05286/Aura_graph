import { useGraphStore } from "../../store/graphStore";
import DetailPanel from "../panels/DetailPanel";
import { t } from "../../i18n";

/** 桌面端右栏:选中记忆时显示其详情,否则显示空态提示 */
export default function Inspector() {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

  return (
    <aside className="ds-inspector">
      {selectedNodeId ? (
        <DetailPanel />
      ) : (
        <div className="ds-inspector-empty">{t("inspector.empty")}</div>
      )}
    </aside>
  );
}
