import type {
  AssetPricePoint,
  BtcAutoCloseReason,
  BtcAutoEntryGate,
  BtcAutoPerformanceSummary,
  BtcAutoSignalSnapshot,
  BtcAutoTrade,
  BtcAutoTradingConfig,
  ContractTradeDecision,
} from '@/types'

const round = (value: number, digits = 4) => Number(value.toFixed(digits))
const directional = (action: ContractTradeDecision['action']) =>
  action === 'long' || action === 'short'

export const countConsecutiveBtcAutoLosses = (trades: readonly BtcAutoTrade[]) => {
  const closed = trades
    .filter((trade) => trade.status === 'closed' && trade.closedAt && trade.netPnl !== null)
    .sort((left, right) => Date.parse(right.closedAt ?? '') - Date.parse(left.closedAt ?? ''))
  let losses = 0
  for (const trade of closed) {
    if ((trade.netPnl ?? 0) >= 0) break
    losses += 1
  }
  return { losses, lastClosedAt: closed[0]?.closedAt ?? null }
}

export const evaluateBtcAutoEntryGate = (input: {
  config: BtcAutoTradingConfig
  signal: BtcAutoSignalSnapshot | null
  trades: readonly BtcAutoTrade[]
  hasActivePosition: boolean
  cooldownUntil: string | null
  dailyNetPnl: number
  now?: Date
}): BtcAutoEntryGate => {
  const now = input.now ?? new Date()
  const streak = countConsecutiveBtcAutoLosses(input.trades)
  const lossResumeAt = streak.lastClosedAt
    ? new Date(
        Date.parse(streak.lastClosedAt) + input.config.lossPauseMinutes * 60_000,
      ).toISOString()
    : null
  const lossPauseActive =
    streak.losses >= input.config.maxConsecutiveLosses &&
    lossResumeAt !== null &&
    Date.parse(lossResumeAt) > now.getTime()
  const cooldownActive =
    input.cooldownUntil !== null && Date.parse(input.cooldownUntil) > now.getTime()
  const result = (reason: BtcAutoEntryGate['reason'], resumeAt: string | null = null) => ({
    reason,
    eligible: reason === 'ready',
    consecutiveLosses: streak.losses,
    resumeAt,
  })
  if (!input.config.enabled) return result('disabled')
  if (input.hasActivePosition) return result('positionOpen')
  if (input.dailyNetPnl <= -input.config.dailyLossLimitUsdt) return result('dailyLossLimit')
  if (lossPauseActive) return result('consecutiveLossPause', lossResumeAt)
  if (cooldownActive) return result('cooldown', input.cooldownUntil)
  if (!input.signal || !directional(input.signal.action)) return result('waitingDirection')
  if (Math.abs(input.signal.score) < input.config.minimumDirectionalScore)
    return result('weakScore')
  if (input.signal.confidence < input.config.minimumConfidence) return result('lowConfidence')
  if (input.signal.confirmations < input.config.requiredConfirmations) return result('confirming')
  return result('ready')
}

export const evolveBtcAutoSignal = (
  previous: BtcAutoSignalSnapshot | null,
  decision: ContractTradeDecision,
  observedAt: string,
  marketSource: BtcAutoSignalSnapshot['marketSource'],
): BtcAutoSignalSnapshot => {
  const sameDirection = previous?.action === decision.action && directional(decision.action)
  const oppositeDirection =
    previous &&
    directional(previous.action) &&
    directional(decision.action) &&
    previous.action !== decision.action
  const confirmations = sameDirection
    ? previous.confirmations + 1
    : directional(decision.action)
      ? 1
      : 0
  let evolution: BtcAutoSignalSnapshot['evolution'] = previous ? 'unchanged' : 'new'
  if (oppositeDirection) evolution = 'falsified'
  else if (previous && sameDirection) {
    if (
      decision.confidence >= previous.confidence + 3 ||
      Math.abs(decision.score) >= Math.abs(previous.score) + 5
    )
      evolution = 'strengthened'
    else if (
      decision.confidence <= previous.confidence - 3 ||
      Math.abs(decision.score) <= Math.abs(previous.score) - 5
    )
      evolution = 'weakened'
  } else if (previous && directional(previous.action) && !directional(decision.action)) {
    evolution = 'weakened'
  }
  return {
    action: decision.action,
    score: decision.score,
    confidence: decision.confidence,
    price: decision.latestPrice,
    evolution,
    confirmations,
    reasons: decision.reasons,
    risks: decision.risks,
    observedAt,
    marketSource,
  }
}

export const decideBtcAutoClose = (
  trade: BtcAutoTrade,
  signal: BtcAutoSignalSnapshot,
  minimumConfidence: number,
): BtcAutoCloseReason | null => {
  if (signal.price === null || trade.status !== 'open') return null
  if (
    (trade.direction === 'long' && signal.price <= trade.stopLoss) ||
    (trade.direction === 'short' && signal.price >= trade.stopLoss)
  )
    return 'stopLoss'
  if (
    (trade.direction === 'long' && signal.price >= trade.takeProfit) ||
    (trade.direction === 'short' && signal.price <= trade.takeProfit)
  )
    return 'takeProfit'
  if (
    signal.confidence >= minimumConfidence &&
    ((trade.direction === 'long' && signal.action === 'short') ||
      (trade.direction === 'short' && signal.action === 'long'))
  )
    return 'signalFalsified'
  return null
}

export interface BtcAutoCloseTrigger {
  reason: BtcAutoCloseReason
  referencePrice: number
  source: 'minuteCandle' | 'markPrice' | 'signal'
}

const firstFullMinuteStart = (openedAt: string) => Math.ceil(Date.parse(openedAt) / 60_000) * 60_000

