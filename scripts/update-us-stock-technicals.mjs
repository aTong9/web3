import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const megaCapsPath = resolve(root, 'src/data/us-megacaps.json')
const outputPath = resolve(root, 'src/data/us-stock-technical-signals.json')
const apiKey = process.env.MASSIVE_API_KEY?.trim()
const apiBase = 'https://api.massive.com'
const interRequestDelayMs = 13_000

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const sleep = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
const isoDate = (date) => date.toISOString().slice(0, 10)
const round = (value, digits = 4) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const fetchAggregateBars = async (symbol, from, to) => {
  const providerSymbol = symbol.replace('.', '-')
  const url = new URL(
    `/v2/aggs/ticker/${encodeURIComponent(providerSymbol)}/range/1/day/${from}/${to}`,
    apiBase,
  )
  url.searchParams.set('adjusted', 'true')
  url.searchParams.set('sort', 'asc')
  url.searchParams.set('limit', '50000')
  url.searchParams.set('apiKey', apiKey)

  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!response.ok) {
        if (response.status === 429 && attempt < 2) {
          const retryAfterSeconds = Number(response.headers.get('retry-after') ?? 0)
          await sleep(Math.max(interRequestDelayMs, retryAfterSeconds * 1_000))
          continue
        }
        throw new Error(`${symbol}: HTTP ${response.status}`)
      }
      const payload = await response.json()
      if (payload.status !== 'OK' && payload.status !== 'DELAYED') {
        throw new Error(`${symbol}: provider status ${payload.status ?? 'unknown'}`)
      }
      return Array.isArray(payload.results) ? payload.results : []
    } catch (error) {
      lastError = error
      if (attempt < 2) await sleep(1_000 * 2 ** attempt)
    }
  }
  throw lastError
}

const main = async () => {
  if (!apiKey) {
    console.warn('MASSIVE_API_KEY is not configured; preserving the existing technical dataset.')
    return
  }

  const megaCaps = await readJson(megaCapsPath)
  const previousDataset = await readJson(outputPath).catch(() => ({ assets: [] }))
  const stocks = Array.isArray(megaCaps.stocks) ? megaCaps.stocks.slice(0, 10) : []
  if (!stocks.length) throw new Error('No US mega-cap constituents are available.')

  const to = new Date()
  const from = new Date(to)
  from.setUTCFullYear(from.getUTCFullYear() - 5)
  from.setUTCDate(from.getUTCDate() - 10)

  const assets = []
  const failures = []
  for (const stock of stocks) {
    try {
      const rows = await fetchAggregateBars(stock.symbol, isoDate(from), isoDate(to))
      const points = rows
        .filter((row) => [row.o, row.h, row.l, row.c, row.t].every(Number.isFinite))
        .map((row) => ({
          date: isoDate(new Date(row.t)),
          open: round(row.o),
          high: round(row.h),
          low: round(row.l),
          close: round(row.c),
          ...(Number.isFinite(row.v) ? { volume: Math.round(row.v) } : {}),
        }))
        .slice(-1260)
      if (!points.length) throw new Error(`${stock.symbol}: empty aggregate-bar result`)

      const latest = points.at(-1)
      assets.push({
        id: `us-${stock.symbol.toLowerCase().replaceAll('.', '-')}`,
        name: stock.name,
        category: 'stocks',
        series: stock.symbol,
        unit: 'USD',
        mode: 'return',
        date: latest.date,
        stale: false,
        source: 'Massive',
        sourceUrl: 'https://massive.com/docs/rest/stocks/aggregates/custom-bars',
        calendar: 'nyse',
        dataShape: 'ohlcv',
        points,
      })
      console.log(`Fetched ${stock.symbol}: ${points.length} daily bars`)
    } catch (error) {
      failures.push(`${stock.symbol}: ${error instanceof Error ? error.message : String(error)}`)
      console.warn(failures.at(-1))
      const previous = previousDataset.assets?.find((asset) => asset.series === stock.symbol)
      if (previous) assets.push({ ...previous, stale: true })
    }
    if (stock !== stocks.at(-1)) await sleep(interRequestDelayMs)
  }

  if (!assets.length) throw new Error(`All Massive requests failed: ${failures.join('; ')}`)
  const dataset = {
    updatedAt: new Date().toISOString(),
    source: 'Massive Stocks Aggregate Bars',
    sourceUrl: 'https://massive.com/docs/rest/stocks/aggregates/custom-bars',
    sourcePriority: ['Massive'],
    limitations: [
      '美股数据为复权日线 OHLCV；免费数据计划提供最近2年历史，公司范围跟随每日市值前10排名，历史成分不做回溯修正。',
      ...(failures.length ? [`本次部分标的更新失败：${failures.join('；')}`] : []),
    ],
    assets,
  }
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`)
  console.log(`Wrote ${assets.length} US stock assets to ${outputPath}`)
}

await main()
