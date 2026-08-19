ALTER TABLE btc_auto_trading_config
  ADD COLUMN risk_controls_enabled INTEGER NOT NULL DEFAULT 1 CHECK (risk_controls_enabled IN (0, 1));

ALTER TABLE btc_auto_trading_config
  ADD COLUMN hedge_mode_enabled INTEGER NOT NULL DEFAULT 0 CHECK (hedge_mode_enabled IN (0, 1));

ALTER TABLE btc_auto_trading_config
  ADD COLUMN max_positions_per_direction INTEGER NOT NULL DEFAULT 1;

DROP INDEX IF EXISTS btc_auto_trades_active_idx;

CREATE INDEX IF NOT EXISTS btc_auto_trades_active_direction_idx
  ON btc_auto_trades(symbol, direction, opened_at DESC)
  WHERE status IN ('opening', 'open', 'closing');
