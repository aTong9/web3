import type { LiveTradingReadinessInput, LiveTradingReadinessReport } from '@/types'

export const liveTradingReadinessThresholds: Readonly<
  LiveTradingReadinessInput['thresholds']
> = Object.freeze({
  minimumHoldoutSamples: 100,
  minimumHoldoutDays: 90,
  maximumHoldoutDrawdownPct: 10,
  minimumPaperSamples: 100,
  maximumPaperReturnDegradationPct: 0.5,
  minimumTestnetFilledObservations: 100,
})

const hasFixedThresholds = (thresholds: LiveTradingReadinessInput['thresholds']) =>
  Object.entries(liveTradingReadinessThresholds).every(
    ([key, value]) => thresholds[key as keyof typeof thresholds] === value,
  ) && Object.keys(thresholds).length === Object.keys(liveTradingReadinessThresholds).length

const trueKeys = (record: Record<string, boolean>) =>
  Object.entries(record)
    .filter(([, value]) => value)
    .map(([key]) => key)

export const assessLiveTradingReadiness = (
  input: LiveTradingReadinessInput,
): LiveTradingReadinessReport => {
  if (!hasFixedThresholds(input.thresholds)) {
    throw new Error('交易准备度门槛与固定政策不一致')
  }
  const passed: string[] = []
  const blockers: string[] = []

  const backtestReady =
    input.backtest.holdoutStatus === 'supported' &&
    input.backtest.holdoutSamples >= input.thresholds.minimumHoldoutSamples &&
    input.backtest.holdoutDays >= input.thresholds.minimumHoldoutDays &&
    (input.backtest.averageNetReturnPct ?? 0) > 0 &&
    input.backtest.maximumDrawdownPct <= input.thresholds.maximumHoldoutDrawdownPct
  if (backtestReady) passed.push('样本外回测达到正期望、样本长度和回撤门槛')
  else blockers.push('样本外回测尚未同时达到正期望、样本长度和回撤门槛')

  const paperReady =
    input.paper.status === 'stable' &&
    input.paper.samples >= input.thresholds.minimumPaperSamples &&
    input.paper.returnDeltaPct !== null &&
    input.paper.returnDeltaPct >= -input.thresholds.maximumPaperReturnDegradationPct
  if (paperReady) passed.push('Paper样本充足且相对回测未显著退化')
  else blockers.push('Paper样本或相对回测偏差尚未达标')

  const testnetReady =
    input.testnet.readyForPaperComparison &&
    input.testnet.filledObservations >= input.thresholds.minimumTestnetFilledObservations &&
    input.testnet.unresolvedOrders === 0
  if (testnetReady) passed.push('Testnet成交校准、对账和演练证据达标')
  else blockers.push('Testnet成交样本、对账或安全演练证据尚未达标')

  const missingAccountControls = Object.entries(input.accountControls)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key)
  const missingRiskControls = Object.entries(input.riskControls)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key)
  const missingEligibility = Object.entries(input.eligibility)
    .filter(([, confirmed]) => !confirmed)
    .map(([key]) => key)
  if (missingAccountControls.length) {
    blockers.push(`账户安全控制缺失：${missingAccountControls.join(', ')}`)
  } else passed.push(`账户安全控制：${trueKeys(input.accountControls).join(', ')}`)
  if (missingRiskControls.length) {
    blockers.push(`组合风险控制缺失：${missingRiskControls.join(', ')}`)
  } else passed.push(`组合风险控制：${trueKeys(input.riskControls).join(', ')}`)
  if (missingEligibility.length) {
    blockers.push(`资格确认缺失：${missingEligibility.join(', ')}`)
  } else passed.push(`资格确认：${trueKeys(input.eligibility).join(', ')}`)

  const reviewEligible = blockers.length === 0
  const evidenceLevel = reviewEligible
    ? 'reviewEligible'
    : backtestReady && paperReady && testnetReady
      ? 'testnet'
      : backtestReady && paperReady
        ? 'paper'
        : 'research'
  return {
    evidenceLevel,
    decision: reviewEligible ? 'eligibleForHumanReview' : 'notReady',
    liveTradingAuthorized: false,
    passed,
    blockers,
    prohibitions: [
      '本报告不授权真实资金交易',
      '不得把研究、Paper或Testnet结果冒充真实成交能力',
      '不得在浏览器、源码、GitHub Pages或日志中保存主网密钥',
      '没有单独人工批准时不得新增或启用主网执行适配器',
    ],
  }
}

export const buildLiveTradingReadinessExport = (
  input: LiveTradingReadinessInput,
  report: LiveTradingReadinessReport,
) => {
  const recalculated = assessLiveTradingReadiness(input)
  if (JSON.stringify(recalculated) !== JSON.stringify(report)) {
    throw new Error('交易准备度报告与固定政策重算结果不一致')
  }
  return JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      input,
      report,
      authorization: 'human-review-only',
    },
    null,
    2,
  )
}
