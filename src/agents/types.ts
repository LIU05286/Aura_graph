import type { MemoryNodeType, MemoryEdgeType, Intensity } from "../types/graph";

/** 一条 AI 抽取出的待确认记忆 */
export interface ProposedNode {
  tempId: string;
  title: string;
  content: string;
  type: MemoryNodeType;
  tags: string[];
  importance: Intensity;
  /** 合并候选:与之高度相似的已有节点(用户可选择并入) */
  mergeCandidateId?: string;
  mergeCandidateTitle?: string;
  mergeCandidateDate?: string; // 合并候选的创建日期(用于跨天区分)
}

/** 一条待确认的关系:从"建议节点"指向"已有节点" */
export interface ProposedRelation {
  sourceTempId: string;
  targetId: string;
  type: MemoryEdgeType;
  reason: string;
}

/** 整体提案:供确认面板展示,确认前不写库 */
export interface AgentProposal {
  nodes: ProposedNode[];
  tags: string[];
  relations: ProposedRelation[];
}

/** 一次问答的回答 */
export interface QaAnswer {
  answer: string;
  usedNodeIds: string[];
  contextIds: string[];
}

/** 问答历史的一轮 */
export interface QaTurn {
  id: string;
  question: string;
  answer: string;
  usedNodeIds: string[];
}

/** 复盘结果 */
export interface ReviewResult {
  summary: string;
  themes: string[];
  mood: string;
  ideas: string[];
  todos: string[];
}
