const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "hrms.sqlite3");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize schema on startup (idempotent - uses CREATE TABLE IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema);

module.exports = db;
