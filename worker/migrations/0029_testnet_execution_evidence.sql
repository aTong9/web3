CREATE TABLE IF NOT EXISTS testnet_execution_observations (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  trade_id TEXT NOT NULL,
  command TEXT NOT NULL CHECK (command IN ('open', 'close')),
  planned_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  acknowledged_at TEXT,
  planned_price REAL NOT NULL,
  average_fill_price REAL,
  planned_quantity REAL NOT NULL,
  filled_quantity REAL NOT NULL DEFAULT 0,
  commission REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('filled', 'partial', 'rejected', 'timeout', 'unknown', 'reconciled')),
  reconciled_at TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS testnet_execution_observations_key_idx
  ON testnet_execution_observations(idempotency_key, submitted_at DESC);

CREATE TABLE IF NOT EXISTS testnet_safety_drills (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('emergencyClose', 'disableEntries', 'staleMarketCircuitBreaker', 'continuousReconciliation')),
  performed_at TEXT NOT NULL,
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  evidence TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS testnet_safety_drills_type_idx
  ON testnet_safety_drills(type, performed_at DESC);
