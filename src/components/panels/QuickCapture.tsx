import { useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import type { MemoryNode } from "../../types/graph";
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

/** 顶部快速记录:输入一行,回车即生成一颗 idea 星并飞过去 */
export default function QuickCapture() {
  const addNode = useGraphStore((s) => s.addNode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);
  const [text, setText] = useState("");

  const capture = () => {
    const title = text.trim();
    if (!title) return;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const node: MemoryNode = {
      id,
      title,
      content: "",
      type: "idea",
      tags: [],
      importance: 3,
      createdAt: now,
      updatedAt: now,
      ...randomPosition(),
    };
    addNode(node);
    selectNode(id);
    requestFocusNode(id);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      capture();
    }
  };

  return (
    <div className="ag-capture">
      <input
        className="ag-capture-input"
        value={text}
        placeholder={t("capture.placeholder")}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
