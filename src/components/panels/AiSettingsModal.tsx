import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGraphStore } from "../../store/graphStore";
import { loadAiConfig, saveAiConfig, type AiConfig } from "../../ai/aiConfig";
import { t } from "../../i18n";

/** 全局 AI 配置模态:由 store.aiSettingsOpen 控制,挂在 AppShell 层,任意页面都能弹出。 */
export default function AiSettingsModal() {
  const aiSettingsOpen = useGraphStore((s) => s.aiSettingsOpen);
  const closeAiSettings = useGraphStore((s) => s.closeAiSettings);
  const [draft, setDraft] = useState<AiConfig>(() => loadAiConfig());

  useEffect(() => {
    if (aiSettingsOpen) setDraft(loadAiConfig());
  }, [aiSettingsOpen]);

  if (!aiSettingsOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeAiSettings();
  };
  const handleSave = () => {
    saveAiConfig(draft);
    closeAiSettings();
  };
  const setField = (
    group: "chat" | "embeddings",
    field: "baseUrl" | "apiKey" | "model",
    value: string
  ) => setDraft((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }));

  return createPortal(
    <div className="ag-modal-overlay" onClick={handleOverlayClick}>
      <div className="ag-modal">
        <div className="ag-modal-title">{t("settings.title")}</div>

        <div className="ag-modal-group">{t("settings.chatGroup")}</div>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.baseUrl")}</span>
          <input className="ag-input" placeholder={t("settings.basePlaceholder")} value={draft.chat.baseUrl} onChange={(e) => setField("chat", "baseUrl", e.target.value)} />
        </label>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.apiKey")}</span>
          <input className="ag-input" type="password" autoComplete="off" placeholder={t("settings.keyPlaceholder")} value={draft.chat.apiKey} onChange={(e) => setField("chat", "apiKey", e.target.value)} />
        </label>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.model")}</span>
          <input className="ag-input" value={draft.chat.model} onChange={(e) => setField("chat", "model", e.target.value)} />
        </label>

        <div className="ag-modal-group">{t("settings.embeddingsGroup")}</div>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.baseUrl")}</span>
          <input className="ag-input" placeholder={t("settings.basePlaceholder")} value={draft.embeddings.baseUrl} onChange={(e) => setField("embeddings", "baseUrl", e.target.value)} />
        </label>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.apiKey")}</span>
          <input className="ag-input" type="password" autoComplete="off" placeholder={t("settings.keyPlaceholder")} value={draft.embeddings.apiKey} onChange={(e) => setField("embeddings", "apiKey", e.target.value)} />
        </label>
        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("settings.model")}</span>
          <input className="ag-input" value={draft.embeddings.model} onChange={(e) => setField("embeddings", "model", e.target.value)} />
        </label>

        <div className="ag-modal-hint">{t("settings.hint")}</div>
        <div className="ag-modal-actions">
          <button type="button" className="ag-chip" onClick={closeAiSettings}>{t("form.cancel")}</button>
          <button type="button" className="ag-chip" onClick={handleSave}>{t("form.save")}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
