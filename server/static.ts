import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Your Vite build output: dist/public/*
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Run "npm run build" first.`
    );
  }

  // Serve static assets
  app.use(express.static(distPath));

  // SPA fallback (Express 5-safe): RegExp avoids path-to-regexp wildcard crash
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
