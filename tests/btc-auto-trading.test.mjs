import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const {
  btcAutoStrategyVersion,
  btcAutoSignalModelVersion,
  btcAutoEvidencePolicyVersion,
  isBtcAutoFeeAdjustedSignalWin,
  btcAutoStrategyDefinition,
  btcAutoLegacyStrategyVersionFromDefinition,
  buildBtcAutoOrderParameters,
  buildBtcAutoTestnetCommissionUpdates,
  btcAutoStrategyVersionFromDefinition,
  btcAutoMonthStartAt,
  btcAutoPerformanceQueryStartAt,
  buildBtcAutoEquityCurve,
  calculateBtcAutoDirectionalMove,
  calculateBtcAutoShadowPathOutcome,
  calculateBtcAutoRollingHealth,
  calculateBtcAutoReconciledResult,
  calculateBtcAutoTradeResult,
  evaluateBtcAutoEntryGate,
  evaluateBtcAutoConsensusStudy,
  evaluateBtcAutoScoreThresholdStudy,
  evaluateBtcAutoStrategyComparison,
  evolveBtcAutoSignal,
  isBtcAutoStrategyDefinition,
  isBtcAutoLegacyStrategyDefinition,
  nextBtcAutoScheduledRunAt,
  resolveBtcAutoCloseTrigger,
  selectBtcAutoOutcomePoint,
  summarizeBtcAutoPerformance,
  validateBtcAutoMarketFreshness,
} = jiti('../src/utils/btc-auto-trading.ts')
const { buildBtcAutoTradingCsv } = jiti('../src/utils/btc-auto-trading-export.ts')
const { buildContractStrategyEnsemble } = jiti('../src/utils/contract-strategy-ensemble.ts')
const { blendContractStrategyScores } = jiti('../src/utils/contract-strategy-weight.ts')
const { evaluateContractTradePath } = jiti('../src/utils/contract-trade-path.ts')

const config = (overrides = {}) => ({
  enabled: true,
  executionMode: 'paper',
  riskControlsEnabled: true,
  hedgeModeEnabled: false,
  maxPositionsPerDirection: 1,
  symbol: 'BTCUSDT',
  interval: '5m',
  notionalUsdt: 100,
  leverage: 2,
  minimumConfidence: 65,
  minimumDirectionalScore: 55,
  requiredConfirmations: 2,
  cooldownMinutes: 30,
  dailyLossLimitUsdt: 10,
  maxConsecutiveLosses: 3,
  lossPauseMinutes: 360,
  performanceWindowTrades: 20,
  minimumRollingProfitFactor: 0.8,
  maximumRollingDrawdownUsdt: 3,
  performancePauseMinutes: 1440,
  maximumHoldingMinutes: 60,
  feeRatePct: 0.05,
  eligibilityConfirmed: false,
  updatedAt: '2026-08-19T00:00:00.000Z',
  ...overrides,
})

const signal = (overrides = {}) => ({
  strategyVersion: 'btc-auto-v4-test',
  action: 'long',
  score: 70,
  confidence: 80,
  price: 100,
  evolution: 'unchanged',
  confirmations: 2,
  reasons: [],
  risks: [],
  observedAt: '2026-08-19T15:35:00.000Z',
  marketSource: 'binance',
  ...overrides,
})

const point = (date, open, overrides = {}) => ({
  date,
  open,
  high: open,
  low: open,
  close: open,
  volume: 1,
  ...overrides,
})

const passingTemporalValidation = (overrides = {}) => ({
  baselineSamples: 24,
  candidateSamples: 18,
  baselineHitRatePct: 50,
  candidateHitRatePct: 60,
  baselineAverageMovePct: 0.2,
  candidateAverageMovePct: 0.32,
  ...overrides,
})

const trade = (overrides = {}) => ({
  id: 'trade-1',
  strategyVersion: 'btc-auto-v4-test',
  performanceCohortVersion: null,
  executionMode: 'paper',
  symbol: 'BTCUSDT',
  direction: 'long',
  status: 'open',
  quantity: 0.01,
  notionalUsdt: 100,
  leverage: 2,
  entryPrice: 100,
  exitPrice: null,
  stopLoss: 95,
  takeProfit: 110,
  openedAt: '2026-08-19T15:30:12.000Z',
  closedAt: null,
  grossPnl: null,
  feeRatePct: 0.05,
  fees: null,
  fundingFee: 0,
  netPnl: null,
  returnPct: null,
  pnlSource: 'estimated',
  reconciledAt: null,
  reconciliationError: null,
  signalScore: 70,
  signalConfidence: 80,
  signalReasons: [],
  closeReason: null,
  openOrderId: null,
  closeOrderId: null,
  error: null,
  ...overrides,
})

const closedTrade = (id, closedAt, netPnl, overrides = {}) =>
  trade({
    id,
    status: 'closed',
    closedAt,
    netPnl,
    grossPnl: netPnl,
    exitPrice: 100,
    closeReason: 'manual',
    ...overrides,
  })

const rollingTrades = () =>
  Array.from({ length: 20 }, (_, index) =>
    closedTrade(
      `rolling-${index}`,
      new Date(Date.UTC(2026, 7, 19, 0, index)).toISOString(),
      index % 2 === 0 ? 0.6 : -1,
    ),
  )

const market = (overrides = {}) => ({
  symbol: 'BTCUSDT',
  quoteAsset: 'USDT',
  interval: '5m',
  points: [],
  timeframes: [
    {
      interval: '1m',
      points: [{ date: '2026-08-19T15:58:00.000Z', close: 100 }],
    },
    {
      interval: '5m',
      points: [{ date: '2026-08-19T15:55:00.000Z', close: 100 }],
    },
  ],
  microstructure: {
    orderBookImbalancePct: null,
    spreadBps: null,
    takerBuyRatioPct: null,
    openInterestChangePct: null,
  },
  markPrice: 100,
  fundingRatePct: null,
  nextFundingTime: null,
  openInterest: null,
  updatedAt: '2026-08-19T16:00:00.000Z',
  latencyMs: null,
  status: 'live',
  errorCode: null,
  ...overrides,
})

const ensembleMarket = (points, microstructure = {}) => ({
  points,
  microstructure: {
    orderBookImbalancePct: null,
    spreadBps: null,
    takerBuyRatioPct: null,
    openInterestChangePct: null,
    ...microstructure,
  },
})

const gate = (overrides = {}) =>
  evaluateBtcAutoEntryGate({
    config: config(),
    signal: signal(),
    trades: [],
    hasActivePosition: false,
    cooldownUntil: null,
    dailyNetPnl: 0,
    now: new Date('2026-08-19T01:00:00.000Z'),
    ...overrides,
  })

