CREATE TABLE IF NOT EXISTS btc_auto_strategy_snapshots (
  strategy_version TEXT PRIMARY KEY,
  definition_json TEXT NOT NULL CHECK (json_valid(definition_json)),
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_btc_auto_strategy_snapshots_seen
ON btc_auto_strategy_snapshots(last_seen_at DESC);
