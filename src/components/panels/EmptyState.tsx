import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

/** 当前星系为空时的居中引导卡 */
export default function EmptyState() {
  const nodes = useGraphStore((s) => s.nodes);
  const activeGalaxyId = useGraphStore((s) => s.activeGalaxyId);
  const resetToSeed = useGraphStore((s) => s.resetToSeed);

  // 仅在星系已初始化(activeGalaxyId 非空)且当前为空时显示,避免启动途中闪现
  if (activeGalaxyId === null || nodes.length > 0) return null;

  return (
    <div className="ag-empty">
      <div className="ag-empty-card">
        <div className="ag-empty-title">{t("empty.title")}</div>
        <p className="ag-empty-hint">{t("empty.hint")}</p>
        <button type="button" className="ag-chip ag-chip-primary" onClick={resetToSeed}>
          {t("empty.loadDemo")}
        </button>
      </div>
    </div>
  );
}
