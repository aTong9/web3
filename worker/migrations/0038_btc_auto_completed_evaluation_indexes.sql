-- Evaluation reads only completed hourly outcomes. Keep earliest-hour lookup on
-- the existing directional index; these indexes narrow the outer sample scans.
CREATE INDEX IF NOT EXISTS btc_auto_consensus_completed_idx
ON btc_auto_signal_history (
  signal_model_version, observed_at DESC, baseline_action, ensemble_action,
  baseline_path_1h_pct
)
WHERE baseline_action IN ('long', 'short') AND baseline_path_1h_pct IS NOT NULL;

CREATE INDEX IF NOT EXISTS btc_auto_comparison_completed_idx
ON btc_auto_signal_history (
  signal_model_version, observed_at DESC, baseline_action, ensemble_action, ensemble_regime,
  baseline_path_1h_pct, ensemble_path_1h_pct
)
WHERE baseline_action IN ('long', 'short')
  AND ensemble_action IN ('long', 'short')
  AND baseline_path_1h_pct IS NOT NULL
  AND ensemble_path_1h_pct IS NOT NULL;
