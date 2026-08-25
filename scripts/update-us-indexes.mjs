import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YahooFinance from 'yahoo-finance2'
import { strFromU8, unzipSync } from 'fflate'
import { buildLeaderPeriodComparison } from './lib/leader-period-comparison.mjs'
import { writeJsonBatchAtomic } from './lib/write-json-atomic.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/us-index-research.json')
const dailyOutputPath = resolve(root, 'src/data/us-index-daily.json')
const yahooFinance = new YahooFinance({ queue: { concurrency: 2, interval: 300 } })
const qqqHoldingsUrl =
  'https://dng-api.invesco.com/cache/v1/accounts/en_US/shareclasses/QQQ/holdings/fund?idType=ticker&interval=monthly&productType=ETF&loadType=initial'
const qqqSectorsUrl =
  'https://dng-api.invesco.com/cache/v1/accounts/en_US/shareclasses/QQQ/weightedHoldings/fund?idType=ticker&productType=ETF&breakdown=sector'
const qqqDetailsUrl =
  'https://dng-api.invesco.com/cache/v1/accounts/en_US/shareclasses/QQQ?idType=ticker&variationType=fundDetails&productType=ETF'
const spyHoldingsUrl =
  'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx'
const spyPageUrl =
  'https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy'
const gldPageUrl = 'https://www.ssga.com/us/en/individual/etfs/spdr-gold-shares-gld'
const gldTrustPageUrl = 'https://www.spdrgoldshares.com/usa/gld/'
const gldTrustDataUrl =
  'https://api.spdrgoldshares.com/api/v1/data?product=gld&exchange=NYSE&lang=en'

const products = [
  { id: 'qqq', ticker: 'QQQ', index: 'Nasdaq-100', inception: '1999-03-10', feePct: 0.18 },
  { id: 'spy', ticker: 'SPY', index: 'S&P 500', inception: '1993-01-29', feePct: 0.0945 },
  { id: 'gld', ticker: 'GLD', index: 'LBMA Gold Price PM', inception: '2004-11-18', feePct: 0.4 },
  {
    id: 'btc',
    ticker: 'BTC-USD',
    index: 'Bitcoin spot reference',
    inception: '2014-09-17',
    feePct: 0,
  },
]

const isoDate = (value) => new Date(value).toISOString().slice(0, 10)
const officialDate = (value) => {
  const parsed = Date.parse(`${value} 12:00:00 UTC`)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : null
}
const finite = (value) => (Number.isFinite(value) ? value : null)
const numericText = (value) => Number(String(value ?? '').replace(/[^\d.-]/g, ''))
const decodeXml = (value = '') =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
const fetchOfficial = async (url, responseType = 'json') => {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'web3-index-leader-archive/1.0 (+https://github.com/aTong9/web3)',
        },
        signal: AbortSignal.timeout(45_000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
      if (responseType === 'binary') return new Uint8Array(await response.arrayBuffer())
      if (responseType === 'text') return await response.text()
      return await response.json()
    } catch (error) {
      lastError = error
      if (attempt < 2)
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000 * 2 ** attempt))
    }
  }
  throw lastError
}

const parseXlsxRows = (bytes) => {
  const files = unzipSync(bytes)
  const sharedXml = strFromU8(files['xl/sharedStrings.xml'])
  const sheetXml = strFromU8(files['xl/worksheets/sheet1.xml'])
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXml(match[1].replace(/<[^>]+>/g, '')),
  )
  return [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const values = {}
    for (const cell of row[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const column = cell[1].match(/\br="([A-Z]+)\d+"/)?.[1]
      const type = cell[1].match(/\bt="([^"]+)"/)?.[1]
      const raw = cell[2].match(/<v>([\s\S]*?)<\/v>/)?.[1]
      if (column) values[column] = type === 's' ? shared[Number(raw)] : Number(raw)
    }
    return values
  })
}

