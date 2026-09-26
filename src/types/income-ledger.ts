export type IncomeLedgerPhase = 'exploring' | 'trial' | 'running' | 'paused' | 'closed'

export interface IncomeLedgerEntry {
  id: string
  projectId: string | null
  projectName: string
  date: string
  hours: number
  receivedIncome: number
  pendingIncome: number
  cost: number
  currency: string
  phase: IncomeLedgerPhase
  notes: string
  conclusion: string
}

export interface IncomeLedger {
  version: 1
  entries: IncomeLedgerEntry[]
}

export interface IncomeLedgerSummary {
  currency: string
  receivedIncome: number
  pendingIncome: number
  cost: number
  netIncome: number
  hours: number
  hourlyIncome: number | null
  count: number
}
