import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const {
  runContractStrategyBacktest,
  buildContractBacktestExport,
  buildContractBacktestOpportunities,
} = jiti('../src/utils/contract-strategy-backtest.ts')
const { analyzeContractPaperDrift } = jiti('../src/utils/contract-paper-drift.ts')
const { buildContractPaperCostAssumptions, simulateContractPosition } = jiti(
  '../src/utils/contract-position-simulation.ts',
)
const {
  buildTestnetExecutionCalibrationEvidence,
  assessTestnetExecutionCalibrationEvidenceCurrency,
  calibrateTestnetExecution,
  parseTestnetExecutionCalibrationEvidence,
  testnetExecutionEvidenceWindowStartAt,
} = jiti('../src/utils/testnet-execution-calibration.ts')
const {
  assessLiveTradingReadiness,
  buildLiveTradingReadinessExport,
  liveTradingReadinessThresholds,
} = jiti('../src/utils/live-trading-readiness.ts')
const { parseContractBacktestEvidence, buildCurrentPaperBacktestReferences } = jiti(
  '../src/utils/trading-evidence.ts',
)
const { createContractPaperTrade, contractPaperTradeToObservation, restoreContractPaperTrades } =
  jiti('../src/utils/contract-paper-journal.ts')
const {
  createTradingReviewChecklist,
  confirmTradingReviewAttestation,
  applyTradingReviewChecklistDraft,
  evaluateTradingReviewChecklist,
  parseTradingReviewChecklist,
} = jiti('../src/utils/trading-review-checklist.ts')
const {
  buildTradingReviewPackage,
  assessTradingReviewPackageCurrency,
  parseTradingReviewPackage,
  reverifyTradingReviewPackageCloudAudit,
} = jiti(
  '../src/utils/trading-review-package.ts',
)
const {
  createContractPaperTelemetry,
  startContractPaperMonitoringSession,
  observeContractPaperMonitoring,
  finishContractPaperMonitoringSession,
  buildContractPaperTelemetryEvidence,
  parseContractPaperTelemetry,
} = jiti('../src/utils/contract-paper-telemetry.ts')
const {
  containsSensitiveTradingEvidence,
  createTradingEvidenceAuditCheckpoint,
  loadTradingEvidenceCloudSnapshot,
  loadTradingEvidenceCloudVersion,
  saveTradingEvidenceCloudSnapshot,
  TradingEvidenceConflictError,
  TradingEvidenceIntegrityError,
  TradingEvidenceInputError,
  validateTradingEvidenceCloudBundle,
  verifyExternalTradingEvidenceAuditCheckpoint,
  verifyTradingEvidenceCloudAudit,
} = jiti('../worker/trading-evidence-sync.ts')
const { compareTradingEvidenceBundles } = jiti('../src/utils/trading-evidence-diff.ts')
const { buildTradingEvidenceAuditDigest, verifyTradingEvidenceAuditChain } = jiti(
  '../src/utils/trading-evidence-audit.ts',
)
const { buildTradingEvidenceAuditCheckpoint, parseTradingEvidenceAuditCheckpoint } = jiti(
  '../src/utils/trading-evidence-checkpoint.ts',
)

const createTradingEvidenceD1Double = ({ failOn = '' } = {}) => {
  let current = null
  const versions = new Map()
  const audits = []

  const execute = (statement, state) => {
    const { query, values } = statement
    if (failOn && query.includes(failOn)) throw new Error('injected D1 failure')
    if (query.includes('INSERT INTO trading_evidence_bundles')) {
      const [
        userId,
        bundleJson,
        contentDigest,
        revision,
        updatedAt,
        expectedRevision,
        syncToken,
        auditDigest,
      ] = values
      const permitsInitialInsert =
        !query.includes('WHERE ?6=0') || (expectedRevision === 0 && state.current === null)
      if (state.current === null && permitsInitialInsert) {
        state.current = {
          user_id: userId,
          bundle_json: bundleJson,
          content_digest: contentDigest,
          revision,
          updated_at: updatedAt,
          sync_token: syncToken,
          audit_digest: auditDigest,
        }
        return { success: true, meta: { changes: 1 }, results: [] }
      }
      if (state.current?.revision === expectedRevision) {
        state.current = {
          user_id: userId,
          bundle_json: bundleJson,
          content_digest: contentDigest,
          revision,
          updated_at: updatedAt,
          sync_token: syncToken,
          audit_digest: auditDigest,
        }
        return { success: true, meta: { changes: 1 }, results: [] }
      }
      return { success: true, meta: { changes: 0 }, results: [] }
    }
    if (query.includes('INSERT INTO trading_evidence_sync_audit')) {
      if (query.includes('WHERE EXISTS')) {
        const chained = query.includes('previous_audit_digest')
        const revision = values[2]
        const contentDigest = values[3]
        const userId = values[chained ? 7 : 5]
        const expectedRevision = values[chained ? 8 : 6]
        const expectedMarker = values[chained ? 9 : 7]
        const marker = query.includes('sync_token')
          ? state.current?.sync_token
          : state.current?.content_digest
        if (
          state.current?.user_id !== userId ||
          revision !== expectedRevision ||
          contentDigest !== state.current?.content_digest ||
          marker !== expectedMarker
        ) {
          return { success: true, meta: { changes: 0 }, results: [] }
        }
      }
      state.audits.push(values)
      return { success: true, meta: { changes: 1 }, results: [] }
    }
    if (query.includes('INSERT INTO trading_evidence_versions')) {
      if (query.includes('WHERE EXISTS')) {
        const [userId, revision, , contentDigest, , expectedUserId, expectedRevision, marker] =
          values
        const currentMarker = query.includes('sync_token')
          ? state.current?.sync_token
          : state.current?.content_digest
        if (
          state.current?.user_id !== expectedUserId ||
          userId !== expectedUserId ||
          revision !== expectedRevision ||
          contentDigest !== state.current?.content_digest ||
          currentMarker !== marker
        ) {
          return { success: true, meta: { changes: 0 }, results: [] }
        }
      }
      if (state.versions.has(values[1])) throw new Error('UNIQUE constraint failed')
      state.versions.set(values[1], values)
      return { success: true, meta: { changes: 1 }, results: [] }
    }
    if (query.includes('DELETE FROM trading_evidence_versions')) {
      return { success: true, meta: { changes: 0 }, results: [] }
    }
    throw new Error(`Unexpected D1 statement: ${query}`)
  }

  const prepare = (query, values = []) => ({
    query,
    values,
    bind: (...nextValues) => prepare(query, nextValues),
    first: async () => {
      if (query.includes('FROM trading_evidence_sync_audit')) {
        const stored = query.includes('AND revision=?')
          ? audits.find((entry) => entry[1] === values[0] && entry[2] === values[1])
          : audits.at(-1)
        if (!stored) return null
        return query.includes('AND revision=?')
          ? {
              revision: stored[2],
              content_digest: stored[3],
              audit_digest: stored[5] ?? null,
            }
          : { revision: stored[2], audit_digest: stored[5] ?? null }
      }
      if (query.includes('FROM trading_evidence_versions')) {
        const stored = versions.get(values[1])
        if (!stored || stored[0] !== values[0]) return null
        return {
          bundle_json: stored[2],
          revision: stored[1],
          content_digest: stored[3],
          created_at: stored[4],
        }
      }
      if (!query.includes('FROM trading_evidence_bundles')) {
        throw new Error(`Unexpected D1 read: ${query}`)
      }
      return current
    },
    all: async () => {
      if (!query.includes('FROM trading_evidence_sync_audit')) {
        throw new Error(`Unexpected D1 list: ${query}`)
      }
      return {
        results: audits.map((stored) => ({
          id: stored[0],
          user_id: stored[1],
          revision: stored[2],
          content_digest: stored[3],
          previous_audit_digest: stored[4],
          audit_digest: stored[5],
          created_at: stored[6],
        })),
      }
    },
    run: async () => {
      const state = { current, versions, audits }
      const result = execute({ query, values }, state)
      current = state.current
      return result
    },
  })

  return {
    prepare,
    tamperAuditContent: (revision, contentDigest) => {
      const stored = audits.find((entry) => entry[2] === revision)
      if (stored) stored[3] = contentDigest
    },
    batch: async (statements) => {
      const state = {
        current: current ? structuredClone(current) : null,
        versions: new Map(versions),
        audits: [...audits],
      }
      const results = statements.map((statement) => execute(statement, state))
      current = state.current
      versions.clear()
      for (const [revision, value] of state.versions) versions.set(revision, value)
      audits.splice(0, audits.length, ...state.audits)
      return results
    },
  }
}

const opportunity = (index, overrides = {}) => {
  const minute = String(index).padStart(2, '0')
  const decisionAt = `2026-08-22T00:${minute}:00.000Z`
  return {
    id: `opportunity-${index}`,
    symbol: 'BTCUSDT',
    decisionAt,
    evidenceEndAt: decisionAt,
    regime: index % 3 === 0 ? 'trending' : index % 3 === 1 ? 'ranging' : 'volatile',
    action: index % 2 === 0 ? 'long' : 'short',
    entryPrice: 100,
    stopLoss: index % 2 === 0 ? 95 : 105,
    takeProfit: index % 2 === 0 ? 110 : 90,
    notional: 1_000,
    maximumHoldingMinutes: 1,
    bars: [
      {
        date: `2026-08-22T00:${String(index + 1).padStart(2, '0')}:00.000Z`,
        open: 100,
        high: index % 2 === 0 ? 111 : 101,
        low: index % 2 === 0 ? 99 : 89,
        close: index % 2 === 0 ? 110 : 90,
      },
    ],
    baselineDirections: { hold: 'long', simpleTrend: 'long', random: index % 2 ? 'long' : 'short' },
    ...overrides,
  }
}

const input = (overrides = {}) => ({
  strategyVersion: 'contract-v1',
  signalModelVersion: 'contract-signal-v1',
  generatedAt: '2026-08-22T01:00:00.000Z',
  minimumSamples: 2,
  trainingPct: 60,
  validationPct: 20,
  costModel: {
    version: 'cost-v1',
    feeRatePct: 0.05,
    slippageRatePct: 0.05,
    fundingRatePct: 0,
    fundingSettlements: 0,
  },
  opportunities: Array.from({ length: 10 }, (_, index) => opportunity(index)),
  ...overrides,
})

test('paper position simulation includes round-trip slippage in costs and risk', () => {
  const simulation = simulateContractPosition({
    direction: 'long',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    leverage: 2,
    feeRatePct: 0.05,
    slippageRatePct: 0.05,
    fundingRatePct: 0,
    fundingSettlements: 0,
    accountEquity: 10_000,
    maxRiskPct: 1,
  })

  assert.equal(simulation.roundTripFee, 1)
  assert.equal(simulation.roundTripSlippage, 1)
  assert.equal(simulation.breakEvenMovePct, 0.2)
  assert.ok(Math.abs(simulation.stopNetPnl + 52) < 1e-9)
  assert.ok(Math.abs(simulation.enteredRiskAmount - 52) < 1e-9)
})

test('paper cost assumptions enforce review floors and identify their exact rates', () => {
  assert.deepEqual(buildContractPaperCostAssumptions(0, Number.NaN), {
    feeRatePct: 0.05,
    slippageRatePct: 0.05,
    version: 'contract-cost-v2-fee-0.0500-slippage-0.0500',
  })
  assert.deepEqual(buildContractPaperCostAssumptions(0.08, 0.12), {
    feeRatePct: 0.08,
    slippageRatePct: 0.12,
    version: 'contract-cost-v2-fee-0.0800-slippage-0.1200',
  })
})

test('contract strategy backtest uses chronological training, validation and untouched holdout segments', () => {
  const report = runContractStrategyBacktest(input())

  assert.equal(report.segments.training.metrics.opportunities, 6)
  assert.equal(report.segments.validation.metrics.opportunities, 2)
  assert.equal(report.segments.holdout.metrics.opportunities, 2)
  assert.equal(report.segments.training.metrics.trades, 6)
  assert.equal(report.segments.holdout.metrics.status, 'supported')
  assert.equal(report.segments.holdout.byRegime.ranging.status, 'insufficient')
  assert.equal(report.split.holdoutPct, 20)
})

test('contract strategy backtest keeps deterministic baselines and auditable input export', () => {
  const backtestInput = input()
  const report = runContractStrategyBacktest(backtestInput)
  const exported = JSON.parse(buildContractBacktestExport(backtestInput, report))

  assert.equal(report.segments.holdout.baselines.hold.trades, 2)
  assert.equal(report.segments.holdout.baselines.random.trades, 2)
  assert.match(report.inputDigest, /^fnv1a-[0-9a-f]{8}$/)
  assert.equal(exported.input.strategyVersion, 'contract-v1')
  assert.equal(exported.input.costModel.version, 'cost-v1')
  assert.deepEqual(exported.report, report)
})

test('backtest evidence import recalculates the report and rejects tampering', () => {
  const backtestInput = input()
  const report = runContractStrategyBacktest(backtestInput)
  const exported = buildContractBacktestExport(backtestInput, report)
  const tampered = JSON.parse(exported)
  tampered.report.segments.holdout.metrics.averageNetReturnPct = 99

  assert.deepEqual(parseContractBacktestEvidence(exported), report)
  assert.throws(
    () => parseContractBacktestEvidence(JSON.stringify(tampered)),
    /重算结果不一致/,
  )
})

test('paper drift references use current Shanghai week and month with holdout benchmarks', () => {
  const report = runContractStrategyBacktest(input())
  const references = buildCurrentPaperBacktestReferences(
    report,
    new Date('2026-08-22T04:00:00.000Z'),
  )

  assert.equal(references.length, 2)
  assert.equal(references[0].startAt, '2026-08-16T16:00:00.000Z')
  assert.equal(references[0].endAt, '2026-08-23T15:59:59.999Z')
  assert.equal(references[1].startAt, '2026-07-31T16:00:00.000Z')
  assert.equal(references[1].endAt, '2026-08-31T15:59:59.999Z')
  assert.equal(
    references[0].averageNetReturnPct,
    report.segments.holdout.metrics.averageNetReturnPct,
  )
})

