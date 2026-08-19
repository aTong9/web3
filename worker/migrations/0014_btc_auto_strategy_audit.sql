ALTER TABLE btc_auto_trading_config
  ADD COLUMN minimum_directional_score REAL NOT NULL DEFAULT 55;

ALTER TABLE btc_auto_trading_config
  ADD COLUMN max_consecutive_losses INTEGER NOT NULL DEFAULT 3;

ALTER TABLE btc_auto_trading_config
  ADD COLUMN loss_pause_minutes INTEGER NOT NULL DEFAULT 360;

CREATE TABLE IF NOT EXISTS btc_auto_signal_history (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  score REAL NOT NULL,
  confidence INTEGER NOT NULL,
  price REAL,
  evolution TEXT NOT NULL,
  confirmations INTEGER NOT NULL,
  reasons TEXT NOT NULL,
  risks TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  market_source TEXT NOT NULL CHECK (market_source IN ('binance', 'coinbase')),
  cooldown_until TEXT,
  entry_gate_reason TEXT NOT NULL,
  entry_eligible INTEGER NOT NULL CHECK (entry_eligible IN (0, 1))
);

CREATE INDEX IF NOT EXISTS btc_auto_signal_history_observed_idx
  ON btc_auto_signal_history(observed_at DESC);
