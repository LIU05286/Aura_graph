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

/** Type → label */
export const TYPE_LABEL: Record<MemoryNodeType, string> = {
  idea: "Idea",
  note: "Note",
  person: "Person",
  project: "Project",
  book: "Book",
  course: "Course",
  event: "Event",
  concept: "Concept",
};

/** importance(1..5) → 核心球半径(纯函数,便于测试) */
export const importanceToRadius = (i: number): number => 0.12 + i * 0.16;

/** importance(1..5) → 辉光 Sprite 尺寸 */
export const importanceToGlow = (i: number): number => 0.8 + i * 0.9;

/** 边的配色:普通 / 高亮(连接到选中节点) */
export const EDGE_COLOR_DIM = "#33415a";
export const EDGE_COLOR_HOT = "#9fd0ff";

export const EDGE_TYPE_LABEL: Record<MemoryEdgeType, string> = {
  related: "Related",
  causes: "Causes",
  supports: "Supports",
  contradicts: "Contradicts",
  source: "Source",
  similar: "Similar",
  extends: "Extends",
};