export const resolveBtcAutoCloseTrigger = (
  trade: BtcAutoTrade,
  signal: BtcAutoSignalSnapshot,
  minutePoints: readonly AssetPricePoint[],
  minimumConfidence: number,
): BtcAutoCloseTrigger | null => {
  if (trade.status !== 'open') return null
  const eligiblePoints = minutePoints
    .filter((point) => Date.parse(point.date) >= firstFullMinuteStart(trade.openedAt))
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
  for (const point of eligiblePoints) {
    const high = point.high ?? point.close
    const low = point.low ?? point.close
    const stopHit = trade.direction === 'long' ? low <= trade.stopLoss : high >= trade.stopLoss
    const targetHit =
      trade.direction === 'long' ? high >= trade.takeProfit : low <= trade.takeProfit
    // OHLC cannot reveal the intraminute path. Stop-first avoids optimistic backfill.
    if (stopHit) {
      const candleOpen = point.open ?? trade.stopLoss
      const referencePrice =
        trade.direction === 'long'
          ? Math.min(trade.stopLoss, candleOpen)
          : Math.max(trade.stopLoss, candleOpen)
      return { reason: 'stopLoss', referencePrice, source: 'minuteCandle' }
    }
    if (targetHit)
      return { reason: 'takeProfit', referencePrice: trade.takeProfit, source: 'minuteCandle' }
  }
  const markReason = decideBtcAutoClose(trade, signal, Number.POSITIVE_INFINITY)
  if (markReason === 'stopLoss' || markReason === 'takeProfit') {
    const result: BtcAutoCloseTrigger = {
      reason: markReason,
      referencePrice: markReason === 'stopLoss' ? trade.stopLoss : trade.takeProfit,
      source: 'markPrice',
    }
    if (markReason === 'stopLoss' && signal.price !== null) {
      result.referencePrice =
        trade.direction === 'long'
          ? Math.min(result.referencePrice, signal.price)
          : Math.max(result.referencePrice, signal.price)
    }
    return result
  }
  const signalReason = decideBtcAutoClose(trade, signal, minimumConfidence)
  if (signalReason === 'signalFalsified' && signal.price !== null) {
    return { reason: signalReason, referencePrice: signal.price, source: 'signal' }
  }
  return null
}

export const calculateBtcAutoTradeResult = (
  trade: BtcAutoTrade,
  exitPrice: number,
  feeRatePct: number,
) => {
  if (trade.entryPrice === null || exitPrice <= 0) return null
  const multiplier = trade.direction === 'long' ? 1 : -1
  const grossPnl = (exitPrice - trade.entryPrice) * trade.quantity * multiplier
  const fees = (trade.entryPrice + exitPrice) * trade.quantity * (feeRatePct / 100)
  const netPnl = grossPnl - fees
  return {
    grossPnl: round(grossPnl),
    fees: round(fees),
    netPnl: round(netPnl),
    returnPct: round((netPnl / trade.notionalUsdt) * 100),
  }
}

const shanghaiDateParts = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0)
  return { year: part('year'), month: part('month'), day: part('day') }
}

const shanghaiMidnightUtc = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day, -8))

const periodStarts = (now: Date) => {
  const { year, month, day } = shanghaiDateParts(now)
  const dayStart = shanghaiMidnightUtc(year, month, day)
  const localCalendarDay = new Date(Date.UTC(year, month - 1, day))
  const mondayOffset = (localCalendarDay.getUTCDay() + 6) % 7
  const weekStart = new Date(dayStart.getTime() - mondayOffset * 86_400_000)
  const monthStart = shanghaiMidnightUtc(year, month, 1)
  return { day: dayStart, week: weekStart, month: monthStart }
}

export const summarizeBtcAutoPerformance = (
  trades: readonly BtcAutoTrade[],
  now = new Date(),
): BtcAutoPerformanceSummary[] => {
  const starts = periodStarts(now)
  return (['day', 'week', 'month'] as const).map((period) => {
    const selected = trades.filter(
      (trade) =>
        trade.status === 'closed' &&
        trade.closedAt !== null &&
        trade.netPnl !== null &&
        Date.parse(trade.closedAt) >= starts[period].getTime(),
    )
    const wins = selected.filter((trade) => (trade.netPnl ?? 0) > 0)
    const losses = selected.filter((trade) => (trade.netPnl ?? 0) < 0)
    const grossProfit = wins.reduce((sum, trade) => sum + (trade.netPnl ?? 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + (trade.netPnl ?? 0), 0))
    const averageWin = wins.length ? grossProfit / wins.length : null
    const averageLoss = losses.length ? grossLoss / losses.length : null
    const ordered = [...selected].sort(
      (left, right) => Date.parse(left.closedAt ?? '') - Date.parse(right.closedAt ?? ''),
    )
    let equity = 0
    let peak = 0
    let maxDrawdown = 0
    ordered.forEach((trade) => {
      equity += trade.netPnl ?? 0
      peak = Math.max(peak, equity)
      maxDrawdown = Math.max(maxDrawdown, peak - equity)
    })
    return {
      period,
      startAt: starts[period].toISOString(),
      endAt: now.toISOString(),
      trades: selected.length,
      wins: wins.length,
      losses: losses.length,
      winRatePct: selected.length ? round((wins.length / selected.length) * 100, 2) : null,
      grossProfit: round(grossProfit),
      grossLoss: round(grossLoss),
      netPnl: round(grossProfit - grossLoss),
      averageWinLossRatio:
        averageWin !== null && averageLoss !== null && averageLoss > 0
          ? round(averageWin / averageLoss, 2)
          : null,
      profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null,
      expectancyUsdt: selected.length ? round((grossProfit - grossLoss) / selected.length) : null,
      maxDrawdownUsdt: round(maxDrawdown),
    }
  })
}
