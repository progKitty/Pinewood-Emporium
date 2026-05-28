import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "#tanstack-router-entry": path.resolve(__dirname, "./src/lib/empty.ts"),
      "#tanstack-start-entry": path.resolve(__dirname, "./src/lib/empty.ts"),
      "#tanstack-start-plugin-adapters": path.resolve(__dirname, "./src/lib/empty.ts"),
      "tanstack-start-manifest:v": path.resolve(__dirname, "./src/lib/empty.ts"),
      "tanstack-start-injected-head-scripts:v": path.resolve(__dirname, "./src/lib/empty.ts"),
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [],
    exclude: [
      "@tanstack/react-start",
      "@tanstack/start-server-core",
      "#tanstack-router-entry",
      "#tanstack-start-entry",
      "#tanstack-start-plugin-adapters",
      "tanstack-start-manifest:v",
      "tanstack-start-injected-head-scripts:v"
    ]
  }
});
