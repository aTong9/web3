CREATE TABLE IF NOT EXISTS trading_evidence_versions (
  user_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  bundle_json TEXT NOT NULL,
  content_digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, revision),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS trading_evidence_versions_user_idx
  ON trading_evidence_versions(user_id, revision DESC);

INSERT OR IGNORE INTO trading_evidence_versions
  (user_id,revision,schema_version,bundle_json,content_digest,created_at)
SELECT user_id,revision,schema_version,bundle_json,content_digest,updated_at
FROM trading_evidence_bundles;