test('contract strategy backtest rejects lookahead evidence and settlement candles', () => {
  assert.throws(
    () =>
      runContractStrategyBacktest(
        input({
          opportunities: [
            opportunity(0, {
              evidenceEndAt: '2026-08-22T00:01:00.000Z',
            }),
          ],
        }),
      ),
    /证据截止时间不得晚于决策时间/,
  )
  assert.throws(
    () =>
      runContractStrategyBacktest(
        input({
          opportunities: [
            opportunity(0, {
              bars: [
                {
                  date: '2026-08-22T00:00:00.000Z',
                  open: 100,
                  high: 101,
                  low: 99,
                  close: 100,
                },
              ],
            }),
          ],
        }),
      ),
    /结算K线必须严格晚于决策时间/,
  )
})

test('historical opportunity builder generates decisions only from evidence available at decision time', () => {
  const points = Array.from({ length: 90 }, (_, index) => ({
    date: `2026-08-21T${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00.000Z`,
    open: 100 + index,
    high: 101 + index,
    low: 99 + index,
    close: 100 + index,
    volume: 100 + index,
  }))
  const evidenceEndAt = points[points.length - 1].date
  const market = {
    symbol: 'BTCUSDT',
    quoteAsset: 'USDT',
    interval: '5m',
    points,
    timeframes: ['1m', '5m', '15m', '1h', '4h'].map((interval) => ({ interval, points })),
    microstructure: {
      orderBookImbalancePct: 10,
      spreadBps: 1,
      takerBuyRatioPct: 55,
      openInterestChangePct: 1,
    },
    markPrice: 189,
    fundingRatePct: 0.01,
    nextFundingTime: null,
    openInterest: 1_000,
    updatedAt: evidenceEndAt,
    latencyMs: 10,
    status: 'live',
    errorCode: null,
  }
  const opportunities = buildContractBacktestOpportunities({
    frames: [
      {
        id: 'historical-1',
        decisionAt: '2026-08-21T02:00:00.000Z',
        evidenceEndAt,
        market,
        futureBars: [
          {
            date: '2026-08-21T02:01:00.000Z',
            open: 189,
            high: 195,
            low: 188,
            close: 194,
          },
        ],
      },
    ],
    notional: 1_000,
    maximumHoldingMinutes: 1,
    ensembleWeight: 0.35,
  })

  assert.equal(opportunities.length, 1)
  assert.equal(opportunities[0].action, 'long')
  assert.equal(opportunities[0].evidenceEndAt, evidenceEndAt)
  assert.ok(opportunities[0].stopLoss < opportunities[0].entryPrice)
})

test('historical opportunity builder rejects a future point hidden inside any timeframe', () => {
  const futurePoint = {
    date: '2026-08-22T00:02:00.000Z',
    open: 100,
    high: 101,
    low: 99,
    close: 100,
  }
  assert.throws(
    () =>
      buildContractBacktestOpportunities({
        frames: [
          {
            id: 'historical-1',
            decisionAt: '2026-08-22T00:01:00.000Z',
            evidenceEndAt: '2026-08-22T00:01:00.000Z',
            market: {
              symbol: 'BTCUSDT',
              quoteAsset: 'USDT',
              interval: '5m',
              points: [],
              timeframes: [{ interval: '1m', points: [futurePoint] }],
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
              updatedAt: null,
              latencyMs: null,
              status: 'live',
              errorCode: null,
            },
            futureBars: [],
          },
        ],
        notional: 1_000,
        maximumHoldingMinutes: 60,
        ensembleWeight: 0.35,
      }),
    /包含证据截止时间之后的数据/,
  )
})

test('paper drift compares each strategy version only with its matching backtest window', () => {
  const report = analyzeContractPaperDrift({
    minimumSamples: 2,
    maximumExpectedReturnDegradationPct: 0.5,
    maximumWinRateDegradationPct: 10,
    maximumDrawdownIncreasePct: 1,
    cycleToleranceMinutes: 1,
    references: [
      {
        strategyVersion: 'contract-v1',
        period: 'week',
        startAt: '2026-08-17T00:00:00.000Z',
        endAt: '2026-08-23T23:59:59.999Z',
        averageNetReturnPct: 1,
        winRatePct: 60,
        maximumDrawdownPct: 1,
      },
      {
        strategyVersion: 'contract-v2',
        period: 'week',
        startAt: '2026-08-17T00:00:00.000Z',
        endAt: '2026-08-23T23:59:59.999Z',
        averageNetReturnPct: 2,
        winRatePct: 70,
        maximumDrawdownPct: 1,
      },
    ],
    paperTrades: [
      {
        id: 'paper-1',
        strategyVersion: 'contract-v1',
        signalVersion: 'signal-v1',
        pathId: 'path-1',
        marketSource: 'binance',
        costModelVersion: 'cost-v1',
        plannedAt: '2026-08-18T00:00:00.000Z',
        closedAt: '2026-08-18T01:00:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100.1,
        netReturnPct: 1.2,
      },
      {
        id: 'paper-2',
        strategyVersion: 'contract-v1',
        signalVersion: 'signal-v1',
        pathId: 'path-2',
        marketSource: 'binance',
        costModelVersion: 'cost-v1',
        plannedAt: '2026-08-19T00:00:00.000Z',
        closedAt: '2026-08-19T01:00:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100,
        netReturnPct: 0.8,
      },
      {
        id: 'paper-3',
        strategyVersion: 'contract-v2',
        signalVersion: 'signal-v2',
        pathId: 'path-3',
        marketSource: 'binance',
        costModelVersion: 'cost-v1',
        plannedAt: '2026-08-20T00:00:00.000Z',
        closedAt: '2026-08-20T01:00:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100,
        netReturnPct: -1,
      },
    ],
    expectedCycleAts: [],
    observedCycleAts: [],
    dataGaps: [],
  })

  assert.equal(report.cohorts[0].samples, 2)
  assert.equal(report.cohorts[0].paperAverageNetReturnPct, 1)
  assert.equal(report.cohorts[0].status, 'stable')
  assert.equal(report.cohorts[1].samples, 1)
  assert.equal(report.cohorts[1].status, 'insufficient')
  assert.deepEqual(report.strategyVersions, ['contract-v1', 'contract-v2'])
})

test('paper drift emits trace, missed-cycle, data-gap and strategy-switch audit events', () => {
  const report = analyzeContractPaperDrift({
    minimumSamples: 1,
    maximumExpectedReturnDegradationPct: 0.5,
    maximumWinRateDegradationPct: 10,
    maximumDrawdownIncreasePct: 1,
    cycleToleranceMinutes: 1,
    references: [],
    paperTrades: [
      {
        id: 'paper-1',
        strategyVersion: 'contract-v1',
        signalVersion: null,
        pathId: null,
        marketSource: null,
        costModelVersion: null,
        plannedAt: '2026-08-22T00:00:00.000Z',
        closedAt: '2026-08-22T00:30:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100,
        netReturnPct: 0,
      },
      {
        id: 'paper-2',
        strategyVersion: 'contract-v2',
        signalVersion: 'signal-v2',
        pathId: 'path-2',
        marketSource: 'binance',
        costModelVersion: 'cost-v1',
        plannedAt: '2026-08-22T01:00:00.000Z',
        closedAt: '2026-08-22T01:30:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100,
        netReturnPct: 0,
      },
    ],
    expectedCycleAts: ['2026-08-22T00:00:00.000Z', '2026-08-22T00:05:00.000Z'],
    observedCycleAts: ['2026-08-22T00:00:30.000Z'],
    dataGaps: [
      {
        startAt: '2026-08-22T00:10:00.000Z',
        endAt: '2026-08-22T00:20:00.000Z',
        reason: '行情源中断',
      },
    ],
  })

  assert.deepEqual([...new Set(report.auditEvents.map((event) => event.type))].sort(), [
    'dataGap',
    'missedCycle',
    'missingTrace',
    'strategySwitch',
  ])
})

test('paper journal persists trace fields and converts a closed trade into drift evidence', () => {
  const created = createContractPaperTrade({
    id: 'paper-trace-1',
    symbol: 'BTCUSDT',
    displayName: 'Bitcoin',
    quoteAsset: 'USDT',
    direction: 'long',
    interval: '5m',
    openedAt: '2026-08-22T00:00:00.000Z',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    leverage: 2,
    feeRatePct: 0.05,
    fundingRatePct: 0,
    fundingSettlements: 0,
    riskBudget: 100,
    enteredRiskAmount: 51,
    signalScore: 70,
    signalConfidence: 80,
    strategyVersion: 'contract-v1',
    signalVersion: 'signal-v1',
    pathId: 'path-1',
    marketSource: 'binance-futures-public',
    costModelVersion: 'cost-v1',
    plannedEntryPrice: 100,
    slippageRatePct: 0.05,
  })
  assert.ok(created)
  const closed = {
    ...created,
    status: 'closed',
    closedAt: '2026-08-22T01:00:00.000Z',
    exitPrice: 110,
  }
  const observation = contractPaperTradeToObservation(closed)

  assert.equal(observation.strategyVersion, 'contract-v1')
  assert.equal(observation.pathId, 'path-1')
  assert.equal(observation.feeRatePct, 0.05)
  assert.equal(observation.slippageRatePct, 0.05)
  assert.equal(observation.netReturnPct, 9.8)
})

test('paper journal restores legacy local records with explicit unknown trace defaults', () => {
  const legacy = {
    id: 'legacy-1',
    symbol: 'BTCUSDT',
    displayName: 'Bitcoin',
    quoteAsset: 'USDT',
    direction: 'long',
    interval: '5m',
    openedAt: '2026-08-22T00:00:00.000Z',
    entryPrice: 100,
    stopLoss: 95,
    takeProfit: 110,
    notional: 1_000,
    leverage: 2,
    feeRatePct: 0.05,
    fundingRatePct: 0,
    fundingSettlements: 0,
    riskBudget: 100,
    enteredRiskAmount: 51,
    signalScore: 70,
    signalConfidence: 80,
    status: 'open',
    closedAt: null,
    exitPrice: null,
  }
  const restored = restoreContractPaperTrades(JSON.stringify([legacy]))

  assert.equal(restored[0].strategyVersion, 'contract-minute-legacy')
  assert.equal(restored[0].marketSource, 'legacy-unknown')
  assert.equal(restored[0].plannedEntryPrice, 100)
})

const testnetObservation = (overrides = {}) => {
  const isClose =
    overrides.command === 'close' &&
    overrides.plannedAt === undefined &&
    overrides.submittedAt === undefined &&
    overrides.acknowledgedAt === undefined
  return {
    id: 'observation-1',
    tradeId: 'trade-1',
    idempotencyKey: 'command-1',
    costModelVersion: 'cost-v1',
    command: 'open',
    plannedAt: isClose ? '2026-08-22T00:05:00.000Z' : '2026-08-22T00:00:00.000Z',
    submittedAt: isClose ? '2026-08-22T00:05:01.000Z' : '2026-08-22T00:00:01.000Z',
    acknowledgedAt: isClose
      ? '2026-08-22T00:05:01.200Z'
      : '2026-08-22T00:00:01.200Z',
    plannedPrice: 100,
    averageFillPrice: 100.1,
    plannedQuantity: 1,
    filledQuantity: 1,
    commission: 0.05,
    status: 'filled',
    reconciledAt: null,
    ...overrides,
  }
}

const passedDrills = () =>
  ['emergencyClose', 'disableEntries', 'staleMarketCircuitBreaker', 'continuousReconciliation'].map(
    (type) => ({
      type,
      costModelVersion: 'cost-v1',
      performedAt: '2026-08-22T02:00:00.000Z',
      passed: true,
      evidence: `${type}-audit-1`,
    }),
  )

test('testnet calibration measures fill, slippage, latency and recommends a versioned cost model', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      testnetObservation(),
      testnetObservation({
        id: 'observation-2',
        idempotencyKey: 'command-2',
        plannedPrice: 200,
        averageFillPrice: 199.8,
        plannedQuantity: 2,
        filledQuantity: 1,
        acknowledgedAt: '2026-08-22T00:00:01.400Z',
        status: 'partial',
      }),
    ],
    drills: passedDrills(),
  })

  assert.equal(report.observations, 2)
  assert.equal(report.uniqueCommands, 2)
  assert.equal(report.averageSignedSlippageBps, 0)
  assert.equal(report.p95AbsoluteSlippageBps, 10)
  assert.equal(report.averageAcknowledgementLatencyMs, 300)
  assert.equal(report.aggregateFillRatePct, 66.6667)
  assert.match(report.recommendedCostModel.version, /^cost-v1-testnet-2-fnv1a-[0-9a-f]{8}$/)
  assert.deepEqual({ ...report.recommendedCostModel, version: undefined }, {
    version: undefined,
    feeRatePct: 0.05,
    slippageRatePct: 0.1,
    sourceObservations: 2,
    feeSourceObservations: 2,
  })
  assert.equal(report.filledObservations, 2)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('有效成交样本')))
})

test('testnet recommended cost-model version fingerprints evidence content independent of order', () => {
  const first = testnetObservation()
  const second = testnetObservation({
    id: 'observation-2',
    idempotencyKey: 'command-2',
    tradeId: 'trade-2',
  })
  const calibrate = (observations) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations,
      drills: passedDrills(),
    }).recommendedCostModel.version

  const original = calibrate([first, second])
  const reordered = calibrate([second, first])
  const changed = calibrate([first, { ...second, commission: 0.06 }])

  assert.equal(reordered, original)
  assert.notEqual(changed, original)
})