const fetchQqqLeaders = async () => {
  const [payload, sectorPayload, details] = await Promise.all([
    fetchOfficial(qqqHoldingsUrl),
    fetchOfficial(qqqSectorsUrl),
    fetchOfficial(qqqDetailsUrl),
  ])
  const leaders = payload.holdings
    ?.filter(
      (holding) =>
        holding.ticker &&
        Number.isFinite(holding.percentageOfTotalNetAssets) &&
        holding.percentageOfTotalNetAssets > 0,
    )
    .sort((left, right) => right.percentageOfTotalNetAssets - left.percentageOfTotalNetAssets)
    .slice(0, 10)
    .map((holding, index) => ({
      rank: index + 1,
      ticker: holding.ticker,
      name: holding.issuerName,
      weightPct: Number(holding.percentageOfTotalNetAssets.toFixed(4)),
    }))
  const sectors = sectorPayload.holdingWeights
    ?.filter((sector) => sector.name && Number.isFinite(sector.value) && sector.value > 0)
    .sort((left, right) => right.value - left.value)
    .map((sector) => ({ name: sector.name, weightPct: Number(sector.value.toFixed(4)) }))
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.effectiveBusinessDate ?? '') ||
    leaders?.length !== 10 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(sectorPayload.effectiveDate ?? '') ||
    sectors?.length < 9
  )
    throw new Error('Invesco QQQ official holdings are incomplete')
  if (
    details.ticker !== 'QQQ' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(details.effectiveBusinessDate ?? '') ||
    !/^\d{4}-\d{2}-\d{2}$/.test(details.shareclassTotalNetAssetsEffectiveDate ?? '') ||
    !/^\d{4}-\d{2}-\d{2}$/.test(details.totalNoOfHoldingsEffectiveDate ?? '') ||
    !Number.isFinite(details.feeValue) ||
    !Number.isFinite(details.shareclassTotalNetAssets) ||
    !Number.isInteger(details.totalNoOfHoldings)
  )
    throw new Error('Invesco QQQ official product details are incomplete')
  return {
    index: {
      id: 'qqq',
      benchmarkTicker: 'QQQ',
      holdingsAsOfDate: payload.effectiveBusinessDate,
      sourceUrl: qqqHoldingsUrl,
      sectorAsOfDate: sectorPayload.effectiveDate,
      sectorSourceUrl: qqqSectorsUrl,
      sectorSystem: 'Invesco product classification',
      sectors,
      leaders,
    },
    profile: {
      id: 'qqq',
      ticker: 'QQQ',
      name: 'Invesco QQQ ETF',
      benchmark: 'Nasdaq-100',
      inceptionDate: details.inceptionDate,
      expenseRatioPct: details.feeValue,
      totalNetAssetsUsd: Number(details.shareclassTotalNetAssets.toFixed(2)),
      netAssetsAsOfDate: details.shareclassTotalNetAssetsEffectiveDate,
      holdingsCount: details.totalNoOfHoldings,
      holdingsCountAsOfDate: details.totalNoOfHoldingsEffectiveDate,
      sourceAsOfDate: details.effectiveBusinessDate,
      sourceUrl: qqqDetailsUrl,
      sourceLabel: 'Invesco official fund details',
    },
  }
}

