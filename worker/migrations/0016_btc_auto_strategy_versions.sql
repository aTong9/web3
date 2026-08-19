ALTER TABLE btc_auto_signal_state
ADD COLUMN strategy_version TEXT NOT NULL DEFAULT 'legacy';

ALTER TABLE btc_auto_signal_history
ADD COLUMN strategy_version TEXT NOT NULL DEFAULT 'legacy';

ALTER TABLE btc_auto_trades
ADD COLUMN strategy_version TEXT NOT NULL DEFAULT 'legacy';

CREATE INDEX IF NOT EXISTS idx_btc_auto_trades_strategy_closed
ON btc_auto_trades(strategy_version, closed_at DESC)
WHERE status = 'closed';
