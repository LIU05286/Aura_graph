import SettingsPanel from "../components/panels/SettingsPanel";
import GraphIOPanel from "../components/panels/GraphIOPanel";
import { t } from "../i18n";

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
    </div>
  );
}
