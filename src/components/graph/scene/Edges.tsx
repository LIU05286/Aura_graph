import { useMemo } from "react";
import * as THREE from "three";
import type { MemoryNode, MemoryEdge } from "../../../types/graph";
import { EDGE_COLOR_DIM, EDGE_COLOR_HOT } from "../../../data/visualMappings";

interface EdgesProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  visibleIds: Set<string>;
  selectedNodeId: string | null;
}

export default function Edges({ nodes, edges, visibleIds, selectedNodeId }: EdgesProps) {
  const { positions, colors } = useMemo(() => {
    const posById = new Map(nodes.map((n) => [n.id, n] as const));
    const pos: number[] = [];
    const col: number[] = [];
    const dim = new THREE.Color(EDGE_COLOR_DIM);
    const hot = new THREE.Color(EDGE_COLOR_HOT);
    for (const e of edges) {
      if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) continue;
      const a = posById.get(e.source);
      const b = posById.get(e.target);
      if (!a || !b) continue;
      const connected =
        selectedNodeId !== null &&
        (e.source === selectedNodeId || e.target === selectedNodeId);
      const c = connected ? hot : dim;
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }, [nodes, edges, visibleIds, selectedNodeId]);

  if (positions.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.62}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
