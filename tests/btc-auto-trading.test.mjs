import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const {
  calculateBtcAutoRollingHealth,
  calculateBtcAutoTradeResult,
  evaluateBtcAutoEntryGate,
  evolveBtcAutoSignal,
  resolveBtcAutoCloseTrigger,
  summarizeBtcAutoPerformance,
} = jiti('../src/utils/btc-auto-trading.ts')

const config = (overrides = {}) => ({
  enabled: true,
  executionMode: 'paper',
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
  feeRatePct: 0.05,
  eligibilityConfirmed: false,
  updatedAt: '2026-08-19T00:00:00.000Z',
  ...overrides,
})

const signal = (overrides = {}) => ({
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

const trade = (overrides = {}) => ({
  id: 'trade-1',
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
  netPnl: null,
  returnPct: null,
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
  )
  assert.equal(strengthened.confirmations, 3)
  assert.equal(strengthened.evolution, 'strengthened')

  const falsified = evolveBtcAutoSignal(
    strengthened,
    { action: 'short', score: -70, confidence: 80, latestPrice: 99, reasons: [], risks: [] },
    '2026-08-19T15:45:00.000Z',
    'binance',
  )
  assert.equal(falsified.confirmations, 1)
  assert.equal(falsified.evolution, 'falsified')
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
  assert.deepEqual(gate(), {
    reason: 'ready',
    eligible: true,
    consecutiveLosses: 0,
    resumeAt: null,
  })
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

test('trade result subtracts entry and exit fees', () => {
  assert.deepEqual(calculateBtcAutoTradeResult(trade({ quantity: 1 }), 110, 0.05), {
    grossPnl: 10,
    fees: 0.105,
    netPnl: 9.895,
    returnPct: 9.895,
  })
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
  assert.equal(day.netPnl, 2)
  assert.equal(day.expectancyUsdt, 0.5)
  assert.equal(day.maxDrawdownUsdt, 4)
  assert.equal(day.profitFactor, 1.5)
})
