CREATE TABLE IF NOT EXISTS contract_paper_trades (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  display_name TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  interval TEXT NOT NULL CHECK (interval IN ('1m', '3m', '5m', '15m', '30m', '1h', '4h')),
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  entry_price REAL NOT NULL,
  exit_price REAL,
  stop_loss REAL NOT NULL,
  take_profit REAL NOT NULL,
  notional REAL NOT NULL,
  leverage REAL NOT NULL,
  fee_rate_pct REAL NOT NULL,
  funding_rate_pct REAL NOT NULL,
  funding_settlements INTEGER NOT NULL,
  risk_budget REAL NOT NULL,
  entered_risk_amount REAL NOT NULL,
  signal_score REAL NOT NULL,
  signal_confidence REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS contract_paper_trades_user_idx
  ON contract_paper_trades(user_id, opened_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS contract_paper_trades_open_symbol_idx
  ON contract_paper_trades(user_id, symbol)
  WHERE status = 'open';