test('signal evolution counts same-direction confirmations and detects changes', () => {
  const previous = signal({ score: 60, confidence: 70, confirmations: 2 })
  const strengthened = evolveBtcAutoSignal(
    previous,
    { action: 'long', score: 68, confidence: 74, latestPrice: 101, reasons: [], risks: [] },
    '2026-08-19T15:40:00.000Z',
    'binance',
    'btc-auto-v4-test',
  )
  assert.equal(strengthened.confirmations, 3)
  assert.equal(strengthened.evolution, 'strengthened')

  const falsified = evolveBtcAutoSignal(
    strengthened,
    { action: 'short', score: -70, confidence: 80, latestPrice: 99, reasons: [], risks: [] },
    '2026-08-19T15:45:00.000Z',
    'binance',
    'btc-auto-v4-test',
  )
  assert.equal(falsified.confirmations, 1)
  assert.equal(falsified.evolution, 'falsified')
})

test('strategy fingerprint changes only when execution behavior changes', () => {
  const baseline = btcAutoStrategyVersion(config())
  assert.equal(
    btcAutoStrategyVersion(config({ enabled: false, updatedAt: '2027-01-01T00:00:00.000Z' })),
    baseline,
  )
  assert.notEqual(btcAutoStrategyVersion(config({ minimumDirectionalScore: 56 })), baseline)
  assert.deepEqual(Object.keys(btcAutoStrategyDefinition(config())).sort(), [
    'cooldownMinutes',
    'dailyLossLimitUsdt',
    'executionMode',
    'feeRatePct',
    'hedgeModeEnabled',
    'interval',
    'leverage',
    'lossPauseMinutes',
    'maxConsecutiveLosses',
    'maxPositionsPerDirection',
    'maximumHoldingMinutes',
    'maximumRollingDrawdownUsdt',
    'minimumConfidence',
    'minimumDirectionalScore',
    'minimumRollingProfitFactor',
    'notionalUsdt',
    'performancePauseMinutes',
    'performanceWindowTrades',
    'requiredConfirmations',
    'riskControlsEnabled',
    'symbol',
  ])
  const definition = btcAutoStrategyDefinition(config())
  assert.equal(btcAutoStrategyVersionFromDefinition(definition), baseline)
  assert.equal(isBtcAutoStrategyDefinition(definition), true)
  assert.equal(isBtcAutoStrategyDefinition({ ...definition, unexpected: true }), false)
  assert.equal(isBtcAutoStrategyDefinition({ ...definition, feeRatePct: '0.05' }), false)
  const legacy = { ...definition }
  delete legacy.riskControlsEnabled
  delete legacy.hedgeModeEnabled
  delete legacy.maxPositionsPerDirection
  assert.equal(isBtcAutoLegacyStrategyDefinition(legacy), true)
  assert.equal(btcAutoLegacyStrategyVersionFromDefinition(legacy).startsWith('btc-auto-v4-'), true)
})

test('signal model cohort remains stable across execution configuration changes', () => {
  assert.equal(btcAutoSignalModelVersion, 'btc-signal-model-v2')
  assert.equal(btcAutoEvidencePolicyVersion, 'btc-evidence-v9-path-realized')
  assert.notEqual(
    btcAutoStrategyVersion(config()),
    btcAutoStrategyVersion(config({ minimumDirectionalScore: 70 })),
  )
})

test('fee-adjusted signal wins must clear the estimated round-trip cost', () => {
  assert.equal(isBtcAutoFeeAdjustedSignalWin(0.1, 0.05), false)
  assert.equal(isBtcAutoFeeAdjustedSignalWin(0.1001, 0.05), true)
  assert.equal(isBtcAutoFeeAdjustedSignalWin(-0.2, 0.05), false)
})

test('market freshness rejects stale or incomplete minute data', () => {
  const now = new Date('2026-08-19T16:00:30.000Z')
  assert.equal(validateBtcAutoMarketFreshness(market(), now), null)
  assert.equal(
    validateBtcAutoMarketFreshness(
      market({
        timeframes: [
          { interval: '1m', points: [{ date: '2026-08-19T15:50:00.000Z', close: 100 }] },
          { interval: '5m', points: [{ date: '2026-08-19T15:55:00.000Z', close: 100 }] },
        ],
      }),
      now,
    ),
    '1m行情已过期',
  )
  assert.equal(validateBtcAutoMarketFreshness(market({ markPrice: null }), now), 'BTC标记价不可用')
  assert.equal(
    validateBtcAutoMarketFreshness(
      market({
        timeframes: [
          { interval: '1m', points: [{ date: '2026-08-19T15:58:00.000Z', close: 100 }] },
          { interval: '5m', points: [{ date: '2026-08-19T15:40:00.000Z', close: 100 }] },
        ],
      }),
      now,
    ),
    '5m行情已过期',
  )
  assert.equal(
    validateBtcAutoMarketFreshness(
      market({
        timeframes: [
          { interval: '1m', points: [{ date: '2026-08-19T16:01:00.000Z', close: 100 }] },
          { interval: '5m', points: [{ date: '2026-08-19T15:55:00.000Z', close: 100 }] },
        ],
      }),
      now,
    ),
    '1m行情时间异常',
  )
  const delayedCoinbase = market({
    timeframes: [
      { interval: '1m', points: [{ date: '2026-08-19T15:55:00.000Z', close: 100 }] },
      { interval: '5m', points: [{ date: '2026-08-19T15:55:00.000Z', close: 100 }] },
    ],
  })
  assert.equal(validateBtcAutoMarketFreshness(delayedCoinbase, now), '1m行情已过期')
  assert.equal(validateBtcAutoMarketFreshness(delayedCoinbase, now, 'coinbase'), null)
})

test('next scheduled run advances to the next five-minute UTC boundary', () => {
  assert.equal(
    nextBtcAutoScheduledRunAt(new Date('2026-08-19T16:40:00.000Z')),
    '2026-08-19T16:45:00.000Z',
  )
  assert.equal(
    nextBtcAutoScheduledRunAt(new Date('2026-08-19T16:44:59.999Z')),
    '2026-08-19T16:45:00.000Z',
  )
})

test('hedge orders use positionSide while one-way closes use reduceOnly', () => {
  const hedgeClose = buildBtcAutoOrderParameters({
    kind: 'close',
    direction: 'short',
    quantity: 0.01,
    clientOrderId: 'hedge-close',
    hedgeMode: true,
  })
  assert.equal(hedgeClose.side, 'BUY')
  assert.equal(hedgeClose.positionSide, 'SHORT')
  assert.equal('reduceOnly' in hedgeClose, false)

  const oneWayClose = buildBtcAutoOrderParameters({
    kind: 'close',
    direction: 'long',
    quantity: 0.01,
    clientOrderId: 'one-way-close',
    hedgeMode: false,
  })
  assert.equal(oneWayClose.side, 'SELL')
  assert.equal(oneWayClose.reduceOnly, 'true')
  assert.equal('positionSide' in oneWayClose, false)
})

