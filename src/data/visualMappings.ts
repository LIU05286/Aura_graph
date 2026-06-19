import type { MemoryEdgeType, MemoryNodeType } from "../types/graph";

/**
 * 视觉映射:渲染层与 UI 共用的"单一数据源"。
 * 组件内禁止硬编码色值,一律从这里取。
 */

/** 类型 → 颜色(发光星星的主色) */
export const TYPE_COLOR: Record<MemoryNodeType, string> = {
  idea: "#FACC15",
  note: "#4F9DFF",
  person: "#FF9F43",
  project: "#34D399",
  book: "#A78BFA",
  course: "#F472B6",
  event: "#818CF8",
  concept: "#22D3EE",
  life: "#FB7185",
  phrase: "#A3E635",
  knowledge: "#E879F9",
};

/** Type → label */
export const TYPE_LABEL: Record<MemoryNodeType, string> = {
  idea: "灵感",
  note: "笔记",
  person: "人物",
  project: "项目",
  book: "书籍",
  course: "课程",
  event: "事件",
  concept: "概念",
  life: "生活",
  phrase: "短语",
  knowledge: "知识",
};

/** importance(1..5) → 核心球半径(纯函数,便于测试) */
export const importanceToRadius = (i: number): number => 0.12 + i * 0.16;

/** importance(1..5) → 辉光 Sprite 尺寸 */
export const importanceToGlow = (i: number): number => 0.8 + i * 0.9;

/** 时间近因 → 亮度因子(0.35..1):越新越亮,半衰期 40 天。纯函数,渲染层做时间渐变用。 */
const RECENCY_HALF_LIFE_MS = 40 * 86_400_000;
export function recencyFactor(createdAtIso: string, nowMs: number = Date.now()): number {
  const t = Date.parse(createdAtIso);
  if (Number.isNaN(t)) return 1;
  const age = Math.max(0, nowMs - t);
  const f = Math.pow(2, -age / RECENCY_HALF_LIFE_MS);
  return Math.max(0.35, Math.min(1, f));
}

/** 边的配色:普通 / 高亮(连接到选中节点) */
export const EDGE_COLOR_DIM = "#6a80ad";
export const EDGE_COLOR_HOT = "#bfe0ff";

export const EDGE_TYPE_LABEL: Record<MemoryEdgeType, string> = {
  related: "Related",
  causes: "Causes",
  supports: "Supports",
  contradicts: "Contradicts",
  source: "Source",
  similar: "Similar",
  extends: "Extends",
};
