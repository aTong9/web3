ALTER TABLE btc_auto_trades
ADD COLUMN funding_fee REAL NOT NULL DEFAULT 0;

ALTER TABLE btc_auto_trades
ADD COLUMN pnl_source TEXT NOT NULL DEFAULT 'estimated'
CHECK (pnl_source IN ('estimated', 'reconciled'));

ALTER TABLE btc_auto_trades
ADD COLUMN reconciled_at TEXT;

ALTER TABLE btc_auto_trades
ADD COLUMN reconciliation_error TEXT;

CREATE INDEX IF NOT EXISTS idx_btc_auto_trades_reconciliation
ON btc_auto_trades(execution_mode, pnl_source, closed_at DESC)
WHERE status = 'closed';
