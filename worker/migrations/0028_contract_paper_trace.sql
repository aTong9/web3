ALTER TABLE contract_paper_trades ADD COLUMN strategy_version TEXT NOT NULL DEFAULT 'contract-minute-legacy';
ALTER TABLE contract_paper_trades ADD COLUMN signal_version TEXT NOT NULL DEFAULT 'legacy-unknown';
ALTER TABLE contract_paper_trades ADD COLUMN path_id TEXT NOT NULL DEFAULT 'legacy-unknown';
ALTER TABLE contract_paper_trades ADD COLUMN market_source TEXT NOT NULL DEFAULT 'legacy-unknown';
ALTER TABLE contract_paper_trades ADD COLUMN cost_model_version TEXT NOT NULL DEFAULT 'contract-cost-legacy';
ALTER TABLE contract_paper_trades ADD COLUMN planned_entry_price REAL;
ALTER TABLE contract_paper_trades ADD COLUMN slippage_rate_pct REAL NOT NULL DEFAULT 0;

UPDATE contract_paper_trades
SET planned_entry_price = entry_price
WHERE planned_entry_price IS NULL;
