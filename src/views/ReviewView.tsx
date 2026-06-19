import { useMemo, useState } from "react";
import { useGraphStore } from "../store/graphStore";
import { useChatConfigured } from "../ai/useAiConfig";
import { reviewAgent } from "../agents/reviewAgent";
import type { ReviewResult } from "../agents/types";
import { dayDiff } from "../utils/dateLabel";
import { t } from "../i18n";
import type { TranslationKey } from "../i18n/en";
import AiConfigGate from "../components/panels/AiConfigGate";
import MemoryListView from "../features/memories/MemoryListView";

type Period = "week" | "month" | "all";
const PERIODS: { id: Period; labelKey: TranslationKey; days: number }[] = [
  { id: "week", labelKey: "review.week", days: 7 },
  { id: "month", labelKey: "review.month", days: 31 },
  { id: "all", labelKey: "review.all", days: Number.POSITIVE_INFINITY },
];

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="review-block">
      <div className="review-block-title">{title}</div>
      <ul className="review-ul">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/** 复盘:选时间段 → 生成复盘(主题/情绪/灵感/待办) + 待复盘列表 */
export default function ReviewView() {
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);
  const updateNode = useGraphStore((s) => s.updateNode);
  const chatOk = useChatConfigured();

  const [period, setPeriod] = useState<Period>("week");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);

  const days = PERIODS.find((p) => p.id === period)?.days ?? 7;

  const periodNodes = useMemo(
    () =>
      nodes
        .filter((n) => {
          const d = dayDiff(n.createdAt);
          return !Number.isNaN(d) && d < days;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [nodes, days]
  );

  const dueNodes = useMemo(
    () =>
      periodNodes.filter((n) => {
        if (!n.reviewedAt) return true;
        const r = dayDiff(n.reviewedAt);
        return Number.isNaN(r) ? true : r >= 7;
      }),
    [periodNodes]
  );

  const run = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const label = t(PERIODS.find((p) => p.id === period)!.labelKey);
      const res = await reviewAgent(periodNodes, label);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-scroll">
      <div className="page-inner">
        <div className="page-title">{t("review.pageTitle")}</div>

        <div className="memories-filters">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`memories-filter${p.id === period ? " is-active" : ""}`}
              onClick={() => setPeriod(p.id)}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>

        {!chatOk ? (
          <AiConfigGate />
        ) : (
          <button
            type="button"
            className="capture-submit review-run"
            onClick={run}
            disabled={running || periodNodes.length === 0}
          >
            {running ? t("review.running") : t("review.generate", { count: periodNodes.length })}
          </button>
        )}
        {error && <div className="organizer-error">{error}</div>}

        {result && (
          <div className="review-result">
            {result.summary && <p className="review-summary">{result.summary}</p>}
            {result.mood && (
              <div className="review-block">
                <div className="review-block-title">{t("review.mood")}</div>
                <div>{result.mood}</div>
              </div>
            )}
            {result.themes.length > 0 && <ReviewList title={t("review.themes")} items={result.themes} />}
            {result.ideas.length > 0 && <ReviewList title={t("review.ideas")} items={result.ideas} />}
            {result.todos.length > 0 && <ReviewList title={t("review.todos")} items={result.todos} />}
          </div>
        )}

        <div className="page-section-title">{t("review.due", { count: dueNodes.length })}</div>
        <MemoryListView
          nodes={dueNodes}
          onSelect={(id) => selectNode(id)}
          emptyText={t("review.dueEmpty")}
          renderActions={(node) => (
            <button
              type="button"
              className="memory-action"
              onClick={() => updateNode(node.id, { reviewedAt: new Date().toISOString() })}
            >
              {t("review.markReviewed")}
            </button>
          )}
        />
      </div>
    </div>
  );
}