const fetchSpyLeaders = async () => {
  const [workbook, pageHtml] = await Promise.all([
    fetchOfficial(spyHoldingsUrl, 'binary'),
    fetchOfficial(spyPageUrl, 'text'),
  ])
  const rows = parseXlsxRows(workbook)
  const header = rows.findIndex((row) => row.A === 'Name' && row.B === 'Ticker')
  const asOfLabel = rows.find((row) => typeof row.B === 'string' && row.B.startsWith('As of '))?.B
  const holdingsAsOfDate = asOfLabel
    ? new Date(`${asOfLabel.slice(6)} 12:00:00 UTC`).toISOString().slice(0, 10)
    : null
  const leaders = rows
    .slice(header + 1)
    .filter(
      (row) => typeof row.A === 'string' && typeof row.B === 'string' && Number.isFinite(row.E),
    )
    .sort((left, right) => right.E - left.E)
    .slice(0, 10)
    .map((row, index) => ({
      rank: index + 1,
      ticker: row.B,
      name: row.A,
      weightPct: Number(row.E.toFixed(4)),
    }))
  const sectorAttribute = pageHtml.match(
    /<input[^>]+id="fund-sector-breakdown"[^>]+value="([^"]+)"/i,
  )?.[1]
  const sectorPayload = sectorAttribute ? JSON.parse(decodeXml(sectorAttribute)) : null
  const sectorAsOfDate = sectorPayload?.asOfDateSimple
    ? new Date(`${sectorPayload.asOfDateSimple} 12:00:00 UTC`).toISOString().slice(0, 10)
    : null
  const sectors = sectorPayload?.attrArray
    ?.map((sector) => ({
      name: sector.name?.value,
      weightPct: Number(sector.weight?.originalValue),
    }))
    .filter((sector) => sector.name && Number.isFinite(sector.weightPct) && sector.weightPct > 0)
    .sort((left, right) => right.weightPct - left.weightPct)
  const quickInfoAttribute = pageHtml.match(
    /<input[^>]+id="fund-quick-info"[^>]+value="([^"]+)"/i,
  )?.[1]
  const quickInfo = quickInfoAttribute ? JSON.parse(decodeXml(quickInfoAttribute)) : null
  const characteristics = pageHtml.match(
    /Fund Characteristics\s*<span[^>]*>as of ([^<]+)<\/span>[\s\S]*?Number of Holdings[\s\S]*?<td class="data">\s*([\d,]+)\s*<\/td>/i,
  )
  const profileAsOfDate = officialDate(quickInfo?.asOfDateSimple)
  const netAssetsAsOfDate = officialDate(quickInfo?.attrs?.aum?.asOfDateSimple)
  const holdingsCountAsOfDate = officialDate(characteristics?.[1])
  const expenseRatioPct = Number(quickInfo?.attrs?.['gross-expense-ratio']?.originalValue)
  const totalNetAssetsUsd = Number(quickInfo?.attrs?.aum?.originalValue)
  const holdingsCount = Number(characteristics?.[2]?.replaceAll(',', ''))
  if (
    header < 0 ||
    !holdingsAsOfDate ||
    leaders.length !== 10 ||
    !sectorAsOfDate ||
    sectors?.length !== 11 ||
    !profileAsOfDate ||
    !netAssetsAsOfDate ||
    !holdingsCountAsOfDate ||
    !Number.isFinite(expenseRatioPct) ||
    !Number.isFinite(totalNetAssetsUsd) ||
    !Number.isInteger(holdingsCount)
  )
    throw new Error('State Street SPY official holdings are incomplete')
  return {
    index: {
      id: 'sp500',
      benchmarkTicker: 'SPY',
      holdingsAsOfDate,
      sourceUrl: spyHoldingsUrl,
      sectorAsOfDate,
      sectorSourceUrl: spyPageUrl,
      sectorSystem: 'GICS',
      sectors,
      leaders,
    },
    profile: {
      id: 'spy',
      ticker: 'SPY',
      name: quickInfo.attrs['fund-name-simple'].value,
      benchmark: quickInfo.attrs.benchmark.value,
      inceptionDate: officialDate(quickInfo.attrs['inception-date'].value),
      expenseRatioPct,
      totalNetAssetsUsd: Number(totalNetAssetsUsd.toFixed(2)),
      netAssetsAsOfDate,
      holdingsCount,
      holdingsCountAsOfDate,
      sourceAsOfDate: profileAsOfDate,
      sourceUrl: spyPageUrl,
      sourceLabel: 'State Street official fund page',
    },
  }
}

