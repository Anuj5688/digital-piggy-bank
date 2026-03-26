import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express, { type Express } from "express";
import fs from "fs";
import path from "path";

 export function serveStatic(app: Express) {
   const distPath = path.resolve(__dirname, "../../client/dist");

   if (!fs.existsSync(distPath)) {
     console.log("Build folder not found, skipping static serving");
     return;
   }

   app.use(express.static(distPath));

   app.use("*", (_req, res) => {
     res.sendFile(path.resolve(distPath, "index.html"));
   });
 }
