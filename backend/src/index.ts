import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PORT } from "./config.js";
import apiRoutes from "./routes/api.js";
import { initEventListener, getEventListenerStatus } from "./services/eventListener.js";

// ──────────────────────── APP ────────────────────────

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "clave-backend",
    version: "1.0.0",
    eventListener: getEventListenerStatus(),
  });
});

// ──────────────────────── START ────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        CLAVE BACKEND — RUNNING           ║
  ║        Port: ${PORT}                        ║
  ║        API:  http://localhost:${PORT}/api   ║
  ╚══════════════════════════════════════════╝
  `);

  // Initialize event listeners
  initEventListener();
});
