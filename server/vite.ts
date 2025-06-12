import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nanoid } from "nanoid";
import { registerRoutes } from './routes.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Handle API routes first
  const httpServer = await registerRoutes(app);

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Serve static files from the dist directory in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = resolve(__dirname, '../client/dist');
    const indexHtml = fs.readFileSync(resolve(distPath, 'index.html'), 'utf-8');

    // Serve static files
    app.use(express.static(distPath, {
      index: false,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }));

    // Handle all other routes by serving index.html
    app.use('*', (req, res) => {
      res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
    });
  }

  return httpServer;
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
