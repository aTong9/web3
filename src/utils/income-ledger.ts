import type { IncomeLedger, IncomeLedgerEntry, IncomeLedgerSummary } from '@/types/income-ledger'

export const emptyIncomeLedger = (): IncomeLedger => ({ version: 1, entries: [] })
export const incomeLedgerPhases = ['exploring', 'trial', 'running', 'paused', 'closed'] as const

const fail = (): never => {
  throw new Error('Invalid income ledger data')
}

export const isIncomeLedgerDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !value.startsWith('0000') &&
  Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value

const object = (value: unknown, keys: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail()
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(record, key))
  )
    return fail()
  return record
}

const text = (value: unknown, max: number, required = false): string => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) return fail()
  return value
}

const amount = (value: unknown, max = 1_000_000_000): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    Number(value.toFixed(8)) !== value
  )
    return fail()
  return value
}

export const parseIncomeLedger = (raw: string): IncomeLedger => {
  if (raw.length > 10_000_000) return fail()
  const ledger = object(JSON.parse(raw), ['version', 'entries'])
  if (ledger.version !== 1 || !Array.isArray(ledger.entries) || ledger.entries.length > 5000) {
    return fail()
  }
  const entries: IncomeLedgerEntry[] = ledger.entries.map((value: unknown) => {
    const entry = object(value, [
      'id',
      'projectId',
      'projectName',
      'date',
      'hours',
      'receivedIncome',
      'pendingIncome',
      'cost',
      'currency',
      'phase',
      'notes',
      'conclusion',
    ])
    const date = text(entry.date, 10, true)
    const currency = text(entry.currency, 10, true)
    const phase = incomeLedgerPhases.find((value) => value === entry.phase)
    if (!isIncomeLedgerDate(date) || !/^[A-Z][A-Z0-9]{1,9}$/.test(currency) || !phase) return fail()
    return {
      id: text(entry.id, 160, true),
      projectId: entry.projectId === null ? null : text(entry.projectId, 160, true),
      projectName: text(entry.projectName, 160, true),
      date,
      hours: amount(entry.hours, 24),
      receivedIncome: amount(entry.receivedIncome),
      pendingIncome: amount(entry.pendingIncome),
      cost: amount(entry.cost),
      currency,
      phase,
      notes: text(entry.notes, 5000),
      conclusion: text(entry.conclusion, 5000),
    }
  })
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) return fail()
  return { version: 1, entries }
}

export const summarizeIncomeLedger = (entries: IncomeLedgerEntry[]): IncomeLedgerSummary[] => {
  // Sum decimal units before converting for display, including when large receipts and costs cancel.
  const units = (value: number) => {
    const [coefficient = '0', exponent = '0'] = value.toString().split('e')
    const [integer = '0', fraction = ''] = coefficient.split('.')
    return BigInt(integer + fraction) * 10n ** BigInt(8 + Number(exponent) - fraction.length)
  }
  const display = (value: bigint) => Number(value) / 100_000_000
  const summaries = new Map<
    string,
    {
      currency: string
      receivedIncome: bigint
      pendingIncome: bigint
      cost: bigint
      hours: bigint
      count: number
    }
  >()
  for (const entry of entries) {
    const summary = summaries.get(entry.currency) ?? {
      currency: entry.currency,
      receivedIncome: 0n,
      pendingIncome: 0n,
      cost: 0n,
      hours: 0n,
      count: 0,
    }
    summary.receivedIncome += units(entry.receivedIncome)
    summary.pendingIncome += units(entry.pendingIncome)
    summary.cost += units(entry.cost)
    summary.hours += units(entry.hours)
    summary.count++
    summaries.set(entry.currency, summary)
  }
  return [...summaries.values()]
    .sort((a, b) => a.currency.localeCompare(b.currency))
    .map((summary) => {
      const round = (value: number) => Number(value.toFixed(8))
      const netIncome = display(summary.receivedIncome - summary.cost)
      const hours = display(summary.hours)
      return {
        currency: summary.currency,
        count: summary.count,
        receivedIncome: display(summary.receivedIncome),
        cost: display(summary.cost),
        netIncome,
        pendingIncome: display(summary.pendingIncome),
        hours,
        hourlyIncome: hours > 0 ? round(netIncome / hours) : null,
      }
    })
}
