import type {
  TradingEvidenceAuditDigestInput,
  TradingEvidenceAuditEntry,
  TradingEvidenceAuditHead,
  TradingEvidenceAuditVerification,
} from '../types/index'

const sha256 = async (value: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const buildTradingEvidenceAuditDigest = (input: TradingEvidenceAuditDigestInput) =>
  sha256(
    JSON.stringify({
      schemaVersion: 1,
      userId: input.userId,
      revision: input.revision,
      contentDigest: input.contentDigest,
      previousAuditDigest: input.previousAuditDigest,
      createdAt: input.createdAt,
    }),
  )

export const verifyTradingEvidenceAuditChain = async (input: {
  userId: string
  entries: TradingEvidenceAuditEntry[]
  current: TradingEvidenceAuditHead | null
}): Promise<TradingEvidenceAuditVerification> => {
  const issues: string[] = []
  let previousAuditDigest: string | null = null
  let verifiedEntries = 0
  let legacyEntries = 0
  let chainedEntriesStarted = false

  let expectedRevision = 1
  for (const entry of input.entries) {
    if (entry.userId !== input.userId) issues.push(`修订版 ${entry.revision} 的用户不匹配`)
    if (entry.revision !== expectedRevision) issues.push(`修订序列在 ${entry.revision} 处不连续`)
    expectedRevision += 1
    if (!entry.auditDigest) {
      legacyEntries += 1
      if (chainedEntriesStarted) issues.push(`修订版 ${entry.revision} 缺少审计摘要`)
      if (entry.previousAuditDigest) issues.push(`修订版 ${entry.revision} 的旧记录前序摘要异常`)
      continue
    }
    chainedEntriesStarted = true
    if (entry.previousAuditDigest !== previousAuditDigest) {
      issues.push(`修订版 ${entry.revision} 的前序摘要不匹配`)
    }
    const expectedDigest = await buildTradingEvidenceAuditDigest(entry)
    if (entry.auditDigest !== expectedDigest) {
      issues.push(`修订版 ${entry.revision} 的审计摘要不匹配`)
    } else {
      verifiedEntries += 1
    }
    previousAuditDigest = entry.auditDigest
  }

  const lastEntry = input.entries[input.entries.length - 1] ?? null
  if (!lastEntry && input.current) issues.push('当前证据缺少同步审计记录')
  if (lastEntry && !input.current) issues.push('同步审计存在但当前证据缺失')
  if (lastEntry && input.current) {
    if (input.current.revision !== lastEntry.revision) issues.push('当前修订号与审计链头不匹配')
    if (input.current.contentDigest !== lastEntry.contentDigest) {
      issues.push('当前内容摘要与审计链头不匹配')
    }
    if (input.current.auditDigest !== lastEntry.auditDigest) {
      issues.push('当前审计摘要与审计链头不匹配')
    }
  }

  const empty = !input.entries.length && !input.current
  const status = empty
    ? 'empty'
    : issues.length
      ? 'broken'
      : legacyEntries
        ? 'partial'
        : 'valid'
  return {
    status,
    chainIntact: issues.length === 0,
    fullyVerifiable: !empty && !legacyEntries && issues.length === 0,
    totalEntries: input.entries.length,
    verifiedEntries,
    legacyEntries,
    firstRevision: input.entries[0]?.revision ?? null,
    lastRevision: lastEntry?.revision ?? null,
    headAuditDigest: lastEntry?.auditDigest ?? null,
    issues,
  }
}
