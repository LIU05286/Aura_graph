import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

/** AI 配置入口按钮(模态由全局 AiSettingsModal 渲染) */
export default function SettingsPanel() {
  const openAiSettings = useGraphStore((s) => s.openAiSettings);
  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("settings.label")}</label>
      <button type="button" className="ag-chip" onClick={openAiSettings}>
        {t("settings.open")}
      </button>
    </div>
  );
}
