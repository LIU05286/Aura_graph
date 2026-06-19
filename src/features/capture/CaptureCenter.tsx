import { useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { createCapturedNode } from "../../utils/nodeFactory";
import { CAPTURE_TEMPLATES } from "./templates";
import { t } from "../../i18n";

/** 记录中心:草稿存在 store,切视图不丢失。 */
export default function CaptureCenter() {
  const addNode = useGraphStore((s) => s.addNode);
  const draft = useGraphStore((s) => s.captureDraft);
  const patchDraft = useGraphStore((s) => s.patchCaptureDraft);
  const [saved, setSaved] = useState(false);

  const template =
    CAPTURE_TEMPLATES.find((tp) => tp.id === draft.templateId) ?? CAPTURE_TEMPLATES[0];

  const submit = () => {
    const raw = draft.text.trim();
    if (!raw) return;
    const lines = raw.split("\n");
    const title = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();
    const tagList = draft.tags.split(",").map((s) => s.trim()).filter(Boolean);
    const node = createCapturedNode({
      title,
      content,
      type: template.type,
      tags: tagList,
      status: "inbox",
    });
    addNode(node);
    patchDraft({ text: "", tags: "" });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="capture-center">
      <div className="capture-title">{t("capture.title")}</div>

      <div className="capture-templates">
        {CAPTURE_TEMPLATES.map((tp) => (
          <button
            key={tp.id}
            type="button"
            className={`capture-tpl${tp.id === draft.templateId ? " is-active" : ""}`}
            onClick={() => patchDraft({ templateId: tp.id })}
          >
            {t(tp.labelKey)}
          </button>
        ))}
      </div>

      <textarea
        className="capture-textarea"
        rows={4}
        value={draft.text}
        placeholder={t(template.placeholderKey)}
        onChange={(e) => patchDraft({ text: e.target.value })}
        onKeyDown={onKeyDown}
      />

      <input
        className="capture-tags"
        value={draft.tags}
        placeholder={t("capture.tagsPlaceholder")}
        onChange={(e) => patchDraft({ tags: e.target.value })}
      />

      <div className="capture-actions">
        <span className="capture-hint">{saved ? t("capture.saved") : t("capture.hint")}</span>
        <button
          type="button"
          className="capture-submit"
          onClick={submit}
          disabled={!draft.text.trim()}
        >
          {t("capture.submit")}
        </button>
      </div>
    </div>
  );
}
