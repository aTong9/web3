import type {
  TradingEvidenceCloudBundle,
  TradingEvidenceCloudSnapshot,
  TradingEvidenceCloudVersion,
  TradingEvidenceAuditEntry,
  TradingEvidenceAuditCheckpoint,
  TradingEvidenceAuditCheckpointVerification,
  TradingEvidenceAuditVerification,
} from '../src/types/index'
import { parseContractPaperTelemetry } from '../src/utils/contract-paper-telemetry'
import { parseContractBacktestEvidenceEnvelope } from '../src/utils/trading-evidence'
import { assertContractBacktestReviewCostPolicy } from '../src/utils/contract-strategy-backtest'
import { parseTradingReviewChecklist } from '../src/utils/trading-review-checklist'
import {
  buildTradingEvidenceAuditDigest,
  verifyTradingEvidenceAuditChain,
} from '../src/utils/trading-evidence-audit'
import {
  buildTradingEvidenceAuditCheckpoint,
  parseTradingEvidenceAuditCheckpoint,
} from '../src/utils/trading-evidence-checkpoint'

const maximumBundleBytes = 2_000_000
const sensitivePatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\b(?:api[_ -]?secret|secret[_ -]?key|private[_ -]?key)\s*[:=]\s*\S{8,}/i,
  /\b(?:mnemonic|seed phrase)\s*[:=]\s*(?:[a-z]+\s+){2,}[a-z]+/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/i,
]

interface TradingEvidenceRow {
  bundle_json: string
  revision: number
  content_digest: string
  updated_at: string
}

interface TradingEvidenceVersionRow {
  bundle_json: string
  revision: number
  content_digest: string
  created_at: string
}

interface TradingEvidenceAuditRow {
  id: string
  user_id: string
  revision: number
  content_digest: string
  previous_audit_digest: string | null
  audit_digest: string | null
  created_at: string
}

interface TradingEvidenceAuditHeadRow {
  revision: number
  audit_digest: string | null
}

export class TradingEvidenceConflictError extends Error {}

export class TradingEvidenceIntegrityError extends Error {}

export class TradingEvidenceInputError extends Error {}

export class TradingEvidenceNotFoundError extends Error {}

