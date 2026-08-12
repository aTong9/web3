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

export const loadUsStockTechnicalDataset = () => fetchDataset(usStockDatasetUrl)

export const loadAssetTechnicalDataset = async (): Promise<AssetTechnicalDataset> => {
  const [baseDataset, usStockDataset] = await Promise.all([
    fetchDataset(baseDatasetUrl),
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
    limitationsEn: [
      ...(baseDataset.limitationsEn ?? []),
      ...(usStockDataset.limitationsEn ?? []),
    ],
    assets: [...baseDataset.assets, ...usStockDataset.assets],
  }
}
