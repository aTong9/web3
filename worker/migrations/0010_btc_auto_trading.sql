CREATE TABLE IF NOT EXISTS btc_auto_trading_config (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  execution_mode TEXT NOT NULL DEFAULT 'paper' CHECK (execution_mode IN ('paper', 'testnet')),
  symbol TEXT NOT NULL DEFAULT 'BTCUSDT' CHECK (symbol = 'BTCUSDT'),
  interval TEXT NOT NULL DEFAULT '5m' CHECK (interval = '5m'),
  notional_usdt REAL NOT NULL DEFAULT 100,
  leverage INTEGER NOT NULL DEFAULT 2,
  minimum_confidence INTEGER NOT NULL DEFAULT 65,
  required_confirmations INTEGER NOT NULL DEFAULT 2,
  cooldown_minutes INTEGER NOT NULL DEFAULT 30,
  daily_loss_limit_usdt REAL NOT NULL DEFAULT 10,
  fee_rate_pct REAL NOT NULL DEFAULT 0.05,
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  last_run_at TEXT,
  last_error TEXT,
  cycle_lock_until TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO btc_auto_trading_config (id, updated_at)
VALUES ('default', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS btc_auto_signal_state (
  id TEXT PRIMARY KEY CHECK (id = 'default'),
  action TEXT NOT NULL,
  score REAL NOT NULL,
  confidence INTEGER NOT NULL,
  price REAL,
  evolution TEXT NOT NULL,
  confirmations INTEGER NOT NULL,
  reasons TEXT NOT NULL,
  risks TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  cooldown_until TEXT
);

CREATE TABLE IF NOT EXISTS btc_auto_trades (
  id TEXT PRIMARY KEY,
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('paper', 'testnet')),
  symbol TEXT NOT NULL CHECK (symbol = 'BTCUSDT'),
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  status TEXT NOT NULL CHECK (status IN ('opening', 'open', 'closing', 'closed', 'error')),
  quantity REAL NOT NULL,
  notional_usdt REAL NOT NULL,
  leverage INTEGER NOT NULL,
  entry_price REAL,
  exit_price REAL,
  stop_loss REAL NOT NULL,
  take_profit REAL NOT NULL,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  gross_pnl REAL,
  fees REAL,
  net_pnl REAL,
  return_pct REAL,
  signal_score REAL NOT NULL,
  signal_confidence INTEGER NOT NULL,
  signal_reasons TEXT NOT NULL,
  close_reason TEXT,
  open_client_order_id TEXT NOT NULL UNIQUE,
  close_client_order_id TEXT UNIQUE,
  open_order_id TEXT,
  close_order_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS btc_auto_trades_active_idx
  ON btc_auto_trades(symbol)
  WHERE status IN ('opening', 'open', 'closing');

CREATE INDEX IF NOT EXISTS btc_auto_trades_closed_idx
  ON btc_auto_trades(closed_at DESC)
  WHERE status = 'closed';
