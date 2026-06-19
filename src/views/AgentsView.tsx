import { useState } from "react";
import { useGraphStore } from "../store/graphStore";
import { useChatConfigured } from "../ai/useAiConfig";
import { answerQuestion } from "../agents/qaAgent";
import { t } from "../i18n";
import AiConfigGate from "../components/panels/AiConfigGate";
import MemoryCard from "../features/memories/MemoryCard";

/** 智能体:基于记忆的问答,回答时展示引用的记忆。问答历史与输入存 store,切视图不丢。 */
export default function AgentsView() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectNode = useGraphStore((s) => s.selectNode);
  const input = useGraphStore((s) => s.qaInput);
  const setInput = useGraphStore((s) => s.setQaInput);
  const thread = useGraphStore((s) => s.qaThread);
  const pushTurn = useGraphStore((s) => s.pushQaTurn);
  const clearThread = useGraphStore((s) => s.clearQaThread);
  const chatOk = useChatConfigured();

  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const ask = async () => {
    const q = input.trim();
    if (!q) return;
    setRunning(true);
    setError("");
    try {
      const res = await answerQuestion(q, nodes, edges);
      pushTurn({
        id: crypto.randomUUID(),
        question: q,
        answer: res.answer || t("qa.noContext"),
        usedNodeIds: res.usedNodeIds,
      });
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <div className="page-title">{t("qa.title")}</div>
        <div className="today-date">{t("qa.subtitle")}</div>

        {!chatOk ? (
          <AiConfigGate />
        ) : (
          <div className="qa-box">
            <textarea
              className="capture-textarea"
              rows={3}
              value={input}
              placeholder={t("qa.placeholder")}
              disabled={running}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <div className="capture-actions">
              <span className="capture-hint">{running ? t("qa.thinking") : t("qa.hint")}</span>
              <button type="button" className="capture-submit" onClick={ask} disabled={running || !input.trim()}>
                {t("qa.ask")}
              </button>
            </div>
          </div>
        )}

        {error && <div className="organizer-error">{error}</div>}

        {thread.length > 0 && (
          <div className="qa-thread">
            <div className="qa-thread-head">
              <span className="page-section-title">{t("qa.history")}</span>
              <button type="button" className="memory-action" onClick={clearThread}>
                {t("qa.clear")}
              </button>
            </div>
            {thread.slice().reverse().map((turn) => (
              <div key={turn.id} className="qa-turn">
                <div className="qa-question">{turn.question}</div>
                <div className="qa-answer">{turn.answer}</div>
                {turn.usedNodeIds.length > 0 && (
                  <>
                    <div className="qa-cite-label">{t("qa.cited")}</div>
                    <div className="memory-list">
                      {turn.usedNodeIds.map((id) => {
                        const n = nodes.find((x) => x.id === id);
                        return n ? <MemoryCard key={id} node={n} onClick={() => selectNode(id)} /> : null;
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