test('testnet calibration blocks conflicting idempotency and unreconciled unknown orders', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      testnetObservation({
        status: 'timeout',
        acknowledgedAt: null,
        averageFillPrice: null,
        filledQuantity: 0,
        commission: 0,
      }),
      testnetObservation({
        id: 'observation-2',
        command: 'close',
        plannedPrice: 101,
      }),
    ],
    drills: [],
  })

  assert.deepEqual(report.idempotencyConflicts, ['command-1'])
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('未完成对账')))
  assert.ok(report.blockers.some((blocker) => blocker.includes('演练证据')))
})

test('testnet calibration does not count rejected commands as filled samples', () => {
  const observations = Array.from({ length: 100 }, (_, index) =>
    testnetObservation({
      id: `observation-${index}`,
      idempotencyKey: `command-${index}`,
      ...(index === 0
        ? {}
        : {
            status: 'rejected',
            averageFillPrice: null,
            filledQuantity: 0,
            commission: 0,
          }),
    }),
  )
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations,
    drills: passedDrills(),
  })

  assert.equal(report.observations, 100)
  assert.equal(report.recommendedCostModel.sourceObservations, 1)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('有效成交样本')))
})

test('testnet calibration requires at least 100 filled observations', () => {
  const calibrateFilled = (count) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: count }, (_, index) =>
        testnetObservation({
          id: `filled-observation-${index}`,
          idempotencyKey: `filled-command-${index}`,
          tradeId: `filled-trade-${Math.floor(index / 2)}`,
          command: index % 2 === 0 ? 'open' : 'close',
        }),
      ),
      drills: passedDrills(),
    })

  const below = calibrateFilled(99)
  const boundary = calibrateFilled(100)

  assert.equal(below.filledObservations, 99)
  assert.equal(below.readyForPaperComparison, false)
  assert.equal(boundary.filledObservations, 100)
  assert.equal(boundary.readyForPaperComparison, true)
})

test('testnet calibration requires actual commission evidence for at least 80% of fills', () => {
  const calibrateCommissionCoverage = (observedCommissionCount) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: 100 }, (_, index) =>
        testnetObservation({
          id: `commission-coverage-observation-${index}`,
          idempotencyKey: `commission-coverage-command-${index}`,
          tradeId: `commission-coverage-trade-${Math.floor(index / 2)}`,
          command: index % 2 === 0 ? 'open' : 'close',
          commission: index < observedCommissionCount ? 0.05 : 0,
        }),
      ),
      drills: passedDrills(),
    })

  const below = calibrateCommissionCoverage(79)
  const boundary = calibrateCommissionCoverage(80)

  assert.equal(below.commissionObservedFillRatePct, 79)
  assert.equal(below.readyForPaperComparison, false)
  assert.ok(below.blockers.some((blocker) => blocker.includes('手续费证据覆盖率低于80%')))
  assert.equal(boundary.commissionObservedFillRatePct, 80)
  assert.equal(boundary.readyForPaperComparison, true)
})

test('testnet calibration cannot use open-only fills as lifecycle evidence', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `open-only-observation-${index}`,
        idempotencyKey: `open-only-command-${index}`,
        command: 'open',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.filledOpenObservations, 100)
  assert.equal(report.filledCloseObservations, 0)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('平仓有效成交样本不足')))
})

test('testnet calibration requires at least 40 open and close fills', () => {
  const calibrateCommands = (openCount, closeCount) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: [
        ...Array.from({ length: openCount }, (_, index) =>
          testnetObservation({
            id: `command-coverage-open-${index}`,
            idempotencyKey: `command-coverage-open-key-${index}`,
            tradeId: `command-coverage-trade-${index}`,
            command: 'open',
          }),
        ),
        ...Array.from({ length: closeCount }, (_, index) =>
          testnetObservation({
            id: `command-coverage-close-${index}`,
            idempotencyKey: `command-coverage-close-key-${index}`,
            tradeId: `command-coverage-trade-${index}`,
            command: 'close',
          }),
        ),
      ],
      drills: passedDrills(),
    })

  const boundary = calibrateCommands(60, 40)
  const below = calibrateCommands(61, 39)

  assert.equal(boundary.filledOpenObservations, 60)
  assert.equal(boundary.filledCloseObservations, 40)
  assert.equal(boundary.completedRoundTrips, 40)
  assert.equal(boundary.readyForPaperComparison, true)
  assert.equal(below.filledCloseObservations, 39)
  assert.equal(below.completedRoundTrips, 39)
  assert.equal(below.readyForPaperComparison, false)
})

test('testnet calibration cannot treat unrelated opens and closes as round trips', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      ...Array.from({ length: 60 }, (_, index) =>
        testnetObservation({
          id: `unpaired-open-${index}`,
          idempotencyKey: `unpaired-open-command-${index}`,
          tradeId: `open-trade-${index}`,
          command: 'open',
        }),
      ),
      ...Array.from({ length: 40 }, (_, index) =>
        testnetObservation({
          id: `unpaired-close-${index}`,
          idempotencyKey: `unpaired-close-command-${index}`,
          tradeId: `close-trade-${index}`,
          command: 'close',
        }),
      ),
    ],
    drills: passedDrills(),
  })

  assert.equal(report.completedRoundTrips, 0)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('完整往返交易不足')))
})

test('testnet calibration cannot count closes submitted before their opens', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      ...Array.from({ length: 60 }, (_, index) =>
        testnetObservation({
          id: `late-open-${index}`,
          idempotencyKey: `late-open-command-${index}`,
          tradeId: `time-order-trade-${index}`,
          command: 'open',
          plannedAt: '2026-08-22T02:00:00.000Z',
          submittedAt: '2026-08-22T02:00:01.000Z',
          acknowledgedAt: '2026-08-22T02:00:01.200Z',
        }),
      ),
      ...Array.from({ length: 40 }, (_, index) =>
        testnetObservation({
          id: `early-close-${index}`,
          idempotencyKey: `early-close-command-${index}`,
          tradeId: `time-order-trade-${index}`,
          command: 'close',
        }),
      ),
    ],
    drills: passedDrills(),
  })

  assert.equal(report.completedRoundTrips, 0)
  assert.equal(report.invalidRoundTripTradeIds.length, 40)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('往返交易时间顺序无效')))
})

test('testnet calibration cannot count materially under-closed positions as round trips', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      ...Array.from({ length: 60 }, (_, index) =>
        testnetObservation({
          id: `quantity-open-${index}`,
          idempotencyKey: `quantity-open-command-${index}`,
          tradeId: `quantity-trade-${index}`,
          command: 'open',
        }),
      ),
      ...Array.from({ length: 40 }, (_, index) =>
        testnetObservation({
          id: `quantity-close-${index}`,
          idempotencyKey: `quantity-close-command-${index}`,
          tradeId: `quantity-trade-${index}`,
          command: 'close',
          plannedQuantity: 0.01,
          filledQuantity: 0.01,
        }),
      ),
    ],
    drills: passedDrills(),
  })

  assert.equal(report.aggregateFillRatePct, 100)
  assert.equal(report.completedRoundTrips, 0)
  assert.equal(report.invalidRoundTripQuantityTradeIds.length, 40)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('往返交易数量未闭合')))
})

test('testnet calibration tolerates numeric dust but rejects material round-trip imbalance', () => {
  const calibrateCloseQuantity = (closeQuantity) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: 100 }, (_, index) =>
        testnetObservation({
          id: `quantity-tolerance-observation-${index}`,
          idempotencyKey: `quantity-tolerance-command-${index}`,
          tradeId: `quantity-tolerance-trade-${Math.floor(index / 2)}`,
          command: index % 2 === 0 ? 'open' : 'close',
          ...(index === 1
            ? { plannedQuantity: closeQuantity, filledQuantity: closeQuantity }
            : {}),
        }),
      ),
      drills: passedDrills(),
    })

  const dust = calibrateCloseQuantity(0.9999995)
  const material = calibrateCloseQuantity(0.999998)

  assert.equal(dust.completedRoundTrips, 50)
  assert.equal(dust.readyForPaperComparison, true)
  assert.deepEqual(material.invalidRoundTripQuantityTradeIds, ['quantity-tolerance-trade-0'])
  assert.equal(material.completedRoundTrips, 49)
  assert.equal(material.readyForPaperComparison, false)
})

test('testnet calibration cannot inflate filled samples by duplicating one command', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `duplicated-command-observation-${index}`,
        idempotencyKey: 'one-command-replayed',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.uniqueCommands, 1)
  assert.deepEqual(report.duplicateIdempotencyKeys, ['one-command-replayed'])
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('重复幂等键')))
})

test('testnet calibration blocks tiny partial fills despite 100 priced executions', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `partial-observation-${index}`,
        idempotencyKey: `partial-command-${index}`,
        status: 'partial',
        filledQuantity: 0.01,
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.filledObservations, 100)
  assert.equal(report.aggregateFillRatePct, 1)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('总成交率')))
})

test('testnet calibration requires at least 95 percent aggregate fill rate', () => {
  const calibrateAtRate = (filledQuantity) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: 100 }, (_, index) =>
        testnetObservation({
          id: `fill-rate-observation-${index}`,
          idempotencyKey: `fill-rate-command-${index}`,
          tradeId: `fill-rate-trade-${Math.floor(index / 2)}`,
          command: index % 2 === 0 ? 'open' : 'close',
          status: filledQuantity === 1 ? 'filled' : 'partial',
          filledQuantity,
        }),
      ),
      drills: passedDrills(),
    })

  const below = calibrateAtRate(0.9499)
  const boundary = calibrateAtRate(0.95)

  assert.equal(below.aggregateFillRatePct, 94.99)
  assert.equal(below.readyForPaperComparison, false)
  assert.equal(boundary.aggregateFillRatePct, 95)
  assert.equal(boundary.readyForPaperComparison, true)
})

test('testnet calibration rejects observations from mixed cost-model cohorts', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `cost-cohort-observation-${index}`,
        idempotencyKey: `cost-cohort-command-${index}`,
        costModelVersion: index === 99 ? 'cost-v2' : 'cost-v1',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('成本模型版本不一致')))
})

test('testnet calibration rejects safety drills from an older cost-model cohort', () => {
  const drills = passedDrills()
  drills[0].costModelVersion = 'cost-v0'
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `drill-cohort-observation-${index}`,
        idempotencyKey: `drill-cohort-command-${index}`,
      }),
    ),
    drills,
  })

  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('安全演练成本模型版本不一致')))
})

test('testnet calibration blocks 100 fills with excessive acknowledgement latency', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `slow-observation-${index}`,
        idempotencyKey: `slow-command-${index}`,
        acknowledgedAt: '2026-08-22T00:00:04.000Z',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.p95AcknowledgementLatencyMs, 3000)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('P95确认延迟')))
})

test('testnet calibration blocks stale plans despite fast acknowledgement', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `slow-submit-observation-${index}`,
        idempotencyKey: `slow-submit-command-${index}`,
        submittedAt: '2026-08-22T00:00:03.000Z',
        acknowledgedAt: '2026-08-22T00:00:03.200Z',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.p95SubmissionLatencyMs, 3000)
  assert.equal(report.p95AcknowledgementLatencyMs, 200)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('P95提交延迟')))
})

test('testnet calibration accepts 2000ms P95 submission latency and rejects 2001ms', () => {
  const calibrateAtTimes = (submittedAt, acknowledgedAt) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: 100 }, (_, index) =>
        testnetObservation(
          index % 2 === 0
            ? {
                id: `submission-boundary-observation-${index}`,
                idempotencyKey: `submission-boundary-command-${index}`,
                tradeId: `submission-boundary-trade-${Math.floor(index / 2)}`,
                command: 'open',
                submittedAt,
                acknowledgedAt,
              }
            : {
                id: `submission-boundary-observation-${index}`,
                idempotencyKey: `submission-boundary-command-${index}`,
                tradeId: `submission-boundary-trade-${Math.floor(index / 2)}`,
                command: 'close',
                plannedAt: '2026-08-22T00:05:00.000Z',
                submittedAt: submittedAt.replace('T00:00:', 'T00:05:'),
                acknowledgedAt: acknowledgedAt.replace('T00:00:', 'T00:05:'),
              },
        ),
      ),
      drills: passedDrills(),
    })

  const boundary = calibrateAtTimes(
    '2026-08-22T00:00:02.000Z',
    '2026-08-22T00:00:02.200Z',
  )
  const above = calibrateAtTimes(
    '2026-08-22T00:00:02.001Z',
    '2026-08-22T00:00:02.201Z',
  )

  assert.equal(boundary.p95SubmissionLatencyMs, 2000)
  assert.equal(boundary.readyForPaperComparison, true)
  assert.equal(above.p95SubmissionLatencyMs, 2001)
  assert.equal(above.readyForPaperComparison, false)
})

test('testnet calibration blocks filled observations without acknowledgement latency', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `missing-latency-observation-${index}`,
        idempotencyKey: `missing-latency-command-${index}`,
        acknowledgedAt: null,
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.filledObservations, 100)
  assert.equal(report.p95AcknowledgementLatencyMs, null)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('确认延迟证据不完整')))
})

test('testnet calibration accepts 2000ms P95 latency and rejects 2001ms', () => {
  const calibrateAtAcknowledgedAt = (acknowledgedAt) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: Array.from({ length: 100 }, (_, index) =>
        testnetObservation(
          index % 2 === 0
            ? {
                id: `latency-boundary-observation-${index}`,
                idempotencyKey: `latency-boundary-command-${index}`,
                tradeId: `latency-boundary-trade-${Math.floor(index / 2)}`,
                command: 'open',
                acknowledgedAt,
              }
            : {
                id: `latency-boundary-observation-${index}`,
                idempotencyKey: `latency-boundary-command-${index}`,
                tradeId: `latency-boundary-trade-${Math.floor(index / 2)}`,
                command: 'close',
                plannedAt: '2026-08-22T00:05:00.000Z',
                submittedAt: '2026-08-22T00:05:01.000Z',
                acknowledgedAt: acknowledgedAt.replace('T00:00:', 'T00:05:'),
              },
        ),
      ),
      drills: passedDrills(),
    })

  const boundary = calibrateAtAcknowledgedAt('2026-08-22T00:00:03.000Z')
  const above = calibrateAtAcknowledgedAt('2026-08-22T00:00:03.001Z')

  assert.equal(boundary.p95AcknowledgementLatencyMs, 2000)
  assert.equal(boundary.readyForPaperComparison, true)
  assert.equal(above.p95AcknowledgementLatencyMs, 2001)
  assert.equal(above.readyForPaperComparison, false)
})

