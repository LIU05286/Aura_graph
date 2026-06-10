import { create } from "zustand";
import type {
  AuraGraph,
  MemoryNode,
  MemoryEdge,
  MemoryNodeType,
  Galaxy,
  GalaxyKind,
} from "../types/graph";
import { createSeedGraph } from "../data/seedGraph";
import {
  putGalaxy,
  saveGraphById,
  deleteGalaxy as deleteGalaxyData,
} from "../data/graphRepository";

/**
 * 全局图谱状态。
 * 渲染层(StarScene)不直接依赖本 store —— 由 GraphCanvas 适配 store → props。
 */
export interface GraphState {
  // —— 数据 ——
  nodes: MemoryNode[];
  edges: MemoryEdge[];

  // —— 多星系 ——
  galaxies: Galaxy[];
  activeGalaxyId: string | null;

  // —— 交互状态 ——
  selectedNodeId: string | null;
  searchTerm: string;
  hiddenTypes: Set<MemoryNodeType>;
  activeTags: Set<string>;
  focusNodeId: string | null;
  focusNonce: number;
  editorMode: "create" | "edit" | null;
  editorNodeId: string | null;

  // —— actions:图与交互 ——
  selectNode: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleType: (type: MemoryNodeType) => void;
  toggleTag: (tag: string) => void;
  requestFocusNode: (id: string) => void;
  openCreateNode: () => void;
  openEditNode: (id: string) => void;
  closeEditor: () => void;
  replaceGraph: (graph: AuraGraph) => void;
  resetToSeed: () => void;

  // —— actions:多星系 ——
  /** 仅启动时由 usePersistence 调用:一次性灌入星系列表 + 当前激活星系 */
  initGalaxies: (galaxies: Galaxy[], activeGalaxyId: string) => void;
  /** 切换激活星系(纯状态;图数据的加载由 usePersistence 监听 activeGalaxyId 完成) */
  switchGalaxy: (id: string) => void;
  /** 新建星系(写库 + 入列表 + 切过去) */
  createGalaxy: (name: string, kind?: GalaxyKind) => Promise<void>;
  /** 重命名星系(写库 + 更新列表) */
  renameGalaxy: (id: string, name: string) => Promise<void>;
  /** 删除星系(写库 + 出列表;若删的是激活星系则切到剩余第一个;至少保留一个) */
  deleteGalaxy: (id: string) => Promise<void>;

  // —— 节点/边增删改 ——
  addNode: (node: MemoryNode) => void;
  updateNode: (id: string, patch: Partial<MemoryNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: MemoryEdge) => void;
  deleteEdge: (id: string) => void;
  setNodePositions: (positions: Map<string, [number, number, number]>) => void;
}

const initial: AuraGraph = { nodes: [], edges: [] };

/** 新星系的点缀色调色板,按现有星系数量轮换取色 */
const ACCENT_PALETTE = [
  "#4f9dff",
  "#ff7eb6",
  "#7ee787",
  "#ffd166",
  "#b692ff",
  "#5be0d6",
];

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: initial.nodes,
  edges: initial.edges,

  galaxies: [],
  activeGalaxyId: null,

  selectedNodeId: null,
  searchTerm: "",
  hiddenTypes: new Set<MemoryNodeType>(),
  activeTags: new Set<string>(),
  focusNodeId: null,
  focusNonce: 0,
  editorMode: null,
  editorNodeId: null,

  selectNode: (id) => set({ selectedNodeId: id }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  toggleType: (type) =>
    set((state) => {
      const next = new Set(state.hiddenTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { hiddenTypes: next };
    }),

  toggleTag: (tag) =>
    set((state) => {
      const next = new Set(state.activeTags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return { activeTags: next };
    }),

  requestFocusNode: (id) =>
    set((state) => ({ focusNodeId: id, focusNonce: state.focusNonce + 1 })),

  openCreateNode: () => set({ editorMode: "create", editorNodeId: null }),

  openEditNode: (id) => set({ editorMode: "edit", editorNodeId: id }),

  closeEditor: () => set({ editorMode: null, editorNodeId: null }),

  replaceGraph: (graph) =>
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      selectedNodeId: null,
    }),

  resetToSeed: () => {
    const fresh = createSeedGraph();
    set({
      nodes: fresh.nodes,
      edges: fresh.edges,
      selectedNodeId: null,
      searchTerm: "",
      hiddenTypes: new Set<MemoryNodeType>(),
      activeTags: new Set<string>(),
    });
  },

  // —— 多星系 actions ——
  initGalaxies: (galaxies, activeGalaxyId) => set({ galaxies, activeGalaxyId }),

  switchGalaxy: (id) => set({ activeGalaxyId: id }),

  createGalaxy: async (name, kind = "custom") => {
    const now = new Date().toISOString();
    const existing = get().galaxies;
    const accentColor = ACCENT_PALETTE[existing.length % ACCENT_PALETTE.length];
    const galaxy: Galaxy = {
      id: `galaxy-${crypto.randomUUID()}`,
      name: name.trim() || "New Galaxy",
      kind,
      accentColor,
      createdAt: now,
      updatedAt: now,
    };
    await putGalaxy(galaxy);
    await saveGraphById(galaxy.id, { nodes: [], edges: [] });
    set((s) => ({ galaxies: [...s.galaxies, galaxy] }));
    // 切到新星系;usePersistence 监听 activeGalaxyId 变化,会把当前图写回旧星系并载入新星系(空图)
    set({ activeGalaxyId: galaxy.id });
  },

  renameGalaxy: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const target = get().galaxies.find((g) => g.id === id);
    if (!target) return;
    const updated: Galaxy = {
      ...target,
      name: trimmed,
      updatedAt: new Date().toISOString(),
    };
    await putGalaxy(updated);
    set((s) => ({
      galaxies: s.galaxies.map((g) => (g.id === id ? updated : g)),
    }));
  },

  deleteGalaxy: async (id) => {
    const { galaxies, activeGalaxyId } = get();
    if (galaxies.length <= 1) return; // 至少保留一个星系,拒绝删最后一个
    await deleteGalaxyData(id); // 删 galaxies 行 + galaxyGraphs 行
    const remaining = galaxies.filter((g) => g.id !== id);
    set({ galaxies: remaining });
    if (activeGalaxyId === id) {
      set({ activeGalaxyId: remaining[0].id }); // usePersistence 监听到后载入该星系
    }
  },

  // —— 节点/边增删改 ——
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  deleteEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),

  setNodePositions: (positions) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        const p = positions.get(n.id);
        return p ? { ...n, x: p[0], y: p[1], z: p[2] } : n;
      }),
    })),
}));
