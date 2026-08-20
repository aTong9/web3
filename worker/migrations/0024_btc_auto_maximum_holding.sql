ALTER TABLE btc_auto_trading_config
  ADD COLUMN maximum_holding_minutes INTEGER NOT NULL DEFAULT 60;
