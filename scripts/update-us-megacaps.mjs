import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/us-megacaps.json')
const headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124 Safari/537.36',
  accept: 'text/html,application/json,*/*',
  referer: 'https://www.nasdaq.com/',
}

const companySlugs = {
  AAPL: 'apple',
  AMZN: 'amazon',
  AVGO: 'broadcom',
  'BRK.B': 'berkshire-hathaway',
  GOOGL: 'alphabet',
  GOOG: 'alphabet',
  JPM: 'jp-morgan-chase',
  LLY: 'eli-lilly',
  META: 'meta-platforms',
  MSFT: 'microsoft',
  NVDA: 'nvidia',
  ORCL: 'oracle',
  TSLA: 'tesla',
  TSM: 'tsmc',
  V: 'visa',
  WMT: 'walmart',
}
const companyFamilies = { GOOG: 'alphabet', GOOGL: 'alphabet' }

const fetchText = async (url) => {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(25_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((delay) => setTimeout(delay, 700 * 2 ** attempt))
    }
  }
  throw lastError
}

const numberFrom = (value) => {
  const parsed = Number(String(value ?? '').replace(/[$,%+,]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}
const round = (value, digits = 2) => {
  if (value === null || !Number.isFinite(value)) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
const median = (values) => {
  const rows = values.filter((value) => Number.isFinite(value)).toSorted((a, b) => a - b)
  if (!rows.length) return null
  const middle = Math.floor(rows.length / 2)
  return rows.length % 2 ? rows[middle] : (rows[middle - 1] + rows[middle]) / 2
}
const loadPrevious = async () => {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'))
  } catch {
    return null
  }
}

const normalizeCompany = (name) =>
  name
    .replace(/ Class [A-Z] Common Stock$/i, '')
    .replace(/ Common Stock$/i, '')
    .replace(/ Inc\.?$/i, '')
    .trim()
    .toLowerCase()

const fetchLargestStocks = async () => {
  const text = await fetchText(
    'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=5000&offset=0&download=true',
  )
  const payload = JSON.parse(text)
  const excluded = /(ETF|ETN|Warrant|Right|Unit|Preferred|Depositary Share)/i
  const seen = new Set()
  return (payload.data?.rows ?? [])
    .filter(
      (item) =>
        item.symbol &&
        item.name &&
        !excluded.test(item.name) &&
        numberFrom(item.marketCap) !== null,
    )
    .toSorted((left, right) => numberFrom(right.marketCap) - numberFrom(left.marketCap))
    .filter((item) => {
      const company = companyFamilies[item.symbol] ?? normalizeCompany(item.name)
      if (seen.has(company)) return false
      seen.add(company)
      return true
    })
    .slice(0, 10)
}

const fetchValuation = async (symbol) => {
  const ticker = symbol.replace('.', '-').toLowerCase()
  const page = await fetchText(`https://stockanalysis.com/stocks/${ticker}/statistics/`)
  const trailingMatch = page.match(/id:"pe",title:"PE Ratio",value:"([\d.\-]+)"/)
  const forwardMatch = page.match(/id:"peForward",title:"Forward PE",value:"([\d.\-]+)"/)
  const earningsDateMatch = page.match(
    /title:"Earnings Date",value:"([A-Z][a-z]{2} \d{1,2}, 20\d{2})"/,
  )
  const earningsDate = earningsDateMatch ? new Date(`${earningsDateMatch[1]} 12:00:00 UTC`) : null
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return {
    trailingPe:
      numberFrom(trailingMatch?.[1]) > 0 ? round(numberFrom(trailingMatch?.[1])) : null,
    forwardPe: numberFrom(forwardMatch?.[1]) > 0 ? round(numberFrom(forwardMatch?.[1])) : null,
    nextEarningsDate:
      earningsDate && earningsDate >= today ? earningsDate.toISOString().slice(0, 10) : null,
  }
}

const fetchEarnings = async (symbol) => {
  const [surpriseText, forecastText] = await Promise.all([
    fetchText(`https://api.nasdaq.com/api/company/${symbol}/earnings-surprise`),
    fetchText(`https://api.nasdaq.com/api/analyst/${symbol}/earnings-forecast`),
  ])
  const surpriseRows = JSON.parse(surpriseText).data?.earningsSurpriseTable?.rows ?? []
  const forecast = JSON.parse(forecastText).data ?? {}
  const quarterly = forecast.quarterlyForecast?.rows?.[0]
  const annual = forecast.yearlyForecast?.rows?.[0]
  const last = surpriseRows[0]
  const lastSurprisePct = round(numberFrom(last?.percentageSurprise))
  const positiveSurpriseStreak = surpriseRows.findIndex(
    (row) => (numberFrom(row.percentageSurprise) ?? 0) <= 0,
  )
  return {
    lastReportedDate: last?.dateReported ?? null,
    lastFiscalQuarter: last?.fiscalQtrEnd ?? null,
    lastActualEps: numberFrom(last?.eps),
    lastConsensusEps: numberFrom(last?.consensusForecast),
    lastSurprisePct,
    lastResultReliable: lastSurprisePct !== null && Math.abs(lastSurprisePct) <= 100,
    positiveSurpriseStreak:
      positiveSurpriseStreak === -1 ? surpriseRows.length : positiveSurpriseStreak,
    nextFiscalQuarter: quarterly?.fiscalEnd ?? null,
    nextConsensusEps: numberFrom(quarterly?.consensusEPSForecast),
    nextHighEps: numberFrom(quarterly?.highEPSForecast),
    nextLowEps: numberFrom(quarterly?.lowEPSForecast),
    estimateCount: numberFrom(quarterly?.noOfEstimates),
    revisionsUp: numberFrom(quarterly?.up),
    revisionsDown: numberFrom(quarterly?.down),
    annualFiscalEnd: annual?.fiscalEnd ?? null,
    annualConsensusEps: numberFrom(annual?.consensusEPSForecast),
  }
}

const fetchHistoricalMedian = async (symbol) => {
  const slug = companySlugs[symbol]
  if (!slug) return { historicalPeMedian5y: null, historicalYears: [] }
  const page = await fetchText(`https://companiesmarketcap.com/${slug}/pe-ratio/`)
  const matches = [...page.matchAll(/<tr><td>(20\d{2})<\/td><td>(-?[\d.]+)<\/td>/g)]
  const annual = matches
    .map((match) => ({ year: Number(match[1]), pe: numberFrom(match[2]) }))
    .filter((item) => item.pe !== null && item.pe > 0)
    .toSorted((left, right) => right.year - left.year)
    .slice(0, 5)
  return {
    historicalPeMedian5y: round(median(annual.map((item) => item.pe))),
    historicalYears: annual,
  }
}

const previous = await loadPrevious()

try {
  const largest = await fetchLargestStocks()
  const stocks = []
  for (const item of largest) {
    const previousStock = previous?.stocks?.find((stock) => stock.symbol === item.symbol)
    const [valuationResult, historyResult, earningsResult] = await Promise.allSettled([
      fetchValuation(item.symbol),
      fetchHistoricalMedian(item.symbol),
      fetchEarnings(item.symbol),
    ])
    const valuation =
      valuationResult.status === 'fulfilled'
        ? valuationResult.value
        : {
            trailingPe: previousStock?.trailingPe ?? null,
            forwardPe: previousStock?.forwardPe ?? null,
            nextEarningsDate: previousStock?.earnings?.nextEarningsDate ?? null,
          }
    const history =
      historyResult.status === 'fulfilled'
        ? historyResult.value
        : {
            historicalPeMedian5y: previousStock?.historicalPeMedian5y ?? null,
            historicalYears: previousStock?.historicalYears ?? [],
          }
    const earnings =
      earningsResult.status === 'fulfilled'
        ? earningsResult.value
        : {
            lastReportedDate: previousStock?.earnings?.lastReportedDate ?? null,
            lastFiscalQuarter: previousStock?.earnings?.lastFiscalQuarter ?? null,
            lastActualEps: previousStock?.earnings?.lastActualEps ?? null,
            lastConsensusEps: previousStock?.earnings?.lastConsensusEps ?? null,
            lastSurprisePct: previousStock?.earnings?.lastSurprisePct ?? null,
            lastResultReliable: previousStock?.earnings?.lastResultReliable ?? false,
            positiveSurpriseStreak: previousStock?.earnings?.positiveSurpriseStreak ?? 0,
            nextFiscalQuarter: previousStock?.earnings?.nextFiscalQuarter ?? null,
            nextConsensusEps: previousStock?.earnings?.nextConsensusEps ?? null,
            nextHighEps: previousStock?.earnings?.nextHighEps ?? null,
            nextLowEps: previousStock?.earnings?.nextLowEps ?? null,
            estimateCount: previousStock?.earnings?.estimateCount ?? null,
            revisionsUp: previousStock?.earnings?.revisionsUp ?? null,
            revisionsDown: previousStock?.earnings?.revisionsDown ?? null,
            annualFiscalEnd: previousStock?.earnings?.annualFiscalEnd ?? null,
            annualConsensusEps: previousStock?.earnings?.annualConsensusEps ?? null,
          }
    const { nextEarningsDate, ...valuationMetrics } = valuation
    stocks.push({
      marketCapRank: stocks.length + 1,
      symbol: item.symbol,
      name: item.name.replace(/ Class [A-Z] Common Stock$/i, '').replace(/ Common Stock$/i, ''),
      marketCapUsd: round(numberFrom(item.marketCap), 0),
      price: round(numberFrom(item.lastsale)),
      ...valuationMetrics,
      ...history,
      earnings: { nextEarningsDate, ...earnings },
      url: `https://www.nasdaq.com/market-activity/stocks/${item.symbol.toLowerCase()}`,
    })
  }
  const output = {
    updatedAt: new Date().toISOString(),
    status: 'ok',
    methodology:
      'Nasdaq全市场普通股按市值选取前10；当前价、Forward PE和已公布财报日期来自StockAnalysis；长期PE为CompaniesMarketCap最近5个可用年度正PE的中位数；财报结果、EPS预期和近4周修正来自Nasdaq。',
    sources: [
      { name: 'Nasdaq', url: 'https://www.nasdaq.com/market-activity/stocks/screener' },
      { name: 'StockAnalysis', url: 'https://stockanalysis.com/stocks/' },
      { name: 'CompaniesMarketCap', url: 'https://companiesmarketcap.com/' },
    ],
    stocks,
  }
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
  process.stdout.write(`wrote ${stocks.length} US mega-cap valuations\n`)
} catch (error) {
  if (!previous) throw error
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        ...previous,
        status: 'stale',
        statusMessage: `本次更新失败，保留上次数据：${error.message}`,
      },
      null,
      2,
    )}\n`,
  )
  process.stdout.write(`kept previous US mega-cap data: ${error.message}\n`)
}
