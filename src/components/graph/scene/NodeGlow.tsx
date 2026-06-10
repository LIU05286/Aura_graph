import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MemoryNode } from "../../../types/graph";
import { TYPE_COLOR, importanceToGlow } from "../../../data/visualMappings";
import { getGlowTexture } from "./glowTexture";

interface NodeGlowProps {
  node: MemoryNode;
  emphasized: boolean; // 选中或悬停时更亮
  dimmed: boolean; // 搜索未命中时变暗
}

export default function NodeGlow({ node, emphasized, dimmed }: NodeGlowProps) {
  const matRef = useRef<THREE.SpriteMaterial>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => getGlowTexture(), []);
  const color = useMemo(
    () => new THREE.Color(node.color ?? TYPE_COLOR[node.type]),
    [node.color, node.type]
  );
  const baseGlow = node.size ? node.size * 3 : importanceToGlow(node.importance);
  // 随机相位,让每颗星呼吸不同步
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const mat = matRef.current;
    const sprite = spriteRef.current;
    if (!mat) return;
    const t = state.clock.elapsedTime;
    if (!sprite) return;
    // 脉冲:亮度在约 0.6~1.0 之间起伏,频率放慢,肉眼可见
    const pulse = 0.8 + 0.2 * Math.sin(t * 1.1 + phase);
    let target = dimmed ? 0.12 : 0.85;
    if (emphasized) target = 1;
    mat.opacity = target * pulse;
    // 强调时光晕放大,普通时复原,用 lerp 平滑
    const targetScale = baseGlow * (emphasized ? 1.5 : 1);
    const cur = sprite.scale.x;
    const next = cur + (targetScale - cur) * 0.15;
    sprite.scale.setScalar(next);
  });

  return (
    <sprite ref={spriteRef} position={[node.x, node.y, node.z]} scale={baseGlow} raycast={() => null}>
      <spriteMaterial
        ref={matRef}
        map={texture}
        color={color}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.9}
      />
    </sprite>
  );
}
