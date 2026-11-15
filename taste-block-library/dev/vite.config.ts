import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// root 设为库根（Tailwind 才会扫描 assets/ 与 dev/ 里的类名）；图片目录指向 assets/public，
// 所以组件里 "/images/xx.jpg" 这类路径在预览里照常可用。
// 页面：/dev/（展示页）、/dev/preview.html?c=<组件名>（单个组件预览，展示页的 iframe 和 npm run render 都用它）。
const root = resolve(import.meta.dirname, "..");

export default defineConfig({
  root,
  publicDir: resolve(root, "assets/public"),
  plugins: [react(), tailwindcss()],
  server: { host: "127.0.0.1", port: 5173 },
  build: {
    outDir: resolve(root, "dev/dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,
    rollupOptions: { input: { index: resolve(root, "dev/index.html"), preview: resolve(root, "dev/preview.html") } },
  },
});
