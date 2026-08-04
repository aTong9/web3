CREATE TABLE IF NOT EXISTS quant_snapshots (
  id TEXT PRIMARY KEY,
  generated_at TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS quant_snapshots_generated_at_idx
  ON quant_snapshots(generated_at DESC);

CREATE TABLE IF NOT EXISTS paper_positions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  action TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  entry_underlying_price REAL NOT NULL,
  exit_underlying_price REAL,
  forward_pe REAL,
  signal_score REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS paper_positions_client_idx
  ON paper_positions(client_id, opened_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS paper_positions_open_symbol_idx
  ON paper_positions(client_id, symbol)
  WHERE status = 'open';
