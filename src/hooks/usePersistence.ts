import { useEffect, useRef } from "react";
import { useGraphStore } from "../store/graphStore";
import {
  listGalaxies,
  getActiveGalaxyId,
  setActiveGalaxyId,
  loadGraphById,
  saveGraphById,
  putGalaxy,
  DEFAULT_GALAXY_ID,
} from "../data/graphRepository";

/**
 * 持久化:
 * - 启动时载入星系列表 + 当前激活星系的图。
 * - 监听 activeGalaxyId 变化:先把当前图写回旧星系,再载入新星系的图。
 * - 防抖(400ms)把当前图保存回它所属的星系(ownerGalaxyRef)。
 */
export function usePersistence(): void {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const activeGalaxyId = useGraphStore((s) => s.activeGalaxyId);
  const replaceGraph = useGraphStore((s) => s.replaceGraph);
  const initGalaxies = useGraphStore((s) => s.initGalaxies);

  // 加载中(启动 / 切换星系)禁止防抖保存写库,避免加载途中乱写
  const hydratingRef = useRef(true);
  // 内存里这张图属于哪个星系;保存永远写回它,杜绝存错库
  const ownerGalaxyRef = useRef<string | null>(null);

  // —— 启动:载入星系列表 + 当前激活星系的图 ——
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const list = await listGalaxies();
      const activeId = await getActiveGalaxyId();

      // 兜底:全新浏览器(没跑过 v1→v2 迁移)时 galaxies/meta 可能为空。
      // 把当前内存里的(种子)图存进默认星系,并补一行星系元信息 + meta。
      if (list.length === 0) {
        const now = new Date().toISOString();
        const defaultGalaxy = {
          id: DEFAULT_GALAXY_ID,
          name: "My Universe",
          kind: "thought" as const,
          accentColor: "#4f9dff",
          createdAt: now,
          updatedAt: now,
        };
        await putGalaxy(defaultGalaxy);
        const { nodes: curN, edges: curE } = useGraphStore.getState();
        await saveGraphById(DEFAULT_GALAXY_ID, { nodes: curN, edges: curE });
        await setActiveGalaxyId(DEFAULT_GALAXY_ID);
        list.push(defaultGalaxy);
      }

      const resolvedActive =
        list.find((g) => g.id === activeId)?.id ?? list[0].id;
      const graph =
        (await loadGraphById(resolvedActive)) ?? { nodes: [], edges: [] };
      if (cancelled) return;

      replaceGraph(graph);
      initGalaxies(list, resolvedActive);
      ownerGalaxyRef.current = resolvedActive;
      hydratingRef.current = false;
    };
    void run();
    return () => {
      cancelled = true;
    };
    // 仅启动跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— 切换星系:flush 旧星系 → 载入新星系 ——
  useEffect(() => {
    if (hydratingRef.current) return; // 启动加载阶段不处理
    if (activeGalaxyId === null) return;
    if (activeGalaxyId === ownerGalaxyRef.current) return; // 没有真正切换
    let cancelled = false;
    const run = async () => {
      hydratingRef.current = true;
      const prev = ownerGalaxyRef.current;
      if (prev) {
        const { nodes: curN, edges: curE } = useGraphStore.getState();
        await saveGraphById(prev, { nodes: curN, edges: curE }); // 先把旧星系存盘
      }
      const graph =
        (await loadGraphById(activeGalaxyId)) ?? { nodes: [], edges: [] };
      if (cancelled) return;
      replaceGraph(graph);
      ownerGalaxyRef.current = activeGalaxyId;
      hydratingRef.current = false;
      void setActiveGalaxyId(activeGalaxyId); // 后台持久化 meta,不阻塞
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [activeGalaxyId, replaceGraph]);

  // —— 防抖保存当前图到它所属的星系 ——
  useEffect(() => {
    if (hydratingRef.current) return;
    const owner = ownerGalaxyRef.current;
    if (!owner) return;
    const timer = window.setTimeout(() => {
      void saveGraphById(owner, { nodes, edges });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [nodes, edges]);
}