const fetchGldProfile = async () => {
  const [pageHtml, trustPayload] = await Promise.all([
    fetchOfficial(gldPageUrl, 'text'),
    fetchOfficial(gldTrustDataUrl),
  ])
  const quickInfoAttribute = pageHtml.match(
    /<input[^>]+id="fund-quick-info"[^>]+value="([^"]+)"/i,
  )?.[1]
  const quickInfo = quickInfoAttribute ? JSON.parse(decodeXml(quickInfoAttribute)) : null
  const data = trustPayload?.data
  const profileAsOfDate = officialDate(quickInfo?.asOfDateSimple)
  const netAssetsAsOfDate = officialDate(quickInfo?.attrs?.aum?.asOfDateSimple)
  const goldHoldingsAsOfDate = officialDate(data?.total_tonnes?.date)
  const expenseRatioPct = Number(quickInfo?.attrs?.['gross-expense-ratio']?.originalValue)
  const totalNetAssetsUsd = Number(quickInfo?.attrs?.aum?.originalValue)
  const goldHoldingsTonnes = numericText(data?.total_tonnes?.value)
  const goldOuncesPerShare = numericText(data?.metal_entitlement?.value)
  if (
    quickInfo?.attrs?.['fund-ticker']?.value?.replace('®', '') !== 'GLD' ||
    trustPayload?.metadata?.dataOwner !== 'World Gold Trust Services LLC' ||
    !profileAsOfDate ||
    !netAssetsAsOfDate ||
    !goldHoldingsAsOfDate ||
    !Number.isFinite(expenseRatioPct) ||
    !Number.isFinite(totalNetAssetsUsd) ||
    !Number.isFinite(goldHoldingsTonnes) ||
    !Number.isFinite(goldOuncesPerShare)
  )
    throw new Error('Official GLD product details are incomplete')
  return {
    id: 'gld',
    ticker: 'GLD',
    name: quickInfo.attrs['fund-name-simple'].value,
    benchmark: 'LBMA Gold Price PM',
    inceptionDate: officialDate(quickInfo.attrs['inception-date'].value),
    expenseRatioPct,
    totalNetAssetsUsd: Number(totalNetAssetsUsd.toFixed(2)),
    netAssetsAsOfDate,
    sourceAsOfDate: profileAsOfDate,
    sourceUrl: gldPageUrl,
    sourceLabel: 'State Street official GLD page',
    goldHoldingsTonnes,
    goldOuncesPerShare,
    goldHoldingsAsOfDate,
    holdingsSourceUrl: gldTrustPageUrl,
  }
}
const loadPrevious = async () => {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'))
  } catch {
    return null
  }
}

const fetchSeries = async (product) => {
  const result = await yahooFinance.chart(product.ticker, {
    period1: product.inception,
    period2: new Date(),
    interval: '1d',
    events: 'div,splits',
    return: 'array',
  })
  const dividends = new Map(
    (result.events?.dividends ?? []).map((event) => [isoDate(event.date), finite(event.amount)]),
  )
  const splits = new Map(
    (result.events?.splits ?? []).map((event) => [
      isoDate(event.date),
      finite(event.numerator / event.denominator),
    ]),
  )
  const prices = result.quotes
    .filter((quote) => quote.date && finite(quote.open) && finite(quote.close))
    .map((quote) => ({
      date: isoDate(quote.date),
      open: finite(quote.open),
      close: finite(quote.close),
      adjClose: finite(quote.adjclose),
      ...(dividends.has(isoDate(quote.date))
        ? { dividendPerShare: dividends.get(isoDate(quote.date)) }
        : {}),
      ...(splits.has(isoDate(quote.date)) ? { splitRatio: splits.get(isoDate(quote.date)) } : {}),
    }))
  if (
    prices.length < 250 ||
    prices.some((row, index) => index && row.date <= prices[index - 1].date)
  ) {
    throw new Error(`${product.ticker} 行情不完整或日期未严格递增`)
  }
  return { symbol: product.ticker, currency: result.meta.currency ?? 'USD', prices }
}

const fetchComparisonSeries = async (symbol, startDate, endDate) => {
  const yahooSymbol = symbol.replace('.', '-')
  const result = await yahooFinance.chart(yahooSymbol, {
    period1: startDate,
    period2: endDate,
    interval: '1d',
    events: 'div,splits',
    return: 'array',
  })
  const points = result.quotes
    .filter((quote) => quote.date && finite(quote.adjclose))
    .map((quote) => ({ date: isoDate(quote.date), adjClose: finite(quote.adjclose) }))
  if (points.length < 2) throw new Error(`${symbol} comparison series is incomplete`)
  return [symbol, points]
}

