ALTER TABLE testnet_safety_drills
ADD COLUMN cost_model_version TEXT NOT NULL DEFAULT 'legacy';

CREATE INDEX IF NOT EXISTS testnet_safety_drills_cost_model_idx
ON testnet_safety_drills(cost_model_version, type, performed_at DESC);
