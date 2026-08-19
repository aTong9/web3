ALTER TABLE btc_auto_trading_config
  ADD COLUMN performance_window_trades INTEGER NOT NULL DEFAULT 20;

ALTER TABLE btc_auto_trading_config
  ADD COLUMN minimum_rolling_profit_factor REAL NOT NULL DEFAULT 0.8;

ALTER TABLE btc_auto_trading_config
  ADD COLUMN maximum_rolling_drawdown_usdt REAL NOT NULL DEFAULT 3;

ALTER TABLE btc_auto_trading_config
  ADD COLUMN performance_pause_minutes INTEGER NOT NULL DEFAULT 1440;
