import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeJsonAtomic } from './lib/write-json-atomic.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const megaCapsPath = resolve(root, 'src/data/us-megacaps.json')
const outputPath = resolve(root, 'src/data/option-market.json')
const apiKey = process.env.MASSIVE_API_KEY?.trim()
const megaCaps = JSON.parse(await readFile(megaCapsPath, 'utf8'))
const previous = await readFile(outputPath, 'utf8')
  .then((text) => JSON.parse(text))
  .catch(() => ({ symbols: [] }))
const previousBySymbol = new Map(previous.symbols.map((item) => [item.symbol, item]))
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
const date = today.toISOString().slice(0, 10)
const addDays = (days) => new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10)
const round = (value, digits = 2) => Number(value.toFixed(digits))
const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds))
let lastRequestAt = 0

const rateLimitedJson = async (url) => {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < 13_000) await wait(13_000 - elapsed)
  lastRequestAt = Date.now()
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'market-desk-options/1.0' },
    signal: AbortSignal.timeout(30_000),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error ?? body.message ?? `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return body
}

const unavailable = (stock, message) => {
  const stored = previousBySymbol.get(stock.symbol)
  return {
    symbol: stock.symbol,
    status: stored?.status === 'ok' ? 'partial' : 'unavailable',
    message,
    underlyingPrice: stock.price,
    leapsIvPct: stored?.leapsIvPct ?? null,
    leapsIvRank52w: stored?.leapsIvRank52w ?? null,
    ivRankObservations: stored?.ivRankObservations ?? 0,
    putCallVolumeRatio: stored?.putCallVolumeRatio ?? null,
    putCallOpenInterestRatio: stored?.putCallOpenInterestRatio ?? null,
    earningsExpectedMovePct: stored?.earningsExpectedMovePct ?? null,
    earningsExpirationDate: stored?.earningsExpirationDate ?? null,
    earningsDte: stored?.earningsDte ?? null,
    termStructure: stored?.termStructure ?? [],
    ivHistory: stored?.ivHistory ?? [],
  }
}

const selectExpirations = (dates) => {
  const unique = [...new Set(dates)].sort()
  const targets = [365, 540, 730]
  const selected = targets.map(
    (target) =>
      unique.toSorted((left, right) => {
        const leftDte = (new Date(left).getTime() - today.getTime()) / 86400000
        const rightDte = (new Date(right).getTime() - today.getTime()) / 86400000
        return Math.abs(leftDte - target) - Math.abs(rightDte - target)
      })[0],
  )
  return [...new Set(selected.filter(Boolean))]
}

const summarizeExpiration = (expirationDate, contracts, fallbackPrice) => {
  const underlyingPrice =
    contracts.find((item) => item.underlying_asset?.price)?.underlying_asset?.price ?? fallbackPrice
  const validIv = contracts.filter(
    (item) =>
      Number.isFinite(item.implied_volatility) &&
      Number.isFinite(item.details?.strike_price) &&
      underlyingPrice,
  )
  const nearAtm = validIv
    .sort(
      (left, right) =>
        Math.abs(left.details.strike_price / underlyingPrice - 1) -
        Math.abs(right.details.strike_price / underlyingPrice - 1),
    )
    .slice(0, 8)
  const atmIvPct = nearAtm.length
    ? round(
        (nearAtm.reduce((sum, item) => sum + item.implied_volatility, 0) / nearAtm.length) * 100,
      )
    : null
  const totals = contracts.reduce(
    (summary, item) => {
      const side = item.details?.contract_type
      if (side !== 'put' && side !== 'call') return summary
      summary[side].volume += item.day?.volume ?? 0
      summary[side].openInterest += item.open_interest ?? 0
      return summary
    },
    { put: { volume: 0, openInterest: 0 }, call: { volume: 0, openInterest: 0 } },
  )
  const dte = Math.max(
    0,
    Math.round((new Date(expirationDate).getTime() - today.getTime()) / 86400000),
  )
  return {
    expirationDate,
    dte,
    atmIvPct,
    expectedMovePct: atmIvPct === null ? null : round(atmIvPct * Math.sqrt(dte / 365)),
    putCallVolumeRatio:
      totals.call.volume > 0 ? round(totals.put.volume / totals.call.volume) : null,
    putCallOpenInterestRatio:
      totals.call.openInterest > 0
        ? round(totals.put.openInterest / totals.call.openInterest)
        : null,
    contracts: contracts.length,
    underlyingPrice,
  }
}

const fetchSymbol = async (stock) => {
  const contractsUrl = new URL('https://api.massive.com/v3/reference/options/contracts')
  contractsUrl.searchParams.set('underlying_ticker', stock.symbol)
  contractsUrl.searchParams.set('expiration_date.gte', addDays(365))
  contractsUrl.searchParams.set('expiration_date.lte', addDays(730))
  contractsUrl.searchParams.set('limit', '1000')
  contractsUrl.searchParams.set('apiKey', apiKey)
  const reference = await rateLimitedJson(contractsUrl)
  const expirations = selectExpirations(
    (reference.results ?? []).map((contract) => contract.expiration_date).filter(Boolean),
  )
  if (!expirations.length) return unavailable(stock, '未来1–2年没有可用LEAPS合约')
  const termStructure = []
  for (const expiration of expirations) {
    const snapshotUrl = new URL(`https://api.massive.com/v3/snapshot/options/${stock.symbol}`)
    snapshotUrl.searchParams.set('expiration_date', expiration)
    snapshotUrl.searchParams.set('limit', '250')
    snapshotUrl.searchParams.set('apiKey', apiKey)
    const snapshot = await rateLimitedJson(snapshotUrl)
    const point = summarizeExpiration(expiration, snapshot.results ?? [], stock.price)
    termStructure.push(point)
  }
  let earningsPoint = null
  const earningsDate = stock.earnings?.nextEarningsDate
  if (earningsDate && new Date(earningsDate).getTime() >= today.getTime()) {
    const earningsWindowUrl = new URL(`https://api.massive.com/v3/snapshot/options/${stock.symbol}`)
    earningsWindowUrl.searchParams.set('expiration_date.gte', earningsDate)
    earningsWindowUrl.searchParams.set(
      'expiration_date.lte',
      new Date(new Date(earningsDate).getTime() + 45 * 86400000).toISOString().slice(0, 10),
    )
    earningsWindowUrl.searchParams.set('limit', '250')
    earningsWindowUrl.searchParams.set('apiKey', apiKey)
    const earningsSnapshot = await rateLimitedJson(earningsWindowUrl)
    const byExpiration = new Map()
    for (const contract of earningsSnapshot.results ?? []) {
      const expiration = contract.details?.expiration_date
      if (!expiration) continue
      byExpiration.set(expiration, [...(byExpiration.get(expiration) ?? []), contract])
    }
    const expiration = [...byExpiration.keys()].filter(Boolean).sort()[0]
    if (expiration)
      earningsPoint = summarizeExpiration(
        expiration,
        byExpiration.get(expiration) ?? [],
        stock.price,
      )
  }
  const usable = termStructure.filter((point) => point.atmIvPct !== null)
  if (!usable.length) return unavailable(stock, '期权链返回但缺少可用隐含波动率')
  const nearest = usable[0]
  const storedHistory = previousBySymbol.get(stock.symbol)?.ivHistory ?? []
  const ivHistory = [
    ...storedHistory.filter((point) => point.date !== date),
    { date, value: nearest.atmIvPct },
  ].slice(-260)
  const values = ivHistory.map((point) => point.value)
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const leapsIvRank52w =
    values.length >= 20 && maximum > minimum
      ? round(((nearest.atmIvPct - minimum) / (maximum - minimum)) * 100)
      : null
  return {
    symbol: stock.symbol,
    status: termStructure.some((point) => point.contracts >= 250) ? 'partial' : 'ok',
    message: termStructure.some((point) => point.contracts >= 250)
      ? '单个到期日合约达到250条返回上限，Put/Call口径可能不完整'
      : null,
    underlyingPrice: nearest.underlyingPrice ?? stock.price,
    leapsIvPct: nearest.atmIvPct,
    leapsIvRank52w,
    ivRankObservations: ivHistory.length,
    putCallVolumeRatio: nearest.putCallVolumeRatio,
    putCallOpenInterestRatio: nearest.putCallOpenInterestRatio,
    earningsExpectedMovePct: earningsPoint?.expectedMovePct ?? null,
    earningsExpirationDate: earningsPoint?.expirationDate ?? null,
    earningsDte: earningsPoint?.dte ?? null,
    termStructure: termStructure.map((point) => ({
      expirationDate: point.expirationDate,
      dte: point.dte,
      atmIvPct: point.atmIvPct,
      expectedMovePct: point.expectedMovePct,
      putCallVolumeRatio: point.putCallVolumeRatio,
      putCallOpenInterestRatio: point.putCallOpenInterestRatio,
      contracts: point.contracts,
    })),
    ivHistory,
  }
}

