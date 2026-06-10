import { db, DEFAULT_GALAXY_ID } from "./db";
import type { AuraGraph, Galaxy } from "../types/graph";

/** 读当前激活星系 id(没有则回退默认) */
export async function getActiveGalaxyId(): Promise<string> {
  const row = await db.meta.get("activeGalaxyId");
  return row?.value ?? DEFAULT_GALAXY_ID;
}

/** 设置当前激活星系 id */
export async function setActiveGalaxyId(id: string): Promise<void> {
  await db.meta.put({ key: "activeGalaxyId", value: id });
}

/** 读所有星系元信息 */
export async function listGalaxies(): Promise<Galaxy[]> {
  return db.galaxies.toArray();
}

/** 新增/更新一个星系元信息 */
export async function putGalaxy(galaxy: Galaxy): Promise<void> {
  await db.galaxies.put(galaxy);
}

/** 删除一个星系及其图数据 */
export async function deleteGalaxy(id: string): Promise<void> {
  await db.galaxies.delete(id);
  await db.galaxyGraphs.delete(id);
}

/** 读指定星系的图数据 */
export async function loadGraphById(galaxyId: string): Promise<AuraGraph | null> {
  const row = await db.galaxyGraphs.get(galaxyId);
  if (!row) return null;
  return { nodes: row.nodes, edges: row.edges };
}

/** 写指定星系的图数据 */
export async function saveGraphById(galaxyId: string, graph: AuraGraph): Promise<void> {
  await db.galaxyGraphs.put({ galaxyId, nodes: graph.nodes, edges: graph.edges });
}

/** —— 向后兼容:操作"当前激活星系" —— */
export async function loadGraph(): Promise<AuraGraph | null> {
  const id = await getActiveGalaxyId();
  return loadGraphById(id);
}

export async function saveGraph(graph: AuraGraph): Promise<void> {
  const id = await getActiveGalaxyId();
  await saveGraphById(id, graph);
}
