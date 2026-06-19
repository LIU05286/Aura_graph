import type { AuraGraph, Galaxy } from "../types/graph";
import { apiGetData, apiPutData, type ServerDoc } from "../api/client";

export const DEFAULT_GALAXY_ID = "galaxy-default";

// 内存缓存整份服务器文档;读走缓存副本,写改缓存后整份 PUT 回服务器。
let cache: ServerDoc | null = null;
let loading: Promise<ServerDoc> | null = null;

/** 按 id 去重,保留首次出现 —— 自愈历史上写入的重复星系 */
function dedupeById(galaxies: Galaxy[]): Galaxy[] {
  const seen = new Set<string>();
  const out: Galaxy[] = [];
  for (const g of galaxies) {
    if (g && typeof g.id === "string" && !seen.has(g.id)) {
      seen.add(g.id);
      out.push(g);
    }
  }
  return out;
}

function normalize(d: Partial<ServerDoc> | null | undefined): ServerDoc {
  const galaxies = Array.isArray(d?.galaxies) ? (d!.galaxies as Galaxy[]) : [];
  return {
    galaxies: dedupeById(galaxies),
    activeGalaxyId: typeof d?.activeGalaxyId === "string" ? d!.activeGalaxyId : null,
    graphs:
      d?.graphs && typeof d.graphs === "object"
        ? (d!.graphs as Record<string, AuraGraph>)
        : {},
  };
}

async function ensureDoc(): Promise<ServerDoc> {
  if (cache) return cache;
  if (!loading) {
    loading = apiGetData()
      .then(async (d) => {
        const before = Array.isArray(d?.galaxies) ? d.galaxies.length : 0;
        cache = normalize(d);
        // 去重后数量变了,说明服务器有历史重复,顺手写回一份干净数据(自愈)
        if (cache.galaxies.length !== before) {
          await apiPutData(cache);
        }
        return cache;
      })
      .catch((e) => {
        loading = null; // 失败可重试
        throw e;
      });
  }
  return loading;
}

async function flush(): Promise<void> {
  if (cache) await apiPutData(cache);
}

export async function getActiveGalaxyId(): Promise<string> {
  const doc = await ensureDoc();
  return doc.activeGalaxyId ?? DEFAULT_GALAXY_ID;
}
export async function setActiveGalaxyId(id: string): Promise<void> {
  const doc = await ensureDoc();
  doc.activeGalaxyId = id;
  await flush();
}
/** 返回副本:避免调用方(store / usePersistence)与内部缓存共享同一数组而互相污染 */
export async function listGalaxies(): Promise<Galaxy[]> {
  const doc = await ensureDoc();
  return doc.galaxies.map((g) => ({ ...g }));
}
export async function putGalaxy(galaxy: Galaxy): Promise<void> {
  const doc = await ensureDoc();
  const i = doc.galaxies.findIndex((g) => g.id === galaxy.id);
  if (i >= 0) doc.galaxies[i] = galaxy;
  else doc.galaxies.push(galaxy);
  await flush();
}
export async function deleteGalaxy(id: string): Promise<void> {
  const doc = await ensureDoc();
  doc.galaxies = doc.galaxies.filter((g) => g.id !== id);
  delete doc.graphs[id];
  await flush();
}
export async function loadGraphById(galaxyId: string): Promise<AuraGraph | null> {
  const doc = await ensureDoc();
  const g = doc.graphs[galaxyId];
  return g ? { nodes: [...g.nodes], edges: [...g.edges] } : null;
}
export async function saveGraphById(galaxyId: string, graph: AuraGraph): Promise<void> {
  const doc = await ensureDoc();
  doc.graphs[galaxyId] = { nodes: graph.nodes, edges: graph.edges };
  await flush();
}
export async function loadGraph(): Promise<AuraGraph | null> {
  const id = await getActiveGalaxyId();
  return loadGraphById(id);
}
export async function saveGraph(graph: AuraGraph): Promise<void> {
  const id = await getActiveGalaxyId();
  await saveGraphById(id, graph);
}
