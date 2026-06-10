import { useEffect, useMemo, useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { NODE_TYPES, type MemoryNodeType, type MemoryNode } from "../../types/graph";
import { TYPE_LABEL } from "../../data/visualMappings";
import { t } from "../../i18n";

function randomPosition(): { x: number; y: number; z: number } {
  const r = 4 + Math.random() * 4;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
}

export default function NodeFormModal() {
  const editorMode = useGraphStore((s) => s.editorMode);
  const editorNodeId = useGraphStore((s) => s.editorNodeId);
  const nodes = useGraphStore((s) => s.nodes);
  const addNode = useGraphStore((s) => s.addNode);
  const updateNode = useGraphStore((s) => s.updateNode);
  const closeEditor = useGraphStore((s) => s.closeEditor);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);

  const currentNode = useMemo(
    () => nodes.find((node) => node.id === editorNodeId),
    [nodes, editorNodeId]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<MemoryNodeType>("note");
  const [tagsText, setTagsText] = useState("");
  const [importance, setImportance] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    if (editorMode === "create") {
      setTitle("");
      setContent("");
      setType("note");
      setTagsText("");
      setImportance(3);
      return;
    }

    if (editorMode === "edit" && currentNode) {
      setTitle(currentNode.title);
      setContent(currentNode.content);
      setType(currentNode.type);
      setTagsText(currentNode.tags.join(", "));
      setImportance(currentNode.importance);
    }
  }, [editorMode, editorNodeId, currentNode]);

  if (editorMode === null) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeEditor();
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      window.alert(t("form.titleRequired"));
      return;
    }

    const tags = tagsText
      .split(/[,，、;；]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const importanceValue = Number(importance) as 1 | 2 | 3 | 4 | 5;

    if (editorMode === "create") {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const pos = randomPosition();
      const node: MemoryNode = {
        id,
        title: trimmedTitle,
        content,
        type,
        tags,
        importance: importanceValue,
        createdAt: now,
        updatedAt: now,
        ...pos,
      };
      addNode(node);
      selectNode(id);
      requestFocusNode(id);
      closeEditor();
      return;
    }

    if (editorMode === "edit" && editorNodeId) {
      updateNode(editorNodeId, {
        title: trimmedTitle,
        content,
        type,
        tags,
        importance: importanceValue,
      });
      closeEditor();
    }
  };

  return (
    <div className="ag-modal-overlay" onClick={handleOverlayClick}>
      <div className="ag-modal">
        <div className="ag-modal-title">{editorMode === "create" ? t("form.createTitle") : t("form.editTitle")}</div>

        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("form.title")}</span>
          <input
            className="ag-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("form.type")}</span>
          <select
            className="ag-select"
            value={type}
            onChange={(e) => setType(e.target.value as MemoryNodeType)}
          >
            {NODE_TYPES.map((nodeType) => (
              <option key={nodeType} value={nodeType}>
                {TYPE_LABEL[nodeType]}
              </option>
            ))}
          </select>
        </label>

        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("form.importance")}</span>
          <select
            className="ag-select"
            value={importance}
            onChange={(e) => setImportance(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("form.tags")}</span>
          <input
            className="ag-input"
            placeholder={t("form.tagsPlaceholder")}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </label>

        <label className="ag-modal-field">
          <span className="ag-eyebrow">{t("form.content")}</span>
          <textarea
            className="ag-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>

        <div className="ag-modal-actions">
          <button type="button" className="ag-chip" onClick={closeEditor}>
            {t("form.cancel")}
          </button>
          <button type="button" className="ag-chip" onClick={handleSave}>
            {t("form.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
