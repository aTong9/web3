ALTER TABLE btc_auto_signal_history ADD COLUMN baseline_action TEXT;
ALTER TABLE btc_auto_signal_history ADD COLUMN baseline_score REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_action TEXT;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_score REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_regime TEXT;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_confidence INTEGER;
ALTER TABLE btc_auto_signal_history ADD COLUMN baseline_forward_1h_pct REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_forward_1h_pct REAL;

CREATE INDEX IF NOT EXISTS btc_auto_signal_strategy_comparison_idx
  ON btc_auto_signal_history(strategy_version, observed_at DESC)
  WHERE baseline_action IS NOT NULL AND ensemble_action IS NOT NULL;
