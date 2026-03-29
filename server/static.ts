import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: express.Express) {
  // 🔥 ALWAYS go to project root
  const distPath = path.resolve(__dirname, "../../dist/public");

  console.log("Serving from:", distPath);

  if (!fs.existsSync(distPath)) {
    console.error("❌ Build folder not found:", distPath);
    return;
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}