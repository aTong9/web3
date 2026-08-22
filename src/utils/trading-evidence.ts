import type {
  ContractPaperBacktestReference,
  ContractBacktestEvidenceEnvelope,
  ContractStrategyBacktestReport,
  TradingEvaluationPeriod,
} from '@/types'
import { runContractStrategyBacktest } from './contract-strategy-backtest'

const shanghaiOffsetMs = 8 * 60 * 60 * 1_000

export const buildTradingEvaluationPeriodBounds = (
  period: TradingEvaluationPeriod,
  now: Date,
) => {
  const shanghai = new Date(now.getTime() + shanghaiOffsetMs)
  let start: Date
  let end: Date
  if (period === 'week') {
    const mondayOffset = (shanghai.getUTCDay() + 6) % 7
    start = new Date(
      Date.UTC(
        shanghai.getUTCFullYear(),
        shanghai.getUTCMonth(),
        shanghai.getUTCDate() - mondayOffset,
      ) - shanghaiOffsetMs,
    )
    end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1_000 - 1)
  } else {
    start = new Date(
      Date.UTC(shanghai.getUTCFullYear(), shanghai.getUTCMonth(), 1) - shanghaiOffsetMs,
    )
    end = new Date(
      Date.UTC(shanghai.getUTCFullYear(), shanghai.getUTCMonth() + 1, 1) -
        shanghaiOffsetMs -
        1,
    )
  }
  return { startAt: start.toISOString(), endAt: end.toISOString() }
}

const isEnvelope = (value: unknown): value is ContractBacktestEvidenceEnvelope => {
  if (!value || typeof value !== 'object') return false
  const envelope = value as Partial<ContractBacktestEvidenceEnvelope>
  return envelope.schemaVersion === 1 && Boolean(envelope.input && envelope.report)
}

export const parseContractBacktestEvidence = (
  serialized: string,
): ContractStrategyBacktestReport => parseContractBacktestEvidenceEnvelope(serialized).report

export const parseContractBacktestEvidenceEnvelope = (
  serialized: string,
): ContractBacktestEvidenceEnvelope => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('回测证据不是有效JSON')
  }
  if (!isEnvelope(parsed)) throw new Error('回测证据结构或版本不受支持')
  const recalculated = runContractStrategyBacktest(parsed.input)
  if (JSON.stringify(recalculated) !== JSON.stringify(parsed.report)) {
    throw new Error('回测报告与输入重算结果不一致')
  }
  return { schemaVersion: 1, input: parsed.input, report: recalculated }
}

export const buildCurrentPaperBacktestReferences = (
  report: ContractStrategyBacktestReport,
  now = new Date(),
): ContractPaperBacktestReference[] => {
  const holdout = report.segments.holdout.metrics
  if (
    holdout.averageNetReturnPct === null ||
    holdout.winRatePct === null ||
    report.segments.holdout.startAt === null ||
    report.segments.holdout.endAt === null
  ) {
    return []
  }
  const averageNetReturnPct = holdout.averageNetReturnPct
  const winRatePct = holdout.winRatePct
  return (['week', 'month'] as const).map((period) => ({
    strategyVersion: report.strategyVersion,
    period,
    ...buildTradingEvaluationPeriodBounds(period, now),
    averageNetReturnPct,
    winRatePct,
    maximumDrawdownPct: holdout.maximumDrawdownPct,
  }))
}
