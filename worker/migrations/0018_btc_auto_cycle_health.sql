ALTER TABLE btc_auto_trading_config
ADD COLUMN last_success_at TEXT;

ALTER TABLE btc_auto_trading_config
ADD COLUMN last_failure_at TEXT;

ALTER TABLE btc_auto_trading_config
ADD COLUMN last_cycle_status TEXT NOT NULL DEFAULT 'unknown'
CHECK (last_cycle_status IN ('success', 'failed', 'skipped', 'unknown'));

ALTER TABLE btc_auto_trading_config
ADD COLUMN consecutive_failures INTEGER NOT NULL DEFAULT 0;

UPDATE btc_auto_trading_config
SET last_success_at = CASE WHEN last_error IS NULL THEN last_run_at ELSE NULL END,
    last_failure_at = CASE WHEN last_error IS NOT NULL THEN last_run_at ELSE NULL END,
    last_cycle_status = CASE
      WHEN last_run_at IS NULL THEN 'unknown'
      WHEN last_error IS NULL THEN 'success'
      ELSE 'failed'
    END,
    consecutive_failures = CASE WHEN last_error IS NULL THEN 0 ELSE 1 END;
