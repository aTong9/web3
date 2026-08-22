import type {
  ContractBacktestBaseline,
  ContractBacktestOpportunityBuildInput,
  ContractBacktestMetrics,
  ContractBacktestOpportunity,
  ContractBacktestRegime,
  ContractBacktestSegment,
  ContractBacktestSegmentResult,
  ContractPositionDirection,
  ContractStrategyBacktestInput,
  ContractStrategyBacktestReport,
  ContractTradePathResult,
} from '@/types'
import { evaluateContractTradePath } from './contract-trade-path'
import { buildContractTradeDecision } from './contract-trade-decision'

export const contractBacktestReviewCostPolicy = Object.freeze({
  minimumFeeRatePct: 0.05,
  minimumSlippageRatePct: 0.05,
})

export const assertContractBacktestReviewCostPolicy = (
  input: ContractStrategyBacktestInput,
) => {
  const cost = input.costModel
  if (
    !cost.version.trim() ||
    !Number.isFinite(cost.feeRatePct) ||
    cost.feeRatePct < contractBacktestReviewCostPolicy.minimumFeeRatePct ||
    !Number.isFinite(cost.slippageRatePct) ||
    cost.slippageRatePct < contractBacktestReviewCostPolicy.minimumSlippageRatePct ||
    !Number.isFinite(cost.fundingRatePct) ||
    !Number.isInteger(cost.fundingSettlements) ||
    cost.fundingSettlements < 0
  ) {
    throw new Error('综合评审包的回测成本政策不一致')
  }
}

interface SettledOpportunity {
  opportunity: ContractBacktestOpportunity
  results: Record<ContractBacktestBaseline, ContractTradePathResult | null>
}

const regimes: ContractBacktestRegime[] = ['trending', 'ranging', 'volatile']
const baselines: Array<Exclude<ContractBacktestBaseline, 'strategy'>> = [
  'hold',
  'simpleTrend',
  'random',
]
const round = (value: number, digits = 4) => Number(value.toFixed(digits))
const isPositive = (value: number) => Number.isFinite(value) && value > 0

const digest = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

const deterministicDirection = (id: string): ContractPositionDirection => {
  let value = 0
  for (const character of id) value = (value * 31 + character.charCodeAt(0)) >>> 0
  return value % 2 === 0 ? 'long' : 'short'
}

export const buildContractBacktestOpportunities = (
  input: ContractBacktestOpportunityBuildInput,
): ContractBacktestOpportunity[] => {
  if (!isPositive(input.notional) || !Number.isInteger(input.maximumHoldingMinutes)) {
    throw new Error('回测名义仓位或最长持仓时间无效')
  }
  let previousDecisionTime = -Infinity
  return input.frames.flatMap((frame) => {
    const decisionTime = Date.parse(frame.decisionAt)
    const evidenceTime = Date.parse(frame.evidenceEndAt)
    if (!Number.isFinite(decisionTime) || !Number.isFinite(evidenceTime)) {
      throw new Error('历史决策帧时间无效')
    }
    if (decisionTime <= previousDecisionTime) throw new Error('历史决策帧必须按时间严格升序')
    if (evidenceTime > decisionTime) throw new Error('历史证据截止时间不得晚于决策时间')
    const evidencePoints = [
      ...frame.market.points,
      ...frame.market.timeframes.flatMap((timeframe) => timeframe.points),
    ]
    if (evidencePoints.some((point) => Date.parse(point.date) > evidenceTime)) {
      throw new Error('历史决策输入包含证据截止时间之后的数据')
    }
    previousDecisionTime = decisionTime
    const decision = buildContractTradeDecision(frame.market, {
      ensembleWeight: input.ensembleWeight,
    })
    if (
      (decision.action !== 'long' && decision.action !== 'short') ||
      decision.latestPrice === null ||
      decision.stopLoss === null ||
      decision.takeProfit === null
    ) {
      return []
    }
    const closes = frame.market.points.slice(-20).map((point) => point.close)
    const simpleTrend =
      closes.length >= 2 && closes[closes.length - 1]! < closes[0]! ? 'short' : 'long'
    return [
      {
        id: frame.id,
        symbol: frame.market.symbol,
        decisionAt: frame.decisionAt,
        evidenceEndAt: frame.evidenceEndAt,
        regime: decision.strategyDiagnostics?.ensembleRegime ?? 'ranging',
        action: decision.action,
        entryPrice: decision.latestPrice,
        stopLoss: decision.stopLoss,
        takeProfit: decision.takeProfit,
        notional: input.notional,
        maximumHoldingMinutes: input.maximumHoldingMinutes,
        bars: frame.futureBars,
        baselineDirections: {
          hold: 'long',
          simpleTrend,
          random: deterministicDirection(frame.id),
        },
      },
    ] satisfies ContractBacktestOpportunity[]
  })
}

