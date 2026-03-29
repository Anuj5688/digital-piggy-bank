import express from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: express.Express) {
  const distPath = path.join(process.cwd(), "dist", "public");

  console.log("Serving from:", distPath);

  // 🔥 Check folder exists
  if (!fs.existsSync(distPath)) {
    console.error("❌ Build folder not found:", distPath);
    return;
  }

  // ✅ Serve static files
  app.use(express.static(distPath));

  // ✅ VERY IMPORTANT (fixes "Cannot GET /")
  app.get("/", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // ✅ SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}