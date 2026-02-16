import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production builds (Vite), files are usually in /dist at project root
  const distPath = path.resolve(process.cwd(), "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find build directory: ${distPath}. Make sure you ran the client build (npm run build).`
    );
  }

  // Serve static assets
  app.use(express.static(distPath));

  // SPA fallback (important for routing)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