const validateInput = (input: ContractStrategyBacktestInput) => {
  if (!input.strategyVersion.trim() || !input.signalModelVersion.trim()) {
    throw new Error('策略版本和信号模型版本不能为空')
  }
  if (!Number.isInteger(input.minimumSamples) || input.minimumSamples < 1) {
    throw new Error('最小样本数必须为正整数')
  }
  if (
    !Number.isFinite(input.trainingPct) ||
    !Number.isFinite(input.validationPct) ||
    input.trainingPct <= 0 ||
    input.validationPct <= 0 ||
    input.trainingPct + input.validationPct >= 100
  ) {
    throw new Error('训练、验证和留出比例必须都大于0')
  }
  let previousDecisionTime = -Infinity
  const ids = new Set<string>()
  for (const opportunity of input.opportunities) {
    if (!opportunity.id || ids.has(opportunity.id)) throw new Error('回测机会ID必须唯一')
    ids.add(opportunity.id)
    const decisionTime = Date.parse(opportunity.decisionAt)
    const evidenceTime = Date.parse(opportunity.evidenceEndAt)
    if (!Number.isFinite(decisionTime) || !Number.isFinite(evidenceTime)) {
      throw new Error('回测时间无效')
    }
    if (decisionTime <= previousDecisionTime) throw new Error('回测机会必须按决策时间严格升序')
    if (evidenceTime > decisionTime) throw new Error('证据截止时间不得晚于决策时间')
    if (opportunity.bars.some((bar) => Date.parse(bar.date) <= decisionTime)) {
      throw new Error('结算K线必须严格晚于决策时间')
    }
    previousDecisionTime = decisionTime
  }
}

const mirroredPlan = (
  opportunity: ContractBacktestOpportunity,
  direction: ContractPositionDirection,
) => {
  if (opportunity.stopLoss === null || opportunity.takeProfit === null) return null
  const stopDistance = Math.abs(opportunity.entryPrice - opportunity.stopLoss)
  const targetDistance = Math.abs(opportunity.takeProfit - opportunity.entryPrice)
  if (!isPositive(stopDistance) || !isPositive(targetDistance)) return null
  return direction === 'long'
    ? {
        stopLoss: opportunity.entryPrice - stopDistance,
        takeProfit: opportunity.entryPrice + targetDistance,
      }
    : {
        stopLoss: opportunity.entryPrice + stopDistance,
        takeProfit: opportunity.entryPrice - targetDistance,
      }
}

const settle = (
  opportunity: ContractBacktestOpportunity,
  direction: ContractPositionDirection,
  input: ContractStrategyBacktestInput,
) => {
  const plan = mirroredPlan(opportunity, direction)
  if (!plan) return null
  return evaluateContractTradePath({
    direction,
    entryPrice: opportunity.entryPrice,
    stopLoss: plan.stopLoss,
    takeProfit: plan.takeProfit,
    notional: opportunity.notional,
    bars: opportunity.bars,
    maximumHoldingMinutes: opportunity.maximumHoldingMinutes,
    feeRatePct: input.costModel.feeRatePct,
    slippageRatePct: input.costModel.slippageRatePct,
    fundingRatePct: input.costModel.fundingRatePct,
    fundingSettlements: input.costModel.fundingSettlements,
  })
}

const settleOpportunity = (
  opportunity: ContractBacktestOpportunity,
  input: ContractStrategyBacktestInput,
): SettledOpportunity => {
  const strategyDirection =
    opportunity.action === 'long' || opportunity.action === 'short' ? opportunity.action : null
  return {
    opportunity,
    results: {
      strategy: strategyDirection ? settle(opportunity, strategyDirection, input) : null,
      hold: settle(opportunity, opportunity.baselineDirections.hold, input),
      simpleTrend: settle(opportunity, opportunity.baselineDirections.simpleTrend, input),
      random: settle(opportunity, opportunity.baselineDirections.random, input),
    },
  }
}

