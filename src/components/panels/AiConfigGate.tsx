import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

/** AI 未配置时的占位按钮:点击直接打开设置模态 */
export default function AiConfigGate() {
  const openAiSettings = useGraphStore((s) => s.openAiSettings);
  return (
    <button type="button" className="ag-chip ag-ai-btn" onClick={openAiSettings}>
      {t("ai.configure")}
    </button>
  );
}
