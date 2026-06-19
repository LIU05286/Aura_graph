/**
 * 核心数据模型 —— Aura Graph 的"记忆星图"领域类型。
 * 这是整个工程的单一类型来源,store / utils / 渲染层都从这里取类型。
 */

export type MemoryNodeType =
  | "idea"
  | "note"
  | "person"
  | "project"
  | "book"
  | "course"
  | "event"
  | "concept"
  // —— 第二阶段新增类型 ——
  | "life"
  | "phrase"
  | "knowledge";

/** 记忆处理状态(第二阶段新增):待整理 / 已整理 / 已归档 */
export type MemoryStatus = "inbox" | "processed" | "archived";

/** 状态稳定顺序 */
export const MEMORY_STATUSES: MemoryStatus[] = ["inbox", "processed", "archived"];

export type MemoryEdgeType =
  | "related"
  | "causes"
  | "supports"
  | "contradicts"
  | "source"
  | "similar"
  | "extends";

/** 重要度 / 关系强度:1(最弱)~ 5(最强) */
export type Intensity = 1 | 2 | 3 | 4 | 5;

/** 一颗"星":一条记忆 / 笔记 / 概念 / 人物 …… */
export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  type: MemoryNodeType;
  tags: string[];
  importance: Intensity;
  createdAt: string; // ISO 字符串
  updatedAt: string; // ISO 字符串
  /** 处理状态(第二阶段新增);旧数据无此字段,读取时一律视为 "processed" */
  status?: MemoryStatus;
  /** 上次复盘时间(第四阶段);用于"待复盘"判定 */
  reviewedAt?: string;
  /** 3D 坐标(由 seed 或未来的布局算法写入) */
  x: number;
  y: number;
  z: number;
  /** 可选视觉覆盖:不填则按 type 自动取色 / 按 importance 自动取尺寸 */
  color?: string;
  size?: number;
}

/** 两颗星之间的连线:一段关系 */
export interface MemoryEdge {
  id: string;
  source: string; // MemoryNode.id
  target: string; // MemoryNode.id
  type: MemoryEdgeType;
  strength: Intensity;
  label?: string;
  createdAt: string;
}

/** 完整图谱:也是导入 / 导出 JSON 的结构 */
export interface AuraGraph {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

/** 所有节点类型(用于筛选面板等的稳定展示顺序) */
export const NODE_TYPES: MemoryNodeType[] = [
  "idea",
  "note",
  "person",
  "project",
  "book",
  "course",
  "event",
  "concept",
  "life",
  "phrase",
  "knowledge",
];


/** 星系类型(呼应"思维星系/事件星系"等) */
export type GalaxyKind = "thought" | "event" | "custom";

/** 一个星系:一张独立的图谱及其元信息 */
export interface Galaxy {
  id: string;
  name: string;
  kind: GalaxyKind;
  accentColor: string; // 主题色(十六进制),用于 UI 点缀
  createdAt: string;
  updatedAt: string;
}

/** 时间轴筛选窗口(P5.2):createdAt 落在 [start, end](毫秒)内的节点才可见 */
export interface TimeWindow {
  start: number;
  end: number;
}

/** 应用主视图(第一阶段新增):决定中间主工作区渲染哪个页面 */
export type AppView =
  | "today"
  | "inbox"
  | "memories"
  | "graph"
  | "review"
  | "agents"
  | "settings";

/** 视图稳定顺序(导航 / 底部 Tab 用) */
export const APP_VIEWS: AppView[] = [
  "today",
  "inbox",
  "memories",
  "graph",
  "review",
  "agents",
  "settings",
];
