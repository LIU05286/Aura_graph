import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    build: {
      // three.js 是 3D 应用绕不开的体积(gzip 后约 300KB)且已懒加载,
      // 默认 500 阈值对它属误报;设为 700 仍能拦住未来真正的体积回归。
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (/[\\/]node_modules[\\/](three|@react-three|three-stdlib)[\\/]/.test(id))
              return "three-vendor";
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
              return "react-vendor";
          },
        },
      },
    },
    server: {
      proxy: {
        "/deepseek": {
          target: "https://api.deepseek.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/deepseek/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.DEEPSEEK_API_KEY;
              if (key) proxyReq.setHeader("Authorization", `Bearer ${key}`);
            });
          },
        },
        "/relay": {
          target: env.RELAY_BASE_URL || "https://yunwu.ai",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/relay/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const key = env.RELAY_API_KEY;
              if (key) proxyReq.setHeader("Authorization", `Bearer ${key}`);
            });
          },
        },
      },
    },
  };
});
