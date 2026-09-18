CREATE INDEX IF NOT EXISTS btc_auto_signal_unresolved_idx
ON btc_auto_signal_history(market_source, observed_at)
WHERE price > 0
       AND (action IN ('long', 'short') OR baseline_action IN ('long', 'short')
         OR ensemble_action IN ('long', 'short'))
       AND ((action IN ('long', 'short')
           AND (forward_1h_pct IS NULL OR forward_4h_pct IS NULL OR forward_24h_pct IS NULL))
         OR (baseline_action IN ('long', 'short') AND baseline_forward_1h_pct IS NULL)
         OR (ensemble_action IN ('long', 'short') AND ensemble_forward_1h_pct IS NULL)
         OR (baseline_action IN ('long', 'short') AND baseline_path_1h_pct IS NULL
           AND shadow_stop_distance_pct IS NOT NULL AND shadow_target_distance_pct IS NOT NULL)
         OR (ensemble_action IN ('long', 'short') AND ensemble_path_1h_pct IS NULL
           AND shadow_stop_distance_pct IS NOT NULL AND shadow_target_distance_pct IS NOT NULL));

