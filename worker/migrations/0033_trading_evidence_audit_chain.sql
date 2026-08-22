ALTER TABLE trading_evidence_bundles ADD COLUMN audit_digest TEXT;

ALTER TABLE trading_evidence_sync_audit ADD COLUMN previous_audit_digest TEXT;

ALTER TABLE trading_evidence_sync_audit ADD COLUMN audit_digest TEXT;
