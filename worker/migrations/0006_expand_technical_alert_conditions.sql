ALTER TABLE technical_alert_rules RENAME TO technical_alert_rules_legacy;

CREATE TABLE technical_alert_rules (
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
      'macdBearishCross',
      'volumeSpike',
      'volatilityAbove',
      'gapAbove',
      'earningsWithinDays'
    )
  ),
  threshold REAL,
  horizon TEXT NOT NULL DEFAULT 'month'
    CHECK (horizon IN ('day', 'week', 'month', 'quarter', 'halfYear', 'year')),
  minimum_confidence INTEGER NOT NULL DEFAULT 60
    CHECK (minimum_confidence BETWEEN 0 AND 100),
  require_resonance INTEGER NOT NULL DEFAULT 0
    CHECK (require_resonance IN (0, 1)),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO technical_alert_rules (
  id, user_id, asset_id, asset_name, series, condition, threshold, horizon,
  minimum_confidence, require_resonance, enabled, created_at, updated_at
)
SELECT
  id, user_id, asset_id, asset_name, series, condition, threshold, horizon,
  minimum_confidence, require_resonance, enabled, created_at, updated_at
FROM technical_alert_rules_legacy;

DROP TABLE technical_alert_rules_legacy;

CREATE INDEX idx_technical_alert_rules_user
  ON technical_alert_rules(user_id, created_at DESC);

CREATE UNIQUE INDEX idx_technical_alert_rules_unique
  ON technical_alert_rules(user_id, asset_id, condition);
