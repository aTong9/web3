import type {
  ContractPaperAuditEvent,
  ContractPaperDriftCohort,
  ContractPaperDriftInput,
  ContractPaperDriftReport,
  ContractPaperObservation,
} from '@/types'

const round = (value: number, digits = 4) => Number(value.toFixed(digits))
const validTime = (value: string) => Number.isFinite(Date.parse(value))

export const contractPaperDriftReviewPolicy = Object.freeze({
  minimumSamples: 100,
  maximumExpectedReturnDegradationPct: 0.5,
  maximumWinRateDegradationPct: 5,
  maximumDrawdownIncreasePct: 3,
  cycleToleranceMinutes: 2,
})

export const assertContractPaperDriftReviewPolicy = (input: ContractPaperDriftInput) => {
  const matches = Object.entries(contractPaperDriftReviewPolicy).every(
    ([key, value]) => input[key as keyof typeof contractPaperDriftReviewPolicy] === value,
  )
  if (!matches) throw new Error('综合评审包的Paper偏差政策不一致')
}

const maximumDrawdown = (returns: readonly number[]) => {
  let equity = 0
  let peak = 0
  let drawdown = 0
  for (const value of returns) {
    equity += value
    peak = Math.max(peak, equity)
    drawdown = Math.max(drawdown, peak - equity)
  }
  return round(drawdown)
}

const isExplainable = (trade: ContractPaperObservation) =>
  Boolean(trade.signalVersion && trade.pathId && trade.marketSource && trade.costModelVersion)

const validate = (input: ContractPaperDriftInput) => {
  if (!Number.isInteger(input.minimumSamples) || input.minimumSamples < 1) {
    throw new Error('Paper偏差最小样本数必须为正整数')
  }
  const tradeIds = new Set<string>()
  for (const trade of input.paperTrades) {
    if (!trade.id || tradeIds.has(trade.id)) throw new Error('Paper交易ID必须唯一')
    tradeIds.add(trade.id)
    if (!validTime(trade.plannedAt) || !validTime(trade.closedAt))
      throw new Error('Paper交易时间无效')
    if (Date.parse(trade.closedAt) < Date.parse(trade.plannedAt)) {
      throw new Error('Paper平仓时间不得早于计划时间')
    }
    if (
      (trade.feeRatePct !== undefined &&
        (!Number.isFinite(trade.feeRatePct) || trade.feeRatePct < 0)) ||
      (trade.slippageRatePct !== undefined &&
        (!Number.isFinite(trade.slippageRatePct) || trade.slippageRatePct < 0))
    ) {
      throw new Error('Paper交易成本证据无效')
    }
  }
  for (const reference of input.references) {
    if (!validTime(reference.startAt) || !validTime(reference.endAt)) {
      throw new Error('回测参考窗口时间无效')
    }
  }
}

const cohort = (
  input: ContractPaperDriftInput,
  reference: ContractPaperDriftInput['references'][number],
): ContractPaperDriftCohort => {
  const start = Date.parse(reference.startAt)
  const end = Date.parse(reference.endAt)
  const trades = input.paperTrades.filter(
    (trade) =>
      trade.strategyVersion === reference.strategyVersion &&
      Date.parse(trade.closedAt) >= start &&
      Date.parse(trade.closedAt) <= end,
  )
  const returns = trades.map((trade) => trade.netReturnPct)
  const paperAverageNetReturnPct = returns.length
    ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length)
    : null
  const paperWinRatePct = returns.length
    ? round((returns.filter((value) => value > 0).length / returns.length) * 100)
    : null
  const paperMaximumDrawdownPct = maximumDrawdown(returns)
  const returnDeltaPct =
    paperAverageNetReturnPct === null
      ? null
      : round(paperAverageNetReturnPct - reference.averageNetReturnPct)
  const winRateDeltaPct =
    paperWinRatePct === null ? null : round(paperWinRatePct - reference.winRatePct)
  const drawdownDeltaPct = round(paperMaximumDrawdownPct - reference.maximumDrawdownPct)
  const enough = trades.length >= input.minimumSamples
  const severe =
    (returnDeltaPct ?? 0) < -input.maximumExpectedReturnDegradationPct ||
    drawdownDeltaPct > input.maximumDrawdownIncreasePct
  const warning =
    (winRateDeltaPct ?? 0) < -input.maximumWinRateDegradationPct ||
    trades.some((trade) => !isExplainable(trade))
  return {
    strategyVersion: reference.strategyVersion,
    period: reference.period,
    startAt: reference.startAt,
    endAt: reference.endAt,
    samples: trades.length,
    explainableSamples: trades.filter(isExplainable).length,
    paperAverageNetReturnPct,
    paperWinRatePct,
    paperMaximumDrawdownPct,
    returnDeltaPct,
    winRateDeltaPct,
    drawdownDeltaPct,
    status: !enough ? 'insufficient' : severe ? 'degraded' : warning ? 'watch' : 'stable',
  }
}

const auditEvents = (input: ContractPaperDriftInput): ContractPaperAuditEvent[] => {
  const events: ContractPaperAuditEvent[] = []
  const sortedTrades = [...input.paperTrades].sort(
    (left, right) => Date.parse(left.plannedAt) - Date.parse(right.plannedAt),
  )
  for (const [index, trade] of sortedTrades.entries()) {
    if (!isExplainable(trade)) {
      events.push({
        type: 'missingTrace',
        at: trade.plannedAt,
        detail: '缺少信号版本、路径、行情源或成本模型追踪字段',
        tradeId: trade.id,
      })
    }
    const previous = sortedTrades[index - 1]
    if (previous && previous.strategyVersion !== trade.strategyVersion) {
      events.push({
        type: 'strategySwitch',
        at: trade.plannedAt,
        detail: `${previous.strategyVersion} → ${trade.strategyVersion}`,
        tradeId: trade.id,
      })
    }
  }
  const toleranceMs = input.cycleToleranceMinutes * 60_000
  for (const expectedAt of input.expectedCycleAts) {
    const expectedTime = Date.parse(expectedAt)
    const observed = input.observedCycleAts.some(
      (observedAt) => Math.abs(Date.parse(observedAt) - expectedTime) <= toleranceMs,
    )
    if (!observed) {
      events.push({
        type: 'missedCycle',
        at: expectedAt,
        detail: '预期策略周期未观测到',
        tradeId: null,
      })
    }
  }
  for (const gap of input.dataGaps) {
    events.push({
      type: 'dataGap',
      at: gap.startAt,
      detail: `${gap.reason}（至 ${gap.endAt}）`,
      tradeId: null,
    })
  }
  return events.sort((left, right) => Date.parse(left.at) - Date.parse(right.at))
}

export const analyzeContractPaperDrift = (
  input: ContractPaperDriftInput,
): ContractPaperDriftReport => {
  validate(input)
  return {
    cohorts: input.references.map((reference) => cohort(input, reference)),
    auditEvents: auditEvents(input),
    strategyVersions: [...new Set(input.paperTrades.map((trade) => trade.strategyVersion))].sort(),
  }
}
