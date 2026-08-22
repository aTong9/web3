import type {
  ContractChartInterval,
  ContractPaperMonitoringSession,
  ContractPaperTelemetry,
  ContractPaperTelemetryEvidence,
} from '@/types'

const intervalMinutes: Record<ContractChartInterval, number> = {
  '1m': 1,
  '3m': 3,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '4h': 240,
}
const validTime = (value: string | null) => value !== null && Number.isFinite(Date.parse(value))
const bucketAt = (at: string, minutes: number) => {
  const size = minutes * 60_000
  return new Date(Math.floor(Date.parse(at) / size) * size).toISOString()
}

export const createContractPaperTelemetry = (): ContractPaperTelemetry => ({
  schemaVersion: 1,
  sessions: [],
  cycles: [],
  gaps: [],
})

export const startContractPaperMonitoringSession = (
  telemetry: ContractPaperTelemetry,
  input: { id: string; symbol: string; interval: ContractChartInterval; startedAt: string },
): ContractPaperTelemetry => {
  if (!input.id || !input.symbol || !validTime(input.startedAt)) return telemetry
  const session: ContractPaperMonitoringSession = {
    id: input.id,
    symbol: input.symbol,
    interval: input.interval,
    intervalMinutes: intervalMinutes[input.interval],
    startedAt: input.startedAt,
    lastSeenAt: input.startedAt,
    endedAt: null,
  }
  return {
    ...telemetry,
    sessions: [...telemetry.sessions.filter((item) => item.id !== input.id), session].slice(-50),
  }
}

export const observeContractPaperMonitoring = (
  telemetry: ContractPaperTelemetry,
  input: {
    id: string
    sessionId: string
    observedAt: string
    mode: 'observed' | 'gap' | 'heartbeat'
    evidenceEndAt: string | null
    strategyVersion: string
    signalVersion: string
    marketSource: string
    reason?: string
  },
): ContractPaperTelemetry => {
  const session = telemetry.sessions.find((item) => item.id === input.sessionId)
  if (!session || session.endedAt || !validTime(input.observedAt)) return telemetry
  const next: ContractPaperTelemetry = {
    ...telemetry,
    sessions: telemetry.sessions.map((item) =>
      item.id === input.sessionId ? { ...item, lastSeenAt: input.observedAt } : item,
    ),
    cycles: [...telemetry.cycles],
    gaps: [...telemetry.gaps],
  }
  const openGap = next.gaps.find((gap) => gap.sessionId === input.sessionId && gap.endAt === null)
  if (input.mode === 'gap') {
    if (!openGap) {
      next.gaps.push({
        id: input.id,
        sessionId: input.sessionId,
        startAt: input.observedAt,
        endAt: null,
        reason: input.reason?.trim() || 'market feed unavailable',
      })
    }
    return { ...next, gaps: next.gaps.slice(-100) }
  }
  if (openGap) {
    next.gaps = next.gaps.map((gap) =>
      gap.id === openGap.id ? { ...gap, endAt: input.observedAt } : gap,
    )
  }
  if (
    input.mode === 'heartbeat' ||
    typeof input.evidenceEndAt !== 'string' ||
    !validTime(input.evidenceEndAt)
  )
    return next
  const evidenceEndAt = input.evidenceEndAt
  const cycleAt = bucketAt(input.observedAt, session.intervalMinutes)
  if (next.cycles.some((cycle) => cycle.sessionId === input.sessionId && cycle.cycleAt === cycleAt)) {
    return next
  }
  next.cycles.push({
    id: input.id,
    sessionId: input.sessionId,
    observedAt: input.observedAt,
    cycleAt,
    evidenceEndAt,
    strategyVersion: input.strategyVersion,
    signalVersion: input.signalVersion,
    marketSource: input.marketSource,
  })
  return { ...next, cycles: next.cycles.slice(-2_000) }
}

export const finishContractPaperMonitoringSession = (
  telemetry: ContractPaperTelemetry,
  sessionId: string,
  endedAt: string,
): ContractPaperTelemetry => {
  if (!validTime(endedAt)) return telemetry
  return {
    ...telemetry,
    sessions: telemetry.sessions.map((session) =>
      session.id === sessionId ? { ...session, lastSeenAt: endedAt, endedAt } : session,
    ),
    gaps: telemetry.gaps.map((gap) =>
      gap.sessionId === sessionId && gap.endAt === null ? { ...gap, endAt: endedAt } : gap,
    ),
  }
}