const previous = await loadPrevious()
try {
  const [marketSeries, qqqOfficial, spyOfficial, gldOfficial] = await Promise.all([
    Promise.all(products.map(fetchSeries)),
    fetchQqqLeaders(),
    fetchSpyLeaders(),
    fetchGldProfile(),
  ])
  const capturedAt = new Date().toISOString()
  const period = capturedAt.slice(0, 7)
  const previousSnapshots = Array.isArray(previous?.leaderSnapshots) ? previous.leaderSnapshots : []
  const isNewLeaderPeriod = !previousSnapshots.some((snapshot) => snapshot.period === period)
  const currentLeaderSnapshot = {
    period,
    capturedAt,
    status: 'archived',
    methodology: 'First successful official holdings observation in each UTC calendar month',
    indexes: [qqqOfficial.index, spyOfficial.index],
  }
  const leaderSnapshots = isNewLeaderPeriod
    ? [...previousSnapshots, currentLeaderSnapshot]
    : previousSnapshots.map((snapshot) =>
        snapshot.period !== period
          ? snapshot
          : {
              ...snapshot,
              indexes: snapshot.indexes.map((index) => {
                if (Array.isArray(index.sectors) && index.sectors.length) return index
                const currentIndex = currentLeaderSnapshot.indexes.find(
                  (candidate) => candidate.id === index.id,
                )
                return currentIndex
                  ? {
                      ...index,
                      sectorAsOfDate: currentIndex.sectorAsOfDate,
                      sectorSourceUrl: currentIndex.sectorSourceUrl,
                      sectorSystem: currentIndex.sectorSystem,
                      sectors: currentIndex.sectors,
                    }
                  : index
              }),
            },
      )
  const leaderComparisons = Array.isArray(previous?.leaderComparisons)
    ? [...previous.leaderComparisons]
    : []
  if (isNewLeaderPeriod && previousSnapshots.length) {
    const previousLeaderSnapshot = previousSnapshots[previousSnapshots.length - 1]
    const comparisonKey = `${previousLeaderSnapshot.period}:${period}`
    if (
      !leaderComparisons.some(
        (comparison) => `${comparison.fromPeriod}:${comparison.toPeriod}` === comparisonKey,
      )
    ) {
      const symbols = [
        ...new Set(
          previousLeaderSnapshot.indexes.flatMap((index) => [
            index.benchmarkTicker,
            ...index.leaders.map((leader) => leader.ticker),
          ]),
        ),
      ]
      const seriesBySymbol = Object.fromEntries(
        await Promise.all(
          symbols.map((symbol) =>
            fetchComparisonSeries(
              symbol,
              previousLeaderSnapshot.capturedAt.slice(0, 10),
              capturedAt.slice(0, 10),
            ),
          ),
        ),
      )
      leaderComparisons.push(
        buildLeaderPeriodComparison(
          previousLeaderSnapshot,
          currentLeaderSnapshot,
          seriesBySymbol,
          0.2,
        ),
      )
    }
  }
  const generatedAt = new Date().toISOString()
  const monthlySeries = marketSeries.map((series) => {
    const monthly = new Map()
    for (const point of series.prices) monthly.set(point.date.slice(0, 7), point)
    return {
      symbol: series.symbol,
      currency: series.currency,
      prices: [...monthly.values()].map((point) => ({
        date: point.date,
        close: point.close,
        ...(point.adjClose === null ? {} : { adjClose: point.adjClose }),
      })),
    }
  })
  const payload = {
    schemaVersion: 6,
    datasetVersion: generatedAt,
    generatedAt,
    status: 'complete',
    source: {
      marketData: 'yahoo-finance2',
      officialStructure: 'Invesco, Nasdaq, S&P DJI, State Street and SEC',
      note: 'Yahoo 行情为非官方研究数据；官方持仓快照独立归档。',
    },
    products: products.map((product) => {
      const official = [qqqOfficial.profile, spyOfficial.profile, gldOfficial].find(
        (profile) => profile.id === product.id,
      )
      return official
        ? { ...product, inception: official.inceptionDate, feePct: official.expenseRatioPct }
        : product
    }),
    productProfiles: [qqqOfficial.profile, spyOfficial.profile, gldOfficial],
    monthlySeries,
    leaderSnapshots,
    leaderComparisons,
  }
  const dailyPayload = {
    schemaVersion: 1,
    datasetVersion: generatedAt,
    generatedAt,
    status: 'complete',
    source: { marketData: 'yahoo-finance2' },
    marketSeries,
  }
  await writeJsonBatchAtomic([
    { outputPath, value: payload },
    { outputPath: dailyOutputPath, value: dailyPayload },
  ])
  console.log(
    `Updated US index bundle ${generatedAt}: ${marketSeries.map((row) => `${row.symbol} ${row.prices.length}`).join(', ')}; ${leaderSnapshots.length} leader snapshots, ${leaderComparisons.length} closed periods`,
  )
} catch (error) {
  console.error(`US index update failed; preserved previous snapshot: ${error.message}`)
  process.exitCode = 1
}
