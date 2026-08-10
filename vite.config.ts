import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../public/dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  server: {
    port: 5000,
    host: true,
    allowedHosts: true,
    hmr: {
      // Replit proxies all traffic on port 443 (WSS), so the browser-side
      // HMR client must connect on 443 instead of the raw dev-server port.
      clientPort: 443,
      protocol: "wss",
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      // The shared public assets live at the project root, not client/public.
      // Proxy them to Express so Vite does not return index.html as a fallback.
      "/images": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/icons": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/manifest.json": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/favicon.ico": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/sw.js": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://127.0.0.1:3000",
        ws: true,
      },
    },
  },
});
