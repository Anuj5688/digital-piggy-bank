import express from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: express.Express) {
  // 🔥 FIXED PATH (go up one folder)
  const distPath = path.join(process.cwd(), "..", "dist", "public");

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