test('testnet calibration blocks high command rejection hidden by quantity fill rate', () => {
  const filled = Array.from({ length: 100 }, (_, index) =>
    testnetObservation({
      id: `accepted-observation-${index}`,
      idempotencyKey: `accepted-command-${index}`,
    }),
  )
  const rejected = Array.from({ length: 20 }, (_, index) =>
    testnetObservation({
      id: `rejected-observation-${index}`,
      idempotencyKey: `rejected-command-${index}`,
      plannedQuantity: 0.001,
      filledQuantity: 0,
      averageFillPrice: null,
      acknowledgedAt: null,
      commission: 0,
      status: 'rejected',
    }),
  )
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [...filled, ...rejected],
    drills: passedDrills(),
  })

  assert.equal(report.aggregateFillRatePct, 99.98)
  assert.equal(report.rejected, 20)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('命令拒绝率')))
})

test('testnet calibration accepts 5 percent rejection rate and rejects above it', () => {
  const calibrateRejections = (filledCount, rejectedCount) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: [
        ...Array.from({ length: filledCount }, (_, index) =>
          testnetObservation({
            id: `rejection-boundary-fill-${index}`,
            idempotencyKey: `rejection-boundary-fill-command-${index}`,
            tradeId: `rejection-boundary-trade-${Math.floor(index / 2)}`,
            command: index % 2 === 0 ? 'open' : 'close',
          }),
        ),
        ...Array.from({ length: rejectedCount }, (_, index) =>
          testnetObservation({
            id: `rejection-boundary-reject-${index}`,
            idempotencyKey: `rejection-boundary-reject-command-${index}`,
            plannedQuantity: 0.001,
            filledQuantity: 0,
            averageFillPrice: null,
            acknowledgedAt: null,
            commission: 0,
            status: 'rejected',
          }),
        ),
      ],
      drills: passedDrills(),
    })

  const boundary = calibrateRejections(190, 10)
  const above = calibrateRejections(189, 11)

  assert.equal(boundary.rejectionRatePct, 5)
  assert.equal(boundary.readyForPaperComparison, true)
  assert.equal(above.rejectionRatePct, 5.5)
  assert.equal(above.readyForPaperComparison, false)
})

test('testnet calibration counts reconciled timeout recovery without mixing execution modes', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: [
      testnetObservation({
        status: 'reconciled',
        acknowledgedAt: null,
        averageFillPrice: 100.2,
        reconciledAt: '2026-08-22T00:05:00.000Z',
      }),
    ],
    drills: passedDrills(),
  })

  assert.equal(report.recoveredUnknown, 1)
  assert.equal(report.reconciliationRecoveryPct, 100)
  assert.equal(report.filledObservations, 1)
  assert.equal(report.readyForPaperComparison, false)
})

test('testnet calibration rejects reconciled status without a reconciliation timestamp', () => {
  assert.throws(
    () =>
      calibrateTestnetExecution({
        currentCostModelVersion: 'cost-v1',
        observations: Array.from({ length: 100 }, (_, index) =>
          testnetObservation({
            id: `false-reconciled-observation-${index}`,
            idempotencyKey: `false-reconciled-command-${index}`,
            status: 'reconciled',
            reconciledAt: null,
          }),
        ),
        drills: passedDrills(),
      }),
    /对账状态与时间不一致/,
  )
})

test('testnet calibration blocks fills that depend heavily on exception recovery', () => {
  const report = calibrateTestnetExecution({
    currentCostModelVersion: 'cost-v1',
    observations: Array.from({ length: 100 }, (_, index) =>
      testnetObservation({
        id: `recovered-observation-${index}`,
        idempotencyKey: `recovered-command-${index}`,
        status: 'reconciled',
        reconciledAt: '2026-08-22T00:05:00.000Z',
      }),
    ),
    drills: passedDrills(),
  })

  assert.equal(report.recoveryDependencyRatePct, 100)
  assert.equal(report.readyForPaperComparison, false)
  assert.ok(report.blockers.some((blocker) => blocker.includes('异常恢复依赖率')))
})

test('testnet calibration accepts 5 percent recovery dependency and rejects above it', () => {
  const calibrateRecoveries = (normalCount, recoveredCount) =>
    calibrateTestnetExecution({
      currentCostModelVersion: 'cost-v1',
      observations: [
        ...Array.from({ length: normalCount }, (_, index) =>
          testnetObservation({
            id: `recovery-boundary-normal-${index}`,
            idempotencyKey: `recovery-boundary-normal-command-${index}`,
            tradeId: `recovery-boundary-trade-${Math.floor(index / 2)}`,
            command: index % 2 === 0 ? 'open' : 'close',
          }),
        ),
        ...Array.from({ length: recoveredCount }, (_, index) =>
          testnetObservation({
            id: `recovery-boundary-recovered-${index}`,
            idempotencyKey: `recovery-boundary-recovered-command-${index}`,
            command: index % 2 === 0 ? 'open' : 'close',
            status: 'reconciled',
            reconciledAt: '2026-08-22T00:06:00.000Z',
          }),
        ),
      ],
      drills: passedDrills(),
    })

  const boundary = calibrateRecoveries(190, 10)
  const above = calibrateRecoveries(189, 11)

  assert.equal(boundary.recoveryDependencyRatePct, 5)
  assert.equal(boundary.readyForPaperComparison, true)
  assert.equal(above.recoveryDependencyRatePct, 5.5)
  assert.equal(above.readyForPaperComparison, false)
})

test('testnet calibration evidence recalculates raw observations and rejects report tampering', () => {
  const calibrationInput = {
    currentCostModelVersion: 'cost-v1',
    observations: [testnetObservation()],
    drills: [],
  }
  const evidence = buildTestnetExecutionCalibrationEvidence(calibrationInput)

  assert.deepEqual(parseTestnetExecutionCalibrationEvidence(JSON.stringify(evidence)), evidence)
  evidence.report.observations = 999
  assert.throws(
    () => parseTestnetExecutionCalibrationEvidence(JSON.stringify(evidence)),
    /重算结果不一致/,
  )
})

test('testnet calibration evidence rejects an acknowledgement before submission', () => {
  assert.throws(
    () =>
      buildTestnetExecutionCalibrationEvidence({
        currentCostModelVersion: 'cost-v1',
        observations: [
          testnetObservation({
            submittedAt: '2026-08-22T00:00:02.000Z',
            acknowledgedAt: '2026-08-22T00:00:01.000Z',
          }),
        ],
        drills: [],
      }),
    /时间顺序无效/,
  )
})

test('testnet calibration evidence rejects unsupported runtime command and status values', () => {
  for (const observation of [
    testnetObservation({ command: 'withdraw' }),
    testnetObservation({ status: 'assumed-filled' }),
  ]) {
    assert.throws(
      () =>
        buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [observation],
          drills: [],
        }),
      /命令或状态无效/,
    )
  }
  assert.throws(
    () =>
      buildTestnetExecutionCalibrationEvidence({
        currentCostModelVersion: 'cost-v1',
        observations: [testnetObservation({ costModelVersion: '' })],
        drills: [],
      }),
    /成本模型版本不能为空/,
  )
})

test('testnet calibration evidence rejects impossible fill prices, quantities and commissions', () => {
  for (const observation of [
    testnetObservation({ averageFillPrice: -1 }),
    testnetObservation({ filledQuantity: Number.NaN }),
    testnetObservation({ commission: -0.01 }),
  ]) {
    assert.throws(
      () =>
        buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [observation],
          drills: [],
        }),
      /价格、数量或手续费无效/,
    )
  }
})

test('testnet calibration rejects non-fill statuses carrying fabricated fill data', () => {
  for (const status of ['rejected', 'timeout', 'unknown']) {
    assert.throws(
      () =>
        calibrateTestnetExecution({
          currentCostModelVersion: 'cost-v1',
          observations: [
            testnetObservation({
              status,
              reconciledAt: null,
            }),
          ],
          drills: passedDrills(),
        }),
      /执行状态与成交数据不一致/,
    )
  }
})

test('testnet calibration rejects fill statuses without positive fill data', () => {
  for (const status of ['filled', 'partial', 'reconciled']) {
    assert.throws(
      () =>
        calibrateTestnetExecution({
          currentCostModelVersion: 'cost-v1',
          observations: [
            testnetObservation({
              status,
              averageFillPrice: null,
              filledQuantity: 0,
              commission: 0,
              reconciledAt:
                status === 'reconciled' ? '2026-08-22T00:05:00.000Z' : null,
            }),
          ],
          drills: passedDrills(),
        }),
      /执行状态与成交数据不一致/,
    )
  }
})

test('testnet calibration evidence rejects malformed safety drill records', () => {
  for (const drill of [
    { type: 'withdrawFunds', performedAt: '2026-08-22T02:00:00.000Z', passed: true, evidence: 'ticket-1' },
    { type: 'emergencyClose', performedAt: 'not-a-time', passed: true, evidence: 'ticket-2' },
    { type: 'emergencyClose', performedAt: '2026-08-22T02:00:00.000Z', passed: 'yes', evidence: 'ticket-3' },
    { type: 'emergencyClose', performedAt: '2026-08-22T02:00:00.000Z', passed: true, evidence: 42 },
  ]) {
    assert.throws(
      () =>
        buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [],
          drills: [drill],
        }),
      /演练记录无效/,
    )
  }
})

const readinessInput = (overrides = {}) => ({
  thresholds: { ...liveTradingReadinessThresholds },
  backtest: {
    holdoutStatus: 'supported',
    holdoutSamples: 120,
    holdoutDays: 120,
    averageNetReturnPct: 0.2,
    maximumDrawdownPct: 8,
  },
  paper: { status: 'stable', samples: 110, returnDeltaPct: -0.2 },
  testnet: {
    readyForPaperComparison: true,
    observations: 120,
    filledObservations: 120,
    unresolvedOrders: 0,
  },
  accountControls: {
    isolatedAccount: true,
    withdrawalsDisabled: true,
    ipAllowlist: true,
    leastPrivilegeKey: true,
  },
  riskControls: {
    perTradeLimit: true,
    dailyLossLimit: true,
    directionalExposureLimit: true,
    portfolioExposureLimit: true,
    humanKillSwitch: true,
    anomalyCircuitBreaker: true,
    idempotentOrders: true,
    continuousReconciliation: true,
  },
  eligibility: {
    jurisdictionConfirmed: true,
    accountEligible: true,
    productEligible: true,
  },
  ...overrides,
})

test('live readiness can only make a system eligible for separate human review', () => {
  const evidence = readinessInput()
  const report = assessLiveTradingReadiness(evidence)
  const exported = JSON.parse(buildLiveTradingReadinessExport(evidence, report))

  assert.equal(report.evidenceLevel, 'reviewEligible')
  assert.equal(report.decision, 'eligibleForHumanReview')
  assert.equal(report.liveTradingAuthorized, false)
  assert.equal(report.blockers.length, 0)
  assert.ok(report.prohibitions.some((item) => item.includes('不授权真实资金交易')))
  assert.equal(exported.authorization, 'human-review-only')
  assert.equal(exported.report.liveTradingAuthorized, false)
  assert.throws(
    () =>
      buildLiveTradingReadinessExport(evidence, {
        ...report,
        decision: 'notReady',
      }),
    /报告与固定政策重算结果不一致/,
  )
})

test('live readiness rejects thresholds weakened by imported evidence', () => {
  const weakened = readinessInput({
    thresholds: {
      minimumHoldoutSamples: 1,
      minimumHoldoutDays: 1,
      maximumHoldoutDrawdownPct: 100,
      minimumPaperSamples: 1,
      maximumPaperReturnDegradationPct: 100,
      minimumTestnetFilledObservations: 1,
    },
  })

  assert.throws(() => assessLiveTradingReadiness(weakened), /固定政策不一致/)
})

test('live readiness defaults to research when holdout, paper, testnet and eligibility are incomplete', () => {
  const report = assessLiveTradingReadiness(
    readinessInput({
      backtest: {
        holdoutStatus: 'insufficient',
        holdoutSamples: 0,
        holdoutDays: 0,
        averageNetReturnPct: null,
        maximumDrawdownPct: 0,
      },
      paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
      testnet: {
        readyForPaperComparison: false,
        observations: 0,
        filledObservations: 0,
        unresolvedOrders: 1,
      },
      eligibility: {
        jurisdictionConfirmed: false,
        accountEligible: false,
        productEligible: false,
      },
    }),
  )

  assert.equal(report.evidenceLevel, 'research')
  assert.equal(report.decision, 'notReady')
  assert.equal(report.liveTradingAuthorized, false)
  assert.ok(report.blockers.some((item) => item.includes('资格确认缺失')))
})

test('live readiness evidence levels cannot skip backtest or paper gates', () => {
  const missingBacktest = assessLiveTradingReadiness(
    readinessInput({
      backtest: {
        holdoutStatus: 'insufficient',
        holdoutSamples: 0,
        holdoutDays: 0,
        averageNetReturnPct: null,
        maximumDrawdownPct: 0,
      },
    }),
  )
  const missingPaper = assessLiveTradingReadiness(
    readinessInput({
      paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    }),
  )

  assert.equal(missingBacktest.evidenceLevel, 'research')
  assert.equal(missingPaper.evidenceLevel, 'research')
  assert.equal(missingBacktest.decision, 'notReady')
  assert.equal(missingPaper.decision, 'notReady')
})

