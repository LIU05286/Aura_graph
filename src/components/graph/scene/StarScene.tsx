import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { MemoryNode, MemoryEdge } from "../../../types/graph";
import CameraRig from "./CameraRig";
import Edges from "./Edges";
import Nodes from "./Nodes";

// props 形状与旧 StarMap 保持一致,方便 GraphCanvas 几乎零改动地切换过来。
// 本子步骤暂未用到的 props(edges、matchedIds、hasSearch、focusNodeId、focusNonce)
// 先保留在接口里,后续子步骤会用到。
export interface StarSceneProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  visibleIds: Set<string>;
  matchedIds: Set<string> | null;
  hasSearch: boolean;
  selectedNodeId: string | null;
  focusNodeId: string | null;
  focusNonce: number;
  onSelect: (id: string | null) => void;
  onFocus: (id: string) => void;
}

export default function StarScene(props: StarSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="ag-canvas-wrap">
      <Canvas
        className="ag-canvas"
        frameloop="always"
        camera={{ position: [0, 6, 26], fov: 55, near: 0.1, far: 1000 }}
        gl={{ alpha: true, antialias: true }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <Stars
          radius={120}
          depth={60}
          count={1400}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />
        <Edges
          nodes={props.nodes}
          edges={props.edges}
          visibleIds={props.visibleIds}
          selectedNodeId={props.selectedNodeId}
        />
        <Nodes
          nodes={props.nodes}
          visibleIds={props.visibleIds}
          selectedNodeId={props.selectedNodeId}
          matchedIds={props.matchedIds}
          hasSearch={props.hasSearch}
          onSelect={props.onSelect}
          onFocus={props.onFocus}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan
          screenSpacePanning
          panSpeed={0.8}
          minDistance={6}
          maxDistance={120}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
        <CameraRig
          controlsRef={controlsRef}
          nodes={props.nodes}
          focusNodeId={props.focusNodeId}
          focusNonce={props.focusNonce}
        />
      </Canvas>
    </div>
  );
}
