/** 从可能含 ```json 围栏或前后噪声的字符串安全解析 JSON。失败返回 null,绝不抛错。 */
export function safeParseJson<T = unknown>(raw: string): T | null {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
export function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
export function asStringArray(v: unknown): string[] {
  return asArray(v).filter((x): x is string => typeof x === "string");
}
