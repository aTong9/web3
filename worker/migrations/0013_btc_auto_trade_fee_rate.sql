ALTER TABLE btc_auto_trades
  ADD COLUMN fee_rate_pct REAL NOT NULL DEFAULT 0.05;
