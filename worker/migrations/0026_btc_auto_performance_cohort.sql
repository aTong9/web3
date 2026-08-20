ALTER TABLE btc_auto_trades ADD COLUMN performance_cohort_version TEXT;

UPDATE btc_auto_trades
SET performance_cohort_version = 'btc-performance-v2-minute-strategy'
WHERE strategy_version LIKE 'btc-auto-v11-%'
   OR strategy_version LIKE 'btc-auto-v12-%'
   OR strategy_version LIKE 'btc-auto-v13-%'
   OR strategy_version LIKE 'btc-auto-v14-%'
   OR strategy_version LIKE 'btc-auto-v15-%'
   OR strategy_version LIKE 'btc-auto-v16-%'
   OR strategy_version LIKE 'btc-auto-v17-%'
   OR strategy_version LIKE 'btc-auto-v18-%';

CREATE INDEX IF NOT EXISTS btc_auto_trades_performance_cohort_closed_idx
  ON btc_auto_trades(performance_cohort_version, closed_at DESC)
  WHERE status = 'closed';
