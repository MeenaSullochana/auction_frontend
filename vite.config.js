import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function backendOrigin() {
  const runtimeFile = path.resolve(__dirname, "../backend/.runtime-port");
  try {
    const port = fs.readFileSync(runtimeFile, "utf8").trim();
    if (/^\d+$/.test(port)) return `http://127.0.0.1:${port}`;
  } catch {
    /* ignore */
  }
  return process.env.VITE_BACKEND_URL || "http://127.0.0.1:5060";
}

const target = backendOrigin();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": target,
      "/uploads": target,
      "/socket.io": { target, ws: true },
    },
  },
});
