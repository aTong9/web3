ALTER TABLE btc_auto_signal_history ADD COLUMN signal_model_version TEXT;

UPDATE btc_auto_signal_history
SET signal_model_version = 'btc-signal-model-v2'
WHERE ensemble_regime IS NOT NULL
  AND (
    strategy_version LIKE 'btc-auto-v7-%'
    OR strategy_version LIKE 'btc-auto-v8-%'
    OR strategy_version LIKE 'btc-auto-v9-%'
    OR strategy_version LIKE 'btc-auto-v10-%'
    OR strategy_version LIKE 'btc-auto-v11-%'
    OR strategy_version LIKE 'btc-auto-v12-%'
    OR strategy_version LIKE 'btc-auto-v13-%'
  );

CREATE INDEX IF NOT EXISTS btc_auto_signal_history_model_observed_idx
  ON btc_auto_signal_history(signal_model_version, observed_at DESC);
