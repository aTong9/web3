import type { ContractTradePathInput, ContractTradePathResult } from '@/types'

const round = (value: number, digits = 8) => Number(value.toFixed(digits))
const isPositive = (value: number) => Number.isFinite(value) && value > 0
const isNonNegative = (value: number) => Number.isFinite(value) && value >= 0

const validateInput = (input: ContractTradePathInput) => {
  if (input.direction !== 'long' && input.direction !== 'short') {
    throw new Error('交易方向必须为long或short')
  }
  if (
    !isPositive(input.entryPrice) ||
    !isPositive(input.stopLoss) ||
    !isPositive(input.takeProfit) ||
    !isPositive(input.notional)
  ) {
    throw new Error('入场价、止损、止盈和名义仓位必须为有限正数')
  }
  if (
    input.direction === 'long' &&
    !(input.stopLoss < input.entryPrice && input.takeProfit > input.entryPrice)
  ) {
    throw new Error('多头止损必须低于入场价，止盈必须高于入场价')
  }
  if (
    input.direction === 'short' &&
    !(input.stopLoss > input.entryPrice && input.takeProfit < input.entryPrice)
  ) {
    throw new Error('空头止损必须高于入场价，止盈必须低于入场价')
  }
  if (
    !Number.isInteger(input.maximumHoldingMinutes) ||
    input.maximumHoldingMinutes < 0 ||
    !isNonNegative(input.feeRatePct) ||
    !isNonNegative(input.slippageRatePct) ||
    !Number.isFinite(input.fundingRatePct) ||
    !Number.isInteger(input.fundingSettlements) ||
    input.fundingSettlements < 0
  ) {
    throw new Error('持仓、费用、滑点和资金费参数无效')
  }

  let previousTime = -Infinity
  for (const bar of input.bars) {
    const prices = [bar.open, bar.high, bar.low, bar.close]
    if (!prices.every((price) => typeof price === 'number' && isPositive(price))) {
      throw new Error('K线必须包含有效的完整OHLC')
    }
    const [open, high, low, close] = prices as [number, number, number, number]
    if (high < Math.max(open, close) || low > Math.min(open, close) || high < low) {
      throw new Error('K线OHLC价格关系无效')
    }
    const currentTime = Date.parse(bar.date)
    if (!Number.isFinite(currentTime)) throw new Error('K线时间无效')
    if (currentTime <= previousTime) throw new Error('K线必须按时间严格升序排列')
    previousTime = currentTime
  }
}

export const evaluateContractTradePath = (
  input: ContractTradePathInput,
): ContractTradePathResult => {
  validateInput(input)
  const directionMultiplier = input.direction === 'long' ? 1 : -1
  const observedBars =
    input.maximumHoldingMinutes > 0 ? input.bars.slice(0, input.maximumHoldingMinutes) : input.bars
  let maximumAdverseExcursionPct: number | null = null

  for (const [index, bar] of observedBars.entries()) {
    const adversePrice = input.direction === 'long' ? bar.low! : bar.high!
    const adverseMove = (adversePrice / input.entryPrice - 1) * 100 * directionMultiplier
    maximumAdverseExcursionPct = round(Math.min(maximumAdverseExcursionPct ?? 0, adverseMove))
    const stopTouched =
      input.direction === 'long'
        ? bar.low !== undefined && bar.low <= input.stopLoss
        : bar.high !== undefined && bar.high >= input.stopLoss
    const targetTouched =
      input.direction === 'long'
        ? bar.high !== undefined && bar.high >= input.takeProfit
        : bar.low !== undefined && bar.low <= input.takeProfit
    if (!stopTouched && !targetTouched) continue

    const exitReason = stopTouched ? 'stopLoss' : 'takeProfit'
    const gapStopPrice =
      stopTouched && bar.open !== undefined
        ? input.direction === 'long'
          ? Math.min(input.stopLoss, bar.open)
          : Math.max(input.stopLoss, bar.open)
        : input.stopLoss
    const exitPrice = stopTouched ? gapStopPrice : input.takeProfit
    const directionalReturn = (exitPrice / input.entryPrice - 1) * directionMultiplier
    const grossPnl = input.notional * directionalReturn
    const fees = input.notional * (input.feeRatePct / 100) * 2
    const slippage = input.notional * (input.slippageRatePct / 100) * 2
    const funding =
      input.notional *
      (input.fundingRatePct / 100) *
      Math.floor(input.fundingSettlements) *
      directionMultiplier
    const netPnl = grossPnl - fees - slippage - funding

    return {
      status: 'closed',
      exitReason,
      exitPrice,
      exitedAt: bar.date,
      holdingMinutes: index + 1,
      grossPnl: round(grossPnl),
      fees: round(fees),
      slippage: round(slippage),
      funding: round(funding),
      netPnl: round(netPnl),
      returnPct: round((netPnl / input.notional) * 100),
      maximumAdverseExcursionPct,
    }
  }

  if (input.maximumHoldingMinutes > 0 && observedBars.length === input.maximumHoldingMinutes) {
    const finalBar = observedBars[observedBars.length - 1]!
    const exitPrice = finalBar.close
    const directionalReturn = (exitPrice / input.entryPrice - 1) * directionMultiplier
    const grossPnl = input.notional * directionalReturn
    const fees = input.notional * (input.feeRatePct / 100) * 2
    const slippage = input.notional * (input.slippageRatePct / 100) * 2
    const funding =
      input.notional *
      (input.fundingRatePct / 100) *
      Math.floor(input.fundingSettlements) *
      directionMultiplier
    const netPnl = grossPnl - fees - slippage - funding
    return {
      status: 'closed',
      exitReason: 'timeStop',
      exitPrice,
      exitedAt: finalBar.date,
      holdingMinutes: observedBars.length,
      grossPnl: round(grossPnl),
      fees: round(fees),
      slippage: round(slippage),
      funding: round(funding),
      netPnl: round(netPnl),
      returnPct: round((netPnl / input.notional) * 100),
      maximumAdverseExcursionPct,
    }
  }

  return {
    status: 'open',
    exitReason: null,
    exitPrice: null,
    exitedAt: null,
    holdingMinutes: observedBars.length,
    grossPnl: null,
    fees: 0,
    slippage: 0,
    funding: 0,
    netPnl: null,
    returnPct: null,
    maximumAdverseExcursionPct,
  }
}
