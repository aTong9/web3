import aShareDatasetUrl from '@/data/a-share-sectors.json?url'
import usFundDatasetUrl from '@/data/us-funds.json?url'
import type { AShareSectorDataset, UsFundDataset } from '@/types'
import { recoverStaleVersionOnce } from '@/utils/version-recovery'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isMarketDataset = (
  value: unknown,
): value is Record<string, unknown> & {
  updatedAt: string
  source: string
  funds: Record<string, unknown>[]
} =>
  isRecord(value) &&
  typeof value.updatedAt === 'string' &&
  value.updatedAt.length > 0 &&
  typeof value.source === 'string' &&
  Array.isArray(value.funds) &&
  value.funds.length > 0 &&
  value.funds.every((fund: unknown) => isRecord(fund) && typeof fund.code === 'string')

const fetchDataset = async (url: string): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) {
    if (response.status === 404) recoverStaleVersionOnce()
    throw new Error(`Market dataset request failed: ${response.status}`)
  }
  if (!response.headers.get('Content-Type')?.toLowerCase().includes('application/json')) {
    throw new Error('Market dataset content type is not JSON')
  }
  return response.json()
}

export const loadAShareSectorDataset = async (): Promise<AShareSectorDataset> => {
  const value = await fetchDataset(aShareDatasetUrl)
  if (
    !isMarketDataset(value) ||
    typeof value.tradingDate !== 'string' ||
    (value.marketStatus !== 'closed' && value.marketStatus !== 'holiday') ||
    !isRecord(value.periods) ||
    typeof value.periods.day !== 'string' ||
    !Array.isArray(value.sectors) ||
    value.sectors.length === 0 ||
    !value.funds.every(
      (fund: unknown) =>
        isRecord(fund) &&
        typeof fund.name === 'string' &&
        typeof fund.sector === 'string' &&
        isRecord(fund.returns) &&
        Array.isArray(fund.priceHistory) &&
        Array.isArray(fund.navHistory),
    ) ||
    !value.sectors.every(
      (sector: unknown) =>
        isRecord(sector) &&
        typeof sector.name === 'string' &&
        (sector.kind === 'industry' || sector.kind === 'theme') &&
        isRecord(sector.returns) &&
        typeof sector.representativeFundCode === 'string',
    )
  ) {
    throw new Error('A-share sector dataset is invalid')
  }
  return value as unknown as AShareSectorDataset
}

export const loadUsFundDataset = async (): Promise<UsFundDataset> => {
  const value = await fetchDataset(usFundDatasetUrl)
  if (
    !isMarketDataset(value) ||
    !value.funds.every(
      (fund: unknown) =>
        isRecord(fund) &&
        typeof fund.name === 'string' &&
        (fund.venue === 'exchange' || fund.venue === 'offExchange') &&
        typeof fund.index === 'string' &&
        Array.isArray(fund.priceHistory) &&
        Array.isArray(fund.navHistory) &&
        Array.isArray(fund.investmentLimitHistory),
    )
  ) {
    throw new Error('US fund dataset is invalid')
  }
  return value as unknown as UsFundDataset
}
