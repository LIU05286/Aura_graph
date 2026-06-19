import type { MemoryNodeType, Intensity } from "../types/graph";
import { NODE_TYPES } from "../types/graph";
import { deepseekChat } from "../ai/deepseek";
import { safeParseJson, asArray, asString, asStringArray } from "./json";
import type { ProposedNode } from "./types";

function clampImportance(v: unknown): Intensity {
  const n = typeof v === "number" ? Math.round(v) : 3;
  return Math.min(5, Math.max(1, n)) as Intensity;
}

let counter = 0;
function nextTempId(): string {
  counter += 1;
  return `tmp-${Date.now()}-${counter}`;
}

function fallbackNode(text: string, type: MemoryNodeType): ProposedNode {
  const firstLine = text.trim().split("\n")[0] ?? "";
  return {
    tempId: nextTempId(),
    title: firstLine.slice(0, 24) || "未命名记忆",
    content: text.trim(),
    type,
    tags: [],
    importance: 3,
  };
}

/** 从自然语言抽取 1..N 条结构化记忆。失败回退为单条。 */
export async function memoryExtractionAgent(
  text: string,
  hintType: MemoryNodeType,
  opts: { signal?: AbortSignal } = {}
): Promise<ProposedNode[]> {
  const system =
    "你是记忆抽取器。把用户文字拆成 1 到 5 条结构化记忆,每条有简洁标题、正文、类型、标签、重要度(1-5)。" +
    "可选类型:" + NODE_TYPES.join(", ") + "。标签用中文短词。" +
    '只输出 JSON:{"nodes":[{"title":"...","content":"...","type":"note","tags":["..."],"importance":3}]}';
  try {
    const raw = await deepseekChat(
      [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      { json: true, signal: opts.signal }
    );
    const parsed = safeParseJson<{ nodes?: unknown }>(raw);
    const list = asArray(parsed?.nodes);
    const out: ProposedNode[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const title = asString(rec.title).trim();
      const content = asString(rec.content).trim();
      if (!title && !content) continue;
      const type = asString(rec.type) as MemoryNodeType;
      out.push({
        tempId: nextTempId(),
        title: title || content.slice(0, 24),
        content,
        type: (NODE_TYPES as string[]).includes(type) ? type : hintType,
        tags: asStringArray(rec.tags).map((s) => s.trim()).filter(Boolean).slice(0, 8),
        importance: clampImportance(rec.importance),
      });
    }
    return out.length > 0 ? out : [fallbackNode(text, hintType)];
  } catch {
    return [fallbackNode(text, hintType)];
  }
}