test('manual review attestations require evidence and expire after the validity window', () => {
  const now = new Date('2026-08-22T00:00:00.000Z')
  const empty = createTradingReviewChecklist(now)
  const missingEvidence = confirmTradingReviewAttestation(
    empty,
    'accountControls',
    'isolatedAccount',
    true,
    'short',
    now,
  )
  const valid = confirmTradingReviewAttestation(
    empty,
    'accountControls',
    'isolatedAccount',
    true,
    '独立Testnet账户截图与复核工单 #42',
    now,
  )

  assert.equal(evaluateTradingReviewChecklist(missingEvidence, now).validCount, 0)
  assert.deepEqual(evaluateTradingReviewChecklist(missingEvidence, now).missingEvidenceKeys, [
    'isolatedAccount',
  ])
  assert.equal(evaluateTradingReviewChecklist(valid, now).accountControls.isolatedAccount, true)
  assert.equal(
    evaluateTradingReviewChecklist(valid, new Date('2026-09-22T00:00:00.001Z')).accountControls
      .isolatedAccount,
    false,
  )
})

test('manual review checklist parser rejects missing or duplicate controls', () => {
  const checklist = createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z'))
  assert.deepEqual(parseTradingReviewChecklist(JSON.stringify(checklist)), checklist)
  assert.throws(
    () => parseTradingReviewChecklist(JSON.stringify({ ...checklist, validityDays: 365 })),
    /结构或版本无效/,
  )
  checklist.attestations.pop()
  assert.throws(() => parseTradingReviewChecklist(JSON.stringify(checklist)), /结构或版本无效/)
})

test('saving an unchanged manual attestation preserves its original audit timestamp', () => {
  const initialAt = new Date('2026-08-22T00:00:00.000Z')
  const savedAt = new Date('2026-08-23T00:00:00.000Z')
  const confirmed = confirmTradingReviewAttestation(
    createTradingReviewChecklist(initialAt),
    'riskControls',
    'humanKillSwitch',
    true,
    'Testnet紧急停止演练工单 #77',
    initialAt,
  )
  const draft = confirmed.attestations.map(({ category, key, confirmed, evidence }) => ({
    category,
    key,
    confirmed,
    evidence,
  }))
  const resaved = applyTradingReviewChecklistDraft(confirmed, draft, savedAt)

  assert.equal(
    resaved.attestations.find((item) => item.key === 'humanKillSwitch').confirmedAt,
    initialAt.toISOString(),
  )
  assert.equal(resaved.updatedAt, savedAt.toISOString())
})

test('combined review package rechecks backtest, attestations and readiness on import', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const backtestInput = input()
  const backtestReport = runContractStrategyBacktest(backtestInput)
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const paperDriftInput = {
    minimumSamples: 100,
    maximumExpectedReturnDegradationPct: 0.5,
    maximumWinRateDegradationPct: 5,
    maximumDrawdownIncreasePct: 3,
    cycleToleranceMinutes: 2,
    references: [],
    paperTrades: [],
    expectedCycleAts: ['2026-08-22T00:00:00.000Z'],
    observedCycleAts: [],
    dataGaps: [
      {
        startAt: '2026-08-22T00:00:00.000Z',
        endAt: '2026-08-22T00:05:00.000Z',
        reason: 'network',
      },
    ],
  }
  const paperDriftReport = analyzeContractPaperDrift(paperDriftInput)
  const holdout = backtestReport.segments.holdout
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: holdout.metrics.status,
      holdoutSamples: holdout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil((Date.parse(holdout.endAt) - Date.parse(holdout.startAt)) / 86_400_000),
      ),
      averageNetReturnPct: holdout.metrics.averageNetReturnPct,
      maximumDrawdownPct: holdout.metrics.maximumDrawdownPct,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const reviewPackage = await buildTradingReviewPackage({
    generatedAt,
    backtest: { schemaVersion: 1, input: backtestInput, report: backtestReport },
    paperDrift: { input: paperDriftInput, report: paperDriftReport },
    testnet: null,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
  })

  assert.deepEqual(await parseTradingReviewPackage(JSON.stringify(reviewPackage)), reviewPackage)
  assert.match(reviewPackage.contentDigest, /^sha256-[0-9a-f]{64}$/)
  assert.equal(reviewPackage.authorization, 'human-review-only')
  assert.equal(reviewPackage.readinessReport.liveTradingAuthorized, false)
  const weakenedPaperPolicy = structuredClone(reviewPackage)
  weakenedPaperPolicy.evidence.paperDrift.input.maximumWinRateDegradationPct = 50
  const weakenedPaperPolicyBase = structuredClone(weakenedPaperPolicy)
  delete weakenedPaperPolicyBase.contentDigest
  weakenedPaperPolicy.contentDigest = `sha256-${createHash('sha256')
    .update(JSON.stringify(weakenedPaperPolicyBase))
    .digest('hex')}`
  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(weakenedPaperPolicy)),
    /Paper偏差政策不一致/,
  )
})

test('combined review package rejects backtest costs below the fixed floor', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const backtestInput = input({
    costModel: {
      version: 'zero-cost-v1',
      feeRatePct: 0,
      slippageRatePct: 0,
      fundingRatePct: 0,
      fundingSettlements: 0,
    },
  })
  const backtestReport = runContractStrategyBacktest(backtestInput)
  const holdout = backtestReport.segments.holdout
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: holdout.metrics.status,
      holdoutSamples: holdout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil((Date.parse(holdout.endAt) - Date.parse(holdout.startAt)) / 86_400_000),
      ),
      averageNetReturnPct: holdout.metrics.averageNetReturnPct,
      maximumDrawdownPct: holdout.metrics.maximumDrawdownPct,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })

  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        generatedAt,
        backtest: { schemaVersion: 1, input: backtestInput, report: backtestReport },
        paperDrift: null,
        testnet: null,
        reviewChecklist: checklist,
        readinessInput: evidence,
        readinessReport: assessLiveTradingReadiness(evidence),
      }),
    /回测成本政策不一致/,
  )

  for (const costModel of [
    { ...backtestInput.costModel, version: 'low-fee-v1', feeRatePct: 0.0499 },
    { ...backtestInput.costModel, version: 'low-slippage-v1', slippageRatePct: 0.0499 },
  ]) {
    const lowCostInput = input({ costModel })
    await assert.rejects(
      () =>
        buildTradingReviewPackage({
          generatedAt,
          backtest: {
            schemaVersion: 1,
            input: lowCostInput,
            report: runContractStrategyBacktest(lowCostInput),
          },
          paperDrift: null,
          testnet: null,
          reviewChecklist: checklist,
          readinessInput: evidence,
          readinessReport: assessLiveTradingReadiness(evidence),
        }),
      /回测成本政策不一致/,
    )
  }
})

test('combined review package v2 binds a verified external audit checkpoint', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: 'insufficient',
      holdoutSamples: 0,
      holdoutDays: 0,
      averageNetReturnPct: null,
      maximumDrawdownPct: 0,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt,
    revision: 1,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 1,
    chainStatus: 'valid',
  })
  const reviewPackage = await buildTradingReviewPackage({
    schemaVersion: 2,
    generatedAt,
    backtest: null,
    paperDrift: null,
    testnet: null,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
    cloudAudit: {
      checkpoint,
      verification: {
        valid: true,
        checkpointRevision: 1,
        currentRevision: 2,
        isCurrentHead: false,
        message: '外部检查点是当前审计链的有效历史祖先',
      },
      verifiedAt: '2026-08-22T00:10:00.000Z',
    },
  })

  const parsed = await parseTradingReviewPackage(JSON.stringify(reviewPackage))

  assert.equal(parsed.schemaVersion, 2)
  assert.equal(parsed.cloudAudit?.checkpoint.revision, 1)
  assert.equal(parsed.cloudAudit?.verification.currentRevision, 2)
  assert.equal(parsed.cloudAudit?.verificationScope, 'server-response-not-signature')
})

test('combined review package v3 rejects forged Testnet metrics after outer digest replacement', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const testnet = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [testnetObservation()],
    drills: [],
  })
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: 'insufficient',
      holdoutSamples: 0,
      holdoutDays: 0,
      averageNetReturnPct: null,
      maximumDrawdownPct: 0,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: testnet.report.readyForPaperComparison,
      observations: testnet.report.observations,
      filledObservations: testnet.report.filledObservations,
      unresolvedOrders: testnet.report.timedOut + testnet.report.unknown,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const reviewPackage = await buildTradingReviewPackage({
    schemaVersion: 3,
    generatedAt,
    backtest: null,
    paperDrift: null,
    testnet,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
  })
  assert.deepEqual(await parseTradingReviewPackage(JSON.stringify(reviewPackage)), reviewPackage)
  assert.equal(reviewPackage.schemaVersion, 3)
  const forged = structuredClone(reviewPackage)
  forged.evidence.testnet.report.observations = 999
  forged.readinessInput.testnet.observations = 999
  forged.readinessReport = assessLiveTradingReadiness(forged.readinessInput)
  const base = structuredClone(forged)
  delete base.contentDigest
  forged.contentDigest = `sha256-${createHash('sha256').update(JSON.stringify(base)).digest('hex')}`

  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(forged)),
    /Testnet校准证据与原始输入重算结果不一致/,
  )
})

