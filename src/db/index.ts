import path from "node:path";
import sqlite3 from "sqlite3";


const dbPath = path.join(process.cwd(), "notes.db");

/**
 * Inline schema (no file system dependency)
 */
const schema = `
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  isDirty INTEGER NOT NULL DEFAULT 0
);
`;

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to SQLite", error);
    return;
  }

  console.log("SQLite DB connected");

  db.exec(schema, (schemaErr) => {
    if (schemaErr) {
      console.error("Failed to initialize schema", schemaErr);
      return;
    }

    console.log("Database schema is ready to use");
  });
});

export default db;
