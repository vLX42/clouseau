import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/run": { target: "http://localhost:3737", changeOrigin: true },
      "/health": { target: "http://localhost:3737", changeOrigin: true },
    },
  },
});
