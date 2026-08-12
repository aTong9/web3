import type { ContractPositionSimulation, ContractPositionSimulationInput } from '@/types'

const finitePositive = (value: number) => Number.isFinite(value) && value > 0
const unavailableRisk = {
  riskBudget: null,
  enteredRiskAmount: null,
  recommendedNotional: null,
  recommendedMargin: null,
  riskUtilizationPct: null,
  riskStatus: 'unavailable' as const,
}
const pnlAtPrice = (
  entryPrice: number,
  exitPrice: number | null,
  notional: number,
  direction: ContractPositionSimulationInput['direction'],
) => {
  if (exitPrice === null || !finitePositive(exitPrice)) return null
  const change = exitPrice / entryPrice - 1
  return notional * change * (direction === 'long' ? 1 : -1)
}

export const simulateContractPosition = (
  input: ContractPositionSimulationInput,
): ContractPositionSimulation => {
  const entryPrice = input.entryPrice
  if (
    entryPrice === null ||
    !finitePositive(entryPrice) ||
    !finitePositive(input.notional) ||
    !finitePositive(input.leverage)
  ) {
    return {
      marginRequired: null,
      roundTripFee: null,
      projectedFunding: null,
      breakEvenMovePct: null,
      stopGrossPnl: null,
      stopNetPnl: null,
      targetGrossPnl: null,
      targetNetPnl: null,
      stopLossMarginPct: null,
      ...unavailableRisk,
    }
  }

  const feeRatePct = Math.max(0, input.feeRatePct)
  const fundingSettlements = Math.max(0, Math.floor(input.fundingSettlements))
  const fundingRatePct = input.fundingRatePct ?? 0
  const directionMultiplier = input.direction === 'long' ? 1 : -1
  const marginRequired = input.notional / input.leverage
  const roundTripFee = input.notional * (feeRatePct / 100) * 2
  // 正资金费率时多头支付空头，负资金费率时方向相反。
  const projectedFunding =
    input.notional * (fundingRatePct / 100) * fundingSettlements * directionMultiplier
  const breakEvenMovePct = ((roundTripFee + projectedFunding) / input.notional) * 100
  const stopGrossPnl = pnlAtPrice(entryPrice, input.stopLoss, input.notional, input.direction)
  const targetGrossPnl = pnlAtPrice(entryPrice, input.takeProfit, input.notional, input.direction)
  const friction = roundTripFee + projectedFunding
  const stopNetPnl = stopGrossPnl === null ? null : stopGrossPnl - friction
  const targetNetPnl = targetGrossPnl === null ? null : targetGrossPnl - friction
  const stopLossMarginPct =
    stopNetPnl === null || marginRequired <= 0
      ? null
      : (Math.abs(Math.min(stopNetPnl, 0)) / marginRequired) * 100
  const hasRiskInputs = finitePositive(input.accountEquity) && finitePositive(input.maxRiskPct)
  const hasAdverseStop = stopGrossPnl !== null && stopGrossPnl < 0
  const riskBudget = hasRiskInputs ? input.accountEquity * (input.maxRiskPct / 100) : null
  // 预计资金费为收益时不抵扣风险预算，以免放大建议仓位。
  const adverseFriction = roundTripFee + Math.max(projectedFunding, 0)
  const enteredRiskAmount = hasAdverseStop
    ? Math.abs(stopGrossPnl) + adverseFriction
    : null
  const riskPerNotional =
    enteredRiskAmount === null || enteredRiskAmount <= 0
      ? null
      : enteredRiskAmount / input.notional
  const capitalCapacity = hasRiskInputs ? input.accountEquity * input.leverage : null
  const recommendedNotional =
    riskBudget === null || riskPerNotional === null || capitalCapacity === null
      ? null
      : Math.min(riskBudget / riskPerNotional, capitalCapacity)
  const recommendedMargin =
    recommendedNotional === null ? null : recommendedNotional / input.leverage
  const riskUtilizationPct =
    riskBudget === null || enteredRiskAmount === null || riskBudget <= 0
      ? null
      : (enteredRiskAmount / riskBudget) * 100
  const riskStatus =
    riskUtilizationPct === null
      ? ('unavailable' as const)
      : riskUtilizationPct > 100
        ? ('over' as const)
        : ('within' as const)

  return {
    marginRequired,
    roundTripFee,
    projectedFunding,
    breakEvenMovePct,
    stopGrossPnl,
    stopNetPnl,
    targetGrossPnl,
    targetNetPnl,
    stopLossMarginPct,
    riskBudget,
    enteredRiskAmount,
    recommendedNotional,
    recommendedMargin,
    riskUtilizationPct,
    riskStatus,
  }
}
