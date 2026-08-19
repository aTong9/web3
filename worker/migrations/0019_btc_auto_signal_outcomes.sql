ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_1h_pct REAL;

ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_1h_at TEXT;

ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_4h_pct REAL;

ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_4h_at TEXT;

ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_24h_pct REAL;

ALTER TABLE btc_auto_signal_history
ADD COLUMN forward_24h_at TEXT;

CREATE INDEX IF NOT EXISTS idx_btc_auto_signal_outcome_pending
ON btc_auto_signal_history(market_source, observed_at)
WHERE action IN ('long', 'short');
