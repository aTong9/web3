PRAGMA foreign_keys = OFF;

ALTER TABLE btc_auto_signal_state RENAME TO btc_auto_signal_state_legacy;

CREATE TABLE btc_auto_signal_state (
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
  cooldown_until TEXT,
  market_source TEXT NOT NULL DEFAULT 'binance'
    CHECK (market_source IN ('binance', 'coinbase'))
);

INSERT INTO btc_auto_signal_state (
  id,
  action,
  score,
  confidence,
  price,
  evolution,
  confirmations,
  reasons,
  risks,
  observed_at,
  cooldown_until,
  market_source
)
SELECT
  id,
  action,
  score,
  confidence,
  price,
  evolution,
  confirmations,
  reasons,
  risks,
  observed_at,
  cooldown_until,
  CASE WHEN market_source = 'binance' THEN 'binance' ELSE 'coinbase' END
FROM btc_auto_signal_state_legacy;

DROP TABLE btc_auto_signal_state_legacy;

PRAGMA foreign_keys = ON;
