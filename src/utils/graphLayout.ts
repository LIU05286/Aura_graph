import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceX,
  forceY,
  forceZ,
  forceCollide,
  type SimulationNode,
} from "d3-force-3d";
import type { MemoryNode, MemoryEdge } from "../types/graph";

export type Vec3 = [number, number, number];

/** 读取节点的 3D 坐标(渲染层统一从这里取,未来切换布局算法时只改这里) */
export function getNodePosition(node: MemoryNode): Vec3 {
  return [node.x, node.y, node.z];
}

interface LayoutNode extends SimulationNode {
  id: string;
}

/**
 * 用 d3-force-3d 计算力导布局,返回 id -> [x,y,z]。
 * 注意:只在传入的工作副本上跑模拟,绝不修改 store 里的原始节点。
 */
export function computeLayout(
  nodes: MemoryNode[],
  edges: MemoryEdge[]
): Map<string, Vec3> {
  const simNodes: LayoutNode[] = nodes.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    z: n.z,
  }));
  const simLinks = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const sim = forceSimulation<LayoutNode>(simNodes, 3)
    .force("charge", forceManyBody().strength(-30))
    .force(
      "link",
      forceLink(simLinks)
        .id((d: LayoutNode) => d.id)
        .distance(6)
        .strength(0.4)
    )
    .force("x", forceX(0).strength(0.1))
    .force("y", forceY(0).strength(0.1))
    .force("z", forceZ(0).strength(0.1))
    .force("collide", forceCollide(1.2))
    .stop();

  // 同步迭代到收敛(本轮不做动画,直接算最终坐标)
  for (let i = 0; i < 300; i++) sim.tick();

  const positions = new Map<string, Vec3>();
  for (const n of simNodes) {
    positions.set(n.id, [n.x ?? 0, n.y ?? 0, n.z ?? 0]);
  }
  return positions;
}
