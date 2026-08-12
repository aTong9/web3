ALTER TABLE btc_auto_trading_config
  ADD COLUMN eligibility_confirmed INTEGER NOT NULL DEFAULT 0
  CHECK (eligibility_confirmed IN (0, 1));

ALTER TABLE btc_auto_signal_state
  ADD COLUMN market_source TEXT NOT NULL DEFAULT 'binance'
  CHECK (market_source IN ('binance', 'coinbase'));
