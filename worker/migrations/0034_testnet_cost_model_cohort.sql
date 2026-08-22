ALTER TABLE testnet_execution_observations
ADD COLUMN cost_model_version TEXT NOT NULL DEFAULT 'legacy';

CREATE INDEX IF NOT EXISTS testnet_execution_observations_cost_model_idx
ON testnet_execution_observations(cost_model_version, submitted_at DESC);