test('regime ensemble favors momentum and breakout in a persistent trend', () => {
  const points = Array.from({ length: 120 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 7, 19, 0, index)).toISOString(),
    open: 100 + index * 0.2,
    high: 100.3 + index * 0.2,
    low: 99.9 + index * 0.2,
    close: 100.2 + index * 0.2,
    volume: 10,
  }))
  const result = buildContractStrategyEnsemble(ensembleMarket(points))
  assert.equal(result.version, 'regime-ensemble-v1')
  assert.equal(result.regime, 'trending')
  assert.ok(result.score > 20)
  assert.equal(
    result.contributions.reduce((sum, item) => sum + item.weight, 0),
    1,
  )
})

test('regime ensemble applies mean reversion in a range without lookahead breakout', () => {
  const points = Array.from({ length: 120 }, (_, index) => {
    const close = 100 + Math.sin(index / 3) * 2
    return {
      date: new Date(Date.UTC(2026, 7, 19, 0, index)).toISOString(),
      open: close,
      high: close + 0.2,
      low: close - 0.2,
      close,
      volume: 10,
    }
  })
  points[points.length - 1].close = 96.5
  points[points.length - 1].open = 96.5
  points[points.length - 1].high = 96.7
  points[points.length - 1].low = 96.3
  const result = buildContractStrategyEnsemble(ensembleMarket(points))
  const meanReversion = result.contributions.find((item) => item.id === 'meanReversion')
  assert.ok((meanReversion?.rawScore ?? 0) > 0)
  assert.ok(result.contributions.every((item) => Number.isFinite(item.weightedScore)))
})

test('strategy comparison waits for samples and requires hit-rate plus net-move advantage', () => {
  const base = {
    baselineHitRatePct: 50,
    baselineAverageMovePct: 0.15,
    ensembleHitRatePct: 54,
    ensembleAverageMovePct: 0.18,
    feeRatePct: 0.05,
  }
  assert.equal(
    evaluateBtcAutoStrategyComparison({
      ...base,
      pairedSamples: 47,
      baselineOnlyWins: 9,
      ensembleOnlyWins: 11,
      baselineSamples: 47,
      ensembleSamples: 47,
    }).recommendedEnsembleWeightPct,
    0,
  )
  const noisyLead = evaluateBtcAutoStrategyComparison({
    ...base,
    pairedSamples: 48,
    baselineOnlyWins: 10,
    ensembleOnlyWins: 12,
    baselineSamples: 48,
    ensembleSamples: 48,
  })
  assert.equal(noisyLead.verdict, 'mixed')
  assert.ok(noisyLead.hitRateAdvantageLowerBoundPct < 0)
  const ahead = evaluateBtcAutoStrategyComparison({
    ...base,
    pairedSamples: 1000,
    baselineOnlyWins: 80,
    ensembleOnlyWins: 120,
    baselineSamples: 1000,
    ensembleSamples: 1000,
    temporalValidation: passingTemporalValidation(),
  })
  assert.equal(ahead.verdict, 'outperforming')
  assert.equal(ahead.confidenceLevelPct, 98)
  assert.equal(ahead.maximumSamples, 96)
  assert.equal(ahead.hitRateAdvantagePct, 4)
  assert.ok(ahead.hitRateAdvantageLowerBoundPct > 0)
  assert.equal(ahead.ensembleAverageNetMovePct, 0.08)
  assert.equal(ahead.recommendedEnsembleWeightPct, 35)
  assert.equal(ahead.temporalValidation.passed, true)
  assert.equal(ahead.temporalValidation.maximumSamples, 24)
  assert.equal(
    evaluateBtcAutoStrategyComparison({
      ...base,
      pairedSamples: 1000,
      baselineOnlyWins: 80,
      ensembleOnlyWins: 120,
      baselineSamples: 1000,
      ensembleSamples: 1000,
      temporalValidation: passingTemporalValidation({ candidateAverageMovePct: 0.15 }),
    }).recommendedEnsembleWeightPct,
    0,
  )
  assert.equal(
    evaluateBtcAutoStrategyComparison({
      ...base,
      pairedSamples: 1000,
      baselineOnlyWins: 80,
      ensembleOnlyWins: 120,
      baselineSamples: 1000,
      ensembleSamples: 1000,
      temporalValidation: passingTemporalValidation(),
      baselineAverageMovePct: -0.1,
      ensembleAverageMovePct: 0.05,
    }).recommendedEnsembleWeightPct,
    0,
  )
  assert.equal(
    evaluateBtcAutoStrategyComparison({
      ...base,
      pairedSamples: 1000,
      baselineOnlyWins: 80,
      ensembleOnlyWins: 120,
      baselineSamples: 1000,
      ensembleSamples: 1000,
      temporalValidation: passingTemporalValidation(),
      ensembleAverageMovePct: 0.12,
    }).recommendedEnsembleWeightPct,
    0,
  )
  assert.equal(
    evaluateBtcAutoStrategyComparison({
      ...base,
      pairedSamples: 1000,
      baselineOnlyWins: 120,
      ensembleOnlyWins: 70,
      baselineSamples: 1000,
      ensembleSamples: 1000,
      temporalValidation: passingTemporalValidation(),
      ensembleHitRatePct: 45,
      ensembleAverageMovePct: 0.1,
    }).verdict,
    'underperforming',
  )
})

test('unproven ensemble stays shadow-only and promoted weight is capped', () => {
  assert.deepEqual(blendContractStrategyScores(60, -60, 0), {
    score: 60,
    ensembleWeight: 0,
  })
  assert.deepEqual(blendContractStrategyScores(60, -60, 0.35), {
    score: 18,
    ensembleWeight: 0.35,
  })
  assert.deepEqual(blendContractStrategyScores(60, -60, 1), {
    score: 18,
    ensembleWeight: 0.35,
  })
})

