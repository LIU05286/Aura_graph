import { useState, type KeyboardEvent } from "react";
import { useGraphStore } from "../../store/graphStore";
import { createCapturedNode } from "../../utils/nodeFactory";
import { t } from "../../i18n";

/** 星图内快速记录:回车生成一颗记忆(默认进收件箱)并在星图中定位 */
export default function QuickCapture() {
  const addNode = useGraphStore((s) => s.addNode);
  const selectNode = useGraphStore((s) => s.selectNode);
  const requestFocusNode = useGraphStore((s) => s.requestFocusNode);
  const [text, setText] = useState("");

  const capture = () => {
    const title = text.trim();
    if (!title) return;
    const node = createCapturedNode({ title, type: "idea", status: "inbox" });
    addNode(node);
    selectNode(node.id);
    requestFocusNode(node.id);
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
