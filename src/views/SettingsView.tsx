import SettingsPanel from "../components/panels/SettingsPanel";
import GraphIOPanel from "../components/panels/GraphIOPanel";
import { t } from "../i18n";
import { useGraphStore } from "../store/graphStore";

/** 设置视图:AI 配置 + 数据导入导出(保留原有 JSON 导入导出)。 */
export default function SettingsView() {
  return (
    <div className="settings-view">
      <div className="settings-view-title">{t("nav.settings")}</div>
      <div className="settings-view-section">
        <SettingsPanel />
      </div>
      <div className="settings-view-section">
        <GraphIOPanel />
      </div>
      <div className="settings-view-section">
        <button type="button" className="ag-chip" onClick={useGraphStore.getState().openHelp}>
          {t("nav.help")}
        </button>
      </div>
    </div>
  );
}