test('score threshold study waits for coverage and requires precision plus net improvement', () => {
  const collecting = evaluateBtcAutoScoreThresholdStudy({
    currentThreshold: 55,
    candidateThreshold: 70,
    currentSamples: 40,
    candidateSamples: 20,
    currentHitRatePct: 50,
    candidateHitRatePct: 65,
    currentAverageMovePct: 0.2,
    candidateAverageMovePct: 0.3,
    feeRatePct: 0.05,
  })
  assert.equal(collecting.verdict, 'collecting')
  assert.equal(collecting.candidateCoveragePct, 50)

  const noisyLead = evaluateBtcAutoScoreThresholdStudy({
    currentThreshold: 55,
    candidateThreshold: 70,
    currentSamples: 100,
    candidateSamples: 40,
    currentHitRatePct: 50,
    candidateHitRatePct: 58,
    currentAverageMovePct: 0.2,
    candidateAverageMovePct: 0.32,
    feeRatePct: 0.05,
  })
  assert.notEqual(noisyLead.verdict, 'raise')
  assert.ok(noisyLead.hitRateLiftLowerBoundPct < 0)

  const raise = evaluateBtcAutoScoreThresholdStudy({
    currentThreshold: 55,
    candidateThreshold: 70,
    currentSamples: 1000,
    candidateSamples: 400,
    currentHitRatePct: 50,
    candidateHitRatePct: 60,
    currentAverageMovePct: 0.2,
    candidateAverageMovePct: 0.32,
    feeRatePct: 0.05,
    temporalValidation: passingTemporalValidation(),
  })
  assert.equal(raise.verdict, 'raise')
  assert.equal(raise.hitRateLiftPct, 10)
  assert.equal(raise.confidenceLevelPct, 98)
  assert.ok(raise.hitRateLiftLowerBoundPct > 0)
  assert.equal(raise.candidateAverageNetMovePct, 0.22)
  assert.equal(raise.temporalValidation.passed, true)

  assert.notEqual(
    evaluateBtcAutoScoreThresholdStudy({
      ...raise,
      temporalValidation: passingTemporalValidation({ candidateHitRatePct: 45 }),
      feeRatePct: 0.05,
    }).verdict,
    'raise',
  )

  assert.notEqual(
    evaluateBtcAutoScoreThresholdStudy({
      ...raise,
      currentAverageMovePct: -0.1,
      candidateAverageMovePct: 0.05,
      feeRatePct: 0.05,
    }).verdict,
    'raise',
  )

  assert.equal(
    evaluateBtcAutoScoreThresholdStudy({
      ...raise,
      currentAverageMovePct: 0.2,
      candidateAverageMovePct: 0.18,
      feeRatePct: 0.05,
    }).verdict,
    'keep',
  )
})

test('consensus filter promotes only with enough precision, net improvement and coverage', () => {
  const collecting = evaluateBtcAutoConsensusStudy({
    baselineSamples: 100,
    consensusSamples: 29,
    baselineHitRatePct: 48,
    consensusHitRatePct: 60,
    baselineAverageMovePct: 0.16,
    consensusAverageMovePct: 0.3,
    feeRatePct: 0.05,
  })
  assert.equal(collecting.verdict, 'collecting')
  assert.equal(collecting.consensusRequired, false)

  const noisyLead = evaluateBtcAutoConsensusStudy({
    baselineSamples: 100,
    consensusSamples: 40,
    baselineHitRatePct: 48,
    consensusHitRatePct: 56,
    baselineAverageMovePct: 0.16,
    consensusAverageMovePct: 0.3,
    feeRatePct: 0.05,
  })
  assert.equal(noisyLead.consensusRequired, false)
  assert.ok(noisyLead.hitRateLiftLowerBoundPct < 0)

  const promoted = evaluateBtcAutoConsensusStudy({
    baselineSamples: 1000,
    consensusSamples: 400,
    baselineHitRatePct: 48,
    consensusHitRatePct: 58,
    baselineAverageMovePct: 0.16,
    consensusAverageMovePct: 0.3,
    feeRatePct: 0.05,
    temporalValidation: passingTemporalValidation({ baselineHitRatePct: 48 }),
  })
  assert.equal(promoted.verdict, 'promote')
  assert.equal(promoted.confidenceLevelPct, 98)
  assert.equal(promoted.consensusCoveragePct, 40)
  assert.ok(promoted.hitRateLiftLowerBoundPct > 0)
  assert.equal(promoted.consensusAverageNetMovePct, 0.2)
  assert.equal(promoted.consensusRequired, true)
  assert.equal(promoted.temporalValidation.passed, true)
  assert.equal(
    evaluateBtcAutoConsensusStudy({
      ...promoted,
      baselineAverageMovePct: -0.1,
      consensusAverageMovePct: 0.05,
      feeRatePct: 0.05,
    }).consensusRequired,
    false,
  )
})

test('shadow signal outcomes measure directional price movement without trading costs', () => {
  assert.equal(calculateBtcAutoDirectionalMove('long', 100, 103), 3)
  assert.equal(calculateBtcAutoDirectionalMove('short', 100, 97), 3)
  assert.equal(calculateBtcAutoDirectionalMove('short', 100, 103), -3)
  assert.equal(calculateBtcAutoDirectionalMove('wait', 100, 103), null)
  assert.equal(calculateBtcAutoDirectionalMove('long', 0, 103), null)
})

test('shadow path outcome follows minute barriers with conservative stop-first fills', () => {
  const base = {
    action: 'long',
    entryPrice: 100,
    stopDistancePct: 1,
    targetDistancePct: 2,
    observedAt: '2026-08-19T00:00:30.000Z',
    targetAt: Date.parse('2026-08-19T01:00:30.000Z'),
    endpointPrice: 103,
  }
  const stopped = calculateBtcAutoShadowPathOutcome({
    ...base,
    minutePoints: [
      point('2026-08-19T00:00:00.000Z', 100, { high: 103, low: 98 }),
      point('2026-08-19T00:01:00.000Z', 100, { high: 103, low: 98 }),
    ],
  })
  assert.deepEqual(stopped, { grossMovePct: -1, exitPrice: 99, reason: 'stopLoss' })

  const gapStop = calculateBtcAutoShadowPathOutcome({
    ...base,
    minutePoints: [point('2026-08-19T00:01:00.000Z', 98, { high: 99, low: 97 })],
  })
  assert.deepEqual(gapStop, { grossMovePct: -2, exitPrice: 98, reason: 'stopLoss' })

  const target = calculateBtcAutoShadowPathOutcome({
    ...base,
    minutePoints: [point('2026-08-19T00:01:00.000Z', 100, { high: 102.5, low: 99.5 })],
  })
  assert.deepEqual(target, { grossMovePct: 2, exitPrice: 102, reason: 'takeProfit' })

  const timeStop = calculateBtcAutoShadowPathOutcome({ ...base, minutePoints: [] })
  assert.deepEqual(timeStop, { grossMovePct: 3, exitPrice: 103, reason: 'timeStop' })
})

test('shadow outcome selection uses the first complete candle after the target without lookahead', () => {
  const outcomeMarket = market({
    timeframes: [
      {
        interval: '5m',
        points: [
          { date: '2026-08-19T15:05:00.000Z', close: 101 },
          { date: '2026-08-19T15:00:00.000Z', close: 100 },
          { date: '2026-08-19T15:10:00.000Z', close: 102 },
        ],
      },
    ],
  })
  assert.deepEqual(
    selectBtcAutoOutcomePoint(
      outcomeMarket,
      Date.parse('2026-08-19T15:04:00.000Z'),
      ['5m'],
      Date.parse('2026-08-19T15:20:00.000Z'),
    ),
    { price: 100, observedAt: '2026-08-19T15:05:00.000Z' },
  )
  assert.equal(
    selectBtcAutoOutcomePoint(
      outcomeMarket,
      Date.parse('2026-08-19T14:30:00.000Z'),
      ['5m'],
      Date.parse('2026-08-19T15:20:00.000Z'),
    ),
    null,
  )
})

