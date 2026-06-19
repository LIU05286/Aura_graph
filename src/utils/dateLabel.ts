const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** 与今天相差几天:0=今天,1=昨天,... 非法日期返回 NaN */
export function dayDiff(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NaN;
  return Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);
}

/** 卡片用短日期:今天 / 昨天 / M-D */
export function formatShort(iso: string): string {
  const diff = dayDiff(iso);
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

/** 分组标题:今天 · 2026年6月18日 周三 */
export function formatDayHeader(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "未知日期";
  const base = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
  const diff = dayDiff(iso);
  if (diff === 0) return `今天 · ${base}`;
  if (diff === 1) return `昨天 · ${base}`;
  return base;
}

/** 同一天的稳定 key,用于分组 */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 今天的完整日期:2026年6月18日 周三 */
export function todayHeader(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
}
