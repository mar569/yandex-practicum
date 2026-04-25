import path from "path";
import fs from "fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const staticDir = path.resolve(__dirname, "static");

const staticHtmlInputs = fs.existsSync(staticDir)
  ? Object.fromEntries(
      fs
        .readdirSync(staticDir)
        .filter((file) => file.endsWith(".html"))
        .map((file) => [`static/${file.replace(".html", "")}`, path.resolve(staticDir, file)]),
    )
  : {};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "::",
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ...staticHtmlInputs,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