test('a new strategy version resets signal confirmation history', () => {
  const evolved = evolveBtcAutoSignal(
    signal({ confirmations: 5 }),
    { action: 'long', score: 75, confidence: 84, latestPrice: 102, reasons: [], risks: [] },
    '2026-08-19T15:40:00.000Z',
    'binance',
    'btc-auto-v4-new',
  )
  assert.equal(evolved.strategyVersion, 'btc-auto-v4-new')
  assert.equal(evolved.confirmations, 1)
  assert.equal(evolved.evolution, 'new')
})

test('entry gate enforces high-priority safety stops before signal checks', () => {
  assert.equal(gate({ config: config({ enabled: false }) }).reason, 'disabled')
  assert.equal(gate({ hasActivePosition: true }).reason, 'positionOpen')
  assert.equal(gate({ dailyNetPnl: -10 }).reason, 'dailyLossLimit')

  const losses = [
    closedTrade('l1', '2026-08-19T00:10:00.000Z', -1),
    closedTrade('l2', '2026-08-19T00:20:00.000Z', -1),
    closedTrade('l3', '2026-08-19T00:30:00.000Z', -1),
  ]
  assert.equal(gate({ trades: losses }).reason, 'consecutiveLossPause')

  const degraded = rollingTrades()
  assert.equal(gate({ trades: degraded }).reason, 'rollingPerformancePause')
  assert.equal(gate({ cooldownUntil: '2026-08-19T02:00:00.000Z' }).reason, 'cooldown')
})

test('entry gate requires direction, score, confidence and confirmations in order', () => {
  assert.equal(gate({ signal: signal({ action: 'wait' }) }).reason, 'waitingDirection')
  assert.equal(gate({ signal: signal({ score: 54 }) }).reason, 'weakScore')
  assert.equal(gate({ signal: signal({ confidence: 64 }) }).reason, 'lowConfidence')
  assert.equal(gate({ signal: signal({ confirmations: 1 }) }).reason, 'confirming')
  assert.equal(gate({ consensusEligible: false }).reason, 'strategyConsensusConflict')
  assert.deepEqual(gate(), {
    reason: 'ready',
    eligible: true,
    consecutiveLosses: 0,
    resumeAt: null,
  })
})

test('unrestricted mode bypasses risk gates but still enforces directional capacity', () => {
  const unrestricted = config({ riskControlsEnabled: false, maxPositionsPerDirection: 3 })
  assert.equal(
    gate({
      config: unrestricted,
      signal: signal({ score: 1, confidence: 1, confirmations: 0 }),
      dailyNetPnl: -999,
      cooldownUntil: '2026-08-20T02:00:00.000Z',
      activePositionsInDirection: 2,
      consensusEligible: false,
    }).reason,
    'ready',
  )
  assert.equal(
    gate({
      config: unrestricted,
      activePositionsInDirection: 3,
    }).reason,
    'positionLimit',
  )
  assert.equal(
    gate({ config: unrestricted, signal: signal({ action: 'wait' }) }).reason,
    'waitingDirection',
  )
})

test('rolling health pauses degraded samples and later permits one probe', () => {
  const trades = rollingTrades()
  const now = new Date('2026-08-19T01:00:00.000Z')
  const health = calculateBtcAutoRollingHealth(config(), trades, now)
  assert.equal(health.status, 'paused')
  assert.equal(health.profitFactor, 0.6)
  assert.equal(health.maxDrawdownUsdt, 4.6)
  assert.deepEqual(health.reasons, ['lowProfitFactor', 'excessiveDrawdown'])

  const afterPause = new Date(Date.parse(health.resumeAt) + 1)
  assert.equal(calculateBtcAutoRollingHealth(config(), trades, afterPause).status, 'probeEligible')
  assert.equal(
    calculateBtcAutoRollingHealth(config(), trades.slice(0, 19), now).status,
    'insufficientSample',
  )
})

test('rolling health accepts a sufficiently profitable full sample', () => {
  const trades = Array.from({ length: 20 }, (_, index) =>
    closedTrade(
      `healthy-${index}`,
      new Date(Date.UTC(2026, 7, 19, 0, index)).toISOString(),
      index % 2 === 0 ? 1.5 : -1,
    ),
  )
  const health = calculateBtcAutoRollingHealth(
    config({ maximumRollingDrawdownUsdt: 10 }),
    trades,
    new Date('2026-08-19T01:00:00.000Z'),
  )
  assert.equal(health.status, 'healthy')
  assert.equal(health.profitFactor, 1.5)
  assert.deepEqual(health.reasons, [])
})

test('new strategy gets one controlled probe then uses only its own closed samples', () => {
  const currentVersion = 'btc-auto-v4-current'
  const legacy = rollingTrades()
  const coldStart = calculateBtcAutoRollingHealth(
    config(),
    legacy,
    new Date('2026-08-19T02:00:00.000Z'),
    currentVersion,
  )
  assert.equal(coldStart.sampleScope, 'allHistoryFallback')
  assert.equal(coldStart.status, 'newVersionProbeEligible')
  assert.equal(gate({ trades: legacy, strategyVersion: currentVersion }).reason, 'ready')
  assert.equal(
    gate({
      trades: [...legacy, trade({ id: 'probe', strategyVersion: currentVersion })],
      strategyVersion: currentVersion,
    }).reason,
    'rollingPerformancePause',
  )
  const current = Array.from({ length: 3 }, (_, index) =>
    closedTrade(`current-${index}`, new Date(Date.UTC(2026, 7, 19, 1, index)).toISOString(), 2, {
      strategyVersion: currentVersion,
    }),
  )
  const building = calculateBtcAutoRollingHealth(
    config(),
    [...current, ...legacy],
    new Date('2026-08-19T02:00:00.000Z'),
    currentVersion,
  )
  assert.equal(building.sampleScope, 'currentVersion')
  assert.equal(building.currentVersionSampleSize, 3)
  assert.equal(building.sampleSize, 3)
  assert.equal(building.status, 'insufficientSample')

  const fullCurrent = Array.from({ length: 20 }, (_, index) =>
    closedTrade(
      `current-full-${index}`,
      new Date(Date.UTC(2026, 7, 19, 2, index)).toISOString(),
      index % 2 === 0 ? 1.5 : -1,
      { strategyVersion: currentVersion },
    ),
  )
  const isolated = calculateBtcAutoRollingHealth(
    config({ maximumRollingDrawdownUsdt: 10 }),
    [...fullCurrent, ...legacy],
    new Date('2026-08-19T03:00:00.000Z'),
    currentVersion,
  )
  assert.equal(isolated.sampleScope, 'currentVersion')
  assert.equal(isolated.sampleSize, 20)
  assert.equal(isolated.status, 'healthy')
})