const symbols = []
if (!apiKey) {
  for (const stock of megaCaps.stocks)
    symbols.push(unavailable(stock, 'MASSIVE_API_KEY未配置，期权市场数据不可用'))
} else {
  let accessDenied = false
  for (const stock of megaCaps.stocks) {
    if (accessDenied) {
      symbols.push(unavailable(stock, '当前Massive套餐未开放期权链快照'))
      continue
    }
    try {
      symbols.push(await fetchSymbol(stock))
      process.stdout.write(`updated options ${stock.symbol}\n`)
    } catch (error) {
      if (error.status === 401 || error.status === 403) accessDenied = true
      symbols.push(unavailable(stock, `期权链更新失败：${error.message}`))
      process.stderr.write(`failed options ${stock.symbol}: ${error.message}\n`)
    }
  }
}

const okCount = symbols.filter((item) => item.status === 'ok').length
const partialCount = symbols.filter((item) => item.status === 'partial').length
const attemptedAt = new Date().toISOString()
const hasUsableData = okCount + partialCount > 0
const output = {
  updatedAt: attemptedAt,
  attemptedAt,
  dataUpdatedAt: hasUsableData ? attemptedAt : (previous.dataUpdatedAt ?? null),
  configurationStatus: apiKey ? 'configured' : 'missing',
  status:
    okCount === symbols.length ? 'ok' : okCount + partialCount > 0 ? 'partial' : 'unavailable',
  source: 'Massive Options Chain Snapshot',
  sourceUrl: 'https://massive.com/docs/rest/options/snapshots/option-chain-snapshot',
  methodology:
    '选取365–730 DTE内接近1年、18个月和2年的到期日；每个到期日以最接近平值的8份合约计算平均IV，预期波动=IV×√(DTE/365)。Put/Call仅统计所示LEAPS到期日。IV Rank使用每日近端LEAPS平值IV历史，至少20个观测后才显示。',
  symbols,
}
await writeJsonAtomic(outputPath, output)
process.stdout.write(`wrote option market: ${okCount} ok, ${partialCount} partial\n`)
if (!apiKey) process.stdout.write('::warning::MASSIVE_API_KEY is missing; option data remains unavailable\n')
else if (!hasUsableData)
  process.stdout.write('::warning::Massive returned no usable option-chain data; verify plan access\n')
