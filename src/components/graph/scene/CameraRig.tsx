import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { MemoryNode } from "../../../types/graph";

interface CameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  nodes: MemoryNode[];
  focusNodeId: string | null;
  focusNonce: number;
}

export default function CameraRig({
  controlsRef,
  nodes,
  focusNodeId,
  focusNonce,
}: CameraRigProps) {
  const { camera } = useThree();

  // 飞向状态(全部用 ref,避免重渲染)
  const handledNonce = useRef(focusNonce); // 记住已处理到的请求号
  const flying = useRef(false);
  const flyTarget = useRef(new THREE.Vector3());
  const offsetVec = useRef(new THREE.Vector3());
  const lastInteract = useRef(performance.now());
  const prevCamPos = useRef(new THREE.Vector3());

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      lastInteract.current = performance.now();
      flying.current = false;
    };

    const onChange = () => {
      lastInteract.current = performance.now();
    };

    controls.addEventListener("start", onStart);
    controls.addEventListener("change", onChange);
    controls.addEventListener("end", onChange);

    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("change", onChange);
      controls.removeEventListener("end", onChange);
    };
  }, [controlsRef]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 1) 检测是否有新的飞向请求
    if (focusNonce !== handledNonce.current) {
      handledNonce.current = focusNonce;
      const node = focusNodeId ? nodes.find((n) => n.id === focusNodeId) : undefined;
      if (node) {
        flyTarget.current.set(node.x, node.y, node.z);
        flying.current = true;
        lastInteract.current = performance.now(); // 飞行也算交互,暂停自转
      }
    }

    // 2) 检测用户手动交互(相机位置被 OrbitControls 改变):打断飞行 + 重置空闲计时
    if (!prevCamPos.current.equals(camera.position) && !flying.current) {
      lastInteract.current = performance.now();
    }
    prevCamPos.current.copy(camera.position);

    // 3) 飞向动画:平滑把 controls.target 移到目标,并把相机拉近
    if (flying.current) {
      controls.target.lerp(flyTarget.current, 0.08);
      // 把相机也朝目标方向适当靠近(沿当前视线方向缩短距离)
      const desiredDist = 9;
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
      const dist = dir.length();
      if (dist > 0.001) {
        dir.normalize();
        const newDist = dist + (desiredDist - dist) * 0.08;
        camera.position.copy(controls.target).addScaledVector(dir, newDist);
      }
      if (controls.target.distanceTo(flyTarget.current) < 0.05) {
        flying.current = false;
      }
    }

    // 4) 空闲自转:绕 Y 轴小角度旋转相机位置(不依赖 controls 内部方位角)
    const idle = performance.now() - lastInteract.current > 2000;
    if (idle && !flying.current) {
      const offset = offsetVec.current;
      offset.subVectors(camera.position, controls.target); // 相机相对 target 的偏移
      const angle = 0.006; // 每帧旋转角度(弧度),越大越快
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = offset.x;
      const z = offset.z;
      offset.x = x * cos - z * sin;
      offset.z = x * sin + z * cos;
      camera.position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
    }

    controls.update();
  });

  return null;
}