test('compatible strategy versions share one rolling performance cohort', () => {
  const cohort = 'btc-performance-v2-minute-strategy'
  const priorVersionLoss = closedTrade('prior-version-loss', '2026-08-19T01:00:00.000Z', -1, {
    strategyVersion: 'btc-auto-v11-old',
    performanceCohortVersion: cohort,
  })
  const health = calculateBtcAutoRollingHealth(
    config(),
    [priorVersionLoss],
    new Date('2026-08-19T02:00:00.000Z'),
    'btc-auto-v19-current',
    cohort,
  )
  assert.equal(health.sampleScope, 'performanceCohort')
  assert.equal(health.currentVersionSampleSize, 1)
  assert.equal(health.status, 'insufficientSample')
  assert.notEqual(health.status, 'newVersionProbeEligible')
})

test('minute candles close at stop or target and ignore the partial entry minute', () => {
  const stop = resolveBtcAutoCloseTrigger(
    trade(),
    signal(),
    [{ date: '2026-08-19T15:31:00.000Z', open: 100, high: 102, low: 94, close: 100 }],
    65,
  )
  assert.deepEqual(stop, { reason: 'stopLoss', referencePrice: 95, source: 'minuteCandle' })

  const target = resolveBtcAutoCloseTrigger(
    trade(),
    signal(),
    [{ date: '2026-08-19T15:31:00.000Z', open: 100, high: 111, low: 99, close: 105 }],
    65,
  )
  assert.deepEqual(target, {
    reason: 'takeProfit',
    referencePrice: 110,
    source: 'minuteCandle',
  })

  const ignored = resolveBtcAutoCloseTrigger(
    trade(),
    signal(),
    [{ date: '2026-08-19T15:30:00.000Z', open: 100, high: 111, low: 94, close: 105 }],
    65,
  )
  assert.equal(ignored, null)
})

test('ambiguous candle and gaps use conservative stop prices for long and short', () => {
  const both = resolveBtcAutoCloseTrigger(
    trade(),
    signal(),
    [{ date: '2026-08-19T15:31:00.000Z', open: 100, high: 111, low: 94, close: 105 }],
    65,
  )
  assert.equal(both.reason, 'stopLoss')

  const longGap = resolveBtcAutoCloseTrigger(
    trade(),
    signal(),
    [{ date: '2026-08-19T15:31:00.000Z', open: 92, high: 96, low: 91, close: 94 }],
    65,
  )
  assert.equal(longGap.referencePrice, 92)

  const shortGap = resolveBtcAutoCloseTrigger(
    trade({ direction: 'short', stopLoss: 105, takeProfit: 90 }),
    signal({ action: 'short' }),
    [{ date: '2026-08-19T15:31:00.000Z', open: 108, high: 109, low: 100, close: 107 }],
    65,
  )
  assert.deepEqual(shortGap, {
    reason: 'stopLoss',
    referencePrice: 108,
    source: 'minuteCandle',
  })
})

test('mark price and strong opposite signals can close an open trade', () => {
  assert.deepEqual(resolveBtcAutoCloseTrigger(trade(), signal({ price: 90 }), [], 65), {
    reason: 'stopLoss',
    referencePrice: 90,
    source: 'markPrice',
  })
  assert.deepEqual(
    resolveBtcAutoCloseTrigger(
      trade(),
      signal({ action: 'short', score: -70, confidence: 80, price: 100 }),
      [],
      65,
    ),
    { reason: 'signalFalsified', referencePrice: 100, source: 'signal' },
  )
})

test('maximum holding time exits at the observed mark while preserving stop precedence', () => {
  assert.equal(
    resolveBtcAutoCloseTrigger(
      trade(),
      signal({ action: 'wait', observedAt: '2026-08-19T16:29:00.000Z' }),
      [],
      65,
      60,
    ),
    null,
  )
  assert.deepEqual(
    resolveBtcAutoCloseTrigger(
      trade(),
      signal({ action: 'wait', price: 101, observedAt: '2026-08-19T16:31:00.000Z' }),
      [],
      65,
      60,
    ),
    { reason: 'timeStop', referencePrice: 101, source: 'time' },
  )
  assert.equal(
    resolveBtcAutoCloseTrigger(
      trade(),
      signal({ action: 'wait', price: 90, observedAt: '2026-08-19T16:31:00.000Z' }),
      [],
      65,
      60,
    )?.reason,
    'stopLoss',
  )
})

test('trade result subtracts entry and exit fees', () => {
  assert.deepEqual(calculateBtcAutoTradeResult(trade({ quantity: 1 }), 110, 0.05), {
    grossPnl: 10,
    fees: 0.105,
    netPnl: 9.895,
    returnPct: 9.895,
  })
})

test('reconciled trade result includes actual commission and signed funding income', () => {
  assert.deepEqual(calculateBtcAutoReconciledResult(trade(), 10, 0.08, -0.02), {
    grossPnl: 10,
    fees: 0.08,
    fundingFee: -0.02,
    netPnl: 9.9,
    returnPct: 9.9,
  })
  assert.equal(calculateBtcAutoReconciledResult(trade(), 10, -0.08, 0), null)
})

test('Testnet reconciliation attributes USDT commission to each execution observation', () => {
  const result = buildBtcAutoTestnetCommissionUpdates([
    {
      clientOrderId: 'open-client-1',
      fills: [
        { id: 1, commission: '0.02', commissionAsset: 'USDT' },
        { id: 2, commission: '0.03', commissionAsset: 'USDT' },
      ],
    },
    {
      clientOrderId: 'close-client-1',
      fills: [{ id: 3, commission: '0.06', commissionAsset: 'USDT' }],
    },
  ])

  assert.deepEqual(result, {
    totalCommission: 0.11,
    observations: [
      { clientOrderId: 'open-client-1', commission: 0.05 },
      { clientOrderId: 'close-client-1', commission: 0.06 },
    ],
  })
  assert.throws(
    () =>
      buildBtcAutoTestnetCommissionUpdates([
        {
          clientOrderId: 'open-client-1',
          fills: [{ id: 1, commission: '0.01', commissionAsset: 'BNB' }],
        },
      ]),
    /佣金不是USDT/,
  )
})

test('performance summaries use Asia/Shanghai boundaries and report drawdown', () => {
  const trades = [
    closedTrade('before-day', '2026-08-18T15:59:59.000Z', 50),
    closedTrade('a', '2026-08-18T16:00:00.000Z', 2),
    closedTrade('b', '2026-08-19T01:00:00.000Z', -1),
    closedTrade('c', '2026-08-19T02:00:00.000Z', -3),
    closedTrade('d', '2026-08-19T03:00:00.000Z', 4),
  ]
  const [day] = summarizeBtcAutoPerformance(trades, new Date('2026-08-19T05:00:00.000Z'))
  assert.equal(day.trades, 4)
  assert.equal(day.reconciledTrades, 0)
  assert.equal(day.estimatedTrades, 4)
  assert.equal(day.netPnl, 2)
  assert.equal(day.expectancyUsdt, 0.5)
  assert.equal(day.maxDrawdownUsdt, 4)
  assert.equal(day.profitFactor, 1.5)
})

