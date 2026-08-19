import type {
  AssetPricePoint,
  ContractIndicatorReading,
  ContractMarketSnapshot,
  ContractTimeframeReading,
  ContractTradeAction,
  ContractTradeDecision,
  ContractDecisionReason,
} from '@/types'
import { analyzeTechnicalSignals } from '@/utils/technical-analysis'
import { buildContractStrategyEnsemble } from '@/utils/contract-strategy-ensemble'

type ContractMarketInput = Readonly<Omit<ContractMarketSnapshot, 'points' | 'timeframes'>> & {
  readonly points: readonly AssetPricePoint[]
  readonly timeframes: ReadonlyArray<{
    readonly interval: ContractMarketSnapshot['interval']
    readonly points: readonly AssetPricePoint[]
  }>
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))
const last = <T>(values: readonly T[]) => values[values.length - 1]
const round = (value: number, digits = 2) => Number(value.toFixed(digits))
const priceDigits = (value: number) => (value < 1 ? 6 : value < 100 ? 4 : 2)
const roundPrice = (value: number) => round(value, priceDigits(Math.abs(value)))

const calculateKdj = (points: readonly AssetPricePoint[], period = 9) => {
  let k = 50
  let d = 50
  const readings: Array<{ k: number; d: number; j: number }> = []
  points.forEach((point, index) => {
    if (index + 1 < period) return
    const window = points.slice(index + 1 - period, index + 1)
    const high = Math.max(...window.map((item) => item.high ?? item.close))
    const low = Math.min(...window.map((item) => item.low ?? item.close))
    const rsv = high === low ? 50 : ((point.close - low) / (high - low)) * 100
    k = (2 * k + rsv) / 3
    d = (2 * d + k) / 3
    readings.push({ k, d, j: 3 * k - 2 * d })
  })
  return last(readings) ?? null
}

const signalFromScore = (score: number): ContractIndicatorReading['signal'] =>
  score >= 8 ? 'long' : score <= -8 ? 'short' : 'neutral'

const unique = (items: ContractDecisionReason[]) => [...new Set(items)]
const timeframeWeights: Partial<Record<ContractMarketSnapshot['interval'], number>> = {
  '1m': 0.6,
  '5m': 1,
  '15m': 1.2,
  '1h': 1.5,
  '4h': 1.7,
}

const buildTimeframeReadings = (market: ContractMarketInput): ContractTimeframeReading[] =>
  market.timeframes.map((series) => {
    if (series.points.length < 60) {
      return { interval: series.interval, signal: 'neutral', score: 0, latestPrice: null }
    }
    const analysis = analyzeTechnicalSignals([...series.points])
    const latestPrice = analysis.latest
    const ma20 = last(analysis.ma20) ?? null
    const ma60 = last(analysis.ma60) ?? null
    const macd = last(analysis.macd) ?? null
    const macdSignal = last(analysis.macdSignal) ?? null
    const rsi = last(analysis.rsi14) ?? null
    let score = 0
    if (latestPrice !== null && ma20 !== null && ma60 !== null) {
      if (latestPrice > ma20 && ma20 > ma60) score += 50
      else if (latestPrice < ma20 && ma20 < ma60) score -= 50
      else score += latestPrice >= ma20 ? 20 : -20
    }
    if (macd !== null && macdSignal !== null) score += macd >= macdSignal ? 25 : -25
    if (rsi !== null) {
      if (rsi >= 55 && rsi <= 75) score += 25
      if (rsi <= 45 && rsi >= 25) score -= 25
    }
    score = round(clamp(score, -100, 100))
    return {
      interval: series.interval,
      signal: score >= 20 ? 'long' : score <= -20 ? 'short' : 'neutral',
      score,
      latestPrice: latestPrice === null ? null : roundPrice(latestPrice),
    }
  })

