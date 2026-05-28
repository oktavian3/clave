import { Router } from "express";
import db from "../db.js";

const router = Router();

// ──────────────────────── PROJECTS ────────────────────────

router.get("/projects", (req, res) => {
  const { address, role, status } = req.query;

  let query = "SELECT * FROM projects WHERE 1=1";
  const params: any[] = [];

  if (address) {
    query += " AND (client = ? OR worker = ?)";
    params.push(address, address);
  }

  if (role === "client") {
    query += " AND client = ?";
    params.push(address);
  } else if (role === "worker") {
    query += " AND worker = ?";
    params.push(address);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY created_at DESC LIMIT 50";

  const projects = db.prepare(query).all(...params);
  res.json({ projects });
});

router.get("/projects/:id", (req, res) => {
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const milestones = db.prepare("SELECT * FROM milestones WHERE project_id = ? ORDER BY \"index\"").all(req.params.id);
  const events = db.prepare("SELECT * FROM events WHERE project_id = ? ORDER BY created_at DESC LIMIT 20").all(req.params.id);

  res.json({ project, milestones, events });
});

// ──────────────────────── MILESTONES ────────────────────────

router.get("/projects/:id/milestones", (req, res) => {
  const milestones = db.prepare("SELECT * FROM milestones WHERE project_id = ? ORDER BY \"index\"").all(req.params.id);
  res.json({ milestones });
});

router.post("/projects/:id/milestones", (req, res) => {
  const { index, description, amount, deadline } = req.body;
  const projectId = req.params.id;

  const now = Math.floor(Date.now() / 1000);
  db.prepare(
    "INSERT INTO milestones (project_id, \"index\", description, amount, deadline, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(projectId, index, description, amount, deadline, now);

  res.json({ success: true, milestone: { projectId, index, description, amount, deadline } });
});

// ──────────────────────── EVENTS ────────────────────────

router.get("/events", (req, res) => {
  const { address, event_name, limit } = req.query;

  let query = "SELECT * FROM events WHERE 1=1";
  const params: any[] = [];

  if (event_name) {
    query += " AND event_name = ?";
    params.push(event_name);
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(parseInt(limit as string) || 50);

  const events = db.prepare(query).all(...params);
  res.json({ events });
});

// ──────────────────────── NOTIFICATIONS ────────────────────────

router.get("/notifications/:address", (req, res) => {
  const notifications = db.prepare(
    "SELECT * FROM notifications WHERE address = ? ORDER BY created_at DESC LIMIT 50"
  ).all(req.params.address);
  res.json({ notifications });
});

router.post("/notifications/:id/read", (req, res) => {
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/notifications/:address/unread-count", (req, res) => {
  const result = db.prepare(
    "SELECT COUNT(*) as count FROM notifications WHERE address = ? AND read = 0"
  ).get(req.params.address) as any;
  res.json({ count: result?.count || 0 });
});

// ──────────────────────── STATS ────────────────────────

router.get("/stats", (_req, res) => {
  const totalProjects = (db.prepare("SELECT COUNT(*) as count FROM projects").get() as any)?.count || 0;
  const activeProjects = (db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'active'").get() as any)?.count || 0;
  const totalVolume = (db.prepare("SELECT COALESCE(SUM(CAST(released_amount AS REAL)), 0) as total FROM projects").get() as any)?.total || 0;
  const totalEvents = (db.prepare("SELECT COUNT(*) as count FROM events").get() as any)?.count || 0;

  res.json({
    totalProjects,
    activeProjects,
    totalVolumeUSDC: totalVolume,
    totalEvents,
  });
});

export default router;
