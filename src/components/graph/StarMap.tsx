import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MemoryNode, MemoryEdge } from "../../types/graph";
import {
  TYPE_COLOR,
  importanceToRadius,
  importanceToGlow,
  EDGE_COLOR_DIM,
  EDGE_COLOR_HOT,
} from "../../data/visualMappings";
import { getNodePosition } from "../../utils/graphLayout";

/**
 * 纯渲染组件:只吃 props,不知道 Zustand 的存在。
 * 设计红线(与规划文档一致):动画循环只读 ref,绝不在循环里调用 setState。
 * 频繁变化的交互状态经 props → propsRef 流入;仅"边的几何"在依赖变化时由 effect 重建。
 */
export interface StarMapProps {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  visibleIds: Set<string>;
  matchedIds: Set<string> | null;
  hasSearch: boolean;
  selectedNodeId: string | null;
  focusNodeId: string | null;
  focusNonce: number;
  onSelect: (id: string | null) => void;
}

interface NodeObject {
  group: THREE.Group;
  core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  glow: THREE.Sprite;
  baseRadius: number;
  baseGlow: number;
  phase: number;
  label: HTMLDivElement;
}

interface StarMapApi {
  rebuildEdges: () => void;
  focusOn: (pos: [number, number, number]) => void;
}

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** 生成径向辉光纹理:用 canvas 画一团光作为 Sprite 贴图,实现"星星发光" */
function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.85)");
  g.addColorStop(0.4, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function StarMap(props: StarMapProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelLayerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<StarMapApi | null>(null);

  // 始终持有最新 props,供动画循环 / 事件回调读取(避免闭包过期)
  const propsRef = useRef<StarMapProps>(props);
  propsRef.current = props;

  const { nodes, edges } = props;

  /* ---------- 场景初始化:仅在图谱数据(nodes/edges)变化时重建 ---------- */
  useEffect(() => {
    const mount = mountRef.current;
    const labelLayer = labelLayerRef.current;
    if (!mount || !labelLayer) return;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    const dom = renderer.domElement;
    dom.style.cursor = "grab";

    // —— 背景远景星空(Points) ——
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 60 + Math.random() * 80;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      starPos[i * 3 + 2] = r * Math.cos(ph);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xaecbff,
      size: 0.35,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // —— 节点:每个 = Group(实心核心 + 辉光 Sprite) ——
    const glowTex = makeGlowTexture();
    const sphereGeo = new THREE.SphereGeometry(1, 20, 20);
    const nodeObjs = new Map<string, NodeObject>();
    const coreMeshes: THREE.Object3D[] = [];
    const coreToId = new Map<THREE.Object3D, string>(); // 拾取用,避免依赖 userData

    for (const n of nodes) {
      const color = new THREE.Color(n.color ?? TYPE_COLOR[n.type]);
      const group = new THREE.Group();
      const [px, py, pz] = getNodePosition(n);
      group.position.set(px, py, pz);

      const baseRadius = n.size ?? importanceToRadius(n.importance);
      const coreColor = color.clone().lerp(new THREE.Color(0xffffff), 0.55);
      const core = new THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>(
        sphereGeo,
        new THREE.MeshBasicMaterial({ color: coreColor, transparent: true })
      );
      core.scale.setScalar(baseRadius);
      group.add(core);
      coreMeshes.push(core);
      coreToId.set(core, n.id);

      const baseGlow = importanceToGlow(n.importance);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.9,
        })
      );
      glow.scale.setScalar(baseGlow);
      group.add(glow);

      scene.add(group);

      const label = document.createElement("div");
      label.className = "ag-label";
      label.textContent = n.title;
      labelLayer.appendChild(label);

      nodeObjs.set(n.id, {
        group,
        core,
        glow,
        baseRadius,
        baseGlow,
        phase: Math.random() * Math.PI * 2,
        label,
      });
    }

    // —— 边:一条 LineSegments,用顶点色区分高亮/普通 ——
    const edgeGeo = new THREE.BufferGeometry();
    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(edgeLines);

    function rebuildEdges(): void {
      const { edges: curEdges, visibleIds, selectedNodeId } = propsRef.current;
      const positions: number[] = [];
      const colors: number[] = [];
      const dim = new THREE.Color(EDGE_COLOR_DIM);
      const hot = new THREE.Color(EDGE_COLOR_HOT);
      for (const e of curEdges) {
        if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) continue;
        const a = nodeObjs.get(e.source);
        const b = nodeObjs.get(e.target);
        if (!a || !b) continue;
        const connected =
          selectedNodeId !== null &&
          (e.source === selectedNodeId || e.target === selectedNodeId);
        const c = connected ? hot : dim;
        positions.push(a.group.position.x, a.group.position.y, a.group.position.z);
        positions.push(b.group.position.x, b.group.position.y, b.group.position.z);
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
      edgeGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      edgeGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    }

    /* ---------- 自实现轨道控制(拖拽旋转 / 滚轮缩放) ---------- */
    const ctrl = {
      target: new THREE.Vector3(0, 1, 1),
      radius: 26,
      theta: 0.6,
      phi: 1.2,
      dragging: false,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      lastInteract: 0,
      flying: false,
      focusPos: null as THREE.Vector3 | null,
    };

    function applyCamera(): void {
      const { target, radius, theta, phi } = ctrl;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.cos(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
    }

    const raycaster = new THREE.Raycaster();
    const hovered = { id: null as string | null };

    function toNDC(clientX: number, clientY: number): THREE.Vector2 {
      const rect = dom.getBoundingClientRect();
      return new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
    }

    function pickNode(clientX: number, clientY: number): string | null {
      raycaster.setFromCamera(toNDC(clientX, clientY), camera);
      const hits = raycaster.intersectObjects(coreMeshes, false);
      for (const h of hits) {
        const id = coreToId.get(h.object);
        if (id && propsRef.current.visibleIds.has(id)) return id;
      }
      return null;
    }

    const onPointerDown = (ev: PointerEvent): void => {
      ctrl.dragging = true;
      ctrl.flying = false;
      ctrl.lastX = ctrl.downX = ev.clientX;
      ctrl.lastY = ctrl.downY = ev.clientY;
      ctrl.lastInteract = performance.now();
    };
    const onPointerMove = (ev: PointerEvent): void => {
      if (ctrl.dragging) {
        ctrl.theta -= (ev.clientX - ctrl.lastX) * 0.005;
        ctrl.phi = clamp(
          ctrl.phi + (ev.clientY - ctrl.lastY) * 0.005,
          0.15,
          Math.PI - 0.15
        );
        ctrl.lastX = ev.clientX;
        ctrl.lastY = ev.clientY;
        ctrl.lastInteract = performance.now();
      } else {
        const id = pickNode(ev.clientX, ev.clientY);
        hovered.id = id;
        dom.style.cursor = id ? "pointer" : "grab";
      }
    };
    const onPointerUp = (ev: PointerEvent): void => {
      ctrl.dragging = false;
      const moved = Math.hypot(ev.clientX - ctrl.downX, ev.clientY - ctrl.downY);
      if (moved < 5) propsRef.current.onSelect(pickNode(ev.clientX, ev.clientY));
      ctrl.lastInteract = performance.now();
    };
    const onWheel = (ev: WheelEvent): void => {
      ev.preventDefault();
      ctrl.radius = clamp(ctrl.radius * (1 + ev.deltaY * 0.0012), 6, 120);
      ctrl.lastInteract = performance.now();
    };

    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    function focusOn(pos: [number, number, number]): void {
      ctrl.focusPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
      ctrl.flying = true;
    }
    apiRef.current = { rebuildEdges, focusOn };

    /* ---------- 动画循环 ---------- */
    const tmp = new THREE.Vector3();
    let raf = 0;
    const loop = (): void => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const t = now * 0.001;
      const { visibleIds, selectedNodeId, matchedIds, hasSearch } =
        propsRef.current;

      // 相机:空闲时缓慢自转(沉浸感);拖拽/飞行时暂停
      if (
        !ctrl.dragging &&
        !ctrl.flying &&
        !reduceMotion &&
        now - ctrl.lastInteract > 2500
      ) {
        ctrl.theta += 0.0009;
      }
      if (ctrl.flying && ctrl.focusPos) {
        ctrl.target.lerp(ctrl.focusPos, 0.06);
        ctrl.radius = lerp(ctrl.radius, 9, 0.06);
        if (ctrl.target.distanceTo(ctrl.focusPos) < 0.05) ctrl.flying = false;
      }
      applyCamera();
      starField.rotation.y += 0.00012;

      nodeObjs.forEach((o, id) => {
        const visible = visibleIds.has(id);
        const isSel = id === selectedNodeId;
        const isHover = id === hovered.id;
        const dimmedBySearch = hasSearch && matchedIds !== null && !matchedIds.has(id);

        let targetOpacity = visible ? 1 : 0;
        if (visible && dimmedBySearch) targetOpacity = 0.1;
        let targetScale = 1;
        if (isSel) targetScale = 1.55;
        else if (isHover) targetScale = 1.28;

        o.group.scale.setScalar(lerp(o.group.scale.x, targetScale, 0.15));

        const pulse = reduceMotion ? 1 : 0.92 + 0.08 * Math.sin(t * 1.5 + o.phase);
        const co = lerp(o.core.material.opacity, targetOpacity, 0.15);
        o.core.material.opacity = co;
        o.glow.material.opacity = co * pulse * (isSel || isHover ? 1 : 0.85);
        o.group.visible = co > 0.02;

        // 标签投影到屏幕
        tmp.copy(o.group.position).project(camera);
        const inFront = tmp.z < 1;
        const lx = (tmp.x * 0.5 + 0.5) * width;
        const ly = (-tmp.y * 0.5 + 0.5) * height;
        const lbl = o.label;
        if (inFront && co > 0.1) {
          const emphasize = isSel || isHover;
          lbl.style.display = "block";
          lbl.style.transform = `translate(-50%,-50%) translate(${lx}px,${
            ly - 14 - o.baseRadius * 8
          }px)`;
          lbl.style.opacity = String(emphasize ? 1 : co * 0.55);
          lbl.style.color = emphasize ? "#ffffff" : "rgba(200,215,240,0.9)";
          lbl.style.fontSize = emphasize ? "13px" : "11px";
        } else {
          lbl.style.display = "none";
        }
      });

      renderer.render(scene, camera);
    };

    applyCamera();
    rebuildEdges();
    loop();

    /* ---------- 自适应尺寸 ---------- */
    const ro = new ResizeObserver(() => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(mount);

    /* ---------- 卸载清理 ---------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
      nodeObjs.forEach((o) => {
        o.core.material.dispose();
        o.glow.material.dispose();
        o.label.remove();
      });
      sphereGeo.dispose();
      glowTex.dispose();
      starGeo.dispose();
      starMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
      apiRef.current = null;
    };
  }, [nodes, edges]);

  // 边几何:在可见性 / 选中变化时重建(节点透明度由动画循环处理,无需 effect)
  useEffect(() => {
    apiRef.current?.rebuildEdges();
  }, [props.visibleIds, props.selectedNodeId, edges]);

  // 收到聚焦请求时飞向目标
  useEffect(() => {
    if (!props.focusNodeId) return;
    const node = nodes.find((n) => n.id === props.focusNodeId);
    if (node) apiRef.current?.focusOn([node.x, node.y, node.z]);
    // 仅在 focusNonce 自增时触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focusNonce]);

  return (
    <div className="ag-canvas-wrap">
      <div ref={mountRef} className="ag-canvas" />
      <div ref={labelLayerRef} className="ag-labels" />
    </div>
  );
}
