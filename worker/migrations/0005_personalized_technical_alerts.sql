ALTER TABLE technical_alert_rules ADD COLUMN horizon TEXT NOT NULL DEFAULT 'month'
  CHECK (horizon IN ('day', 'week', 'month', 'quarter', 'halfYear', 'year'));

ALTER TABLE technical_alert_rules ADD COLUMN minimum_confidence INTEGER NOT NULL DEFAULT 60
  CHECK (minimum_confidence BETWEEN 0 AND 100);

ALTER TABLE technical_alert_rules ADD COLUMN require_resonance INTEGER NOT NULL DEFAULT 0
  CHECK (require_resonance IN (0, 1));
