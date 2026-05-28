import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "data");
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(join(DB_DIR, "clave.db"));

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// ──────────────────────── SCHEMA ────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    client TEXT NOT NULL,
    worker TEXT NOT NULL,
    total_budget TEXT NOT NULL,
    deposited_amount TEXT NOT NULL DEFAULT '0',
    released_amount TEXT NOT NULL DEFAULT '0',
    status TEXT NOT NULL DEFAULT 'active',
    deadline INTEGER NOT NULL,
    metadata_uri TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount TEXT NOT NULL,
    deadline INTEGER NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    submitted INTEGER NOT NULL DEFAULT 0,
    released INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT NOT NULL,
    block_number INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    project_id INTEGER,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    project_id INTEGER,
    read INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
  CREATE INDEX IF NOT EXISTS idx_projects_worker ON projects(worker);
  CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_address ON notifications(address);
`);

export default db;
