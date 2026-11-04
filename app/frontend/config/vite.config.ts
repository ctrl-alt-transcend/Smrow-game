/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": resolve(configDir, "../../shared"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/socket.io": {
        target: "http://backend:3000", // OK ici : le proxy tourne dans le conteneur
        ws: true,
      },
    },
  },
  test: {
    pool: "threads",
    maxWorkers: 1,
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
});

console.log("Vite config loaded successfully.");