const sha256 = async (value: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const verifyStoredTradingEvidence = async (serialized: string, contentDigest: string) => {
  const actualDigest = await sha256(serialized)
  if (actualDigest !== contentDigest) {
    throw new TradingEvidenceIntegrityError('云端交易证据完整性校验失败')
  }
}

export const containsSensitiveTradingEvidence = (serialized: string) =>
  sensitivePatterns.some((pattern) => pattern.test(serialized))

export const validateTradingEvidenceCloudBundle = (
  value: unknown,
): TradingEvidenceCloudBundle => {
  if (!value || typeof value !== 'object') throw new Error('云端交易证据结构无效')
  const bundle = value as TradingEvidenceCloudBundle
  if (bundle.schemaVersion !== 1) throw new Error('云端交易证据版本无效')
  const serialized = JSON.stringify(bundle)
  if (new TextEncoder().encode(serialized).byteLength > maximumBundleBytes) {
    throw new Error('云端交易证据超过2MB限制')
  }
  if (containsSensitiveTradingEvidence(serialized)) {
    throw new Error('云端交易证据疑似包含密钥、私钥或助记词')
  }
  const backtest = bundle.backtest
    ? parseContractBacktestEvidenceEnvelope(JSON.stringify(bundle.backtest))
    : null
  if (backtest) assertContractBacktestReviewCostPolicy(backtest.input)
  const paperTelemetry = parseContractPaperTelemetry(JSON.stringify(bundle.paperTelemetry))
  const reviewChecklist = parseTradingReviewChecklist(JSON.stringify(bundle.reviewChecklist))
  return { schemaVersion: 1, backtest, paperTelemetry, reviewChecklist }
}

export const loadTradingEvidenceCloudSnapshot = async (
  env: Env,
  userId: string,
): Promise<TradingEvidenceCloudSnapshot> => {
  const row = await env.DB.prepare(
    `SELECT bundle_json,revision,content_digest,updated_at
       FROM trading_evidence_bundles WHERE user_id=?`,
  )
    .bind(userId)
    .first<TradingEvidenceRow>()
  if (!row) return { bundle: null, revision: 0, contentDigest: null, updatedAt: null }
  await verifyStoredTradingEvidence(row.bundle_json, row.content_digest)
  return {
    bundle: validateTradingEvidenceCloudBundle(JSON.parse(row.bundle_json)),
    revision: row.revision,
    contentDigest: row.content_digest,
    updatedAt: row.updated_at,
  }
}

export const saveTradingEvidenceCloudSnapshot = async (
  env: Env,
  userId: string,
  input: { expectedRevision: unknown; bundle: unknown },
): Promise<TradingEvidenceCloudSnapshot> => {
  if (!Number.isInteger(input.expectedRevision) || Number(input.expectedRevision) < 0) {
    throw new TradingEvidenceInputError('云端交易证据版本号无效')
  }
  const expectedRevision = Number(input.expectedRevision)
  let bundle: TradingEvidenceCloudBundle
  try {
    bundle = validateTradingEvidenceCloudBundle(input.bundle)
  } catch (error) {
    throw new TradingEvidenceInputError(
      error instanceof Error ? error.message : '云端交易证据无效',
    )
  }
  const serialized = JSON.stringify(bundle)
  const contentDigest = await sha256(serialized)
  const updatedAt = new Date().toISOString()
  const revision = expectedRevision + 1
  const syncToken = crypto.randomUUID()
  const [currentAuditHead, previousAudit] = await Promise.all([
    env.DB.prepare(`SELECT revision,audit_digest FROM trading_evidence_bundles WHERE user_id=?`)
      .bind(userId)
      .first<TradingEvidenceAuditHeadRow>(),
    env.DB.prepare(
      `SELECT revision,audit_digest FROM trading_evidence_sync_audit
       WHERE user_id=? ORDER BY revision DESC LIMIT 1`,
    )
      .bind(userId)
      .first<TradingEvidenceAuditHeadRow>(),
  ])
  if ((currentAuditHead?.revision ?? 0) !== expectedRevision) {
    throw new TradingEvidenceConflictError('云端证据已被其他设备更新，请先重新读取')
  }
  if ((previousAudit?.revision ?? 0) !== expectedRevision) {
    throw new TradingEvidenceIntegrityError('当前证据与同步审计链不连续')
  }
  if (expectedRevision > 0) {
    const auditVerification = await verifyTradingEvidenceCloudAudit(env, userId)
    if (auditVerification.status === 'broken') {
      throw new TradingEvidenceIntegrityError(
        `同步审计链完整性异常：${auditVerification.issues[0] ?? '无法继续保存'}`,
      )
    }
  }
  const previousAuditDigest = previousAudit?.audit_digest ?? null
  const auditDigest = await buildTradingEvidenceAuditDigest({
    userId,
    revision,
    contentDigest,
    previousAuditDigest,
    createdAt: updatedAt,
  })
  const currentStatement = env.DB.prepare(
    `INSERT INTO trading_evidence_bundles
       (user_id,schema_version,bundle_json,content_digest,revision,updated_at,sync_token,audit_digest)
     SELECT ?1,1,?2,?3,?4,?5,?7,?8 WHERE ?6=0
     ON CONFLICT(user_id) DO UPDATE SET
       schema_version=1,bundle_json=excluded.bundle_json,
       content_digest=excluded.content_digest,revision=excluded.revision,
       updated_at=excluded.updated_at,sync_token=excluded.sync_token,
       audit_digest=excluded.audit_digest
     WHERE trading_evidence_bundles.revision=?6`,
  )
    .bind(
      userId,
      serialized,
      contentDigest,
      revision,
      updatedAt,
      expectedRevision,
      syncToken,
      auditDigest,
    )
  const auditStatement = env.DB.prepare(
    `INSERT INTO trading_evidence_sync_audit
       (id,user_id,revision,content_digest,previous_audit_digest,audit_digest,created_at)
     SELECT ?1,?2,?3,?4,?5,?6,?7 WHERE EXISTS (
       SELECT 1 FROM trading_evidence_bundles
       WHERE user_id=?8 AND revision=?9 AND sync_token=?10
     )`,
  )
    .bind(
      crypto.randomUUID(),
      userId,
      revision,
      contentDigest,
      previousAuditDigest,
      auditDigest,
      updatedAt,
      userId,
      revision,
      syncToken,
    )
  const versionStatement = env.DB.prepare(
    `INSERT INTO trading_evidence_versions
       (user_id,revision,schema_version,bundle_json,content_digest,created_at)
     SELECT ?1,?2,1,?3,?4,?5 WHERE EXISTS (
       SELECT 1 FROM trading_evidence_bundles
       WHERE user_id=?6 AND revision=?7 AND sync_token=?8
     )`,
  )
    .bind(
      userId,
      revision,
      serialized,
      contentDigest,
      updatedAt,
      userId,
      revision,
      syncToken,
    )
  const pruneStatement = env.DB.prepare(
    `DELETE FROM trading_evidence_versions
     WHERE user_id=? AND revision NOT IN (
       SELECT revision FROM trading_evidence_versions
       WHERE user_id=? ORDER BY revision DESC LIMIT 20
     )`,
  )
    .bind(userId, userId)
  const [currentResult] = await env.DB.batch([
    currentStatement,
    auditStatement,
    versionStatement,
    pruneStatement,
  ])
  if ((currentResult.meta.changes ?? 0) !== 1) {
    throw new TradingEvidenceConflictError('云端证据已被其他设备更新，请先重新读取')
  }
  return { bundle, revision, contentDigest, updatedAt }
}

export const verifyTradingEvidenceCloudAudit = async (
  env: Env,
  userId: string,
): Promise<TradingEvidenceAuditVerification> => {
  const [current, auditRows] = await Promise.all([
    env.DB.prepare(
      `SELECT revision,content_digest,audit_digest
       FROM trading_evidence_bundles WHERE user_id=?`,
    )
      .bind(userId)
      .first<{ revision: number; content_digest: string; audit_digest: string | null }>(),
    env.DB.prepare(
      `SELECT id,user_id,revision,content_digest,previous_audit_digest,audit_digest,created_at
       FROM trading_evidence_sync_audit WHERE user_id=? ORDER BY revision ASC LIMIT 5001`,
    )
      .bind(userId)
      .all<TradingEvidenceAuditRow>(),
  ])
  if (auditRows.results.length > 5000) {
    return {
      status: 'broken',
      chainIntact: false,
      fullyVerifiable: false,
      totalEntries: auditRows.results.length,
      verifiedEntries: 0,
      legacyEntries: 0,
      firstRevision: auditRows.results[0]?.revision ?? null,
      lastRevision: auditRows.results[auditRows.results.length - 1]?.revision ?? null,
      headAuditDigest: current?.audit_digest ?? null,
      issues: ['同步审计记录超过5000条验证上限'],
    }
  }
  const entries: TradingEvidenceAuditEntry[] = auditRows.results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    revision: row.revision,
    contentDigest: row.content_digest,
    previousAuditDigest: row.previous_audit_digest,
    auditDigest: row.audit_digest,
    createdAt: row.created_at,
  }))
  return verifyTradingEvidenceAuditChain({
    userId,
    entries,
    current: current
      ? {
          revision: current.revision,
          contentDigest: current.content_digest,
          auditDigest: current.audit_digest,
        }
      : null,
  })
}

