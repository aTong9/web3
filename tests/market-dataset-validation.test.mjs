import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { validateDataset } from '../scripts/validate-market-dataset.mjs'

const now = new Date('2026-08-25T08:00:00.000Z')
const prices = Array.from({ length: 250 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10),
  close: 100 + index,
}))
const readUsIndexBundle = () => ({
  overview: JSON.parse(readFileSync('src/data/us-index-research.json', 'utf8')),
  daily: JSON.parse(readFileSync('src/data/us-index-daily.json', 'utf8')),
})
const validateUsIndexBundle = (overview, daily) =>
  validateDataset(
    'us-indexes',
    overview,
    new Date(new Date(overview.generatedAt).getTime() + 60_000),
    { dailyDataset: daily },
  )

test('A-share gate accepts a fresh complete snapshot', () => {
  const result = validateDataset(
    'a-share',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      tradingDate: '2026-08-25',
      funds: Array.from({ length: 35 }, () => ({})),
      sectors: Array.from({ length: 30 }, () => ({})),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('fund gate rejects stale and partial snapshots', () => {
  const result = validateDataset(
    'us-funds',
    {
      updatedAt: '2026-08-24T07:30:00.000Z',
      funds: Array.from({ length: 10 }, () => ({ venue: 'exchange' })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('超过2小时')))
  assert.ok(result.errors.some((error) => error.includes('少于20条')))
})

test('US index gate requires four complete chronological series', () => {
  const result = validateDataset(
    'us-indexes',
    {
      generatedAt: '2026-08-25T07:45:00.000Z',
      status: 'complete',
      products: Array.from({ length: 4 }, () => ({})),
      marketSeries: ['QQQ', 'SPY', 'GLD', 'BTC-USD'].map((symbol) => ({ symbol, prices })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('US index gate rejects a missing core asset series', () => {
  const result = validateDataset(
    'us-indexes',
    {
      generatedAt: '2026-08-25T07:45:00.000Z',
      status: 'complete',
      products: [],
      marketSeries: ['QQQ', 'SPY', 'GLD'].map((symbol) => ({ symbol, prices })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('BTC-USD')))
})

test('US index v2 gate accepts two immutable official leader archives', () => {
  const snapshot = {
    period: '2026-08',
    capturedAt: '2026-08-25T07:45:00.000Z',
    status: 'archived',
    indexes: ['qqq', 'sp500'].map((id) => ({
      id,
      holdingsAsOfDate: '2026-08-21',
      sourceUrl: `https://official.example/${id}`,
      leaders: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        ticker: `${id}-${index}`,
        weightPct: 10 - index / 2,
      })),
    })),
  }
  const result = validateDataset(
    'us-indexes',
    {
      schemaVersion: 2,
      generatedAt: '2026-08-25T07:45:00.000Z',
      status: 'complete',
      products: Array.from({ length: 4 }, () => ({})),
      marketSeries: ['QQQ', 'SPY', 'GLD', 'BTC-USD'].map((symbol) => ({ symbol, prices })),
      leaderSnapshots: [snapshot],
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('US index v2 gate rejects duplicated and ascending leader weights', () => {
  const result = validateDataset(
    'us-indexes',
    {
      schemaVersion: 2,
      generatedAt: '2026-08-25T07:45:00.000Z',
      status: 'complete',
      products: Array.from({ length: 4 }, () => ({})),
      marketSeries: ['QQQ', 'SPY', 'GLD', 'BTC-USD'].map((symbol) => ({ symbol, prices })),
      leaderSnapshots: [
        {
          period: '2026-08',
          capturedAt: '2026-08-25T07:45:00.000Z',
          status: 'archived',
          indexes: ['qqq', 'sp500'].map((id) => ({
            id,
            holdingsAsOfDate: '2026-08-21',
            sourceUrl: `https://official.example/${id}`,
            leaders: Array.from({ length: 10 }, (_, index) => ({
              rank: index + 1,
              ticker: 'DUP',
              weightPct: index + 1,
            })),
          })),
        },
      ],
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('重复')))
  assert.ok(result.errors.some((error) => error.includes('排名或权重')))
})

test('US index v6 gate accepts matching overview and daily-price bundles', () => {
  const { overview, daily } = readUsIndexBundle()
  const result = validateUsIndexBundle(overview, daily)
  assert.equal(result.ok, true)
})

test('US index v6 gate rejects a mixed-version bundle and truncated monthly overview', () => {
  const { overview, daily } = readUsIndexBundle()
  daily.datasetVersion = '2026-01-01T00:00:00.000Z'
  overview.monthlySeries[0].prices = overview.monthlySeries[0].prices.slice(0, 2)
  const result = validateUsIndexBundle(overview, daily)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('版本不一致')))
  assert.ok(result.errors.some((error) => error.includes('月度概况少于120条')))
})

test('US index v5 gate rejects invalid GLD physical-gold evidence', () => {
  const { overview, daily } = readUsIndexBundle()
  const gldProfile = overview.productProfiles.find((profile) => profile.id === 'gld')
  gldProfile.goldHoldingsTonnes = 0
  gldProfile.goldHoldingsAsOfDate = '2099-01-01'
  gldProfile.holdingsSourceUrl = 'not-official'
  const result = validateUsIndexBundle(overview, daily)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('黄金吨数无效')))
  assert.ok(result.errors.some((error) => error.includes('黄金持仓日期晚于生成日期')))
  assert.ok(result.errors.some((error) => error.includes('黄金持仓来源无效')))
})

test('US index v4 gate rejects stale product parameters or incomplete official profiles', () => {
  const { overview, daily } = readUsIndexBundle()
  const qqqProfile = overview.productProfiles.find((profile) => profile.id === 'qqq')
  const spyProfile = overview.productProfiles.find((profile) => profile.id === 'spy')
  qqqProfile.sourceAsOfDate = '2099-01-01'
  spyProfile.totalNetAssetsUsd = 0
  overview.products.find((product) => product.id === 'qqq').feePct = 9.99
  const result = validateUsIndexBundle(overview, daily)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('产品概况日期晚于生成日期')))
  assert.ok(result.errors.some((error) => error.includes('SPY资产规模无效')))
  assert.ok(result.errors.some((error) => error.includes('计算器产品参数未与官方概况同步')))
})

test('US index v3 gate rejects a truncated or forward-dated sector snapshot', () => {
  const { overview, daily } = readUsIndexBundle()
  const qqq = overview.leaderSnapshots[0].indexes.find((index) => index.id === 'qqq')
  qqq.sectors = qqq.sectors.slice(0, 2)
  qqq.sectorAsOfDate = '2099-01-01'
  const result = validateUsIndexBundle(overview, daily)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('行业数量异常')))
  assert.ok(result.errors.some((error) => error.includes('行业日期晚于归档日期')))
})

test('hot-stock gate requires complete A-share and US rankings', () => {
  const ranking = Array.from({ length: 20 }, (_, index) => ({ rank: index + 1 }))
  const result = validateDataset(
    'hot-stocks',
    {
      updatedAt: '2026-08-25T07:45:00.000Z',
      markets: {
        aShare: { status: 'ok', daily: ranking, weekly: ranking },
        us: { status: 'ok', daily: ranking, weekly: ranking },
      },
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('mega-cap gate rejects stale fallback and duplicate constituents', () => {
  const stocks = Array.from({ length: 10 }, (_, index) => ({
    symbol: index < 2 ? 'DUP' : `S${index}`,
    marketCapUsd: 1_000_000 - index,
  }))
  const result = validateDataset(
    'us-megacaps',
    { updatedAt: '2026-08-25T07:45:00.000Z', status: 'stale', stocks },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('不是ok')))
  assert.ok(result.errors.some((error) => error.includes('重复')))
})

test('US technical gate accepts a recent structurally complete snapshot without same-run timestamp', () => {
  const technicalPrices = Array.from({ length: 200 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 1, 7 + index)).toISOString().slice(0, 10),
    close: 100 + index,
  }))
  const result = validateDataset(
    'us-technicals',
    {
      updatedAt: '2026-08-23T07:45:00.000Z',
      assets: Array.from({ length: 8 }, (_, index) => ({
        series: `S${index}`,
        date: '2026-08-25',
        points: technicalPrices,
      })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('option gate rejects configured provider with no usable option data', () => {
  const result = validateDataset(
    'option-market',
    {
      updatedAt: '2026-08-25T07:45:00.000Z',
      configurationStatus: 'configured',
      status: 'unavailable',
      symbols: Array.from({ length: 10 }, (_, index) => ({
        symbol: `S${index}`,
        status: 'unavailable',
      })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('没有任何可用数据')))
})

test('market-news gate requires unique recent articles and healthy source coverage', () => {
  const result = validateDataset(
    'market-news',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      sourceStatus: [
        { source: '美联储', status: 'ok' },
        { source: 'CNBC', status: 'ok' },
        { source: '华尔街日报', status: 'ok' },
      ],
      articles: Array.from({ length: 10 }, (_, index) => ({
        id: `article-${index}`,
        title: `Article ${index}`,
        url: `https://example.com/${index}`,
        publishedAt: '2026-08-25T06:00:00.000Z',
        sourceType: index === 0 ? 'official' : 'media',
      })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('market-news gate rejects duplicate links and failed source coverage', () => {
  const result = validateDataset(
    'market-news',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      sourceStatus: [{ source: 'CNBC', status: 'ok' }],
      articles: Array.from({ length: 10 }, (_, index) => ({
        id: `article-${index}`,
        title: `Article ${index}`,
        url: 'https://example.com/duplicate',
        publishedAt: '2026-08-25T06:00:00.000Z',
        sourceType: 'media',
      })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('链接缺失或重复')))
  assert.ok(result.errors.some((error) => error.includes('官方新闻源')))
})

test('KOL gate tolerates one inaccessible platform while requiring a usable majority', () => {
  const result = validateDataset(
    'kol-monitor',
    {
      updatedAt: '2026-08-25T03:00:00.000Z',
      kols: [
        { id: 'a', name: 'A', url: 'https://a.example', status: 'failed', items: [] },
        {
          id: 'b',
          name: 'B',
          url: 'https://b.example',
          status: 'partial',
          items: [{ title: 'B item', url: 'https://b.example/1' }],
        },
        {
          id: 'c',
          name: 'C',
          url: 'https://c.example',
          status: 'stale',
          items: [{ title: 'C item', url: 'https://c.example/1' }],
        },
      ],
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('KOL gate rejects an update where most monitored sources have no content', () => {
  const result = validateDataset(
    'kol-monitor',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      kols: Array.from({ length: 4 }, (_, index) => ({
        id: `kol-${index}`,
        name: `KOL ${index}`,
        url: `https://example.com/${index}`,
        status: index === 0 ? 'ok' : 'failed',
        items: index === 0 ? [{ title: 'Only item', url: 'https://example.com/item' }] : [],
      })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('不足一半')))
})

test('technical-fund gate requires twelve unique recent chronological series', () => {
  const fundPrices = Array.from({ length: 200 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 1, 7 + index)).toISOString().slice(0, 10),
    close: 1 + index / 100,
  }))
  const result = validateDataset(
    'technical-funds',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      assets: Array.from({ length: 12 }, (_, index) => ({
        id: `fund-${index}`,
        series: `F${index}`,
        date: '2026-08-25',
        points: fundPrices,
      })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('technical-fund gate rejects duplicate funds and truncated history', () => {
  const result = validateDataset(
    'technical-funds',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      assets: Array.from({ length: 12 }, (_, index) => ({
        id: 'duplicate',
        series: `F${index}`,
        date: '2026-08-25',
        points: [{ date: '2026-08-25', close: 1 }],
      })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('重复')))
  assert.ok(result.errors.some((error) => error.includes('少于200条')))
})

test('Norway-fund gate accepts a complete official report and holdings snapshot', () => {
  const result = validateDataset(
    'norway-fund',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      status: 'complete',
      sources: {
        report: 'https://www.nbim.no/en/report',
        holdingsApi: 'https://www.nbim.no/api/investments/v2/2026-06-30.json',
      },
      summary: {
        asOfDate: '2026-06-30',
        publishedDate: '2026-08-12',
        periodLabel: 'H1 2026',
        valueBillionNok: 22_683,
        listedCompanies: 7_077,
      },
      availability: { equityRegions: 'reported' },
      assetAllocation: [72.1, 25.8, 1.6, 0.5].map((weightPct) => ({ weightPct })),
      equitySectors: Array.from({ length: 11 }, () => ({})),
      equityRegions: Array.from({ length: 4 }, () => ({})),
      fixedIncome: Array.from({ length: 5 }, () => ({})),
      topHoldings: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        company: `Company ${index}`,
        marketValueBillionNok: 100 - index,
      })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('Norway-fund gate accepts an annual report that explicitly omits the half-year region table', () => {
  const result = validateDataset(
    'norway-fund',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      status: 'complete',
      sources: {
        report: 'https://www.nbim.no/en/annual-report',
        holdingsApi: 'https://www.nbim.no/api/investments/v2/2025-12-31.json',
      },
      summary: {
        asOfDate: '2025-12-31',
        publishedDate: '2026-02-27',
        periodLabel: '2025',
        valueBillionNok: 21_268,
        listedCompanies: 7_201,
      },
      availability: { equityRegions: 'not-reported' },
      assetAllocation: [71.3, 26.5, 1.7, 0.4].map((weightPct) => ({ weightPct })),
      equitySectors: Array.from({ length: 11 }, () => ({})),
      equityRegions: [],
      fixedIncome: Array.from({ length: 5 }, () => ({})),
      topHoldings: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        company: `Annual company ${index}`,
        marketValueBillionNok: 100 - index,
      })),
    },
    now,
  )
  assert.equal(result.ok, true)
})

test('Norway-fund gate rejects inferred region rows when the official report marks them unavailable', () => {
  const snapshot = JSON.parse(readFileSync('src/data/norway-fund-snapshot.json', 'utf8'))
  snapshot.availability = { equityRegions: 'not-reported' }
  const result = validateDataset('norway-fund', snapshot, now)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('不应生成推算值')))
})

test('Norway-fund gate rejects duplicated or incorrectly ranked top holdings', () => {
  const result = validateDataset(
    'norway-fund',
    {
      updatedAt: '2026-08-25T07:30:00.000Z',
      status: 'complete',
      sources: {
        report: 'https://www.nbim.no/en/report',
        holdingsApi: 'https://www.nbim.no/api/investments/v2/snapshot.json',
      },
      summary: {
        asOfDate: '2026-06-30',
        publishedDate: '2026-08-12',
        valueBillionNok: 22_683,
        listedCompanies: 7_000,
      },
      availability: { equityRegions: 'reported' },
      assetAllocation: [72, 26, 1.5, 0.5].map((weightPct) => ({ weightPct })),
      equitySectors: Array.from({ length: 11 }, () => ({})),
      equityRegions: Array.from({ length: 4 }, () => ({})),
      fixedIncome: Array.from({ length: 5 }, () => ({})),
      topHoldings: Array.from({ length: 10 }, (_, index) => ({
        rank: index + 2,
        company: 'Duplicate',
        marketValueBillionNok: index,
      })),
    },
    now,
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('重复')))
  assert.ok(result.errors.some((error) => error.includes('排名')))
})
