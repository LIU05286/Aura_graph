import { useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { createCapturedNode } from "../../utils/nodeFactory";
import { CAPTURE_TEMPLATES } from "./templates";
import { t } from "../../i18n";

/** 记录中心:选模板 + 多行输入 → 生成一颗记忆并进入收件箱 */
export default function CaptureCenter() {
  const addNode = useGraphStore((s) => s.addNode);
  const [templateId, setTemplateId] = useState(CAPTURE_TEMPLATES[0].id);
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [saved, setSaved] = useState(false);

  const template =
    CAPTURE_TEMPLATES.find((tp) => tp.id === templateId) ?? CAPTURE_TEMPLATES[0];

  const submit = () => {
    const raw = text.trim();
    if (!raw) return;
    const lines = raw.split("\n");
    const title = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();
    const tagList = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const node = createCapturedNode({
      title,
      content,
      type: template.type,
      tags: tagList,
      status: "inbox",
    });
    addNode(node);
    setText("");
    setTags("");
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
            className={`capture-tpl${tp.id === templateId ? " is-active" : ""}`}
            onClick={() => setTemplateId(tp.id)}
          >
            {t(tp.labelKey)}
          </button>
        ))}
      </div>

      <textarea
        className="capture-textarea"
        rows={4}
        value={text}
        placeholder={t(template.placeholderKey)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <input
        className="capture-tags"
        value={tags}
        placeholder={t("capture.tagsPlaceholder")}
        onChange={(e) => setTags(e.target.value)}
      />

      <div className="capture-actions">
        <span className="capture-hint">
          {saved ? t("capture.saved") : t("capture.hint")}
        </span>
        <button
          type="button"
          className="capture-submit"
          onClick={submit}
          disabled={!text.trim()}
        >
          {t("capture.submit")}
        </button>
      </div>
    </div>
  );
}