test('combined review package rejects backtest and Paper costs below Testnet calibration', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const backtestInput = input()
  const backtestReport = runContractStrategyBacktest(backtestInput)
  const holdout = backtestReport.segments.holdout
  const testnet = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [testnetObservation()],
    drills: [],
  })
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: holdout.metrics.status,
      holdoutSamples: holdout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil((Date.parse(holdout.endAt) - Date.parse(holdout.startAt)) / 86_400_000),
      ),
      averageNetReturnPct: holdout.metrics.averageNetReturnPct,
      maximumDrawdownPct: holdout.metrics.maximumDrawdownPct,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: testnet.report.readyForPaperComparison,
      observations: testnet.report.observations,
      filledObservations: testnet.report.filledObservations,
      unresolvedOrders: testnet.report.timedOut + testnet.report.unknown,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })

  assert.equal(testnet.report.recommendedCostModel.slippageRatePct, 0.1)
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 3,
        generatedAt,
        backtest: { schemaVersion: 1, input: backtestInput, report: backtestReport },
        paperDrift: null,
        testnet,
        reviewChecklist: checklist,
        readinessInput: evidence,
        readinessReport: assessLiveTradingReadiness(evidence),
      }),
    /回测滑点低于Testnet校准建议/,
  )

  const highFeeTestnet = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [testnetObservation({ commission: 0.2 })],
    drills: [],
  })
  const slippageCoveredInput = input({
    costModel: { ...backtestInput.costModel, slippageRatePct: 0.1 },
  })
  const slippageCoveredReport = runContractStrategyBacktest(slippageCoveredInput)
  const slippageCoveredHoldout = slippageCoveredReport.segments.holdout
  const highFeeEvidence = readinessInput({
    ...evidence,
    backtest: {
      holdoutStatus: slippageCoveredHoldout.metrics.status,
      holdoutSamples: slippageCoveredHoldout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil(
          (Date.parse(slippageCoveredHoldout.endAt) -
            Date.parse(slippageCoveredHoldout.startAt)) /
            86_400_000,
        ),
      ),
      averageNetReturnPct: slippageCoveredHoldout.metrics.averageNetReturnPct,
      maximumDrawdownPct: slippageCoveredHoldout.metrics.maximumDrawdownPct,
    },
  })
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 2,
        generatedAt,
        backtest: {
          schemaVersion: 1,
          input: slippageCoveredInput,
          report: slippageCoveredReport,
        },
        paperDrift: null,
        testnet: highFeeTestnet.report,
        reviewChecklist: checklist,
        readinessInput: highFeeEvidence,
        readinessReport: assessLiveTradingReadiness(highFeeEvidence),
      }),
    /回测手续费低于Testnet校准建议/,
  )
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 3,
        generatedAt,
        backtest: {
          schemaVersion: 1,
          input: slippageCoveredInput,
          report: slippageCoveredReport,
        },
        paperDrift: null,
        testnet: highFeeTestnet,
        reviewChecklist: checklist,
        readinessInput: highFeeEvidence,
        readinessReport: assessLiveTradingReadiness(highFeeEvidence),
      }),
    /回测手续费低于Testnet实测费率/,
  )

  const feeCoveredInput = input({
    costModel: { ...backtestInput.costModel, feeRatePct: 0.2, slippageRatePct: 0.1 },
  })
  const feeCoveredReport = runContractStrategyBacktest(feeCoveredInput)
  const feeCoveredHoldout = feeCoveredReport.segments.holdout
  const feeCoveredEvidence = readinessInput({
    ...highFeeEvidence,
    backtest: {
      holdoutStatus: feeCoveredHoldout.metrics.status,
      holdoutSamples: feeCoveredHoldout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil(
          (Date.parse(feeCoveredHoldout.endAt) - Date.parse(feeCoveredHoldout.startAt)) /
            86_400_000,
        ),
      ),
      averageNetReturnPct: feeCoveredHoldout.metrics.averageNetReturnPct,
      maximumDrawdownPct: feeCoveredHoldout.metrics.maximumDrawdownPct,
    },
  })
  const lowCostPaperInput = {
    minimumSamples: 100,
    maximumExpectedReturnDegradationPct: 0.5,
    maximumWinRateDegradationPct: 5,
    maximumDrawdownIncreasePct: 3,
    cycleToleranceMinutes: 2,
    references: [],
    paperTrades: [
      {
        id: 'low-cost-paper-1',
        strategyVersion: 'contract-v1',
        signalVersion: 'signal-v1',
        pathId: 'path-v1',
        marketSource: 'binance-futures-public',
        costModelVersion: 'paper-cost-v1',
        feeRatePct: 0.05,
        slippageRatePct: 0.1,
        plannedAt: '2026-08-22T00:00:00.000Z',
        closedAt: '2026-08-22T00:05:00.000Z',
        plannedEntryPrice: 100,
        paperEntryPrice: 100,
        netReturnPct: 0,
      },
    ],
    expectedCycleAts: [],
    observedCycleAts: [],
    dataGaps: [],
  }
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 3,
        generatedAt,
        backtest: { schemaVersion: 1, input: feeCoveredInput, report: feeCoveredReport },
        paperDrift: {
          input: lowCostPaperInput,
          report: analyzeContractPaperDrift(lowCostPaperInput),
        },
        testnet: highFeeTestnet,
        reviewChecklist: checklist,
        readinessInput: feeCoveredEvidence,
        readinessReport: assessLiveTradingReadiness(feeCoveredEvidence),
      }),
    /Paper手续费低于Testnet校准建议/,
  )
  const lowSlippagePaperInput = structuredClone(lowCostPaperInput)
  lowSlippagePaperInput.paperTrades[0].feeRatePct = 0.2
  lowSlippagePaperInput.paperTrades[0].slippageRatePct = 0.05
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 3,
        generatedAt,
        backtest: { schemaVersion: 1, input: feeCoveredInput, report: feeCoveredReport },
        paperDrift: {
          input: lowSlippagePaperInput,
          report: analyzeContractPaperDrift(lowSlippagePaperInput),
        },
        testnet: highFeeTestnet,
        reviewChecklist: checklist,
        readinessInput: feeCoveredEvidence,
        readinessReport: assessLiveTradingReadiness(feeCoveredEvidence),
      }),
    /Paper滑点低于Testnet校准建议/,
  )
  const missingCostPaperInput = structuredClone(lowCostPaperInput)
  delete missingCostPaperInput.paperTrades[0].feeRatePct
  delete missingCostPaperInput.paperTrades[0].slippageRatePct
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        schemaVersion: 3,
        generatedAt,
        backtest: { schemaVersion: 1, input: feeCoveredInput, report: feeCoveredReport },
        paperDrift: {
          input: missingCostPaperInput,
          report: analyzeContractPaperDrift(missingCostPaperInput),
        },
        testnet: highFeeTestnet,
        reviewChecklist: checklist,
        readinessInput: feeCoveredEvidence,
        readinessReport: assessLiveTradingReadiness(feeCoveredEvidence),
      }),
    /Paper手续费低于Testnet校准建议或缺少成本证据/,
  )
  const feeCoveredPackage = await buildTradingReviewPackage({
    schemaVersion: 3,
    generatedAt,
    backtest: { schemaVersion: 1, input: feeCoveredInput, report: feeCoveredReport },
    paperDrift: null,
    testnet: highFeeTestnet,
    reviewChecklist: checklist,
    readinessInput: feeCoveredEvidence,
    readinessReport: assessLiveTradingReadiness(feeCoveredEvidence),
  })
  const forgedFee = structuredClone(feeCoveredPackage)
  forgedFee.evidence.backtest.input.costModel.feeRatePct = 0.05
  forgedFee.evidence.backtest.report = runContractStrategyBacktest(forgedFee.evidence.backtest.input)
  const forgedFeeHoldout = forgedFee.evidence.backtest.report.segments.holdout
  forgedFee.readinessInput.backtest.averageNetReturnPct =
    forgedFeeHoldout.metrics.averageNetReturnPct
  forgedFee.readinessInput.backtest.maximumDrawdownPct =
    forgedFeeHoldout.metrics.maximumDrawdownPct
  forgedFee.readinessReport = assessLiveTradingReadiness(forgedFee.readinessInput)
  const forgedFeeBase = structuredClone(forgedFee)
  delete forgedFeeBase.contentDigest
  forgedFee.contentDigest = `sha256-${createHash('sha256')
    .update(JSON.stringify(forgedFeeBase))
    .digest('hex')}`
  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(forgedFee)),
    /回测手续费低于Testnet实测费率/,
  )

  const calibratedBacktestInput = input({
    costModel: { ...backtestInput.costModel, slippageRatePct: 0.1 },
  })
  const calibratedBacktestReport = runContractStrategyBacktest(calibratedBacktestInput)
  const calibratedHoldout = calibratedBacktestReport.segments.holdout
  const calibratedEvidence = readinessInput({
    ...evidence,
    backtest: {
      holdoutStatus: calibratedHoldout.metrics.status,
      holdoutSamples: calibratedHoldout.metrics.trades,
      holdoutDays: Math.max(
        1,
        Math.ceil(
          (Date.parse(calibratedHoldout.endAt) - Date.parse(calibratedHoldout.startAt)) /
            86_400_000,
        ),
      ),
      averageNetReturnPct: calibratedHoldout.metrics.averageNetReturnPct,
      maximumDrawdownPct: calibratedHoldout.metrics.maximumDrawdownPct,
    },
  })
  const reviewPackage = await buildTradingReviewPackage({
    schemaVersion: 3,
    generatedAt,
    backtest: {
      schemaVersion: 1,
      input: calibratedBacktestInput,
      report: calibratedBacktestReport,
    },
    paperDrift: null,
    testnet,
    reviewChecklist: checklist,
    readinessInput: calibratedEvidence,
    readinessReport: assessLiveTradingReadiness(calibratedEvidence),
  })
  assert.deepEqual(await parseTradingReviewPackage(JSON.stringify(reviewPackage)), reviewPackage)

  const forged = structuredClone(reviewPackage)
  forged.evidence.backtest.input.costModel.slippageRatePct = 0.05
  forged.evidence.backtest.report = runContractStrategyBacktest(forged.evidence.backtest.input)
  const forgedHoldout = forged.evidence.backtest.report.segments.holdout
  forged.readinessInput.backtest.averageNetReturnPct = forgedHoldout.metrics.averageNetReturnPct
  forged.readinessInput.backtest.maximumDrawdownPct = forgedHoldout.metrics.maximumDrawdownPct
  forged.readinessReport = assessLiveTradingReadiness(forged.readinessInput)
  const forgedBase = structuredClone(forged)
  delete forgedBase.contentDigest
  forged.contentDigest = `sha256-${createHash('sha256')
    .update(JSON.stringify(forgedBase))
    .digest('hex')}`
  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(forged)),
    /回测滑点低于Testnet校准建议/,
  )
})

test('legacy review packages with Testnet summary are not treated as current evidence', () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      schemaVersion: 2,
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        testnet: calibrateTestnetExecution({
          currentCostModelVersion: 'cost-v1',
          observations: [testnetObservation()],
          drills: [],
        }),
      },
    },
    new Date(generatedAt),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['legacy-testnet-not-recomputable'])
})

test('new review package cannot make old Testnet observations current again', () => {
  const generatedAt = '2026-09-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      schemaVersion: 3,
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        testnet: buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [testnetObservation()],
          drills: [],
        }),
      },
    },
    new Date(generatedAt),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['testnet-observations-stale'])
})

test('Testnet evidence is stale when any calibration observation is older than 30 days', () => {
  const oldObservation = testnetObservation({
    id: 'old-observation',
    idempotencyKey: 'old-command',
    plannedAt: '2026-08-01T00:00:00.000Z',
    submittedAt: '2026-08-01T00:00:01.000Z',
    acknowledgedAt: '2026-08-01T00:00:01.200Z',
  })
  const recentObservation = testnetObservation({
    id: 'recent-observation',
    idempotencyKey: 'recent-command',
    plannedAt: '2026-09-22T00:00:00.000Z',
    submittedAt: '2026-09-22T00:00:01.000Z',
    acknowledgedAt: '2026-09-22T00:00:01.200Z',
  })
  const evidence = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [oldObservation, recentObservation],
    drills: [],
  })

  const result = assessTestnetExecutionCalibrationEvidenceCurrency(
    evidence,
    new Date('2026-09-22T00:05:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['observations-stale'])
})

test('Testnet evidence query window starts exactly 30 days before collection', () => {
  assert.equal(
    testnetExecutionEvidenceWindowStartAt(new Date('2026-09-22T00:00:00.000Z')),
    '2026-08-23T00:00:00.000Z',
  )
})

test('new review package cannot make old Testnet safety drills current again', () => {
  const generatedAt = '2026-09-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      schemaVersion: 3,
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        testnet: buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [],
          drills: passedDrills(),
        }),
      },
    },
    new Date(generatedAt),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['testnet-drills-stale'])
})

test('review package rejects Testnet observations and drills beyond clock-skew tolerance', () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      schemaVersion: 3,
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        testnet: buildTestnetExecutionCalibrationEvidence({
          currentCostModelVersion: 'cost-v1',
          observations: [
            testnetObservation({
              plannedAt: '2026-08-22T00:59:00.000Z',
              submittedAt: '2026-08-22T01:00:00.000Z',
              acknowledgedAt: '2026-08-22T01:00:01.000Z',
            }),
          ],
          drills: passedDrills().map((drill) => ({
            ...drill,
            performedAt: '2026-08-22T01:00:00.000Z',
          })),
        }),
      },
    },
    new Date(generatedAt),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, [
    'testnet-observations-in-future',
    'testnet-drills-in-future',
  ])
})

test('Testnet evidence currency rejects a future acknowledgement on a current submission', () => {
  const evidence = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [
      testnetObservation({
        acknowledgedAt: '2026-08-22T00:10:00.000Z',
      }),
    ],
    drills: [],
  })

  const result = assessTestnetExecutionCalibrationEvidenceCurrency(
    evidence,
    new Date('2026-08-22T00:00:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['observations-in-future'])
})

test('Testnet evidence currency rejects a future reconciliation on a current submission', () => {
  const evidence = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [
      testnetObservation({
        status: 'reconciled',
        reconciledAt: '2026-08-22T00:10:00.000Z',
      }),
    ],
    drills: [],
  })

  const result = assessTestnetExecutionCalibrationEvidenceCurrency(
    evidence,
    new Date('2026-08-22T00:00:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['observations-in-future'])
})

test('Testnet observation clock-skew tolerance accepts 5 minutes and rejects 1ms above', () => {
  const assessAcknowledgedAt = (acknowledgedAt) =>
    assessTestnetExecutionCalibrationEvidenceCurrency(
      buildTestnetExecutionCalibrationEvidence({
        currentCostModelVersion: 'cost-v1',
        observations: [testnetObservation({ acknowledgedAt })],
        drills: [],
      }),
      new Date('2026-08-22T00:00:00.000Z'),
    )

  const boundary = assessAcknowledgedAt('2026-08-22T00:05:00.000Z')
  const above = assessAcknowledgedAt('2026-08-22T00:05:00.001Z')

  assert.equal(boundary.status, 'current')
  assert.deepEqual(boundary.reasons, [])
  assert.equal(above.status, 'stale')
  assert.deepEqual(above.reasons, ['observations-in-future'])
})

test('Testnet evidence currency exposes stale raw inputs to live readiness consumers', () => {
  const evidence = buildTestnetExecutionCalibrationEvidence({
    currentCostModelVersion: 'cost-v1',
    observations: [testnetObservation()],
    drills: passedDrills(),
  })
  const result = assessTestnetExecutionCalibrationEvidenceCurrency(
    evidence,
    new Date('2026-09-22T00:00:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['observations-stale', 'drills-stale'])
})

test('combined review package cloud audit is only online-verified by a matching server result', async () => {
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt: '2026-08-22T08:00:00.000Z',
    revision: 2,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 2,
    chainStatus: 'valid',
  })
  let submitted = null
  const result = await reverifyTradingReviewPackageCloudAudit(
    { cloudAudit: { checkpoint } },
    async (serialized) => {
      submitted = JSON.parse(serialized)
      return {
        valid: true,
        checkpointRevision: 2,
        currentRevision: 3,
        isCurrentHead: false,
        message: '检查点属于当前审计链的历史祖先',
      }
    },
  )

  assert.deepEqual(submitted, checkpoint)
  assert.equal(result.status, 'verified')
  assert.equal(result.verification?.currentRevision, 3)
})

