import express from "express";
import cors from "cors";
import helmet from "helmet";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ──────────────────────── CONFIG ────────────────────────

const ARC_RPC_URL = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const CHAIN_ID = parseInt(process.env.ARC_CHAIN_ID || "5042002");
const PORT = parseInt(process.env.PORT || "4000");

const CONTRACTS = {
  USDC: process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000",
  ESCROW: process.env.CLAVE_ESCROW_ADDRESS || "0xdB963217F191d952AA477E0b0212111C2fF06124",
  REPUTATION: process.env.CLAVE_REPUTATION_ADDRESS || "0xcb8E74F9FA2fC5E6DFA200a56F64F40b09fA8e49",
  PAYROLL: process.env.CLAVE_PAYROLL_ADDRESS || "0x4d5f40c4eD9d5951181344CBdF00910246F1CBC4",
};

// ──────────────────────── IN-MEMORY DB ────────────────────────

const dataDir = join(__dirname, "..", "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

function loadDB(name: string) {
  const path = join(dataDir, `${name}.json`);
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf-8"));
  return [];
}

function saveDB(name: string, data: any) {
  writeFileSync(join(dataDir, `${name}.json`), JSON.stringify(data, null, 2));
}

let projects: any[] = loadDB("projects");
let milestones: any[] = loadDB("milestones");
let events: any[] = loadDB("events");
let notifications: any[] = loadDB("notifications");

// ──────────────────────── EXPRESS ────────────────────────

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", network: "Arc Testnet", chainId: CHAIN_ID });
});

// Config
app.get("/api/config", (_req, res) => {
  res.json({ contracts: CONTRACTS, rpc: ARC_RPC_URL, chainId: CHAIN_ID });
});

// Stats
app.get("/api/stats", (_req, res) => {
  res.json({
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    totalVolumeUSDC: projects.reduce((sum, p) => sum + (parseInt(p.total_budget) || 0), 0),
    totalEvents: events.length,
  });
});

// Projects CRUD
app.get("/api/projects", (_req, res) => {
  res.json({ projects, total: projects.length });
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects.find((p) => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: "Project not found" });
  const projectMilestones = milestones.filter((m) => m.project_id === project.id);
  res.json({ ...project, milestones: projectMilestones });
});

app.post("/api/projects", (req, res) => {
  const { client, worker, total_budget, deadline } = req.body;
  const project = {
    id: projects.length + 1,
    client,
    worker,
    total_budget,
    deposited_amount: "0",
    released_amount: "0",
    status: "active",
    deadline: Math.floor(new Date(deadline).getTime() / 1000),
    created_at: Math.floor(Date.now() / 1000),
  };
  projects.push(project);
  saveDB("projects", projects);
  res.json(project);
});

// Milestones
app.post("/api/projects/:id/milestones", (req, res) => {
  const projectId = parseInt(req.params.id);
  const { description, amount, deadline } = req.body;
  const milestone = {
    id: milestones.length + 1,
    project_id: projectId,
    description,
    amount,
    status: "pending",
    deadline: Math.floor(new Date(deadline).getTime() / 1000),
    submitted_at: null,
    approved_at: null,
  };
  milestones.push(milestone);
  saveDB("milestones", milestones);
  res.json(milestone);
});

// Events
app.get("/api/events", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const filtered = events.slice(offset, offset + limit);
  res.json({ events: filtered, total: events.length });
});

app.post("/api/events", (req, res) => {
  const event = {
    id: events.length + 1,
    ...req.body,
    timestamp: Math.floor(Date.now() / 1000),
  };
  events.push(event);
  saveDB("events", events);
  res.json(event);
});

// Notifications
app.get("/api/notifications", (_req, res) => {
  res.json({ notifications: notifications.slice(0, 20) });
});

app.post("/api/notifications", (req, res) => {
  const notification = {
    id: notifications.length + 1,
    ...req.body,
    read: false,
    timestamp: Math.floor(Date.now() / 1000),
  };
  notifications.push(notification);
  saveDB("notifications", notifications);
  res.json(notification);
});

// ──────────────────────── START ────────────────────────

app.listen(PORT, () => {
  console.log(`🔐 Clave Backend running on port ${PORT}`);
  console.log(`📡 Network: Arc Testnet (Chain ${CHAIN_ID})`);
  console.log(`🔗 RPC: ${ARC_RPC_URL}`);
  console.log(`📋 Contracts:`, CONTRACTS);
});
