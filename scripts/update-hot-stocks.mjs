import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeJsonAtomic } from './lib/write-json-atomic.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/hot-stocks.json')
const headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124 Safari/537.36',
  accept: 'application/json, text/plain, */*',
  referer: 'https://www.nasdaq.com/',
}
const fetchJson = async (url) => {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(25_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((delay) => setTimeout(delay, 800 * 2 ** attempt))
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
const rank = (rows) => rows.slice(0, 20).map((row, index) => ({ rank: index + 1, ...row }))
const loadPrevious = async () => {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'))
  } catch {
    return null
  }
}
const fetchAShare = async () => {
  const query = new URLSearchParams({
    pn: '1', pz: '200', po: '1', np: '1', fltt: '2', invt: '2', fid: 'f6',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
    fields: 'f2,f3,f6,f8,f12,f14,f109,f124',
  })
  const payload = await fetchJson(`https://push2.eastmoney.com/api/qt/clist/get?${query}`)
  const rows = (payload.data?.diff ?? [])
    .filter((item) => item.f12 && item.f14 && numberFrom(item.f2) !== null)
    .map((item) => {
      const exchange = /^(6|68)/.test(item.f12) ? 'sh' : /^(8|4)/.test(item.f12) ? 'bj' : 'sz'
      return {
        code: item.f12,
        name: item.f14,
        price: round(numberFrom(item.f2)),
        dayChangePct: round(numberFrom(item.f3)),
        weekChangePct: round(numberFrom(item.f109)),
        activityValue: round(numberFrom(item.f6), 0),
        activityLabel: '当日成交额',
        turnoverRatePct: round(numberFrom(item.f8)),
        url: `https://quote.eastmoney.com/${exchange}${item.f12}.html`,
      }
    })
  return {
    source: '东方财富行情公开接口',
    sourceUrl: 'https://quote.eastmoney.com/center/gridlist.html',
    dailyMethod: '全A股按当日成交额排序',
    weeklyMethod: '当日成交额前200只股票中，按5日涨跌幅绝对值排序',
    daily: rank(rows.toSorted((left, right) => right.activityValue - left.activityValue)),
    weekly: rank(rows.toSorted((left, right) => Math.abs(right.weekChangePct) - Math.abs(left.weekChangePct))),
  }
}
const fetchNasdaqHistory = async (symbol, fromDate) => {
  const params = new URLSearchParams({ assetclass: 'stocks', fromdate: fromDate, limit: '20' })
  const payload = await fetchJson(
    `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/historical?${params}`,
  )
  const rows = payload.data?.tradesTable?.rows ?? []
  if (rows.length < 2) return null
  const latest = numberFrom(rows[0].close)
  const comparison = numberFrom(rows[Math.min(4, rows.length - 1)].close)
  if (latest === null || comparison === null || comparison === 0) return null
  return {
    weekChangePct: round((latest / comparison - 1) * 100),
    weeklyVolume: rows.slice(0, 5).reduce((sum, row) => sum + (numberFrom(row.volume) ?? 0), 0),
  }
}
const fetchUS = async () => {
  const payload = await fetchJson(
    'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=500&offset=0&download=true',
  )
  const excluded = /(ETF|ETN|Warrant|Right|Unit|Preferred|Depositary Share)/i
  const liquid = (payload.data?.rows ?? [])
    .filter((item) => item.symbol && item.name && !excluded.test(item.name) && numberFrom(item.volume) !== null && numberFrom(item.lastsale) !== null)
    .map((item) => ({
      code: item.symbol,
      name: item.name.replace(/ Common Stock$/i, ''),
      price: round(numberFrom(item.lastsale)),
      dayChangePct: round(numberFrom(item.pctchange)),
      weekChangePct: null,
      activityValue: round(numberFrom(item.volume), 0),
      activityLabel: '当日成交量',
      turnoverRatePct: null,
      sector: item.sector || null,
      url: `https://www.nasdaq.com/market-activity/stocks/${item.symbol.toLowerCase()}`,
    }))
    .toSorted((left, right) => right.activityValue - left.activityValue)
  const fromDate = new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10)
  const weeklyPool = []
  for (let offset = 0; offset < Math.min(60, liquid.length); offset += 8) {
    const batch = liquid.slice(offset, offset + 8)
    const histories = await Promise.all(batch.map((item) => fetchNasdaqHistory(item.code, fromDate).catch(() => null)))
    batch.forEach((item, index) => {
      const history = histories[index]
      if (history) weeklyPool.push({
        ...item,
        weekChangePct: history.weekChangePct,
        activityValue: history.weeklyVolume,
        activityLabel: '近5日成交量',
      })
    })
  }
  return {
    source: 'Nasdaq公开股票筛选与历史行情',
    sourceUrl: 'https://www.nasdaq.com/market-activity/most-active',
    dailyMethod: '美国上市普通股按当日成交量排序',
    weeklyMethod: '当日成交量前60只股票中，按最近5个交易日累计成交量排序',
    daily: rank(liquid),
    weekly: rank(weeklyPool.toSorted((left, right) => right.activityValue - left.activityValue)),
  }
}
const previous = await loadPrevious()
const [aShareResult, usResult] = await Promise.allSettled([fetchAShare(), fetchUS()])
const resolveMarket = (result, key) => {
  if (result.status === 'fulfilled') return { status: 'ok', ...result.value }
  if (previous?.markets?.[key]) return {
    ...previous.markets[key],
    status: 'stale',
    statusMessage: `本次更新失败，保留上次数据：${result.reason?.message ?? result.reason}`,
  }
  return {
    status: 'failed', statusMessage: result.reason?.message ?? String(result.reason),
    source: '暂无', sourceUrl: '', dailyMethod: '', weeklyMethod: '', daily: [], weekly: [],
  }
}
const output = {
  updatedAt: new Date().toISOString(),
  markets: {
    aShare: resolveMarket(aShareResult, 'aShare'),
    us: resolveMarket(usResult, 'us'),
  },
}
await writeJsonAtomic(outputPath, output)
process.stdout.write(`wrote A-share ${output.markets.aShare.daily.length}/${output.markets.aShare.weekly.length}, US ${output.markets.us.daily.length}/${output.markets.us.weekly.length}\n`)
