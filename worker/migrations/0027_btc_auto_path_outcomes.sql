ALTER TABLE btc_auto_signal_history ADD COLUMN shadow_stop_distance_pct REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN shadow_target_distance_pct REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN baseline_path_1h_pct REAL;
ALTER TABLE btc_auto_signal_history ADD COLUMN ensemble_path_1h_pct REAL;
