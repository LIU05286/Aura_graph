import { useMemo } from "react";
import { useGraphStore } from "../../store/graphStore";
import { t } from "../../i18n";

function monthStart(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
function addMonths(ms: number, n: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth() + n, 1).getTime();
}
function monthEnd(ms: number): number {
  return addMonths(monthStart(ms), 1) - 1;
}
function fmtMonth(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

/** 时间轴筛选:按月吸附,把可见范围收窄到 [选中起始月, 选中结束月末];只设过滤窗口,不改数据 */
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
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max };
  }, [nodes]);

  const months = useMemo(() => {
    if (!bounds) return [];
    const out: number[] = [];
    let cur = monthStart(bounds.min);
    const last = monthStart(bounds.max);
    while (cur <= last) {
      out.push(cur);
      cur = addMonths(cur, 1);
    }
    return out;
  }, [bounds]);

  if (!bounds || months.length === 0) return null;

  const idxOf = (ms: number): number => {
    const ms0 = monthStart(ms);
    const i = months.findIndex((m) => m === ms0);
    if (i !== -1) return i;
    return ms0 < months[0] ? 0 : months.length - 1;
  };

  const startIdx = timeWindow ? idxOf(timeWindow.start) : 0;
  const endIdx = timeWindow ? idxOf(timeWindow.end) : months.length - 1;
  const active = timeWindow !== null;
  const maxIdx = months.length - 1;

  const onStart = (i: number) => {
    const s = Math.min(i, endIdx);
    setTimeWindow({ start: months[s], end: monthEnd(months[endIdx]) });
  };
  const onEnd = (i: number) => {
    const e = Math.max(i, startIdx);
    setTimeWindow({ start: months[startIdx], end: monthEnd(months[e]) });
  };

  const setThisMonth = () => {
    const m = monthStart(Date.now());
    setTimeWindow({ start: m, end: monthEnd(m) });
  };
  const setLast3 = () => {
    setTimeWindow({ start: addMonths(monthStart(Date.now()), -2), end: monthEnd(Date.now()) });
  };

  return (
    <div className="ag-section">
      <label className="ag-eyebrow">{t("timeline.label")}</label>
      <div className="ag-timeline-range">
        <input
          type="range"
          className="ag-timeline-slider"
          min={0}
          max={maxIdx}
          step={1}
          value={startIdx}
          onChange={(e) => onStart(Number(e.target.value))}
        />
        <input
          type="range"
          className="ag-timeline-slider"
          min={0}
          max={maxIdx}
          step={1}
          value={endIdx}
          onChange={(e) => onEnd(Number(e.target.value))}
        />
      </div>
      <div className="ag-timeline-dates">
        <span>{fmtMonth(months[startIdx])}</span>
        <span>{fmtMonth(months[endIdx])}</span>
      </div>
      <div className="ag-timeline-quick">
        <button type="button" className="ag-chip" onClick={setThisMonth}>
          {t("timeline.thisMonth")}
        </button>
        <button type="button" className="ag-chip" onClick={setLast3}>
          {t("timeline.last3")}
        </button>
        {active && (
          <button type="button" className="ag-chip" onClick={() => setTimeWindow(null)}>
            {t("timeline.all")}
          </button>
        )}
      </div>
    </div>
  );
}
