CREATE TABLE IF NOT EXISTS technical_alert_rules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  series TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (
    condition IN (
      'priceAbove',
      'priceBelow',
      'rsiAbove',
      'rsiBelow',
      'macdBullishCross',
      'macdBearishCross'
    )
  ),
  threshold REAL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_technical_alert_rules_user
  ON technical_alert_rules(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_technical_alert_rules_unique
  ON technical_alert_rules(user_id, asset_id, condition);