export const createTradingEvidenceAuditCheckpoint = async (
  env: Env,
  userId: string,
): Promise<TradingEvidenceAuditCheckpoint> => {
  const [snapshot, audit] = await Promise.all([
    loadTradingEvidenceCloudSnapshot(env, userId),
    verifyTradingEvidenceCloudAudit(env, userId),
  ])
  if (
    !snapshot.bundle ||
    !snapshot.contentDigest ||
    !audit.headAuditDigest ||
    (audit.status !== 'valid' && audit.status !== 'partial') ||
    audit.lastRevision !== snapshot.revision ||
    audit.totalEntries !== snapshot.revision
  ) {
    throw new TradingEvidenceIntegrityError('当前同步审计链无法生成外部检查点')
  }
  return buildTradingEvidenceAuditCheckpoint({
    generatedAt: new Date().toISOString(),
    revision: snapshot.revision,
    contentDigest: snapshot.contentDigest,
    auditDigest: audit.headAuditDigest,
    totalEntries: audit.totalEntries,
    chainStatus: audit.status,
  })
}

export const verifyExternalTradingEvidenceAuditCheckpoint = async (
  env: Env,
  userId: string,
  serialized: string,
): Promise<TradingEvidenceAuditCheckpointVerification> => {
  let checkpoint: TradingEvidenceAuditCheckpoint
  try {
    checkpoint = await parseTradingEvidenceAuditCheckpoint(serialized)
  } catch (error) {
    throw new TradingEvidenceInputError(
      error instanceof Error ? error.message : '外部审计检查点无效',
    )
  }
  const audit = await verifyTradingEvidenceCloudAudit(env, userId)
  const currentRevision = audit.lastRevision ?? 0
  if (audit.status === 'broken' || audit.status === 'empty') {
    return {
      valid: false,
      checkpointRevision: checkpoint.revision,
      currentRevision,
      isCurrentHead: false,
      message: '当前同步审计链无法验证外部检查点',
    }
  }
  const row = await env.DB.prepare(
    `SELECT revision,content_digest,audit_digest FROM trading_evidence_sync_audit
     WHERE user_id=? AND revision=?`,
  )
    .bind(userId, checkpoint.revision)
    .first<{ revision: number; content_digest: string; audit_digest: string | null }>()
  const valid =
    Boolean(row?.audit_digest) &&
    row?.content_digest === checkpoint.contentDigest &&
    row.audit_digest === checkpoint.auditDigest &&
    checkpoint.revision <= currentRevision
  return {
    valid,
    checkpointRevision: checkpoint.revision,
    currentRevision,
    isCurrentHead: valid && checkpoint.revision === currentRevision,
    message: valid
      ? checkpoint.revision === currentRevision
        ? '外部检查点与当前审计链头一致'
        : '外部检查点是当前审计链的有效历史祖先'
      : '外部检查点不属于当前同步审计链',
  }
}

