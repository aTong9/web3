import { readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YahooFinance from 'yahoo-finance2'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/us-index-research.json')
const temporaryPath = `${outputPath}.next`
const yahooFinance = new YahooFinance({ queue: { concurrency: 2, interval: 300 } })

const products = [
  { id: 'qqq', ticker: 'QQQ', index: 'Nasdaq-100', inception: '1999-03-10', feePct: 0.18 },
  { id: 'spy', ticker: 'SPY', index: 'S&P 500', inception: '1993-01-29', feePct: 0.0945 },
  { id: 'gld', ticker: 'GLD', index: 'LBMA Gold Price PM', inception: '2004-11-18', feePct: 0.4 },
  { id: 'btc', ticker: 'BTC-USD', index: 'Bitcoin spot reference', inception: '2014-09-17', feePct: 0 },
]

const isoDate = (value) => new Date(value).toISOString().slice(0, 10)
const finite = (value) => (Number.isFinite(value) ? value : null)
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
    (result.events?.dividends ?? []).map((event) => [
      isoDate(event.date),
      finite(event.amount),
    ]),
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
  if (prices.length < 250 || prices.some((row, index) => index && row.date <= prices[index - 1].date)) {
    throw new Error(`${product.ticker} 行情不完整或日期未严格递增`)
  }
  return { symbol: product.ticker, currency: result.meta.currency ?? 'USD', prices }
}

const previous = await loadPrevious()
try {
  const marketSeries = await Promise.all(products.map(fetchSeries))
  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: 'complete',
    source: {
      marketData: 'yahoo-finance2',
      officialStructure: 'Invesco, Nasdaq, S&P DJI, State Street and SEC',
      note: 'Yahoo 行情为非官方研究数据；官方持仓快照独立归档。',
    },
    products,
    marketSeries,
    leaderSnapshots: previous?.leaderSnapshots ?? [],
  }
  await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`)
  await rename(temporaryPath, outputPath)
  console.log(`Updated ${outputPath}: ${marketSeries.map((row) => `${row.symbol} ${row.prices.length}`).join(', ')}`)
} catch (error) {
  console.error(`US index update failed; preserved previous snapshot: ${error.message}`)
  process.exitCode = 1
}
