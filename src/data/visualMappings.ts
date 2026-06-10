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
};

/** 类型 → 中文标签 */
export const TYPE_LABEL: Record<MemoryNodeType, string> = {
  idea: "想法",
  note: "笔记",
  person: "人物",
  project: "项目",
  book: "书籍",
  course: "课程",
  event: "事件",
  concept: "概念",
};

/** importance(1..5) → 核心球半径(纯函数,便于测试) */
export const importanceToRadius = (i: number): number => 0.18 + i * 0.07;

/** importance(1..5) → 辉光 Sprite 尺寸 */
export const importanceToGlow = (i: number): number => 1.1 + i * 0.55;

/** 边的配色:普通 / 高亮(连接到选中节点) */
export const EDGE_COLOR_DIM = "#33415a";
export const EDGE_COLOR_HOT = "#9fd0ff";

export const EDGE_TYPE_LABEL: Record<MemoryEdgeType, string> = {
  related: "相关",
  causes: "导致",
  supports: "支持",
  contradicts: "矛盾",
  source: "来源",
  similar: "相似",
  extends: "延伸",
};