export const listTradingEvidenceCloudVersions = async (
  env: Env,
  userId: string,
): Promise<TradingEvidenceCloudVersion[]> => {
  const rows = await env.DB.prepare(
    `SELECT revision,content_digest,created_at FROM trading_evidence_versions
     WHERE user_id=? ORDER BY revision DESC LIMIT 20`,
  )
    .bind(userId)
    .all<{ revision: number; content_digest: string; created_at: string }>()
  return rows.results.map((row) => ({
    revision: row.revision,
    contentDigest: row.content_digest,
    createdAt: row.created_at,
  }))
}

export const loadTradingEvidenceCloudVersion = async (
  env: Env,
  userId: string,
  revision: number,
): Promise<TradingEvidenceCloudSnapshot | null> => {
  const row = await env.DB.prepare(
    `SELECT bundle_json,revision,content_digest,created_at
     FROM trading_evidence_versions WHERE user_id=? AND revision=?`,
  )
    .bind(userId, revision)
    .first<TradingEvidenceVersionRow>()
  if (!row) return null
  await verifyStoredTradingEvidence(row.bundle_json, row.content_digest)
  return {
    bundle: validateTradingEvidenceCloudBundle(JSON.parse(row.bundle_json)),
    revision: row.revision,
    contentDigest: row.content_digest,
    updatedAt: row.created_at,
  }
}

export const restoreTradingEvidenceCloudVersion = async (
  env: Env,
  userId: string,
  revision: number,
  expectedRevision: unknown,
) => {
  const historical = await loadTradingEvidenceCloudVersion(env, userId, revision)
  if (!historical?.bundle) {
    throw new TradingEvidenceNotFoundError('云端交易证据历史版本不存在')
  }
  return saveTradingEvidenceCloudSnapshot(env, userId, {
    expectedRevision,
    bundle: historical.bundle,
  })
}
