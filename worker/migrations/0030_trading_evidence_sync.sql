CREATE TABLE IF NOT EXISTS trading_evidence_bundles (
  user_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  bundle_json TEXT NOT NULL,
  content_digest TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trading_evidence_sync_audit (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  content_digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS trading_evidence_sync_audit_user_idx
  ON trading_evidence_sync_audit(user_id, revision DESC);
