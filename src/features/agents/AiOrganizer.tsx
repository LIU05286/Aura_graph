import { useState } from "react";
import { useGraphStore } from "../../store/graphStore";
import { useChatConfigured } from "../../ai/useAiConfig";
import { runOrganize } from "../../agents/agentOrchestrator";
import { t } from "../../i18n";
import type { TranslationKey } from "../../i18n/en";
import AiConfigGate from "../../components/panels/AiConfigGate";
import ProposalReview from "./ProposalReview";

const STEP_LABEL: Record<string, TranslationKey> = {
  router: "agent.stepRouter",
  extract: "agent.stepExtract",
  merge: "agent.stepMerge",
  relations: "agent.stepRelations",
};

/** AI 整理:输入文字与提案都存 store,切视图不丢失。 */
export default function AiOrganizer() {
  const nodes = useGraphStore((s) => s.nodes);
  const text = useGraphStore((s) => s.organizerText);
  const setText = useGraphStore((s) => s.setOrganizerText);
  const proposal = useGraphStore((s) => s.organizerProposal);
  const setProposal = useGraphStore((s) => s.setOrganizerProposal);
  const chatOk = useChatConfigured();

  const [running, setRunning] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    const input = text.trim();
    if (!input) return;
    setRunning(true);
    setError("");
    setProposal(null);
    try {
      const result = await runOrganize(input, nodes, { onStep: (s) => setStep(s) });
      setProposal(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setRunning(false);
      setStep("");
    }
  };

  return (
    <div className="organizer">
      <div className="organizer-title">{t("agent.title")}</div>
      <div className="organizer-sub">{t("agent.subtitle")}</div>

      {!chatOk ? (
        <AiConfigGate />
      ) : (
        <>
          <textarea
            className="capture-textarea"
            rows={4}
            value={text}
            placeholder={t("agent.placeholder")}
            onChange={(e) => setText(e.target.value)}
            disabled={running}
          />
          <div className="capture-actions">
            <span className="capture-hint">
              {running ? t((STEP_LABEL[step] ?? "agent.running") as TranslationKey) : ""}
            </span>
            <button type="button" className="capture-submit" onClick={run} disabled={running || !text.trim()}>
              {running ? t("agent.running") : t("agent.run")}
            </button>
          </div>
        </>
      )}

      {error && <div className="organizer-error">{error}</div>}

      {proposal && (
        <ProposalReview
          proposal={proposal}
          onApplied={() => {
            setProposal(null);
            setText("");
          }}
          onCancel={() => setProposal(null)}
        />
      )}
    </div>
  );
}
