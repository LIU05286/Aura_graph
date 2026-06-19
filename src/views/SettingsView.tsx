import GraphIOPanel from "../components/panels/GraphIOPanel";
import { useGraphStore } from "../store/graphStore";
import { t } from "../i18n";

/** 设置:AI 由服务器托管说明 + 数据导入导出 + 使用指南 */
export default function SettingsView() {
  const openHelp = useGraphStore((s) => s.openHelp);
  return (
    <div className="settings-view">
      <div className="settings-view-title">{t("nav.settings")}</div>

      <div className="settings-view-section">
        <label className="ag-eyebrow">{t("settings.aiLabel")}</label>
        <p className="settings-note">{t("settings.serverManaged")}</p>
      </div>

      <div className="settings-view-section">
        <GraphIOPanel />
      </div>

      <div className="settings-view-section">
        <button type="button" className="ag-chip" onClick={openHelp}>
          {t("nav.help")}
        </button>
      </div>
    </div>
  );
}
