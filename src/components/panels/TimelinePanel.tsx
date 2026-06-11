import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

const DAY = 86400000;

function fmt(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** 时间轴筛选:按 createdAt 把可见范围收窄到 [start, end];只设过滤窗口,不改数据 */
export default function TimelinePanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const timeWindow = useGraphStore((s) => s.timeWindow);
  const setTimeWindow = useGraphStore((s) => s.setTimeWindow);

  const bounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const n of nodes) {
      const ts = Date.parse(n.createdAt);
      if (Number.isNaN(ts)) continue;
      if (ts < min) min = ts;
      if (ts > max) max = ts;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return null;
    return { min, max };
  }, [nodes]);

  if (!bounds) return null;

  const start = timeWindow ? Math.max(bounds.min, timeWindow.start) : bounds.min;
  const end = timeWindow ? Math.min(bounds.max, timeWindow.end) : bounds.max;
  const active = timeWindow !== null;

  const onStart = (value: number) =>
    setTimeWindow({ start: Math.min(value, end), end });
  const onEnd = (value: number) =>
    setTimeWindow({ start, end: Math.max(value, start) });

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("timeline.label")}</label>
      <div className="ag-timeline-range">
        <input
          type="range"
          className="ag-timeline-slider"
          min={bounds.min}
          max={bounds.max}
          step={DAY}
          value={start}
          onChange={(e) => onStart(Number(e.target.value))}
        />
        <input
          type="range"
          className="ag-timeline-slider"
          min={bounds.min}
          max={bounds.max}
          step={DAY}
          value={end}
          onChange={(e) => onEnd(Number(e.target.value))}
        />
      </div>
      <div className="ag-timeline-dates">
        <span>{fmt(start)}</span>
        <span>{fmt(end)}</span>
      </div>
      {active && (
        <button
          type="button"
          className="ag-chip ag-timeline-reset"
          onClick={() => setTimeWindow(null)}
        >
          {t("timeline.all")}
        </button>
      )}
    </div>
  );
}

