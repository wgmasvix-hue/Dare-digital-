import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL || 'https://odklvauuiitaoenzhlda.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Should be in .env

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:", "http:", "https://picsum.photos"],
        "connect-src": ["'self'", "https://*.supabase.co", "https://*.run.app", "https://*.google.com", "https://*.googleapis.com", "https://huggingface.co", "https://*.huggingface.co", "https://*.hf.co", "https://cdn-lfs.huggingface.co", "https://cdn-lfs.hf.co"],
        "frame-src": ["'self'", "https://*.run.app", "https://*.google.com"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.google.com"],
        "frame-ancestors": ["'self'", "https://*.google.com", "https://*.run.app"],
      },
    },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false, // Disable X-Frame-Options to allow iframe embedding in AI Studio
  }));
  app.use(cors());
  app.use(express.json());

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get("/", (req, res) => {
    res.send("DARE API is running");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
