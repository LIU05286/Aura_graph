import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

/** 当前星系为空时的居中引导卡:引导去记录,不再载入示例 */
export default function EmptyState() {
  const nodes = useGraphStore((s) => s.nodes);
  const activeGalaxyId = useGraphStore((s) => s.activeGalaxyId);
  const setCurrentView = useGraphStore((s) => s.setCurrentView);

  if (activeGalaxyId === null || nodes.length > 0) return null;

  return (
    <div className="ag-empty">
      <div className="ag-empty-card">
        <div className="ag-empty-title">{t("empty.title")}</div>
        <p className="ag-empty-hint">{t("empty.hint")}</p>
        <button
          type="button"
          className="ag-chip ag-chip-primary"
          onClick={() => setCurrentView("today")}
        >
          {t("empty.cta")}
        </button>
      </div>
    </div>
  );
}
