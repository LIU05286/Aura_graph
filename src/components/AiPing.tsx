import { useState } from "react";
import { deepseekChat } from "../ai/deepseek";

/** 临时:AI 连通性自测。验证通过后在 P4.1b 删除本组件及其挂载。 */
export default function AiPing() {
  const [status, setStatus] = useState("");
  const ping = async () => {
    setStatus("…");
    try {
      const reply = await deepseekChat([
        { role: "user", content: "Reply with exactly one word: pong" },
      ]);
      setStatus(reply.trim());
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "error");
    }
  };
  return (
    <button
      type="button"
      onClick={ping}
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 50,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid rgba(150,180,255,0.3)",
        background: "rgba(10,15,30,0.7)",
        color: "#e6ecf7",
        cursor: "pointer",
      }}
    >
      Test AI{status && ` → ${status}`}
    </button>
  );
}