test('performance query includes a prior-month week while equity stays month-scoped', () => {
  assert.equal(
    btcAutoPerformanceQueryStartAt(new Date('2026-08-31T16:30:00.000Z')),
    '2026-08-30T16:00:00.000Z',
  )
  assert.equal(
    btcAutoMonthStartAt(new Date('2026-08-31T16:30:00.000Z')),
    '2026-08-31T16:00:00.000Z',
  )
  assert.equal(
    btcAutoPerformanceQueryStartAt(new Date('2026-08-31T15:59:59.000Z')),
    '2026-07-31T16:00:00.000Z',
  )
})

test('CSV export includes auditable summaries, strategy versions and escaped errors', () => {
  const closed = closedTrade('csv-trade', '2026-08-19T02:00:00.000Z', 2, {
    error: 'retry, then "filled"',
  })
  const performance = summarizeBtcAutoPerformance([closed], new Date('2026-08-19T05:00:00.000Z'))
  const csv = buildBtcAutoTradingCsv(
    {
      config: config(),
      strategyVersion: 'btc-auto-v4-test',
      signalModelVersion: 'btc-signal-model-v2',
      evidencePolicyVersion: 'btc-evidence-v9-path-realized',
      performanceCohortVersion: 'btc-performance-v2-minute-strategy',
      strategySnapshots: [
        {
          strategyVersion: 'btc-auto-v4-test',
          definition: btcAutoStrategyDefinition(config()),
          firstSeenAt: '2026-08-19T00:00:00.000Z',
          lastSeenAt: '2026-08-19T05:00:00.000Z',
        },
      ],
      credentialsReady: false,
      lastRunAt: '2026-08-19T05:00:00.000Z',
      lastSuccessfulRunAt: '2026-08-19T05:00:00.000Z',
      lastFailureAt: null,
      lastError: null,
      lastCycleStatus: 'success',
      consecutiveFailures: 0,
      nextRunAt: '2026-08-19T05:05:00.000Z',
      signal: null,
      signalHistory: [],
      signalOutcomes: [],
      strategyComparison: {
        horizon: '1h',
        minimumSamples: 48,
        maximumSamples: 120,
        confidenceLevelPct: 98,
        pairedSamples: 0,
        baselineOnlyWins: 0,
        ensembleOnlyWins: 0,
        baselineSamples: 0,
        baselineHitRatePct: null,
        baselineAverageMovePct: null,
        baselineAverageNetMovePct: null,
        ensembleSamples: 0,
        ensembleHitRatePct: null,
        ensembleAverageMovePct: null,
        ensembleAverageNetMovePct: null,
        estimatedRoundTripCostPct: 0.1,
        hitRateAdvantagePct: null,
        hitRateAdvantageLowerBoundPct: null,
        hitRateAdvantageUpperBoundPct: null,
        verdict: 'collecting',
        recommendedEnsembleWeightPct: 0,
        temporalValidation: {
          maximumSamples: 24,
          minimumSamples: 12,
          baselineSamples: 0,
          candidateSamples: 0,
          baselineHitRatePct: null,
          candidateHitRatePct: null,
          baselineAverageNetMovePct: null,
          candidateAverageNetMovePct: null,
          hitRateLiftPct: null,
          passed: false,
        },
      },
      activeStrategyRegime: null,
      strategyComparisonsByRegime: [],
      scoreThresholdStudy: {
        horizon: '1h',
        minimumSamples: 30,
        confidenceLevelPct: 98,
        currentThreshold: 55,
        candidateThreshold: 70,
        currentSamples: 0,
        candidateSamples: 0,
        currentHitRatePct: null,
        candidateHitRatePct: null,
        currentAverageNetMovePct: null,
        candidateAverageNetMovePct: null,
        candidateCoveragePct: null,
        hitRateLiftPct: null,
        hitRateLiftLowerBoundPct: null,
        verdict: 'collecting',
        temporalValidation: {
          maximumSamples: 24,
          minimumSamples: 12,
          baselineSamples: 0,
          candidateSamples: 0,
          baselineHitRatePct: null,
          candidateHitRatePct: null,
          baselineAverageNetMovePct: null,
          candidateAverageNetMovePct: null,
          hitRateLiftPct: null,
          passed: false,
        },
      },
      consensusStudy: {
        horizon: '1h',
        minimumSamples: 30,
        confidenceLevelPct: 98,
        baselineSamples: 0,
        consensusSamples: 0,
        baselineHitRatePct: null,
        consensusHitRatePct: null,
        baselineAverageNetMovePct: null,
        consensusAverageNetMovePct: null,
        consensusCoveragePct: null,
        hitRateLiftPct: null,
        hitRateLiftLowerBoundPct: null,
        verdict: 'collecting',
        consensusRequired: false,
        temporalValidation: {
          maximumSamples: 24,
          minimumSamples: 12,
          baselineSamples: 0,
          candidateSamples: 0,
          baselineHitRatePct: null,
          candidateHitRatePct: null,
          baselineAverageNetMovePct: null,
          candidateAverageNetMovePct: null,
          hitRateLiftPct: null,
          passed: false,
        },
      },
      entryGate: {
        reason: 'waitingDirection',
        eligible: false,
        consecutiveLosses: 0,
        resumeAt: null,
      },
      rollingHealth: {
        sampleSize: 1,
        currentVersionSampleSize: 1,
        requiredSampleSize: 20,
        sampleScope: 'currentVersion',
        profitFactor: null,
        minimumProfitFactor: 0.8,
        maxDrawdownUsdt: 0,
        maximumDrawdownUsdt: 3,
        status: 'insufficientSample',
        reasons: [],
        resumeAt: null,
      },
      openTrade: null,
      openTrades: [],
      trades: [closed],
      performance,
      equityCurve: [],
    },
    'zh',
    new Date('2026-08-19T06:00:00.000Z'),
  )

  assert.ok(csv.startsWith('\uFEFF运行信息\r\n'))
  assert.match(csv, /周期汇总/)
  assert.match(csv, /逐笔交易/)
  assert.match(csv, /策略参数快照/)
  assert.match(csv, /minimumDirectionalScore/)
  assert.match(csv, /btc-auto-v4-test/)
  assert.match(csv, /"retry, then ""filled"""/)
  assert.ok(csv.endsWith('\r\n'))
})

test('equity curve groups Shanghai trading dates and preserves intraday drawdown', () => {
  const curve = buildBtcAutoEquityCurve([
    closedTrade('a', '2026-08-18T16:30:00.000Z', 3),
    closedTrade('b', '2026-08-19T01:00:00.000Z', -5),
    closedTrade('c', '2026-08-19T16:10:00.000Z', 4),
  ])
  assert.deepEqual(curve, [
    {
      date: '2026-08-19',
      trades: 2,
      netPnl: -2,
      cumulativeNetPnl: -2,
      drawdownUsdt: 5,
    },
    {
      date: '2026-08-20',
      trades: 1,
      netPnl: 4,
      cumulativeNetPnl: 2,
      drawdownUsdt: 1,
    },
  ])
})

