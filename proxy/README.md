# Aura Graph — AI CORS 代理(可选)

只有当你想直连**不回 CORS 头**的厂商端点(如裸 `api.deepseek.com`)时才需要它。
如果你在设置里填的 Base URL 本身就支持浏览器跨域(多数中转站都支持),**不需要这个代理**——直接把厂商/中转地址填进设置即可。

## 它做什么
一个 Cloudflare Worker,只给响应补 CORS 头、把请求转发给上游。**不存任何 key**:你的 key 仍然只在浏览器里(BYOK)。

## 部署(每个上游一个 Worker)
1. 装 wrangler:`npm i -g wrangler`,然后 `wrangler login`。
2. 进入 `proxy/`,改 `wrangler.toml` 里的 `UPSTREAM` 为目标上游(chat 用 `https://api.deepseek.com`;embeddings 用对应厂商,如 `https://api.openai.com/v1`)。
3. `wrangler deploy`,记下输出的 Worker 网址(形如 `https://aura-graph-ai-proxy.<account>.workers.dev`)。
4. 多个上游就改 `name` + `UPSTREAM` 各 deploy 一次,得到多个 Worker 网址。

## 接入 app
在 Aura Graph 的「⚙ Configure AI keys」里:
- chat 的 Base URL 填 chat 那个 Worker 网址;embeddings 的 Base URL 填 embeddings 那个 Worker 网址。
- 两个 API key 仍填你自己的厂商 key(由浏览器发出、经 Worker 透传)。

## 安全
- 生产环境把 `worker.js` 里的 `ALLOW_ORIGIN` 从 `"*"` 收紧为你的站点域名。
- key 不经过 Worker 存储,仅在请求中透传;别把别人的 key 填进公开部署的实例。

## app 本体托管
纯静态产物(`npm run build` 的 `dist/`),可部署到 GitHub Pages / Netlify / Vercel 等任意静态托管。
