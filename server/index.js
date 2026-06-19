import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "aura-data.json");

const CHAT_BASE = (process.env.CHAT_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const CHAT_KEY = process.env.CHAT_API_KEY || "";
const CHAT_MODEL = process.env.CHAT_MODEL || "deepseek-chat";
const EMB_BASE = (process.env.EMBEDDINGS_BASE_URL || "https://api.openai.com/v1").replace(
  /\/+$/,
  ""
);
const EMB_KEY = process.env.EMBEDDINGS_API_KEY || "";
const EMB_MODEL = process.env.EMBEDDINGS_MODEL || "text-embedding-3-small";

const app = express();
app.use(express.json({ limit: "25mb" }));

const EMPTY = { galaxies: [], activeGalaxyId: null, graphs: {} };

async function readData() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch (e) {
    if (e && e.code === "ENOENT") return structuredClone(EMPTY);
    throw e;
  }
}
async function writeData(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data), "utf8");
  await fs.rename(tmp, DATA_FILE); // 原子替换,避免写一半损坏
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/data", async (_req, res) => {
  try {
    res.json(await readData());
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
});

app.put("/api/data", async (req, res) => {
  try {
    const b = req.body;
    if (!b || typeof b !== "object") return res.status(400).json({ error: "bad body" });
    const data = {
      galaxies: Array.isArray(b.galaxies) ? b.galaxies : [],
      activeGalaxyId: typeof b.activeGalaxyId === "string" ? b.activeGalaxyId : null,
      graphs: b.graphs && typeof b.graphs === "object" ? b.graphs : {},
    };
    await writeData(data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
});

app.post("/api/chat", async (req, res) => {
  if (!CHAT_KEY) return res.status(500).json({ error: "CHAT_API_KEY 未配置" });
  try {
    const payload = { ...req.body };
    if (!payload.model) payload.model = CHAT_MODEL;
    const upstream = await fetch(`${CHAT_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CHAT_KEY}` },
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();
    res.status(upstream.status).type("application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
});

app.post("/api/embeddings", async (req, res) => {
  if (!EMB_KEY) return res.status(500).json({ error: "EMBEDDINGS_API_KEY 未配置" });
  try {
    const payload = { ...req.body };
    if (!payload.model) payload.model = EMB_MODEL;
    const upstream = await fetch(`${EMB_BASE}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${EMB_KEY}` },
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();
    res.status(upstream.status).type("application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
});

app.listen(PORT, HOST, () => console.log(`aura-api listening on http://${HOST}:${PORT}`));
