import type { CrossAssetDataset, ResearchAsset, UsMegaCapDataset } from '@/types'
import crossAssetData from '@/data/cross-asset.json'
import megaCapData from '@/data/us-megacaps.json'

// Only same-instrument quotes: DXY, STOXX50 and commodity futures are not these snapshots.
const quoteSymbols: Record<string, string> = {
  sp500: '^GSPC',
  nasdaq: '^IXIC',
  nikkei: '^N225',
  shanghai: '000001.SS',
  hangseng: '^HSI',
  vix: '^VIX',
  btc: 'BTC-USD',
  eth: 'ETH-USD',
}
const chartIds = new Set([
  'sp500',
  'nasdaq',
  'nikkei',
  'shanghai',
  'hangseng',
  'euro50',
  'us2y',
  'us10y',
  'us30y',
  'real10y',
  'igspread',
  'hyspread',
  'usd',
  'vix',
  'eurusd',
  'usdjpy',
  'usdcny',
  'wti',
  'brent',
  'gold',
  'copper',
  'natgas',
  'btc',
  'eth',
  'us-nvda',
  'us-aapl',
  'us-googl',
  'us-msft',
  'us-amzn',
  'us-tsm',
  'us-spcx',
  'us-meta',
  'us-avgo',
  'us-tsla',
])
const newsQueries: Record<string, string> = {
  sp500: '美股',
  nasdaq: '美股',
  shanghai: 'A股',
  btc: 'BTC',
  eth: 'ETH',
  gold: '黄金',
  wti: '原油',
  brent: '原油',
  usd: '美元',
}
const crossAsset = crossAssetData as CrossAssetDataset
const megaCaps = megaCapData as UsMegaCapDataset

export const researchAssets: ResearchAsset[] = [
  ...crossAsset.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    symbol: asset.series,
    category: asset.category,
    quoteSymbol: quoteSymbols[asset.id] ?? null,
    value: asset.value,
    unit: asset.unit,
    date: asset.date,
    source: asset.source,
    sourceUrl: asset.sourceUrl,
    stale: asset.stale,
    newsQuery: newsQueries[asset.id] ?? (asset.category === 'bonds' ? '债券' : asset.name),
    technicalId: chartIds.has(asset.id) ? asset.id : null,
  })),
  ...megaCaps.stocks.map((stock) => {
    const id = `us-${stock.symbol.toLowerCase()}`
    return {
      id,
      name: stock.name,
      symbol: stock.symbol,
      category: 'stocks',
      quoteSymbol: stock.symbol.replace('/', '-'),
      value: stock.price,
      unit: 'USD',
      date: megaCaps.updatedAt.slice(0, 10),
      source: 'Nasdaq',
      sourceUrl: stock.url,
      stale: false,
      newsQuery: stock.symbol,
      technicalId: chartIds.has(id) ? id : null,
    }
  }),
]
