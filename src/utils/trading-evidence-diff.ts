import type {
  TradingEvidenceBundleDiff,
  TradingEvidenceCloudBundle,
  TradingReviewAttestation,
} from '@/types'

const attestationValue = (item: TradingReviewAttestation | undefined) =>
  item
    ? JSON.stringify({
        confirmed: item.confirmed,
        evidence: item.evidence,
        confirmedAt: item.confirmedAt,
      })
    : ''

export const compareTradingEvidenceBundles = (
  local: TradingEvidenceCloudBundle,
  cloud: TradingEvidenceCloudBundle,
): TradingEvidenceBundleDiff => {
  const cloudAttestations = new Map(
    cloud.reviewChecklist.attestations.map((item) => [`${item.category}:${item.key}`, item]),
  )
  const changedKeys = local.reviewChecklist.attestations.flatMap((item) => {
    const cloudItem = cloudAttestations.get(`${item.category}:${item.key}`)
    return attestationValue(item) === attestationValue(cloudItem) ? [] : [item.key]
  })
  const localStrategyVersion = local.backtest?.report.strategyVersion ?? null
  const cloudStrategyVersion = cloud.backtest?.report.strategyVersion ?? null
  const backtestChanged =
    localStrategyVersion !== cloudStrategyVersion ||
    local.backtest?.report.inputDigest !== cloud.backtest?.report.inputDigest
  const sessionDelta = cloud.paperTelemetry.sessions.length - local.paperTelemetry.sessions.length
  const cycleDelta = cloud.paperTelemetry.cycles.length - local.paperTelemetry.cycles.length
  const gapDelta = cloud.paperTelemetry.gaps.length - local.paperTelemetry.gaps.length
  return {
    identical:
      !backtestChanged &&
      sessionDelta === 0 &&
      cycleDelta === 0 &&
      gapDelta === 0 &&
      changedKeys.length === 0,
    backtest: { localStrategyVersion, cloudStrategyVersion, changed: backtestChanged },
    paperTelemetry: { sessionDelta, cycleDelta, gapDelta },
    reviewChecklist: {
      changedKeys,
      localConfirmed: local.reviewChecklist.attestations.filter((item) => item.confirmed).length,
      cloudConfirmed: cloud.reviewChecklist.attestations.filter((item) => item.confirmed).length,
    },
  }
}
