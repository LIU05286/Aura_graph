import Dexie, { type Table } from "dexie";
import type { MemoryNode, MemoryEdge, Galaxy } from "../types/graph";

/** 每个星系的图数据,一行一个星系 */
export interface GraphRow {
  galaxyId: string; // 主键
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

/** 星系元信息表的行 */
export interface GalaxyRow extends Galaxy {}

/** 全局元数据(如当前激活星系)用键值对存 */
export interface MetaRow {
  key: string; // 主键,如 "activeGalaxyId"
  value: string;
}

export const DEFAULT_GALAXY_ID = "galaxy-default";

class AuraGraphDB extends Dexie {
  /** 新:按星系存储的图数据(主键 galaxyId) */
  galaxyGraphs!: Table<GraphRow, string>;
  galaxies!: Table<GalaxyRow, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super("aura-graph");

    // v1:旧结构,单表 graph(主键 "id"),存一行 id="current"
    this.version(1).stores({ graph: "id" });

    // v2:多星系结构。
    // 关键:不要原地修改 graph 表的主键(Dexie 改主键会删表重建,
    // 旧数据会在 upgrade 回调执行前就被清空)。
    // 这里新建 galaxyGraphs 表;旧 graph 表本版不声明 = Dexie 原样保留(含数据)。
    // upgrade 里从仍然完好的旧 graph 表读出数据,迁移进 galaxyGraphs。
    this.version(2)
      .stores({
        galaxyGraphs: "galaxyId",
        galaxies: "id",
        meta: "key",
        // 注意:这里【故意不声明 graph】,让 v1 的 graph 表原样保留
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString();
        // 此刻旧 graph 表仍是 v1 结构(主键 "id"),数据完好
        const oldRows = await tx.table("graph").toArray();
        const current = oldRows.find(
          (r: { id?: string }) => r.id === "current"
        );

        await tx.table("galaxies").put({
          id: DEFAULT_GALAXY_ID,
          name: "My Universe",
          kind: "thought",
          accentColor: "#4f9dff",
          createdAt: now,
          updatedAt: now,
        });

        await tx.table("galaxyGraphs").put({
          galaxyId: DEFAULT_GALAXY_ID,
          nodes: current?.nodes ?? [],
          edges: current?.edges ?? [],
        });

        await tx.table("meta").put({
          key: "activeGalaxyId",
          value: DEFAULT_GALAXY_ID,
        });
      });

    this.galaxyGraphs = this.table("galaxyGraphs");
    this.galaxies = this.table("galaxies");
    this.meta = this.table("meta");
  }
}

export const db = new AuraGraphDB();
