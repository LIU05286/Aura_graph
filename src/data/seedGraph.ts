import type { AuraGraph, MemoryNode, MemoryEdge } from "../types/graph";

/**
 * 内置示例数据:一个"个人记忆宇宙",分为数学 / 物理 / 方法论三个星团。
 * 由原型的 position:[x,y,z] 转为正式模型的 x/y/z 字段。
 */

const T = "2025-01-01T00:00:00.000Z"; // 示例统一时间戳

const nodes: MemoryNode[] = [
  // —— 数学星团 ——
  { id: "n1", title: "线性代数", type: "concept", importance: 4, tags: ["数学"], x: -7, y: 1, z: -3, createdAt: T, updatedAt: T, content: "研究向量空间与线性映射的语言。几乎所有后续课程(机器学习、量子力学、信号处理)的底座。" },
  { id: "n2", title: "特征值与特征向量", type: "concept", importance: 4, tags: ["数学"], x: -5, y: 2.4, z: -4.2, createdAt: T, updatedAt: T, content: "矩阵作用下方向不变、只被拉伸的向量。理解振动模态、主成分分析、稳定性的钥匙。" },
  { id: "n3", title: "矩阵分解", type: "concept", importance: 3, tags: ["数学"], x: -8.4, y: -1.2, z: -1.5, createdAt: T, updatedAt: T, content: "SVD / QR / LU 等把复杂矩阵拆成简单结构,是数值计算与降维的核心手段。" },
  { id: "n4", title: "《线性代数应该这样学》", type: "book", importance: 3, tags: ["数学", "读书"], x: -6.2, y: 3.1, z: -1, createdAt: T, updatedAt: T, content: "Axler 的经典教材,从抽象向量空间出发,刻意推迟行列式,强调几何直觉。" },

  // —— 物理星团 ——
  { id: "n5", title: "电磁学", type: "concept", importance: 5, tags: ["物理"], x: 6.5, y: -1, z: 2, createdAt: T, updatedAt: T, content: "电场与磁场如何产生、相互转化并传播。整个现代电气文明的理论根基。" },
  { id: "n6", title: "麦克斯韦方程组", type: "concept", importance: 5, tags: ["物理"], x: 8.4, y: 0.2, z: 1, createdAt: T, updatedAt: T, content: "四个方程统一电、磁与光,预言了电磁波。物理学中最优雅的对称结构之一。" },
  { id: "n7", title: "对称性", type: "concept", importance: 4, tags: ["物理", "数学"], x: 4.6, y: 1.3, z: 4.2, createdAt: T, updatedAt: T, content: "横跨数学与物理的桥梁:每一种连续对称都对应一个守恒量(诺特定理)。" },
  { id: "n8", title: "费曼", type: "person", importance: 4, tags: ["物理", "方法论"], x: 7.2, y: -3, z: 3, createdAt: T, updatedAt: T, content: "物理学家,以费曼图与极强的物理直觉著称。学习观:能用简单话讲清,才算真懂。" },
  { id: "n9", title: "《费曼物理学讲义》", type: "book", importance: 4, tags: ["物理", "读书"], x: 9.2, y: -2, z: 0, createdAt: T, updatedAt: T, content: "把深刻物理用直观图景讲出来的典范,适合建立物理'画面感'。" },

  // —— 方法 / 项目 / 读书星团 ——
  { id: "n10", title: "Aura Graph 项目", type: "project", importance: 5, tags: ["项目"], x: 0, y: 2, z: 6, createdAt: T, updatedAt: T, content: "把知识、笔记、想法可视化成 3D 星图的前端项目。当前正在做 MVP。" },
  { id: "n11", title: "第二大脑", type: "idea", importance: 4, tags: ["方法论", "项目"], x: -1.2, y: 4, z: 5, createdAt: T, updatedAt: T, content: "把记忆外化到一个可检索、可连接的系统里,让大脑专注思考而非存储。" },
  { id: "n12", title: "间隔重复", type: "concept", importance: 3, tags: ["方法论"], x: 2.4, y: 3.2, z: 7, createdAt: T, updatedAt: T, content: "在遗忘临界点复习,用最少次数把知识送进长期记忆。Anki 背后的原理。" },
  { id: "n13", title: "《思考,快与慢》", type: "book", importance: 3, tags: ["读书", "方法论"], x: -2.4, y: 1, z: 8, createdAt: T, updatedAt: T, content: "卡尼曼区分快速直觉(系统1)与缓慢理性(系统2),解释了大量认知偏误。" },
  { id: "n14", title: "卡片笔记法", type: "idea", importance: 4, tags: ["方法论", "读书"], x: 1.2, y: 0.2, z: 5, createdAt: T, updatedAt: T, content: "Zettelkasten:每条笔记是一张可独立、可链接的卡片,靠连接而非分类生长。" },
  { id: "n15", title: "学习方法", type: "note", importance: 3, tags: ["方法论"], x: -3.2, y: 3, z: 6.2, createdAt: T, updatedAt: T, content: "关于如何高效学习的笔记总集:主动回忆、间隔重复、费曼讲解、刻意练习。" },
  { id: "n16", title: "React Three Fiber", type: "course", importance: 3, tags: ["项目"], x: 2.2, y: 5, z: 4, createdAt: T, updatedAt: T, content: "用 React 声明式写 three.js 的库。Aura Graph 后续渲染层的目标技术。" },
  { id: "n17", title: "知识图谱", type: "concept", importance: 4, tags: ["项目", "方法论"], x: 0.2, y: 0.4, z: 3, createdAt: T, updatedAt: T, content: "用节点与关系表达知识结构,是 Aura Graph、第二大脑、学习方法的共同内核。" },
];

