// ============================================================
// database.js — SQLite connection & schema bootstrap
// ============================================================
const path = require('path');
const fs = require('fs');

// Load .env from the server root (one level up from /db)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Database = require('better-sqlite3');

// ---------------------------------------------------------------------------
// Resolve DB file path
//   DB_PATH in .env is relative to the server root (e.g. ./db/hrms.db)
//   We resolve it against the server directory so the file always lands in
//   server/db/hrms.db regardless of where the process is started from.
// ---------------------------------------------------------------------------
const serverRoot = path.join(__dirname, '..');
const dbPath = path.resolve(serverRoot, process.env.DB_PATH || './db/hrms.db');

// Make sure the target directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open (or create) the database
const db = new Database(dbPath);

// ---------------------------------------------------------------------------
// Pragmas — performance & integrity
// ---------------------------------------------------------------------------
db.pragma('journal_mode = WAL');    // Write-Ahead Logging for better concurrency
db.pragma('foreign_keys = ON');     // Enforce FK constraints

// ---------------------------------------------------------------------------
// Run the schema — idempotent thanks to IF NOT EXISTS
// ---------------------------------------------------------------------------
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log(`✅ Database ready → ${dbPath}`);

module.exports = db;
