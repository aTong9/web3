ALTER TABLE trading_evidence_bundles ADD COLUMN sync_token TEXT;

UPDATE trading_evidence_bundles
SET sync_token = content_digest || ':' || revision
WHERE sync_token IS NULL;