test('contract trade path uses the stop when one complete candle touches stop and target', () => {
  const result = evaluateContractTradePath({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 100,
        high: 111,
        low: 94,
        close: 105,
      },
    ],
    maximumHoldingMinutes: 60,
    feeRatePct: 0,
    slippageRatePct: 0,
    fundingRatePct: 0,
    fundingSettlements: 0,
  })

  assert.deepEqual(result, {
    status: 'closed',
    exitReason: 'stopLoss',
    exitPrice: 95,
    exitedAt: '2026-08-22T00:01:00.000Z',
    holdingMinutes: 1,
    grossPnl: -50,
    fees: 0,
    slippage: 0,
    funding: 0,
    netPnl: -50,
    returnPct: -5,
    maximumAdverseExcursionPct: -6,
  })
})

test('contract trade path uses a worse opening price when a long gaps through its stop', () => {
  const result = evaluateContractTradePath({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 90,
        high: 94,
        low: 89,
        close: 92,
      },
    ],
    maximumHoldingMinutes: 60,
    feeRatePct: 0,
    slippageRatePct: 0,
    fundingRatePct: 0,
    fundingSettlements: 0,
  })

  assert.equal(result.exitReason, 'stopLoss')
  assert.equal(result.exitPrice, 90)
  assert.equal(result.grossPnl, -100)
  assert.equal(result.maximumAdverseExcursionPct, -11)
})

test('contract trade path subtracts round-trip fees, slippage and long funding from a target win', () => {
  const result = evaluateContractTradePath({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 100,
        high: 110,
        low: 99,
        close: 109,
      },
    ],
    maximumHoldingMinutes: 60,
    feeRatePct: 0.05,
    slippageRatePct: 0.1,
    fundingRatePct: 0.01,
    fundingSettlements: 2,
  })

  assert.equal(result.exitReason, 'takeProfit')
  assert.equal(result.grossPnl, 100)
  assert.equal(result.fees, 1)
  assert.equal(result.slippage, 2)
  assert.equal(result.funding, 0.2)
  assert.equal(result.netPnl, 96.8)
  assert.equal(result.returnPct, 9.68)
})

test('contract trade path mirrors target returns and positive funding income for a short', () => {
  const result = evaluateContractTradePath({
    direction: 'short',
    entryPrice: 100,
    stopLoss: 105,
    takeProfit: 90,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 100,
        high: 101,
        low: 89,
        close: 91,
      },
    ],
    maximumHoldingMinutes: 60,
    feeRatePct: 0,
    slippageRatePct: 0,
    fundingRatePct: 0.01,
    fundingSettlements: 2,
  })

  assert.equal(result.exitReason, 'takeProfit')
  assert.equal(result.grossPnl, 100)
  assert.equal(result.funding, -0.2)
  assert.equal(result.netPnl, 100.2)
  assert.equal(result.returnPct, 10.02)
  assert.equal(result.maximumAdverseExcursionPct, -1)
})

test('contract trade path closes at the final observed close when the holding limit expires', () => {
  const result = evaluateContractTradePath({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 100,
        high: 103,
        low: 98,
        close: 102,
      },
      {
        date: '2026-08-22T00:02:00.000Z',
        open: 102,
        high: 105,
        low: 101,
        close: 104,
      },
      {
        date: '2026-08-22T00:03:00.000Z',
        open: 104,
        high: 111,
        low: 103,
        close: 110,
      },
    ],
    maximumHoldingMinutes: 2,
    feeRatePct: 0,
    slippageRatePct: 0,
    fundingRatePct: 0,
    fundingSettlements: 0,
  })

  assert.equal(result.exitReason, 'timeStop')
  assert.equal(result.exitPrice, 104)
  assert.equal(result.exitedAt, '2026-08-22T00:02:00.000Z')
  assert.equal(result.holdingMinutes, 2)
  assert.equal(result.netPnl, 40)
  assert.equal(result.maximumAdverseExcursionPct, -2)
})

test('contract trade path rejects invalid risk geometry and non-chronological incomplete bars', () => {
  const validInput = {
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [],
    maximumHoldingMinutes: 60,
    feeRatePct: 0.05,
    slippageRatePct: 0.1,
    fundingRatePct: 0.01,
    fundingSettlements: 0,
  }

  assert.throws(
    () => evaluateContractTradePath({ ...validInput, stopLoss: 101 }),
    /多头止损必须低于入场价，止盈必须高于入场价/,
  )
  assert.throws(
    () =>
      evaluateContractTradePath({
        ...validInput,
        bars: [
          { date: '2026-08-22T00:02:00.000Z', open: 100, high: 101, low: 99, close: 100 },
          { date: '2026-08-22T00:01:00.000Z', open: 100, high: 101, low: 99, close: 100 },
        ],
      }),
    /K线必须按时间严格升序排列/,
  )
  assert.throws(
    () =>
      evaluateContractTradePath({
        ...validInput,
        bars: [{ date: '2026-08-22T00:01:00.000Z', close: 100 }],
      }),
    /K线必须包含有效的完整OHLC/,
  )
})

test('contract trade path remains unsettled without a complete post-entry candle', () => {
  assert.deepEqual(
    evaluateContractTradePath({
      direction: 'long',
      entryPrice: 100,
      stopLoss: 95,
      takeProfit: 110,
      notional: 1_000,
      bars: [],
      maximumHoldingMinutes: 60,
      feeRatePct: 0.05,
      slippageRatePct: 0.1,
      fundingRatePct: 0.01,
      fundingSettlements: 0,
    }),
    {
      status: 'open',
      exitReason: null,
      exitPrice: null,
      exitedAt: null,
      holdingMinutes: 0,
      grossPnl: null,
      fees: 0,
      slippage: 0,
      funding: 0,
      netPnl: null,
      returnPct: null,
      maximumAdverseExcursionPct: null,
    },
  )
})

test('contract trade path excludes candles after exit from adverse excursion', () => {
  const result = evaluateContractTradePath({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    bars: [
      {
        date: '2026-08-22T00:01:00.000Z',
        open: 100,
        high: 111,
        low: 99,
        close: 110,
      },
      {
        date: '2026-08-22T00:02:00.000Z',
        open: 90,
        high: 91,
        low: 80,
        close: 85,
      },
    ],
    maximumHoldingMinutes: 60,
    feeRatePct: 0,
    slippageRatePct: 0,
    fundingRatePct: 0,
    fundingSettlements: 0,
  })

  assert.equal(result.exitReason, 'takeProfit')
  assert.equal(result.maximumAdverseExcursionPct, -1)
})