const metrics = (
  records: readonly SettledOpportunity[],
  baseline: ContractBacktestBaseline,
  minimumSamples: number,
): ContractBacktestMetrics => {
  const closed = records
    .map((record) => record.results[baseline])
    .filter(
      (result): result is ContractTradePathResult & { netPnl: number; returnPct: number } =>
        result?.status === 'closed' && result.netPnl !== null && result.returnPct !== null,
    )
  const returns = closed.map((result) => result.returnPct)
  const wins = returns.filter((value) => value > 0)
  const losses = returns.filter((value) => value <= 0)
  const grossProfit = wins.reduce((sum, value) => sum + value, 0)
  const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0))
  let equity = 0
  let peak = 0
  let maximumDrawdownPct = 0
  let consecutiveLosses = 0
  let maximumConsecutiveLosses = 0
  for (const value of returns) {
    equity += value
    peak = Math.max(peak, equity)
    maximumDrawdownPct = Math.max(maximumDrawdownPct, peak - equity)
    consecutiveLosses = value <= 0 ? consecutiveLosses + 1 : 0
    maximumConsecutiveLosses = Math.max(maximumConsecutiveLosses, consecutiveLosses)
  }
  const averageNetReturnPct = returns.length
    ? round(returns.reduce((sum, value) => sum + value, 0) / returns.length)
    : null
  const enough = returns.length >= minimumSamples
  return {
    opportunities: records.length,
    trades: closed.length,
    wins: wins.length,
    losses: losses.length,
    coveragePct: records.length ? round((closed.length / records.length) * 100, 2) : 0,
    winRatePct: closed.length ? round((wins.length / closed.length) * 100, 2) : null,
    averageNetReturnPct,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss) : grossProfit > 0 ? null : 0,
    maximumDrawdownPct: round(maximumDrawdownPct),
    maximumConsecutiveLosses,
    status: !enough
      ? 'insufficient'
      : (averageNetReturnPct ?? 0) <= 0
        ? 'negative'
        : (grossLoss === 0 && grossProfit > 0) || grossProfit / grossLoss >= 1.2
          ? 'supported'
          : 'watch',
  }
}

const segmentResult = (
  segment: ContractBacktestSegment,
  records: readonly SettledOpportunity[],
  minimumSamples: number,
): ContractBacktestSegmentResult => ({
  segment,
  startAt: records[0]?.opportunity.decisionAt ?? null,
  endAt: records[records.length - 1]?.opportunity.decisionAt ?? null,
  metrics: metrics(records, 'strategy', minimumSamples),
  byRegime: Object.fromEntries(
    regimes.map((regime) => [
      regime,
      metrics(
        records.filter((record) => record.opportunity.regime === regime),
        'strategy',
        minimumSamples,
      ),
    ]),
  ) as Record<ContractBacktestRegime, ContractBacktestMetrics>,
  baselines: Object.fromEntries(
    baselines.map((baseline) => [baseline, metrics(records, baseline, minimumSamples)]),
  ) as ContractBacktestSegmentResult['baselines'],
})

export const runContractStrategyBacktest = (
  input: ContractStrategyBacktestInput,
): ContractStrategyBacktestReport => {
  validateInput(input)
  const settled = input.opportunities.map((opportunity) => settleOpportunity(opportunity, input))
  const trainingEnd = Math.floor(settled.length * (input.trainingPct / 100))
  const validationEnd = Math.floor(
    settled.length * ((input.trainingPct + input.validationPct) / 100),
  )
  const groups: Record<ContractBacktestSegment, SettledOpportunity[]> = {
    training: settled.slice(0, trainingEnd),
    validation: settled.slice(trainingEnd, validationEnd),
    holdout: settled.slice(validationEnd),
  }
  const canonicalInput = JSON.stringify(input)
  return {
    strategyVersion: input.strategyVersion,
    signalModelVersion: input.signalModelVersion,
    generatedAt: input.generatedAt,
    costModel: { ...input.costModel },
    minimumSamples: input.minimumSamples,
    split: {
      trainingPct: input.trainingPct,
      validationPct: input.validationPct,
      holdoutPct: 100 - input.trainingPct - input.validationPct,
    },
    segments: {
      training: segmentResult('training', groups.training, input.minimumSamples),
      validation: segmentResult('validation', groups.validation, input.minimumSamples),
      holdout: segmentResult('holdout', groups.holdout, input.minimumSamples),
    },
    inputDigest: digest(canonicalInput),
  }
}

export const buildContractBacktestExport = (
  input: ContractStrategyBacktestInput,
  report: ContractStrategyBacktestReport,
) => JSON.stringify({ schemaVersion: 1, input, report }, null, 2)