test('combined review package becomes stale when its human review evidence expires', () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = confirmTradingReviewAttestation(
    createTradingReviewChecklist(new Date(generatedAt)),
    'riskControls',
    'humanKillSwitch',
    true,
    'Testnet emergency-stop drill ticket #77',
    new Date(generatedAt),
  )
  const result = assessTradingReviewPackageCurrency(
    {
      generatedAt,
      evidence: { reviewChecklist: checklist },
    },
    new Date('2026-09-22T00:00:00.001Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.expiredKeys, ['humanKillSwitch'])
  assert.ok(result.reasons.includes('package-age-exceeded'))
  assert.ok(result.reasons.includes('attestations-expired'))
})

test('combined review package rejects a generated time beyond clock-skew tolerance', () => {
  const generatedAt = '2026-08-22T01:00:00.000Z'
  const result = assessTradingReviewPackageCurrency(
    {
      generatedAt,
      evidence: {
        reviewChecklist: createTradingReviewChecklist(new Date(generatedAt)),
      },
    },
    new Date('2026-08-22T00:00:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['generated-in-future'])
})

test('combined review package is stale when current attestations differ within clock skew', () => {
  const generatedAt = '2026-08-22T00:04:00.000Z'
  const checklist = confirmTradingReviewAttestation(
    createTradingReviewChecklist(new Date(generatedAt)),
    'riskControls',
    'humanKillSwitch',
    true,
    'Testnet emergency-stop drill ticket #78',
    new Date(generatedAt),
  )
  const result = assessTradingReviewPackageCurrency(
    {
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
      },
    },
    new Date('2026-08-22T00:00:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['attestations-not-current'])
})

test('combined review package paper evidence becomes stale across a Shanghai month boundary', () => {
  const generatedAt = '2026-08-31T15:59:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        paperDrift: {
          input: {
            minimumSamples: 20,
            maximumExpectedReturnDegradationPct: 0.2,
            maximumWinRateDegradationPct: 10,
            maximumDrawdownIncreasePct: 2,
            cycleToleranceMinutes: 1,
            references: [],
            paperTrades: [],
            expectedCycleAts: [],
            observedCycleAts: [],
            dataGaps: [],
          },
          report: {
            cohorts: [
              {
                strategyVersion: 'strategy-v1',
                period: 'month',
                startAt: '2026-07-31T16:00:00.000Z',
                endAt: '2026-08-31T15:59:59.999Z',
                samples: 0,
                explainableSamples: 0,
                paperAverageNetReturnPct: null,
                paperWinRatePct: null,
                paperMaximumDrawdownPct: 0,
                returnDeltaPct: null,
                winRateDeltaPct: null,
                drawdownDeltaPct: 0,
                status: 'insufficient',
              },
            ],
            auditEvents: [],
            strategyVersions: [],
          },
        },
      },
    },
    new Date('2026-08-31T16:01:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['paper-period-outdated'])
})

test('combined review package paper evidence becomes stale across a Shanghai week boundary', () => {
  const generatedAt = '2026-08-23T15:59:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const result = assessTradingReviewPackageCurrency(
    {
      generatedAt,
      evidence: {
        reviewChecklist: checklist,
        reviewChecklistEvaluation: evaluateTradingReviewChecklist(
          checklist,
          new Date(generatedAt),
        ),
        paperDrift: {
          input: {
            minimumSamples: 20,
            maximumExpectedReturnDegradationPct: 0.2,
            maximumWinRateDegradationPct: 10,
            maximumDrawdownIncreasePct: 2,
            cycleToleranceMinutes: 1,
            references: [],
            paperTrades: [],
            expectedCycleAts: [],
            observedCycleAts: [],
            dataGaps: [],
          },
          report: {
            cohorts: [
              {
                strategyVersion: 'strategy-v1',
                period: 'week',
                startAt: '2026-08-16T16:00:00.000Z',
                endAt: '2026-08-23T15:59:59.999Z',
                samples: 0,
                explainableSamples: 0,
                paperAverageNetReturnPct: null,
                paperWinRatePct: null,
                paperMaximumDrawdownPct: 0,
                returnDeltaPct: null,
                winRateDeltaPct: null,
                drawdownDeltaPct: 0,
                status: 'insufficient',
              },
            ],
            auditEvents: [],
            strategyVersions: [],
          },
        },
      },
    },
    new Date('2026-08-23T16:01:00.000Z'),
  )

  assert.equal(result.status, 'stale')
  assert.deepEqual(result.reasons, ['paper-period-outdated'])
})

test('combined review package cloud audit rejects a mismatched online result', async () => {
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt: '2026-08-22T08:00:00.000Z',
    revision: 2,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 2,
    chainStatus: 'valid',
  })
  const result = await reverifyTradingReviewPackageCloudAudit(
    { cloudAudit: { checkpoint } },
    async () => ({
      valid: true,
      checkpointRevision: 1,
      currentRevision: 3,
      isCurrentHead: false,
      message: 'unexpected checkpoint',
    }),
  )

  assert.equal(result.status, 'rejected')
  assert.match(result.message, /不一致/)
})

test('combined review package without a cloud audit does not call online verification', async () => {
  let calls = 0
  const result = await reverifyTradingReviewPackageCloudAudit({ cloudAudit: null }, async () => {
    calls += 1
    throw new Error('should not run')
  })

  assert.equal(calls, 0)
  assert.equal(result.status, 'not-included')
})

test('combined review package keeps legacy v1 packages importable', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: 'insufficient',
      holdoutSamples: 0,
      holdoutDays: 0,
      averageNetReturnPct: null,
      maximumDrawdownPct: 0,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const legacyPackage = await buildTradingReviewPackage({
    schemaVersion: 1,
    generatedAt,
    backtest: null,
    paperDrift: null,
    testnet: null,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
  })

  const parsed = await parseTradingReviewPackage(JSON.stringify(legacyPackage))

  assert.equal(parsed.schemaVersion, 1)
  assert.equal(Object.prototype.hasOwnProperty.call(parsed, 'cloudAudit'), false)
})

test('combined review package rejects a forged audit result even with a new outer digest', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: 'insufficient',
      holdoutSamples: 0,
      holdoutDays: 0,
      averageNetReturnPct: null,
      maximumDrawdownPct: 0,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt,
    revision: 1,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 1,
    chainStatus: 'valid',
  })
  const reviewPackage = await buildTradingReviewPackage({
    generatedAt,
    backtest: null,
    paperDrift: null,
    testnet: null,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
    cloudAudit: {
      checkpoint,
      verification: {
        valid: true,
        checkpointRevision: 1,
        currentRevision: 1,
        isCurrentHead: true,
        message: '外部检查点与当前审计链头一致',
      },
      verifiedAt: generatedAt,
    },
  })
  const tampered = structuredClone(reviewPackage)
  tampered.cloudAudit.verification.isCurrentHead = false
  const tamperedBase = structuredClone(tampered)
  delete tamperedBase.contentDigest
  tampered.contentDigest = `sha256-${createHash('sha256').update(JSON.stringify(tamperedBase)).digest('hex')}`

  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(tampered)),
    /云端审计锚点无效/,
  )
})

test('combined review package rejects a modified conclusion or content checksum', async () => {
  const generatedAt = '2026-08-22T00:00:00.000Z'
  const checklist = createTradingReviewChecklist(new Date(generatedAt))
  const checklistEvaluation = evaluateTradingReviewChecklist(checklist, new Date(generatedAt))
  const evidence = readinessInput({
    backtest: {
      holdoutStatus: 'insufficient',
      holdoutSamples: 0,
      holdoutDays: 0,
      averageNetReturnPct: null,
      maximumDrawdownPct: 0,
    },
    paper: { status: 'insufficient', samples: 0, returnDeltaPct: null },
    testnet: {
      readyForPaperComparison: false,
      observations: 0,
      filledObservations: 0,
      unresolvedOrders: 0,
    },
    accountControls: checklistEvaluation.accountControls,
    riskControls: checklistEvaluation.riskControls,
    eligibility: checklistEvaluation.eligibility,
  })
  const reviewPackage = await buildTradingReviewPackage({
    generatedAt,
    backtest: null,
    paperDrift: null,
    testnet: null,
    reviewChecklist: checklist,
    readinessInput: evidence,
    readinessReport: assessLiveTradingReadiness(evidence),
  })
  const tampered = structuredClone(reviewPackage)
  tampered.readinessReport.decision = 'eligibleForHumanReview'

  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(tampered)),
    /内容摘要不匹配/,
  )
  await assert.rejects(
    () =>
      buildTradingReviewPackage({
        generatedAt,
        backtest: null,
        paperDrift: null,
        testnet: null,
        reviewChecklist: checklist,
        readinessInput: evidence,
        readinessReport: tampered.readinessReport,
      }),
    /闸门结论无法重算/,
  )
  const weakenedPolicy = structuredClone(reviewPackage)
  weakenedPolicy.readinessInput.thresholds.minimumTestnetFilledObservations = 1
  const weakenedPolicyBase = structuredClone(weakenedPolicy)
  delete weakenedPolicyBase.contentDigest
  weakenedPolicy.contentDigest = `sha256-${createHash('sha256')
    .update(JSON.stringify(weakenedPolicyBase))
    .digest('hex')}`
  await assert.rejects(
    () => parseTradingReviewPackage(JSON.stringify(weakenedPolicy)),
    /固定政策不一致/,
  )
})

test('paper telemetry records one observation per candle and only expects active-session cycles', () => {
  let telemetry = startContractPaperMonitoringSession(createContractPaperTelemetry(), {
    id: 'session-1',
    symbol: 'BTCUSDT',
    interval: '5m',
    startedAt: '2026-08-22T00:01:00.000Z',
  })
  for (const observedAt of ['2026-08-22T00:01:30.000Z', '2026-08-22T00:04:30.000Z']) {
    telemetry = observeContractPaperMonitoring(telemetry, {
      id: observedAt,
      sessionId: 'session-1',
      observedAt,
      mode: 'observed',
      evidenceEndAt: observedAt,
      strategyVersion: 'strategy-v1',
      signalVersion: 'signal-v1',
      marketSource: 'binance-futures-public',
    })
  }
  telemetry = finishContractPaperMonitoringSession(
    telemetry,
    'session-1',
    '2026-08-22T00:11:00.000Z',
  )
  const evidence = buildContractPaperTelemetryEvidence(telemetry)

  assert.equal(telemetry.cycles.length, 1)
  assert.deepEqual(evidence.expectedCycleAts, [
    '2026-08-22T00:00:00.000Z',
    '2026-08-22T00:05:00.000Z',
    '2026-08-22T00:10:00.000Z',
  ])
  assert.deepEqual(evidence.observedCycleAts, ['2026-08-22T00:00:00.000Z'])
})

test('paper telemetry closes feed gaps on recovery and exposes them to drift audit', () => {
  let telemetry = startContractPaperMonitoringSession(createContractPaperTelemetry(), {
    id: 'session-2',
    symbol: 'BTCUSDT',
    interval: '5m',
    startedAt: '2026-08-22T00:00:00.000Z',
  })
  telemetry = observeContractPaperMonitoring(telemetry, {
    id: 'gap-1',
    sessionId: 'session-2',
    observedAt: '2026-08-22T00:03:00.000Z',
    mode: 'gap',
    evidenceEndAt: null,
    strategyVersion: 'strategy-v1',
    signalVersion: 'signal-v1',
    marketSource: 'binance-futures-public',
    reason: 'network',
  })
  telemetry = observeContractPaperMonitoring(telemetry, {
    id: 'cycle-1',
    sessionId: 'session-2',
    observedAt: '2026-08-22T00:07:00.000Z',
    mode: 'observed',
    evidenceEndAt: '2026-08-22T00:06:59.000Z',
    strategyVersion: 'strategy-v1',
    signalVersion: 'signal-v1',
    marketSource: 'binance-futures-public',
  })
  const evidence = buildContractPaperTelemetryEvidence(
    telemetry,
    new Date('2026-08-22T00:08:00.000Z'),
  )

  assert.deepEqual(evidence.dataGaps, [
    {
      startAt: '2026-08-22T00:03:00.000Z',
      endAt: '2026-08-22T00:07:00.000Z',
      reason: 'network',
    },
  ])
})

test('paper telemetry restore drops malformed or orphaned local evidence', () => {
  const restored = parseContractPaperTelemetry(
    JSON.stringify({
      schemaVersion: 1,
      sessions: [
        {
          id: 'bad-session',
          symbol: 'BTCUSDT',
          interval: '5m',
          intervalMinutes: 99,
          startedAt: 'invalid',
          lastSeenAt: 'invalid',
          endedAt: null,
        },
      ],
      cycles: [{ id: 'orphan', sessionId: 'missing' }],
      gaps: [{ id: 'orphan-gap', sessionId: 'missing' }],
    }),
  )

  assert.deepEqual(restored, createContractPaperTelemetry())
})

test('paper telemetry restore closes crashed sessions and gaps at the last heartbeat', () => {
  let telemetry = startContractPaperMonitoringSession(createContractPaperTelemetry(), {
    id: 'crashed-session',
    symbol: 'BTCUSDT',
    interval: '5m',
    startedAt: '2026-08-22T00:00:00.000Z',
  })
  telemetry = observeContractPaperMonitoring(telemetry, {
    id: 'crashed-gap',
    sessionId: 'crashed-session',
    observedAt: '2026-08-22T00:03:00.000Z',
    mode: 'gap',
    evidenceEndAt: null,
    strategyVersion: 'strategy-v1',
    signalVersion: 'signal-v1',
    marketSource: 'binance-futures-public',
    reason: 'network',
  })
  const restored = parseContractPaperTelemetry(JSON.stringify(telemetry))
  const evidence = buildContractPaperTelemetryEvidence(
    restored,
    new Date('2026-08-23T00:00:00.000Z'),
  )

  assert.equal(restored.sessions[0].endedAt, '2026-08-22T00:03:00.000Z')
  assert.equal(evidence.dataGaps[0].endAt, '2026-08-22T00:03:00.000Z')
})

test('paper telemetry evidence excludes cycles and gaps outside the review window', () => {
  let telemetry = startContractPaperMonitoringSession(createContractPaperTelemetry(), {
    id: 'old-session',
    symbol: 'BTCUSDT',
    interval: '5m',
    startedAt: '2026-07-01T00:00:00.000Z',
  })
  telemetry = finishContractPaperMonitoringSession(
    telemetry,
    'old-session',
    '2026-07-01T00:05:00.000Z',
  )
  const evidence = buildContractPaperTelemetryEvidence(
    telemetry,
    new Date('2026-08-22T00:00:00.000Z'),
    { startAt: '2026-08-01T00:00:00.000Z', endAt: '2026-08-31T23:59:59.999Z' },
  )

  assert.deepEqual(evidence.expectedCycleAts, [])
  assert.deepEqual(evidence.observedCycleAts, [])
  assert.deepEqual(evidence.dataGaps, [])
})

test('cloud evidence validation recomputes backtest and sanitizes telemetry', () => {
  const backtestInput = input()
  const backtestReport = runContractStrategyBacktest(backtestInput)
  const bundle = validateTradingEvidenceCloudBundle({
    schemaVersion: 1,
    backtest: { schemaVersion: 1, input: backtestInput, report: backtestReport },
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  })

  assert.deepEqual(bundle.backtest.report, backtestReport)
  assert.deepEqual(bundle.paperTelemetry, createContractPaperTelemetry())

  const zeroCostInput = input({
    costModel: {
      ...backtestInput.costModel,
      version: 'zero-cost-v1',
      feeRatePct: 0,
      slippageRatePct: 0,
    },
  })
  assert.throws(
    () =>
      validateTradingEvidenceCloudBundle({
        schemaVersion: 1,
        backtest: {
          schemaVersion: 1,
          input: zeroCostInput,
          report: runContractStrategyBacktest(zeroCostInput),
        },
        paperTelemetry: createContractPaperTelemetry(),
        reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
      }),
    /回测成本政策不一致/,
  )
})

