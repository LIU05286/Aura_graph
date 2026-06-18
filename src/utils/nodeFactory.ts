import type { MemoryNode, MemoryNodeType, MemoryStatus, Intensity } from "../types/graph";

/** 在球面壳层取随机坐标,避免新星堆在原点 */
export function randomPosition(): { x: number; y: number; z: number } {
  const r = 4 + Math.random() * 4;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
}

export interface CaptureInput {
  title: string;
  content?: string;
  type: MemoryNodeType;
  tags?: string[];
  importance?: Intensity;
  status?: MemoryStatus;
}

/** 由一次"记录"生成记忆节点;默认进入收件箱(status="inbox") */
export function createCapturedNode(input: CaptureInput): MemoryNode {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    content: input.content?.trim() ?? "",
    type: input.type,
    tags: input.tags ?? [],
    importance: input.importance ?? 3,
    status: input.status ?? "inbox",
    createdAt: now,
    updatedAt: now,
    ...randomPosition(),
  };
}