export const buildContractTradeDecision = (market: ContractMarketInput): ContractTradeDecision => {
  const timeframes = buildTimeframeReadings(market)
  if (market.points.length < 80) {
    return {
      action: 'insufficient',
      score: 0,
      confidence: 0,
      latestPrice: market.markPrice,
      expectedMovePct: null,
      entryLow: null,
      entryHigh: null,
      stopLoss: null,
      takeProfit: null,
      riskReward: null,
      invalidation: null,
      reasons: [],
      risks: [],
      indicators: [],
      timeframes,
    }
  }

  const analysis = analyzeTechnicalSignals([...market.points])
  const latest = market.markPrice ?? analysis.latest
  if (latest === null) return buildContractTradeDecision({ ...market, points: [] })

  const latestMa20 = last(analysis.ma20) ?? null
  const latestMa60 = last(analysis.ma60) ?? null
  const latestMacd = last(analysis.macd) ?? null
  const latestMacdSignal = last(analysis.macdSignal) ?? null
  const latestRsi = last(analysis.rsi14) ?? null
  const latestAtr = last(analysis.atr14) ?? null
  const kdj = calculateKdj(market.points)
  const previous = market.points[market.points.length - 2]
  const latestPoint = last(market.points)!
  const volumes = market.points.map((point) => point.volume ?? 0)
  const averageVolume = volumes.slice(-21, -1).reduce((sum, value) => sum + value, 0) / 20
  const volumeRatio = averageVolume ? (latestPoint.volume ?? 0) / averageVolume : null
  const priceDirection = previous ? Math.sign(latestPoint.close - previous.close) : 0
  const atrPct = latestAtr === null ? null : (latestAtr / latest) * 100
  const strategyEnsemble = buildContractStrategyEnsemble(market)

  const reasons: ContractDecisionReason[] = []
  const risks: ContractDecisionReason[] = []
  const indicators: ContractIndicatorReading[] = []
  let score = 0

  let trendScore = 0
  if (latestMa20 !== null && latestMa60 !== null) {
    trendScore =
      latest > latestMa20 && latestMa20 > latestMa60
        ? 25
        : latest < latestMa20 && latestMa20 < latestMa60
          ? -25
          : 0
    if (trendScore > 0) reasons.push('trendBullish')
    if (trendScore < 0) reasons.push('trendBearish')
  }
  score += trendScore
  indicators.push({
    id: 'trend',
    signal: signalFromScore(trendScore),
    score: trendScore,
    value:
      latestMa20 === null || latestMa60 === null
        ? '—'
        : `MA20 ${roundPrice(latestMa20)} · MA60 ${roundPrice(latestMa60)}`,
  })

  const timeframeWeightTotal = timeframes.reduce(
    (sum, reading) => sum + (timeframeWeights[reading.interval] ?? 1),
    0,
  )
  const timeframeConsensus = timeframeWeightTotal
    ? timeframes.reduce(
        (sum, reading) => sum + reading.score * (timeframeWeights[reading.interval] ?? 1),
        0,
      ) / timeframeWeightTotal
    : 0
  const timeframeScore = round(timeframeConsensus * 0.2)
  const bullishTimeframes = timeframes.filter((reading) => reading.signal === 'long').length
  const bearishTimeframes = timeframes.filter((reading) => reading.signal === 'short').length
  score += timeframeScore
  if (timeframeConsensus >= 20) reasons.push('timeframesBullish')
  if (timeframeConsensus <= -20) reasons.push('timeframesBearish')
  if (bullishTimeframes > 0 && bearishTimeframes > 0) risks.push('timeframesConflict')
  indicators.push({
    id: 'timeframes',
    signal: signalFromScore(timeframeScore),
    score: timeframeScore,
    value: timeframes.length
      ? `${bullishTimeframes}↑ · ${bearishTimeframes}↓ · ${timeframeConsensus > 0 ? '+' : ''}${round(timeframeConsensus)}`
      : '—',
  })

  const macdScore =
    latestMacd === null || latestMacdSignal === null ? 0 : latestMacd >= latestMacdSignal ? 16 : -16
  score += macdScore
  if (macdScore > 0) reasons.push('macdBullish')
  if (macdScore < 0) reasons.push('macdBearish')
  indicators.push({
    id: 'macd',
    signal: signalFromScore(macdScore),
    score: macdScore,
    value:
      latestMacd === null || latestMacdSignal === null
        ? '—'
        : `${round(latestMacd, 4)} / ${round(latestMacdSignal, 4)}`,
  })

  let kdjScore = 0
  if (kdj) {
    if (kdj.k > kdj.d && kdj.j < 90) kdjScore = kdj.j < 25 ? 18 : 12
    if (kdj.k < kdj.d && kdj.j > 10) kdjScore = kdj.j > 75 ? -18 : -12
  }
  score += kdjScore
  if (kdjScore > 0) reasons.push('kdjBullish')
  if (kdjScore < 0) reasons.push('kdjBearish')
  indicators.push({
    id: 'kdj',
    signal: signalFromScore(kdjScore),
    score: kdjScore,
    value: kdj ? `K ${round(kdj.k, 1)} · D ${round(kdj.d, 1)} · J ${round(kdj.j, 1)}` : '—',
  })

  const rsiScore =
    latestRsi === null
      ? 0
      : latestRsi >= 52 && latestRsi <= 72
        ? 12
        : latestRsi <= 48 && latestRsi >= 28
          ? -12
          : 0
  score += rsiScore
  if (rsiScore > 0) reasons.push('rsiBullish')
  if (rsiScore < 0) reasons.push('rsiBearish')
  indicators.push({
    id: 'rsi',
    signal: signalFromScore(rsiScore),
    score: rsiScore,
    value: latestRsi === null ? '—' : round(latestRsi, 1).toString(),
  })

  let volumeScore = 0
  if (volumeRatio !== null && volumeRatio >= 1.15)
    volumeScore = priceDirection > 0 ? 12 : priceDirection < 0 ? -12 : 0
  score += volumeScore
  if (volumeScore > 0) reasons.push('volumeBullish')
  if (volumeScore < 0) reasons.push('volumeBearish')
  if (volumeRatio === null || volumeRatio < 0.85) risks.push('unconfirmedVolume')
  indicators.push({
    id: 'volume',
    signal: signalFromScore(volumeScore),
    score: volumeScore,
    value: volumeRatio === null ? '—' : `${round(volumeRatio, 2)}x`,
  })

  const funding = market.fundingRatePct
  let fundingScore = 0
  if (funding !== null && funding >= 0.05) {
    fundingScore = -8
    risks.push('fundingCrowdedLong')
  }
  if (funding !== null && funding <= -0.05) {
    fundingScore = 8
    risks.push('fundingCrowdedShort')
  }
  score += fundingScore
  indicators.push({
    id: 'funding',
    signal: fundingScore === 0 ? 'neutral' : 'risk',
    score: fundingScore,
    value: funding === null ? '—' : `${round(funding, 4)}%`,
  })

  const orderBookImbalance = market.microstructure.orderBookImbalancePct
  const spreadBps = market.microstructure.spreadBps
  const orderBookScore =
    orderBookImbalance === null
      ? 0
      : orderBookImbalance >= 8
        ? 8
        : orderBookImbalance <= -8
          ? -8
          : 0
  score += orderBookScore
  if (orderBookScore > 0) reasons.push('orderBookBidDominant')
  if (orderBookScore < 0) reasons.push('orderBookAskDominant')
  if (spreadBps !== null && spreadBps >= 3) risks.push('spreadWide')
  indicators.push({
    id: 'orderBook',
    signal: spreadBps !== null && spreadBps >= 3 ? 'risk' : signalFromScore(orderBookScore),
    score: orderBookScore,
    value:
      orderBookImbalance === null
        ? '—'
        : `${orderBookImbalance > 0 ? '+' : ''}${round(orderBookImbalance, 1)}% · ${spreadBps === null ? '—' : `${round(spreadBps, 2)}bp`}`,
  })

  const takerBuyRatio = market.microstructure.takerBuyRatioPct
  const takerFlowScore =
    takerBuyRatio === null ? 0 : takerBuyRatio >= 53 ? 8 : takerBuyRatio <= 47 ? -8 : 0
  score += takerFlowScore
  if (takerFlowScore > 0) reasons.push('takerBuyDominant')
  if (takerFlowScore < 0) reasons.push('takerSellDominant')
  indicators.push({
    id: 'takerFlow',
    signal: signalFromScore(takerFlowScore),
    score: takerFlowScore,
    value: takerBuyRatio === null ? '—' : `${round(takerBuyRatio, 1)}%`,
  })

  const openInterestChange = market.microstructure.openInterestChangePct
  const structureLookback = market.points[Math.max(0, market.points.length - 21)]
  const structurePriceDirection = structureLookback
    ? Math.sign(latestPoint.close - structureLookback.close)
    : 0
  let openInterestScore = 0
  if (openInterestChange !== null && openInterestChange >= 0.2 && structurePriceDirection !== 0) {
    openInterestScore = structurePriceDirection > 0 ? 6 : -6
    reasons.push(structurePriceDirection > 0 ? 'openInterestBullish' : 'openInterestBearish')
  }
  if (openInterestChange !== null && openInterestChange <= -0.2) risks.push('openInterestFalling')
  score += openInterestScore
  indicators.push({
    id: 'openInterest',
    signal:
      openInterestChange !== null && openInterestChange <= -0.2
        ? 'risk'
        : signalFromScore(openInterestScore),
    score: openInterestScore,
    value:
      openInterestChange === null
        ? '—'
        : `${openInterestChange > 0 ? '+' : ''}${round(openInterestChange, 2)}%`,
  })

  if (
    orderBookScore !== 0 &&
    takerFlowScore !== 0 &&
    Math.sign(orderBookScore) !== Math.sign(takerFlowScore)
  )
    risks.push('microstructureConflict')

  if (atrPct !== null && atrPct < 0.08) risks.push('lowVolatility')
  indicators.push({
    id: 'atr',
    signal: atrPct !== null && atrPct < 0.08 ? 'risk' : 'neutral',
    score: 0,
    value: atrPct === null ? '—' : `${round(atrPct, 3)}%`,
  })

  if (Math.sign(trendScore) !== Math.sign(rsiScore) && trendScore !== 0 && rsiScore !== 0)
    risks.push('signalsConflict')

  indicators.push({
    id: 'strategyEnsemble',
    signal: signalFromScore(strategyEnsemble.score),
    score: round(strategyEnsemble.score * 0.35),
    value: `${strategyEnsemble.version} · ${strategyEnsemble.regime} · ${strategyEnsemble.confidence}%`,
  })

  score = round(clamp(score * 0.65 + strategyEnsemble.score * 0.35, -100, 100))
  const absoluteScore = Math.abs(score)
  let action: ContractTradeAction =
    score >= 38 ? 'long' : score <= -38 ? 'short' : absoluteScore < 16 ? 'noTrade' : 'wait'
  if (risks.includes('signalsConflict') || risks.includes('lowVolatility')) {
    if (action === 'long' || action === 'short') action = 'wait'
  }
  if (action === 'long' || action === 'short') {
    const decisionDirection = action === 'long' ? 1 : -1
    if (
      (timeframes.length >= 3 &&
        (Math.abs(timeframeConsensus) < 20 ||
          Math.sign(timeframeConsensus) !== decisionDirection)) ||
      risks.includes('timeframesConflict') ||
      risks.includes('microstructureConflict') ||
      risks.includes('spreadWide')
    )
      action = 'wait'
  }
  const availableIndicators = indicators.filter((item) => item.value !== '—').length
  const directionalIndicators = indicators.filter(
    (item) => item.signal === 'long' || item.signal === 'short',
  )
  const agreement = directionalIndicators.length
    ? directionalIndicators.filter((item) =>
        score >= 0 ? item.signal === 'long' : item.signal === 'short',
      ).length / directionalIndicators.length
    : 0
  const conflictPenalty =
    ['signalsConflict', 'timeframesConflict', 'microstructureConflict'].filter((risk) =>
      risks.includes(risk as ContractDecisionReason),
    ).length *
      10 +
    (risks.includes('spreadWide') ? 5 : 0)
  const confidence = Math.round(
    clamp(
      30 + absoluteScore * 0.45 + agreement * 25 + availableIndicators * 2 - conflictPenalty,
      0,
      88,
    ),
  )
  const expectedMovePct = atrPct === null ? null : round(atrPct * Math.sqrt(3), 3)
  const isDirectional = action === 'long' || action === 'short'
  const direction = action === 'long' ? 1 : -1
  const entryLow = isDirectional && latestAtr !== null ? latest - latestAtr * 0.15 : null
  const entryHigh = isDirectional && latestAtr !== null ? latest + latestAtr * 0.1 : null
  const stopLoss =
    isDirectional && latestAtr !== null ? latest - direction * latestAtr * 1.25 : null
  const takeProfit = isDirectional && latestAtr !== null ? latest + direction * latestAtr * 2 : null
  const entryMid = entryLow !== null && entryHigh !== null ? (entryLow + entryHigh) / 2 : null
  const riskReward =
    entryMid !== null && stopLoss !== null && takeProfit !== null
      ? Math.abs((takeProfit - entryMid) / (entryMid - stopLoss))
      : null

  return {
    action,
    score,
    confidence,
    latestPrice: roundPrice(latest),
    expectedMovePct,
    entryLow: entryLow === null ? null : roundPrice(Math.min(entryLow, entryHigh!)),
    entryHigh: entryHigh === null ? null : roundPrice(Math.max(entryLow!, entryHigh)),
    stopLoss: stopLoss === null ? null : roundPrice(stopLoss),
    takeProfit: takeProfit === null ? null : roundPrice(takeProfit),
    riskReward: riskReward === null ? null : round(riskReward, 2),
    invalidation: stopLoss === null ? null : roundPrice(stopLoss),
    reasons: unique(reasons),
    risks: unique(risks),
    indicators,
    timeframes,
  }
}
