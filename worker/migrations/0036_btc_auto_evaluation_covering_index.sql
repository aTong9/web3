-- Only directional samples participate in historical strategy evaluation.
-- Cover the projected fields so evaluation does not fetch full history rows.
CREATE INDEX IF NOT EXISTS btc_auto_signal_evaluation_idx
ON btc_auto_signal_history (
  signal_model_version, observed_at, baseline_action, ensemble_action,
  ensemble_regime, baseline_path_1h_pct, ensemble_path_1h_pct, baseline_score
)
WHERE baseline_action IN ('long', 'short');