test('trading evidence audit digest has a stable canonical representation', async () => {
  const digest = await buildTradingEvidenceAuditDigest({
    userId: 'user-1',
    revision: 1,
    contentDigest: 'a'.repeat(64),
    previousAuditDigest: null,
    createdAt: '2026-08-22T00:00:00.000Z',
  })

  assert.equal(digest, '19e993ed7dd5a1ae5863ae94b7bf428d531cf8ee1fb89cb0f55267e10e0b4572')
})

test('trading evidence external checkpoint has a stable verifiable format', async () => {
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt: '2026-08-22T00:00:00.000Z',
    revision: 1,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 1,
    chainStatus: 'valid',
  })

  assert.equal(
    checkpoint.checkpointDigest,
    'sha256-f3322825f678ed83a575bc399bb32031572998bebf4f18f585700d6130c14d3d',
  )
  assert.deepEqual(await parseTradingEvidenceAuditCheckpoint(JSON.stringify(checkpoint)), checkpoint)
})

test('trading evidence external checkpoint rejects modified file content', async () => {
  const checkpoint = await buildTradingEvidenceAuditCheckpoint({
    generatedAt: '2026-08-22T00:00:00.000Z',
    revision: 1,
    contentDigest: 'a'.repeat(64),
    auditDigest: 'b'.repeat(64),
    totalEntries: 1,
    chainStatus: 'valid',
  })

  await assert.rejects(
    () =>
      parseTradingEvidenceAuditCheckpoint(
        JSON.stringify({ ...checkpoint, auditDigest: 'c'.repeat(64) }),
      ),
    /内容摘要不匹配/,
  )
})

test('trading evidence audit verification accepts a complete continuous chain', async () => {
  const first = {
    id: 'audit-1',
    userId: 'user-1',
    revision: 1,
    contentDigest: 'a'.repeat(64),
    previousAuditDigest: null,
    createdAt: '2026-08-22T00:00:00.000Z',
  }
  const firstAuditDigest = await buildTradingEvidenceAuditDigest(first)
  const second = {
    id: 'audit-2',
    userId: 'user-1',
    revision: 2,
    contentDigest: 'b'.repeat(64),
    previousAuditDigest: firstAuditDigest,
    createdAt: '2026-08-22T00:05:00.000Z',
  }
  const secondAuditDigest = await buildTradingEvidenceAuditDigest(second)

  const result = await verifyTradingEvidenceAuditChain({
    userId: 'user-1',
    entries: [
      { ...first, auditDigest: firstAuditDigest },
      { ...second, auditDigest: secondAuditDigest },
    ],
    current: {
      revision: 2,
      contentDigest: second.contentDigest,
      auditDigest: secondAuditDigest,
    },
  })

  assert.equal(result.status, 'valid')
  assert.equal(result.chainIntact, true)
  assert.equal(result.fullyVerifiable, true)
  assert.equal(result.verifiedEntries, 2)
  assert.deepEqual(result.issues, [])
})

test('trading evidence audit verification labels migrated unhashed records as partial', async () => {
  const result = await verifyTradingEvidenceAuditChain({
    userId: 'user-1',
    entries: [
      {
        id: 'legacy-audit-1',
        userId: 'user-1',
        revision: 1,
        contentDigest: 'a'.repeat(64),
        previousAuditDigest: null,
        auditDigest: null,
        createdAt: '2026-08-21T00:00:00.000Z',
      },
    ],
    current: { revision: 1, contentDigest: 'a'.repeat(64), auditDigest: null },
  })

  assert.equal(result.status, 'partial')
  assert.equal(result.chainIntact, true)
  assert.equal(result.fullyVerifiable, false)
  assert.equal(result.legacyEntries, 1)
  assert.equal(result.verifiedEntries, 0)
})

test('trading evidence audit verification detects modified and missing records', async () => {
  const first = {
    id: 'audit-1',
    userId: 'user-1',
    revision: 1,
    contentDigest: 'a'.repeat(64),
    previousAuditDigest: null,
    createdAt: '2026-08-22T00:00:00.000Z',
  }
  const firstAuditDigest = await buildTradingEvidenceAuditDigest(first)
  const second = {
    id: 'audit-2',
    userId: 'user-1',
    revision: 2,
    contentDigest: 'b'.repeat(64),
    previousAuditDigest: firstAuditDigest,
    createdAt: '2026-08-22T00:05:00.000Z',
  }
  const secondAuditDigest = await buildTradingEvidenceAuditDigest(second)
  const third = {
    id: 'audit-3',
    userId: 'user-1',
    revision: 3,
    contentDigest: 'c'.repeat(64),
    previousAuditDigest: secondAuditDigest,
    createdAt: '2026-08-22T00:10:00.000Z',
  }
  const thirdAuditDigest = await buildTradingEvidenceAuditDigest(third)
  const current = {
    revision: 3,
    contentDigest: third.contentDigest,
    auditDigest: thirdAuditDigest,
  }
  const entries = [
    { ...first, auditDigest: firstAuditDigest },
    { ...second, auditDigest: secondAuditDigest },
    { ...third, auditDigest: thirdAuditDigest },
  ]

  const modified = await verifyTradingEvidenceAuditChain({
    userId: 'user-1',
    entries: entries.map((entry, index) =>
      index === 1 ? { ...entry, contentDigest: 'd'.repeat(64) } : entry,
    ),
    current,
  })
  const missing = await verifyTradingEvidenceAuditChain({
    userId: 'user-1',
    entries: [entries[0], entries[2]],
    current,
  })

  assert.equal(modified.status, 'broken')
  assert.ok(modified.issues.some((issue) => issue.includes('审计摘要不匹配')))
  assert.equal(missing.status, 'broken')
  assert.ok(missing.issues.some((issue) => issue.includes('修订序列')))
})

test('cloud evidence save rejects a nonzero expected revision when no snapshot exists', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()

  await assert.rejects(
    () => saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 4, bundle }),
    TradingEvidenceConflictError,
  )
  assert.equal((await loadTradingEvidenceCloudSnapshot({ DB }, 'user-1')).revision, 0)
})

test('cloud evidence successful save persists a readable matching history version', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()
  const saved = await saveTradingEvidenceCloudSnapshot(
    { DB },
    'user-1',
    { expectedRevision: 0, bundle },
  )

  const historical = await loadTradingEvidenceCloudVersion({ DB }, 'user-1', 1)

  assert.equal(historical?.revision, saved.revision)
  assert.equal(historical?.contentDigest, saved.contentDigest)
  assert.deepEqual(historical?.bundle, saved.bundle)
})

test('cloud evidence saves expose a fully verifiable server audit chain', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle })
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 1, bundle })

  const verification = await verifyTradingEvidenceCloudAudit({ DB }, 'user-1')

  assert.equal(verification.status, 'valid')
  assert.equal(verification.fullyVerifiable, true)
  assert.equal(verification.verifiedEntries, 2)
  assert.equal(verification.headAuditDigest?.length, 64)
})

test('cloud evidence external checkpoint remains valid as the chain advances', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle })
  const checkpoint = await createTradingEvidenceAuditCheckpoint({ DB }, 'user-1')
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 1, bundle })

  const result = await verifyExternalTradingEvidenceAuditCheckpoint(
    { DB },
    'user-1',
    JSON.stringify(checkpoint),
  )

  assert.equal(result.valid, true)
  assert.equal(result.checkpointRevision, 1)
  assert.equal(result.currentRevision, 2)
  assert.equal(result.isCurrentHead, false)
})

test('cloud evidence external checkpoint is rejected for a different user chain', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const sourceDB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot(
    { DB: sourceDB },
    'user-1',
    { expectedRevision: 0, bundle },
  )
  const checkpoint = await createTradingEvidenceAuditCheckpoint({ DB: sourceDB }, 'user-1')
  const targetDB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot(
    { DB: targetDB },
    'user-2',
    { expectedRevision: 0, bundle },
  )

  const result = await verifyExternalTradingEvidenceAuditCheckpoint(
    { DB: targetDB },
    'user-2',
    JSON.stringify(checkpoint),
  )

  assert.equal(result.valid, false)
  assert.equal(result.isCurrentHead, false)
})

test('cloud evidence save refuses to extend a historically tampered audit chain', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle })
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 1, bundle })
  DB.tamperAuditContent(1, 'f'.repeat(64))

  await assert.rejects(
    () => saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 2, bundle }),
    TradingEvidenceIntegrityError,
  )
  assert.equal((await loadTradingEvidenceCloudSnapshot({ DB }, 'user-1')).revision, 2)
})

test('cloud evidence save distinguishes invalid input from persistence failures', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }

  await assert.rejects(
    () =>
      saveTradingEvidenceCloudSnapshot(createTradingEvidenceD1Double(), 'user-1', {
        expectedRevision: -1,
        bundle,
      }),
    TradingEvidenceInputError,
  )
  await assert.rejects(
    () =>
      saveTradingEvidenceCloudSnapshot(
        { DB: createTradingEvidenceD1Double({ failOn: 'INSERT INTO trading_evidence_bundles' }) },
        'user-1',
        { expectedRevision: 0, bundle },
      ),
    (error) => !(error instanceof TradingEvidenceInputError) && /injected D1 failure/.test(error.message),
  )
})

test('cloud evidence save leaves no current snapshot when history persistence fails', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double({ failOn: 'INSERT INTO trading_evidence_versions' })

  await assert.rejects(
    () => saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle }),
    /injected D1 failure/,
  )
  assert.equal((await loadTradingEvidenceCloudSnapshot({ DB }, 'user-1')).revision, 0)
})

test('cloud evidence save reports an identical stale write as a revision conflict', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const DB = createTradingEvidenceD1Double()
  await saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle })

  await assert.rejects(
    () => saveTradingEvidenceCloudSnapshot({ DB }, 'user-1', { expectedRevision: 0, bundle }),
    TradingEvidenceConflictError,
  )
  assert.equal((await loadTradingEvidenceCloudSnapshot({ DB }, 'user-1')).revision, 1)
})

test('cloud evidence load rejects stored content whose digest no longer matches', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const env = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            bundle_json: JSON.stringify(bundle),
            revision: 3,
            content_digest: '0'.repeat(64),
            updated_at: '2026-08-22T00:00:00.000Z',
          }),
        }),
      }),
    },
  }

  await assert.rejects(
    () => loadTradingEvidenceCloudSnapshot(env, 'user-1'),
    /完整性校验失败/,
  )
})

test('cloud evidence load accepts content whose independently calculated digest matches', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const serialized = JSON.stringify(bundle)
  const digest = createHash('sha256').update(serialized).digest('hex')
  const env = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            bundle_json: serialized,
            revision: 3,
            content_digest: digest,
            updated_at: '2026-08-22T00:00:00.000Z',
          }),
        }),
      }),
    },
  }

  const snapshot = await loadTradingEvidenceCloudSnapshot(env, 'user-1')

  assert.equal(snapshot.revision, 3)
  assert.equal(snapshot.contentDigest, digest)
  assert.deepEqual(snapshot.bundle, bundle)
})

test('cloud evidence history rejects stored content whose digest no longer matches', async () => {
  const bundle = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const env = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            bundle_json: JSON.stringify(bundle),
            revision: 2,
            content_digest: 'f'.repeat(64),
            created_at: '2026-08-21T00:00:00.000Z',
          }),
        }),
      }),
    },
  }

  await assert.rejects(
    () => loadTradingEvidenceCloudVersion(env, 'user-1', 2),
    /完整性校验失败/,
  )
})

test('cloud evidence rejects common secret, private-key and mnemonic shapes', () => {
  assert.equal(containsSensitiveTradingEvidence('api_secret=abcdefghijklmnop'), true)
  assert.equal(containsSensitiveTradingEvidence('-----BEGIN PRIVATE KEY-----'), true)
  assert.equal(containsSensitiveTradingEvidence('seed phrase: apple bridge candle drift'), true)
  assert.equal(containsSensitiveTradingEvidence('API密钥权限已关闭，工单 #42'), false)
  assert.throws(
    () =>
      validateTradingEvidenceCloudBundle({
        schemaVersion: 1,
        backtest: null,
        paperTelemetry: createContractPaperTelemetry(),
        reviewChecklist: {
          ...createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
          attestations: createTradingReviewChecklist(
            new Date('2026-08-22T00:00:00.000Z'),
          ).attestations.map((item, index) =>
            index === 0 ? { ...item, evidence: 'api_secret=abcdefghijklmnop' } : item,
          ),
        },
      }),
    /疑似包含密钥/,
  )
})

test('cloud evidence diff exposes backtest, telemetry and attestation changes', () => {
  const local = {
    schemaVersion: 1,
    backtest: null,
    paperTelemetry: createContractPaperTelemetry(),
    reviewChecklist: createTradingReviewChecklist(new Date('2026-08-22T00:00:00.000Z')),
  }
  const cloud = structuredClone(local)
  cloud.paperTelemetry.sessions.push({
    id: 'session-1',
    symbol: 'BTCUSDT',
    interval: '5m',
    intervalMinutes: 5,
    startedAt: '2026-08-22T00:00:00.000Z',
    lastSeenAt: '2026-08-22T00:05:00.000Z',
    endedAt: '2026-08-22T00:05:00.000Z',
  })
  cloud.reviewChecklist.attestations[0].confirmed = true
  cloud.reviewChecklist.attestations[0].evidence = '云端核验工单 #42'
  cloud.reviewChecklist.attestations[0].confirmedAt = '2026-08-22T00:00:00.000Z'
  const diff = compareTradingEvidenceBundles(local, cloud)

  assert.equal(diff.identical, false)
  assert.equal(diff.paperTelemetry.sessionDelta, 1)
  assert.deepEqual(diff.reviewChecklist.changedKeys, ['isolatedAccount'])
  assert.equal(diff.reviewChecklist.localConfirmed, 0)
  assert.equal(diff.reviewChecklist.cloudConfirmed, 1)
})
