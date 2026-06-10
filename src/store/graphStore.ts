import { create } from "zustand";
import type {
  AuraGraph,
  MemoryNode,
  MemoryEdge,
  MemoryNodeType,
} from "../types/graph";
import { createSeedGraph } from "../data/seedGraph";

/**
 * 全局图谱状态。
 * 渲染层(StarMap)不直接依赖本 store —— 由 GraphCanvas 适配 store → props,
 * 以保持渲染层可独立测试、未来换 R3F 时边界不变。
 */
export interface GraphState {
  // —— 数据 ——
  nodes: MemoryNode[];
  edges: MemoryEdge[];

  // —— 交互状态 ——
  selectedNodeId: string | null;
  searchTerm: string;
  hiddenTypes: Set<MemoryNodeType>; // 被关闭(隐藏)的类型
  activeTags: Set<string>; // 被激活(聚焦)的星座;空集表示不过滤
  focusNodeId: string | null; // 相机请求飞向的目标
  focusNonce: number; // 每次请求自增,用于触发渲染层的飞向动画
  editorMode: "create" | "edit" | null;
  editorNodeId: string | null;

  // —— 本轮 actions ——
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

  // —— 预留:下一轮接 UI(本轮已可用,但暂不在界面暴露入口) ——
  addNode: (node: MemoryNode) => void;
  updateNode: (id: string, patch: Partial<MemoryNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: MemoryEdge) => void;
  deleteEdge: (id: string) => void;
  setNodePositions: (positions: Map<string, [number, number, number]>) => void;
}

const initial = createSeedGraph();

export const useGraphStore = create<GraphState>((set) => ({
  nodes: initial.nodes,
  edges: initial.edges,

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

  // —— 预留实现:已可工作,只是本轮无 UI 入口 ——
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

  deleteEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),

  setNodePositions: (positions) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        const p = positions.get(n.id);
        return p ? { ...n, x: p[0], y: p[1], z: p[2] } : n;
      }),
    })),
}));