export const buildContractPaperTelemetryEvidence = (
  telemetry: ContractPaperTelemetry,
  now = new Date(),
  window?: { startAt: string; endAt: string },
): ContractPaperTelemetryEvidence => {
  const windowStart = window && validTime(window.startAt) ? Date.parse(window.startAt) : -Infinity
  const windowEnd = window && validTime(window.endAt) ? Date.parse(window.endAt) : Infinity
  const expected = new Set<string>()
  for (const session of telemetry.sessions) {
    const start = Math.max(
      Date.parse(bucketAt(session.startedAt, session.intervalMinutes)),
      windowStart,
    )
    const rawEnd = session.endedAt ?? session.lastSeenAt ?? now.toISOString()
    const end = Math.min(Date.parse(bucketAt(rawEnd, session.intervalMinutes)), windowEnd)
    const step = session.intervalMinutes * 60_000
    for (let at = start; at <= end && expected.size < 5_000; at += step) {
      expected.add(new Date(at).toISOString())
    }
  }
  return {
    expectedCycleAts: [...expected].sort(),
    observedCycleAts: [
      ...new Set(
        telemetry.cycles
          .filter((cycle) => {
            const at = Date.parse(cycle.cycleAt)
            return at >= windowStart && at <= windowEnd
          })
          .map((cycle) => cycle.cycleAt),
      ),
    ].sort(),
    dataGaps: telemetry.gaps.flatMap((gap) => {
      const start = Math.max(Date.parse(gap.startAt), windowStart)
      const end = Math.min(Date.parse(gap.endAt ?? now.toISOString()), windowEnd)
      return start <= end
        ? [{ startAt: new Date(start).toISOString(), endAt: new Date(end).toISOString(), reason: gap.reason }]
        : []
    }),
  }
}

export const parseContractPaperTelemetry = (serialized: string): ContractPaperTelemetry => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    return createContractPaperTelemetry()
  }
  if (!parsed || typeof parsed !== 'object') return createContractPaperTelemetry()
  const telemetry = parsed as ContractPaperTelemetry
  if (
    telemetry.schemaVersion !== 1 ||
    !Array.isArray(telemetry.sessions) ||
    !Array.isArray(telemetry.cycles) ||
    !Array.isArray(telemetry.gaps)
  ) {
    return createContractPaperTelemetry()
  }
  const sessions = telemetry.sessions.filter(
    (session) =>
      session &&
      typeof session.id === 'string' &&
      typeof session.symbol === 'string' &&
      session.interval in intervalMinutes &&
      session.intervalMinutes === intervalMinutes[session.interval] &&
      validTime(session.startedAt) &&
      validTime(session.lastSeenAt) &&
      (session.endedAt === null || validTime(session.endedAt)),
  )
  const recoveredSessions = sessions.map((session) =>
    session.endedAt === null ? { ...session, endedAt: session.lastSeenAt } : session,
  )
  const sessionIds = new Set(recoveredSessions.map((session) => session.id))
  const sessionEndAt = new Map(
    recoveredSessions.map((session) => [session.id, session.endedAt ?? session.lastSeenAt]),
  )
  const cycles = telemetry.cycles.filter(
    (cycle) =>
      cycle &&
      typeof cycle.id === 'string' &&
      sessionIds.has(cycle.sessionId) &&
      validTime(cycle.observedAt) &&
      validTime(cycle.cycleAt) &&
      validTime(cycle.evidenceEndAt) &&
      typeof cycle.strategyVersion === 'string' &&
      typeof cycle.signalVersion === 'string' &&
      typeof cycle.marketSource === 'string',
  )
  const gaps = telemetry.gaps
    .filter(
    (gap) =>
      gap &&
      typeof gap.id === 'string' &&
      sessionIds.has(gap.sessionId) &&
      validTime(gap.startAt) &&
      (gap.endAt === null || validTime(gap.endAt)) &&
      typeof gap.reason === 'string',
    )
    .map((gap) =>
      gap.endAt === null ? { ...gap, endAt: sessionEndAt.get(gap.sessionId) ?? gap.startAt } : gap,
    )
  return {
    schemaVersion: 1,
    sessions: recoveredSessions.slice(-50),
    cycles: cycles.slice(-2_000),
    gaps: gaps.slice(-100),
  }
}
