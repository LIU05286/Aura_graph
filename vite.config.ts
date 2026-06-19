import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico"],
        manifest: {
          name: "Aura Graph 记忆星图",
          short_name: "Aura Graph",
          description: "个人记忆星图:记录、整理、关联、复盘",
          lang: "zh-CN",
          theme_color: "#0a0f1f",
          background_color: "#03040a",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
        },
      }),
    ],
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
        "/api": {
          target: "http://127.0.0.1:8787",
          changeOrigin: true,
        },
      },
    },
  };
});
