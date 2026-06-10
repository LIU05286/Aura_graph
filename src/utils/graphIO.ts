import type { AuraGraph } from "../types/graph";

export function exportGraphToFile(graph: AuraGraph): void {
  const json = JSON.stringify(graph, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aura-graph.json";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
}

export function parseGraphFromText(text: string): AuraGraph {
  const obj: unknown = JSON.parse(text);
  if (
    !obj ||
    typeof obj !== "object" ||
    !Array.isArray((obj as { nodes?: unknown }).nodes) ||
    !Array.isArray((obj as { edges?: unknown }).edges)
  ) {
    throw new Error("JSON 格式不正确:缺少 nodes 或 edges 数组");
  }

  return {
    nodes: (obj as AuraGraph).nodes,
    edges: (obj as AuraGraph).edges,
  };
}
