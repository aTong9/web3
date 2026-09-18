import baseDatasetUrl from '@/data/asset-technical-signals.json?url'
import usStockDatasetUrl from '@/data/us-stock-technical-signals.json?url'
import type { AssetTechnicalDataset } from '@/types'

const isAssetTechnicalDataset = (value: unknown): value is AssetTechnicalDataset => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AssetTechnicalDataset>
  return (
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.sourceUrl === 'string' &&
    Array.isArray(candidate.assets) &&
    Array.isArray(candidate.limitations)
  )
}

const fetchDataset = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Technical dataset request failed: ${response.status}`)
  }

  const dataset: unknown = await response.json()
  if (!isAssetTechnicalDataset(dataset)) {
    throw new Error('Technical dataset shape is invalid')
  }

  return dataset
}

// Share in-flight reads and parsed snapshots across routes; refresh long-lived tabs after 5 minutes.
const datasets = new Map<string, { expiresAt: number; promise: Promise<AssetTechnicalDataset> }>()
const loadDataset = (url: string) => {
  const cached = datasets.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.promise
  const promise = fetchDataset(url).catch((error: unknown) => {
    if (datasets.get(url)?.promise === promise) datasets.delete(url)
    throw error
  })
  datasets.set(url, { expiresAt: Date.now() + 5 * 60_000, promise })
  return promise
}

export const loadUsStockTechnicalDataset = () => loadDataset(usStockDatasetUrl)

export const loadAssetTechnicalDataset = async (): Promise<AssetTechnicalDataset> => {
  const [baseDataset, usStockDataset] = await Promise.all([
    loadDataset(baseDatasetUrl),
    loadUsStockTechnicalDataset(),
  ])
  const updatedAt = [baseDataset.updatedAt, usStockDataset.updatedAt]
    .filter(Boolean)
    .reduce((latest, value) => (value > latest ? value : latest), baseDataset.updatedAt)

  return {
    ...baseDataset,
    updatedAt,
    source: [
      baseDataset.source,
      ...(usStockDataset.assets.length ? [usStockDataset.source] : []),
    ].join(' / '),
    limitations: [...baseDataset.limitations, ...usStockDataset.limitations],
    limitationsEn: [...(baseDataset.limitationsEn ?? []), ...(usStockDataset.limitationsEn ?? [])],
    assets: [...baseDataset.assets, ...usStockDataset.assets],
  }
}
