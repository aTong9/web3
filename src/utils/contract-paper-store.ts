import type { ContractPaperTrade } from '@/types'
import {
  closeContractPaperTrade,
  mergeContractPaperTrades,
  restoreContractPaperTrades,
} from '@/utils/contract-paper-journal'
import { quantApi } from '@/utils/quant-api'

export type ContractPaperSyncStatus = 'loading' | 'cloud' | 'local'
export type ContractPaperJournalCommand =
  | { type: 'add'; trade: ContractPaperTrade }
  | { type: 'close'; id: string; exitPrice: number; closedAt: string }
  | { type: 'remove'; id: string }

export interface ContractPaperJournalStore {
  load: () => Promise<ContractPaperTrade[]>
  execute: (command: ContractPaperJournalCommand) => Promise<ContractPaperTrade[]>
}

export interface LocalContractPaperJournalStore extends ContractPaperJournalStore {
  replace: (trades: readonly ContractPaperTrade[]) => Promise<ContractPaperTrade[]>
}

export const createLocalContractPaperJournalStore = (
  storageKey: string,
): LocalContractPaperJournalStore => {
  const load = async () => restoreContractPaperTrades(window.localStorage.getItem(storageKey))
  const replace = async (trades: readonly ContractPaperTrade[]) => {
    const normalized = mergeContractPaperTrades([], trades)
    window.localStorage.setItem(storageKey, JSON.stringify(normalized))
    return normalized
  }
  return {
    load,
    replace,
    execute: async (command) => {
      const current = await load()
      if (command.type === 'add') {
        return replace(mergeContractPaperTrades(current, [command.trade]))
      }
      if (command.type === 'close') {
        return replace(
          current.map((trade) =>
            trade.id === command.id
              ? (closeContractPaperTrade(trade, command.exitPrice, command.closedAt) ?? trade)
              : trade,
          ),
        )
      }
      return replace(current.filter((trade) => trade.id !== command.id || trade.status === 'open'))
    },
  }
}

export const cloudContractPaperJournalStore: ContractPaperJournalStore = {
  load: () => quantApi.contractTrades(),
  execute: (command) => {
    if (command.type === 'add') return quantApi.createContractTrade(command.trade)
    if (command.type === 'close') {
      return quantApi.closeContractTrade(command.id, command.exitPrice, command.closedAt)
    }
    return quantApi.deleteContractTrade(command.id)
  },
}

export const synchronizeContractPaperJournal = async (
  source: readonly ContractPaperTrade[],
  target: ContractPaperJournalStore,
) => {
  let targetTrades = await target.load()
  for (const sourceTrade of [...source].reverse()) {
    const targetTrade = targetTrades.find((trade) => trade.id === sourceTrade.id)
    if (targetTrade) {
      if (
        targetTrade.status === 'open' &&
        sourceTrade.status === 'closed' &&
        sourceTrade.exitPrice !== null &&
        sourceTrade.closedAt
      ) {
        targetTrades = await target.execute({
          type: 'close',
          id: sourceTrade.id,
          exitPrice: sourceTrade.exitPrice,
          closedAt: sourceTrade.closedAt,
        })
      }
      continue
    }
    if (
      sourceTrade.status === 'open' &&
      targetTrades.some((trade) => trade.symbol === sourceTrade.symbol && trade.status === 'open')
    )
      continue
    targetTrades = await target.execute({ type: 'add', trade: sourceTrade })
  }
  return targetTrades
}
