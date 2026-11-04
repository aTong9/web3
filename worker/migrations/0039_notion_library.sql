CREATE TABLE IF NOT EXISTS notion_libraries (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
