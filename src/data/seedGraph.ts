import type { AuraGraph, MemoryNode, MemoryEdge } from "../types/graph";

/**
 * Built-in demo data (English): a "personal memory universe" split into math / physics / methods clusters.
 * This is only optional demo content loaded on demand via "Load demo"; new users start with an empty universe.
 */

const T = "2025-01-01T00:00:00.000Z"; // Shared timestamp for the sample

const nodes: MemoryNode[] = [
  // —— math cluster ——
  { id: "n1", title: "Linear Algebra", type: "concept", importance: 4, tags: ["math"], x: -7, y: 1, z: -3, createdAt: T, updatedAt: T, content: "The language of vector spaces and linear maps. The foundation beneath almost everything that follows — machine learning, quantum mechanics, signal processing." },
  { id: "n2", title: "Eigenvalues & Eigenvectors", type: "concept", importance: 4, tags: ["math"], x: -5, y: 2.4, z: -4.2, createdAt: T, updatedAt: T, content: "Vectors a matrix only stretches, never turns. The key to vibration modes, principal component analysis, and stability." },
  { id: "n3", title: "Matrix Decomposition", type: "concept", importance: 3, tags: ["math"], x: -8.4, y: -1.2, z: -1.5, createdAt: T, updatedAt: T, content: "SVD / QR / LU break a complex matrix into simple structure — the core of numerical computing and dimensionality reduction." },
  { id: "n4", title: "\"Linear Algebra Done Right\"", type: "book", importance: 3, tags: ["math", "reading"], x: -6.2, y: 3.1, z: -1, createdAt: T, updatedAt: T, content: "Axler's classic. Starts from abstract vector spaces, deliberately delays determinants, and emphasizes geometric intuition." },

  // —— physics cluster ——
  { id: "n5", title: "Electromagnetism", type: "concept", importance: 5, tags: ["physics"], x: 6.5, y: -1, z: 2, createdAt: T, updatedAt: T, content: "How electric and magnetic fields arise, transform into each other, and propagate. The theoretical bedrock of modern electrical civilization." },
  { id: "n6", title: "Maxwell's Equations", type: "concept", importance: 5, tags: ["physics"], x: 8.4, y: 0.2, z: 1, createdAt: T, updatedAt: T, content: "Four equations that unify electricity, magnetism, and light, and predict electromagnetic waves. One of the most elegant symmetries in physics." },
  { id: "n7", title: "Symmetry", type: "concept", importance: 4, tags: ["physics", "math"], x: 4.6, y: 1.3, z: 4.2, createdAt: T, updatedAt: T, content: "A bridge between math and physics: every continuous symmetry corresponds to a conserved quantity (Noether's theorem)." },
  { id: "n8", title: "Feynman", type: "person", importance: 4, tags: ["physics", "methods"], x: 7.2, y: -3, z: 3, createdAt: T, updatedAt: T, content: "Physicist famous for Feynman diagrams and remarkable physical intuition. His credo: if you can't explain it simply, you don't truly understand it." },
  { id: "n9", title: "\"The Feynman Lectures on Physics\"", type: "book", importance: 4, tags: ["physics", "reading"], x: 9.2, y: -2, z: 0, createdAt: T, updatedAt: T, content: "A model of explaining deep physics through vivid mental pictures. Great for building physical intuition." },

  // —— methods / project / reading cluster ——
  { id: "n10", title: "Aura Graph", type: "project", importance: 5, tags: ["project"], x: 0, y: 2, z: 6, createdAt: T, updatedAt: T, content: "A front-end project that visualizes knowledge, notes, and ideas as a 3D star map. Currently building the MVP." },
  { id: "n11", title: "Second Brain", type: "idea", importance: 4, tags: ["methods", "project"], x: -1.2, y: 4, z: 5, createdAt: T, updatedAt: T, content: "Externalize memory into a searchable, linkable system so the mind can focus on thinking rather than storage." },
  { id: "n12", title: "Spaced Repetition", type: "concept", importance: 3, tags: ["methods"], x: 2.4, y: 3.2, z: 7, createdAt: T, updatedAt: T, content: "Review right at the edge of forgetting to move knowledge into long-term memory with the fewest repetitions. The principle behind Anki." },
  { id: "n13", title: "\"Thinking, Fast and Slow\"", type: "book", importance: 3, tags: ["reading", "methods"], x: -2.4, y: 1, z: 8, createdAt: T, updatedAt: T, content: "Kahneman distinguishes fast intuition (System 1) from slow reasoning (System 2), explaining a wide range of cognitive biases." },
  { id: "n14", title: "Zettelkasten", type: "idea", importance: 4, tags: ["methods", "reading"], x: 1.2, y: 0.2, z: 5, createdAt: T, updatedAt: T, content: "Each note is a self-contained, linkable card; the system grows through connections rather than folders." },
  { id: "n15", title: "Learning Methods", type: "note", importance: 3, tags: ["methods"], x: -3.2, y: 3, z: 6.2, createdAt: T, updatedAt: T, content: "A collection of notes on learning effectively: active recall, spaced repetition, the Feynman technique, deliberate practice." },
  { id: "n16", title: "React Three Fiber", type: "course", importance: 3, tags: ["project"], x: 2.2, y: 5, z: 4, createdAt: T, updatedAt: T, content: "A library for writing three.js declaratively in React. The target tech for Aura Graph's rendering layer." },
  { id: "n17", title: "Knowledge Graph", type: "concept", importance: 4, tags: ["project", "methods"], x: 0.2, y: 0.4, z: 3, createdAt: T, updatedAt: T, content: "Expressing knowledge as nodes and relations — the shared core of Aura Graph, the Second Brain, and learning methods." },
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

/** Returns a deep copy of the sample data (avoids sharing module constants with the store). */
export function createSeedGraph(): AuraGraph {
  return {
    nodes: seedGraph.nodes.map((n) => ({ ...n, tags: [...n.tags] })),
    edges: seedGraph.edges.map((e) => ({ ...e })),
  };
}