const edges: MemoryEdge[] = [
  { id: "e1", source: "n1", target: "n2", type: "extends", strength: 4, createdAt: T },
  { id: "e2", source: "n1", target: "n3", type: "extends", strength: 3, createdAt: T },
  { id: "e3", source: "n4", target: "n1", type: "source", strength: 3, createdAt: T },
  { id: "e4", source: "n2", target: "n7", type: "related", strength: 3, createdAt: T },
  { id: "e5", source: "n7", target: "n5", type: "supports", strength: 4, createdAt: T },
  { id: "e6", source: "n5", target: "n6", type: "extends", strength: 5, createdAt: T },
  { id: "e7", source: "n9", target: "n8", type: "source", strength: 4, createdAt: T },
  { id: "e8", source: "n8", target: "n5", type: "related", strength: 3, createdAt: T },
  { id: "e9", source: "n10", target: "n17", type: "related", strength: 5, createdAt: T },
  { id: "e10", source: "n10", target: "n16", type: "related", strength: 3, createdAt: T },
  { id: "e11", source: "n11", target: "n17", type: "similar", strength: 4, createdAt: T },
  { id: "e12", source: "n11", target: "n14", type: "related", strength: 4, createdAt: T },
  { id: "e13", source: "n14", target: "n12", type: "related", strength: 3, createdAt: T },
  { id: "e14", source: "n13", target: "n14", type: "source", strength: 2, createdAt: T },
  { id: "e15", source: "n15", target: "n12", type: "related", strength: 3, createdAt: T },
  { id: "e16", source: "n15", target: "n14", type: "related", strength: 4, createdAt: T },
  { id: "e17", source: "n17", target: "n15", type: "related", strength: 3, createdAt: T },
  { id: "e18", source: "n11", target: "n15", type: "related", strength: 3, createdAt: T },
  { id: "e19", source: "n7", target: "n1", type: "related", strength: 4, createdAt: T },
];

export const seedGraph: AuraGraph = { nodes, edges };

/** 返回示例数据的深拷贝(避免 store 直接共享模块常量引用) */
export function createSeedGraph(): AuraGraph {
  return {
    nodes: seedGraph.nodes.map((n) => ({ ...n, tags: [...n.tags] })),
    edges: seedGraph.edges.map((e) => ({ ...e })),
  };
}
