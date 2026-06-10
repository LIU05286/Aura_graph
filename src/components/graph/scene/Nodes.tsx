import { useEffect, useState } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { MemoryNode } from "../../../types/graph";
import { TYPE_COLOR, importanceToRadius } from "../../../data/visualMappings";
import NodeGlow from "./NodeGlow";

interface NodesProps {
  nodes: MemoryNode[];
  visibleIds: Set<string>;
  selectedNodeId: string | null;
  matchedIds: Set<string> | null;
  hasSearch: boolean;
  onSelect: (id: string | null) => void;
  onFocus: (id: string) => void;
}

export default function Nodes({
  nodes,
  visibleIds,
  selectedNodeId,
  matchedIds,
  hasSearch,
  onSelect,
  onFocus,
}: NodesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      {nodes.map((n) => {
        if (!visibleIds.has(n.id)) return null;
        const radius = n.size ?? importanceToRadius(n.importance);
        const isSel = n.id === selectedNodeId;
        const isHover = n.id === hoveredId;
        const dimmed = hasSearch && matchedIds !== null && !matchedIds.has(n.id);
        let factor = 1;
        if (isSel) factor = 1.55;
        else if (isHover) factor = 1.28;
        const scale = radius * factor;
        const opacity = dimmed ? 0.12 : 1;
        const emphasized = isSel || isHover;
        // 核心球颜色:类型色向白色提亮一点(和旧效果一致)
        const coreColor = new THREE.Color(n.color ?? TYPE_COLOR[n.type]).lerp(
          new THREE.Color(0xffffff),
          0.25
        );
        const handleClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(n.id);
          onFocus(n.id);
        };
        return (
          <group key={n.id}>
            <NodeGlow node={n} emphasized={emphasized} dimmed={dimmed} />
            <mesh
              position={[n.x, n.y, n.z]}
              scale={scale}
              onClick={handleClick}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(n.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId(null);
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial color={coreColor} transparent opacity={opacity} />
            </mesh>
            <Html
              position={[n.x, n.y + (radius + 0.5), n.z]}
              center
              distanceFactor={4}
              style={{ pointerEvents: "none" }}
              zIndexRange={[10, 0]}
            >
              <div
                className="ag-label"
                style={{
                  color: emphasized ? "#ffffff" : "rgba(200,215,240,0.9)",
                  fontSize: emphasized ? "100px" : "65px",
                  opacity: dimmed ? 0.2 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {n.title}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
