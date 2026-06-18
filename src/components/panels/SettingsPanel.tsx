import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { loadAiConfig, saveAiConfig, type AiConfig } from "../../ai/aiConfig";
import { t } from "../../i18n";

/** AI 配置入口 + 模态:chat / embeddings 双端点各填 base URL / key / model。key 只存本机 localStorage。 */
export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AiConfig>(() => loadAiConfig());

  // 每次打开都从存储重载,丢弃上次未保存的编辑
  useEffect(() => {
    if (open) setDraft(loadAiConfig());
  }, [open]);

  const close = () => setOpen(false);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const handleSave = () => {
    saveAiConfig(draft);
    close();
  };

  const setField = (
    group: "chat" | "embeddings",
    field: "baseUrl" | "apiKey" | "model",
    value: string
  ) =>
    setDraft((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }));

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("settings.label")}</label>
      <button type="button" className="ag-chip" onClick={() => setOpen(true)}>
        {t("settings.open")}
      </button>

      {open &&
        createPortal(
          <div className="ag-modal-overlay" onClick={handleOverlayClick}>
            <div className="ag-modal">
              <div className="ag-modal-title">{t("settings.title")}</div>

              <div className="ag-modal-group">{t("settings.chatGroup")}</div>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.baseUrl")}</span>
                <input
                  className="ag-input"
                  placeholder={t("settings.basePlaceholder")}
                  value={draft.chat.baseUrl}
                  onChange={(e) => setField("chat", "baseUrl", e.target.value)}
                />
              </label>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.apiKey")}</span>
                <input
                  className="ag-input"
                  type="password"
                  autoComplete="off"
                  placeholder={t("settings.keyPlaceholder")}
                  value={draft.chat.apiKey}
                  onChange={(e) => setField("chat", "apiKey", e.target.value)}
                />
              </label>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.model")}</span>
                <input
                  className="ag-input"
                  value={draft.chat.model}
                  onChange={(e) => setField("chat", "model", e.target.value)}
                />
              </label>

              <div className="ag-modal-group">{t("settings.embeddingsGroup")}</div>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.baseUrl")}</span>
                <input
                  className="ag-input"
                  placeholder={t("settings.basePlaceholder")}
                  value={draft.embeddings.baseUrl}
                  onChange={(e) => setField("embeddings", "baseUrl", e.target.value)}
                />
              </label>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.apiKey")}</span>
                <input
                  className="ag-input"
                  type="password"
                  autoComplete="off"
                  placeholder={t("settings.keyPlaceholder")}
                  value={draft.embeddings.apiKey}
                  onChange={(e) => setField("embeddings", "apiKey", e.target.value)}
                />
              </label>
              <label className="ag-modal-field">
                <span className="ag-eyebrow">{t("settings.model")}</span>
                <input
                  className="ag-input"
                  value={draft.embeddings.model}
                  onChange={(e) => setField("embeddings", "model", e.target.value)}
                />
              </label>

              <div className="ag-modal-hint">{t("settings.hint")}</div>

              <div className="ag-modal-actions">
                <button type="button" className="ag-chip" onClick={close}>
                  {t("form.cancel")}
                </button>
                <button type="button" className="ag-chip" onClick={handleSave}>
                  {t("form.save")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
