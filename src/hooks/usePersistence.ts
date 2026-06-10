import { useEffect, useRef } from "react";
import { useGraphStore } from "../store/graphStore";
import { loadGraph, saveGraph } from "../data/graphRepository";

export function usePersistence(): void {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const replaceGraph = useGraphStore((s) => s.replaceGraph);
  const loadedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      const saved = await loadGraph();
      if (saved) {
        replaceGraph(saved);
      } else {
        const { nodes: currentNodes, edges: currentEdges } = useGraphStore.getState();
        await saveGraph({ nodes: currentNodes, edges: currentEdges });
      }
      loadedRef.current = true;
    };

    void run();
  }, [replaceGraph]);

  useEffect(() => {
    if (!loadedRef.current) return;

    const timer = window.setTimeout(() => {
      void saveGraph({ nodes, edges });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [nodes, edges]);
}
