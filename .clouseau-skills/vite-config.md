---
name: vite-config
description: Configure or extend a Vite + React + TypeScript project.
---

# vite-config

Use when the user asks to set up Vite, add a Vite plugin, or change `vite.config.ts`.

Defaults:
- ESM `defineConfig` form.
- `@vitejs/plugin-react` first in the plugin array.
- Dev server proxies live under `server.proxy` keyed by request prefix.

Skeleton:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:3737", changeOrigin: true } },
  },
});
```
