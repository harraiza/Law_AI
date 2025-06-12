import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nanoid } from "nanoid";

const viteConfig = defineConfig({
  base: '/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "..", "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "..", "shared"),
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "..", "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "..", "dist/public"),
    emptyOutDir: true,
  },
});

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server
      }
    },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Handle API routes before Vite middleware
  app.use('/api', (req, res, next) => {
    // Ensure API routes are handled by the Express app
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return vite;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), 'dist/public');
  app.use(express.static(distPath));

  // Handle API routes before static files
  app.use('/api', (req, res, next) => {
    // Ensure API routes are handled by the Express app
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
