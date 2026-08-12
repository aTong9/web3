import type {
  ContractPaperJournalSummary,
  ContractPaperTrade,
  ContractPaperTradeCreateInput,
  ContractPaperTradeEvaluation,
} from '@/types'

const finitePositive = (value: number) => Number.isFinite(value) && value > 0
const finiteNonNegative = (value: number) => Number.isFinite(value) && value >= 0
const intervals = new Set(['1m', '3m', '5m', '15m', '30m', '1h', '4h'])

const validCreateInput = (input: ContractPaperTradeCreateInput) => {
  const levelsAligned =
    input.direction === 'long'
      ? input.stopLoss < input.entryPrice && input.takeProfit > input.entryPrice
      : input.stopLoss > input.entryPrice && input.takeProfit < input.entryPrice
  return Boolean(
    input.id &&
      input.symbol &&
      input.displayName &&
      input.quoteAsset &&
      (input.direction === 'long' || input.direction === 'short') &&
      intervals.has(input.interval) &&
      finitePositive(input.entryPrice) &&
      finitePositive(input.stopLoss) &&
      finitePositive(input.takeProfit) &&
      levelsAligned &&
      finitePositive(input.notional) &&
      finitePositive(input.leverage) &&
      finiteNonNegative(input.feeRatePct) &&
      Number.isFinite(input.fundingRatePct) &&
      finiteNonNegative(input.fundingSettlements) &&
      finitePositive(input.riskBudget) &&
      finitePositive(input.enteredRiskAmount) &&
      Number.isFinite(input.signalScore) &&
      Number.isFinite(input.signalConfidence) &&
      Number.isFinite(new Date(input.openedAt).getTime()),
  )
}

export const createContractPaperTrade = (
  input: ContractPaperTradeCreateInput,
): ContractPaperTrade | null =>
  validCreateInput(input)
    ? {
        ...input,
        symbol: input.symbol.toUpperCase(),
        fundingSettlements: Math.floor(input.fundingSettlements),
        status: 'open',
        closedAt: null,
        exitPrice: null,
      }
    : null

export const addContractPaperTrade = (
  trades: readonly ContractPaperTrade[],
  input: ContractPaperTradeCreateInput,
): ContractPaperTrade[] => {
  if (
    trades.some(
      (trade) => trade.symbol === input.symbol.toUpperCase() && trade.status === 'open',
    )
  )
    return [...trades]
  const created = createContractPaperTrade(input)
  return created ? [created, ...trades].slice(0, 200) : [...trades]
}

export const closeContractPaperTrade = (
  trade: ContractPaperTrade,
  exitPrice: number,
  closedAt: string,
): ContractPaperTrade | null => {
  if (
    trade.status !== 'open' ||
    !finitePositive(exitPrice) ||
    !Number.isFinite(new Date(closedAt).getTime())
  )
    return null
  return { ...trade, status: 'closed', exitPrice, closedAt }
}

export const evaluateContractPaperTrade = (
  trade: ContractPaperTrade,
  currentPrice: number | null,
): ContractPaperTradeEvaluation | null => {
  const referencePrice = trade.status === 'closed' ? trade.exitPrice : currentPrice
  if (referencePrice === null || !finitePositive(referencePrice) || !validCreateInput(trade))
    return null
  const directionMultiplier = trade.direction === 'long' ? 1 : -1
  const underlyingMove = referencePrice / trade.entryPrice - 1
  const grossPnl = trade.notional * underlyingMove * directionMultiplier
  const roundTripFee = trade.notional * (trade.feeRatePct / 100) * 2
  const projectedFunding =
    trade.notional *
    (trade.fundingRatePct / 100) *
    trade.fundingSettlements *
    directionMultiplier
  const estimatedCosts = roundTripFee + projectedFunding
  const netPnl = grossPnl - estimatedCosts
  const margin = trade.notional / trade.leverage
  return {
    referencePrice,
    positionMovePct: underlyingMove * directionMultiplier * 100,
    grossPnl,
    estimatedCosts,
    netPnl,
    marginReturnPct: margin > 0 ? (netPnl / margin) * 100 : 0,
  }
}

export const summarizeContractPaperTrades = (
  trades: readonly ContractPaperTrade[],
): ContractPaperJournalSummary => {
  const closedEvaluations = trades.flatMap((trade) => {
    if (trade.status !== 'closed') return []
    const evaluation = evaluateContractPaperTrade(trade, null)
    return evaluation ? [evaluation] : []
  })
  const wins = closedEvaluations.filter((evaluation) => evaluation.netPnl > 0).length
  return {
    total: trades.length,
    open: trades.filter((trade) => trade.status === 'open').length,
    closed: closedEvaluations.length,
    wins,
    winRatePct: closedEvaluations.length ? (wins / closedEvaluations.length) * 100 : null,
  }
}

const isPaperTrade = (value: unknown): value is ContractPaperTrade => {
  if (!value || typeof value !== 'object') return false
  const trade = value as ContractPaperTrade
  if (!validCreateInput(trade) || (trade.status !== 'open' && trade.status !== 'closed')) return false
  if (trade.status === 'open') return trade.closedAt === null && trade.exitPrice === null
  return (
    typeof trade.closedAt === 'string' &&
    Number.isFinite(new Date(trade.closedAt).getTime()) &&
    typeof trade.exitPrice === 'number' &&
    finitePositive(trade.exitPrice)
  )
}

export const restoreContractPaperTrades = (serialized: string | null): ContractPaperTrade[] => {
  if (!serialized) return []
  try {
    const parsed: unknown = JSON.parse(serialized)
    if (!Array.isArray(parsed)) return []
    const openSymbols = new Set<string>()
    return parsed
      .filter(isPaperTrade)
      .filter((trade) => {
        if (trade.status === 'closed') return true
        if (openSymbols.has(trade.symbol)) return false
        openSymbols.add(trade.symbol)
        return true
      })
      .slice(0, 200)
  } catch {
    return []
  }
}
