import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './index';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = config.databaseUrl.startsWith('.')
    ? path.resolve(process.cwd(), config.databaseUrl)
    : config.databaseUrl;

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  console.log(`[Database] Connected: ${dbPath}`);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS download_history (
      id          TEXT PRIMARY KEY,
      url         TEXT NOT NULL,
      title       TEXT,
      thumbnail   TEXT,
      type        TEXT NOT NULL DEFAULT 'video',
      format      TEXT,
      quality     TEXT,
      filesize    INTEGER,
      status      TEXT NOT NULL DEFAULT 'completed',
      platform    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_history_created_at ON download_history(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_history_status ON download_history(status);
    CREATE INDEX IF NOT EXISTS idx_history_platform ON download_history(platform);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limit_log (
      ip          TEXT NOT NULL,
      endpoint    TEXT NOT NULL,
      timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
