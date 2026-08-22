import type {
  TradingEvidenceAuditCheckpoint,
  TradingEvidenceAuditCheckpointInput,
} from '../types/index'

const hexDigestPattern = /^[0-9a-f]{64}$/
const checkpointDigestPattern = /^sha256-[0-9a-f]{64}$/

const sha256 = async (value: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  const hex = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
  return `sha256-${hex}`
}

const checkpointBase = (input: TradingEvidenceAuditCheckpointInput) => ({
  schemaVersion: 1 as const,
  kind: 'trading-evidence-audit-checkpoint' as const,
  generatedAt: input.generatedAt,
  revision: input.revision,
  contentDigest: input.contentDigest,
  auditDigest: input.auditDigest,
  totalEntries: input.totalEntries,
  chainStatus: input.chainStatus,
  notice: 'external-checkpoint-not-signature' as const,
})

const validateInput = (input: TradingEvidenceAuditCheckpointInput) => {
  if (!Number.isFinite(Date.parse(input.generatedAt))) throw new Error('审计检查点生成时间无效')
  if (!Number.isInteger(input.revision) || input.revision < 1) {
    throw new Error('审计检查点修订号无效')
  }
  if (!Number.isInteger(input.totalEntries) || input.totalEntries !== input.revision) {
    throw new Error('审计检查点记录数量与修订号不一致')
  }
  if (!hexDigestPattern.test(input.contentDigest) || !hexDigestPattern.test(input.auditDigest)) {
    throw new Error('审计检查点摘要无效')
  }
  if (input.chainStatus !== 'valid' && input.chainStatus !== 'partial') {
    throw new Error('审计检查点链状态无效')
  }
}

export const buildTradingEvidenceAuditCheckpoint = async (
  input: TradingEvidenceAuditCheckpointInput,
): Promise<TradingEvidenceAuditCheckpoint> => {
  validateInput(input)
  const base = checkpointBase(input)
  return { ...base, checkpointDigest: await sha256(JSON.stringify(base)) }
}

export const parseTradingEvidenceAuditCheckpoint = async (
  serialized: string,
): Promise<TradingEvidenceAuditCheckpoint> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('审计检查点不是有效JSON')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('审计检查点结构无效')
  const checkpoint = parsed as TradingEvidenceAuditCheckpoint
  if (
    checkpoint.schemaVersion !== 1 ||
    checkpoint.kind !== 'trading-evidence-audit-checkpoint' ||
    checkpoint.notice !== 'external-checkpoint-not-signature' ||
    !checkpointDigestPattern.test(checkpoint.checkpointDigest)
  ) {
    throw new Error('审计检查点结构无效')
  }
  validateInput(checkpoint)
  const { checkpointDigest, ...base } = checkpoint
  if ((await sha256(JSON.stringify(base))) !== checkpointDigest) {
    throw new Error('审计检查点内容摘要不匹配')
  }
  return checkpoint
}
