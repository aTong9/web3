import type {
  LiveTradingReadinessInput,
  TradingReviewAttestation,
  TradingReviewAttestationDraft,
  TradingReviewChecklist,
  TradingReviewChecklistCategory,
  TradingReviewChecklistEvaluation,
  TradingReviewChecklistKey,
} from '@/types'

export const tradingReviewChecklistKeys = {
  accountControls: [
    'isolatedAccount',
    'withdrawalsDisabled',
    'ipAllowlist',
    'leastPrivilegeKey',
  ],
  riskControls: [
    'perTradeLimit',
    'dailyLossLimit',
    'directionalExposureLimit',
    'portfolioExposureLimit',
    'humanKillSwitch',
    'anomalyCircuitBreaker',
    'idempotentOrders',
    'continuousReconciliation',
  ],
  eligibility: ['jurisdictionConfirmed', 'accountEligible', 'productEligible'],
} as const satisfies Record<TradingReviewChecklistCategory, readonly TradingReviewChecklistKey[]>

const categories = Object.keys(tradingReviewChecklistKeys) as TradingReviewChecklistCategory[]
const allKeys = categories.flatMap((category) =>
  tradingReviewChecklistKeys[category].map((key) => ({ category, key })),
)
const validTime = (value: string | null) => value !== null && Number.isFinite(Date.parse(value))
export const tradingReviewChecklistValidityDays = 30

export const createTradingReviewChecklist = (now = new Date()): TradingReviewChecklist => ({
  schemaVersion: 1,
  validityDays: tradingReviewChecklistValidityDays,
  updatedAt: now.toISOString(),
  attestations: allKeys.map(({ category, key }) => ({
    category,
    key,
    confirmed: false,
    evidence: '',
    confirmedAt: null,
  })),
})

const isChecklist = (value: unknown): value is TradingReviewChecklist => {
  if (!value || typeof value !== 'object') return false
  const checklist = value as Partial<TradingReviewChecklist>
  if (
    checklist.schemaVersion !== 1 ||
    checklist.validityDays !== tradingReviewChecklistValidityDays ||
    !validTime(checklist.updatedAt ?? null) ||
    !Array.isArray(checklist.attestations)
  ) {
    return false
  }
  const expected = new Set(allKeys.map(({ category, key }) => `${category}:${key}`))
  const observed = new Set<string>()
  for (const item of checklist.attestations) {
    if (!item || typeof item !== 'object') return false
    const attestation = item as TradingReviewAttestation
    const id = `${attestation.category}:${attestation.key}`
    if (
      !expected.has(id) ||
      observed.has(id) ||
      typeof attestation.confirmed !== 'boolean' ||
      typeof attestation.evidence !== 'string' ||
      (attestation.confirmedAt !== null && !validTime(attestation.confirmedAt))
    ) {
      return false
    }
    observed.add(id)
  }
  return observed.size === expected.size
}

export const parseTradingReviewChecklist = (serialized: string): TradingReviewChecklist => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('人工核验清单不是有效JSON')
  }
  if (!isChecklist(parsed)) throw new Error('人工核验清单结构或版本无效')
  return parsed
}

const blankEvaluation = (): Omit<
  TradingReviewChecklistEvaluation,
  'validCount' | 'totalCount' | 'expiredKeys' | 'missingEvidenceKeys'
> => ({
  accountControls: {
    isolatedAccount: false,
    withdrawalsDisabled: false,
    ipAllowlist: false,
    leastPrivilegeKey: false,
  },
  riskControls: {
    perTradeLimit: false,
    dailyLossLimit: false,
    directionalExposureLimit: false,
    portfolioExposureLimit: false,
    humanKillSwitch: false,
    anomalyCircuitBreaker: false,
    idempotentOrders: false,
    continuousReconciliation: false,
  },
  eligibility: {
    jurisdictionConfirmed: false,
    accountEligible: false,
    productEligible: false,
  },
})

export const evaluateTradingReviewChecklist = (
  checklist: TradingReviewChecklist,
  now = new Date(),
): TradingReviewChecklistEvaluation => {
  const values = blankEvaluation()
  const expiredKeys: TradingReviewChecklistKey[] = []
  const missingEvidenceKeys: TradingReviewChecklistKey[] = []
  const maximumAgeMs = checklist.validityDays * 86_400_000
  let validCount = 0
  for (const attestation of checklist.attestations) {
    const evidenceReady = attestation.evidence.trim().length >= 8
    const confirmedTime = attestation.confirmedAt ? Date.parse(attestation.confirmedAt) : NaN
    const expired =
      Number.isFinite(confirmedTime) && now.getTime() - confirmedTime > maximumAgeMs
    if (attestation.confirmed && !evidenceReady) missingEvidenceKeys.push(attestation.key)
    if (attestation.confirmed && expired) expiredKeys.push(attestation.key)
    const valid =
      attestation.confirmed &&
      evidenceReady &&
      Number.isFinite(confirmedTime) &&
      confirmedTime <= now.getTime() &&
      !expired
    ;(values[attestation.category] as Record<string, boolean>)[attestation.key] = valid
    if (valid) validCount += 1
  }
  return {
    ...values,
    validCount,
    totalCount: allKeys.length,
    expiredKeys,
    missingEvidenceKeys,
  }
}

export const confirmTradingReviewAttestation = (
  checklist: TradingReviewChecklist,
  category: TradingReviewChecklistCategory,
  key: TradingReviewChecklistKey,
  confirmed: boolean,
  evidence: string,
  now = new Date(),
): TradingReviewChecklist => ({
  ...checklist,
  updatedAt: now.toISOString(),
  attestations: checklist.attestations.map((attestation) =>
    attestation.category === category && attestation.key === key
      ? {
          ...attestation,
          confirmed,
          evidence: evidence.trim(),
          confirmedAt: confirmed ? now.toISOString() : null,
        }
      : attestation,
  ),
})

export const applyTradingReviewChecklistDraft = (
  checklist: TradingReviewChecklist,
  draft: readonly TradingReviewAttestationDraft[],
  now = new Date(),
): TradingReviewChecklist => {
  const updates = new Map(draft.map((item) => [`${item.category}:${item.key}`, item]))
  return {
    ...checklist,
    updatedAt: now.toISOString(),
    attestations: checklist.attestations.map((current) => {
      const update = updates.get(`${current.category}:${current.key}`)
      if (!update) return current
      const evidence = update.evidence.trim()
      const changed = update.confirmed !== current.confirmed || evidence !== current.evidence
      return {
        ...current,
        confirmed: update.confirmed,
        evidence,
        confirmedAt: !update.confirmed
          ? null
          : changed || current.confirmedAt === null
            ? now.toISOString()
            : current.confirmedAt,
      }
    }),
  }
}

export const reviewEvaluationToReadinessInput = (
  evaluation: TradingReviewChecklistEvaluation,
): Pick<LiveTradingReadinessInput, 'accountControls' | 'riskControls' | 'eligibility'> => ({
  accountControls: evaluation.accountControls,
  riskControls: evaluation.riskControls,
  eligibility: evaluation.eligibility,
})
