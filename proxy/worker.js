/**
 * Aura Graph 的 BYOK CORS 垫片(Cloudflare Workers)。
 *
 * 浏览器会带上 `Authorization: Bearer <用户自己的 key>`。本 Worker 不存任何 key,
 * 只负责补上 CORS 头让浏览器能读到响应,然后把请求原样转发给 UPSTREAM。
 *
 * Aura Graph 用 chat / embeddings 两个独立端点,因此【每个上游各部署一个 Worker】,
 * 在 app 设置里把对应 Base URL 指向各自的 Worker 即可:
 *   - chat:       Base URL -> 本 Worker(UPSTREAM = https://api.deepseek.com)
 *   - embeddings: Base URL -> 另一个 Worker(UPSTREAM = https://api.openai.com/v1 等)
 */

const ALLOW_ORIGIN = "*"; // 生产建议收紧为你的站点域名,如 "https://yourname.github.io"

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN === "*" ? "*" : origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders(origin) });
    }

    const upstream = env.UPSTREAM;
    if (!upstream) {
      return new Response("UPSTREAM not configured", { status: 500, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const target = upstream.replace(/\/+$/, "") + url.pathname + url.search;

    // 只透传必要请求头(含用户自带的 Authorization),不把 Origin/Host 等带给上游
    const fwd = new Headers();
    const ct = request.headers.get("Content-Type");
    const auth = request.headers.get("Authorization");
    if (ct) fwd.set("Content-Type", ct);
    if (auth) fwd.set("Authorization", auth);

    const bodyText = await request.text();
    const upstreamResp = await fetch(target, { method: "POST", headers: fwd, body: bodyText });

    const headers = new Headers(upstreamResp.headers);
    for (const [k, v] of Object.entries(corsHeaders(origin))) headers.set(k, v);
    return new Response(upstreamResp.body, { status: upstreamResp.status, headers });
  },
};
