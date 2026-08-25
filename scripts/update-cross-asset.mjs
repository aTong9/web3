import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { selectSourceCandidate } from './lib/source-policy.mjs'
import { writeJsonBatchAtomic } from './lib/write-json-atomic.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/cross-asset.json')
const homeOutputPath = resolve(root, 'src/data/market-home.json')
const forecastHistoryPath = resolve(root, 'src/data/cross-asset-forecast-history.json')
const technicalSignalsPath = resolve(root, 'src/data/asset-technical-signals.json')
const modelVersion = 'cross-asset-v1.5-rate-decomposition'
const homeModelVersion = 'cross-asset-home-v1.0-multi-horizon'
const retiredModelVersions = new Set(['cross-asset-v1.2-risk-stress-resonance'])

let liveForecastHistory = []
try {
  const storedForecasts = JSON.parse(await readFile(forecastHistoryPath, 'utf8'))
  liveForecastHistory = Array.isArray(storedForecasts.records)
    ? storedForecasts.records
        .map((record) => ({
          ...record,
          modelVersion: record.modelVersion ?? modelVersion,
        }))
        .filter((record) => !retiredModelVersions.has(record.modelVersion))
    : []
} catch (error) {
  if (error.code !== 'ENOENT') console.warn(`读取预测账本失败: ${error.message}`)
}

const definitions = [
  { id: 'sp500', name: '标普500', category: 'stocks', series: 'SP500', unit: '点', mode: 'return' },
  {
    id: 'nasdaq',
    name: '纳斯达克综合',
    category: 'stocks',
    series: 'NASDAQCOM',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'nikkei',
    name: '日经225',
    category: 'stocks',
    series: 'NIKKEI225',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'shanghai',
    name: '上证综指',
    category: 'stocks',
    series: 'sh000001',
    source: 'sina',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'hangseng',
    name: '恒生指数',
    category: 'stocks',
    series: 'hkHSI',
    source: 'tencent',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'euro50',
    name: 'NASDAQ Euro 50',
    category: 'stocks',
    series: 'NASDAQNQEURO50',
    unit: '点',
    mode: 'return',
  },
  { id: 'us2y', name: '美债2Y', category: 'bonds', series: 'DGS2', unit: '%', mode: 'difference' },
  {
    id: 'effr',
    name: '有效联邦基金利率',
    category: 'bonds',
    series: 'DFF',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'sofr',
    name: 'SOFR隔夜融资利率',
    category: 'bonds',
    series: 'SOFR',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'policygap',
    name: '2Y−EFFR政策路径差',
    category: 'macro',
    series: 'POLICY_GAP',
    source: 'derived',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
  },
  {
    id: 'fundingspread',
    name: 'SOFR−EFFR资金压力差',
    category: 'macro',
    series: 'FUNDING_SPREAD',
    source: 'derived',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
  },
  {
    id: 'us10y',
    name: '美债10Y',
    category: 'bonds',
    series: 'DGS10',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'us30y',
    name: '美债30Y',
    category: 'bonds',
    series: 'DGS30',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'real10y',
    name: '美债10Y实际利率',
    category: 'bonds',
    series: 'DFII10',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'termpremium10y',
    name: '美国10Y期限溢价',
    category: 'bonds',
    series: 'THREEFYTP10',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 4,
    maxStaleDays: 10,
  },
  {
    id: 'expectedrate10y',
    name: '美国10Y预期短率成分代理',
    category: 'bonds',
    series: 'EXPECTED_RATE_10Y_PROXY',
    source: 'derived',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 4,
    maxStaleDays: 10,
  },
  {
    id: 'breakeven10y',
    name: '美国10Y盈亏平衡通胀率',
    category: 'bonds',
    series: 'T10YIE',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'igspread',
    name: '美国投资级利差',
    category: 'bonds',
    series: 'BAMLC0A0CM',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'hyspread',
    name: '美国高收益利差',
    category: 'bonds',
    series: 'BAMLH0A0HYM2',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'nfci',
    name: '芝加哥联储金融条件指数',
    category: 'bonds',
    series: 'NFCI',
    unit: '点',
    mode: 'absolute',
    releaseLagDays: 5,
  },
  {
    id: 'stlfsi',
    name: '圣路易斯联储金融压力指数',
    category: 'bonds',
    series: 'STLFSI4',
    unit: '点',
    mode: 'absolute',
    releaseLagDays: 5,
    maxStaleDays: 14,
  },
  {
    id: 'fedassets',
    name: '美联储总资产',
    category: 'macro',
    series: 'WALCL',
    unit: '百万美元',
    mode: 'return',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'reserves',
    name: '美联储银行准备金余额',
    category: 'macro',
    series: 'WRESBAL',
    unit: '百万美元',
    mode: 'return',
    releaseLagDays: 1,
  },
  {
    id: 'rrp',
    name: '美联储隔夜逆回购使用量',
    category: 'macro',
    series: 'RRPONTSYD',
    unit: '十亿美元',
    mode: 'absolute',
  },
  {
    id: 'termspread',
    name: '美债10Y–2Y期限利差',
    category: 'macro',
    series: 'T10Y2Y',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'termspread3m',
    name: '美债10Y−3M期限利差',
    category: 'macro',
    series: 'T10Y3M',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'forwardinflation5y5y',
    name: '美国5Y5Y远期通胀预期',
    category: 'bonds',
    series: 'T5YIFR',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'emhyyield',
    name: '新兴市场高收益公司债有效收益率',
    category: 'bonds',
    series: 'BAMLEMHBHYCRPIEY',
    unit: '%',
    mode: 'difference',
  },
  {
    id: 'claims',
    name: '美国初请失业金人数',
    category: 'macro',
    series: 'ICSA',
    unit: '人',
    mode: 'return',
    releaseLagDays: 5,
  },
  {
    id: 'usd',
    name: '美元广义指数',
    category: 'fx',
    series: 'DTWEXBGS',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'vix',
    name: 'VIX波动率',
    category: 'stocks',
    series: 'VIXCLS',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'globalbreadth',
    name: '全球股指上涨参与率',
    category: 'stocks',
    series: 'GLOBAL_EQUITY_BREADTH',
    source: 'derived',
    unit: '%',
    mode: 'absolute',
  },
  {
    id: 'riskbreadth',
    name: '跨资产风险上涨参与率',
    category: 'macro',
    series: 'CROSS_ASSET_RISK_BREADTH',
    source: 'derived',
    unit: '%',
    mode: 'absolute',
  },
  {
    id: 'riskstress',
    name: '全球风险压力共振指数',
    category: 'macro',
    series: 'GLOBAL_RISK_STRESS_RESONANCE',
    source: 'derived',
    unit: 'σ',
    mode: 'absolute',
  },
  { id: 'eurusd', name: 'EUR/USD', category: 'fx', series: 'DEXUSEU', unit: '', mode: 'return' },
  { id: 'usdjpy', name: 'USD/JPY', category: 'fx', series: 'DEXJPUS', unit: '', mode: 'return' },
  { id: 'usdcny', name: 'USD/CNY', category: 'fx', series: 'DEXCHUS', unit: '', mode: 'return' },
  {
    id: 'wti',
    name: 'WTI原油',
    category: 'commodities',
    series: 'DCOILWTICO',
    unit: '美元',
    mode: 'return',
  },
  {
    id: 'brent',
    name: 'Brent原油',
    category: 'commodities',
    series: 'DCOILBRENTEU',
    unit: '美元',
    mode: 'return',
  },
  {
    id: 'gold',
    name: '黄金策略指数',
    category: 'commodities',
    series: 'NASDAQNQXAUGLD',
    unit: '点',
    mode: 'return',
  },
  {
    id: 'copper',
    name: '铜',
    category: 'commodities',
    series: 'PCOPPUSDM',
    unit: '美元/吨',
    mode: 'return',
  },
  {
    id: 'natgas',
    name: '美国天然气',
    category: 'commodities',
    series: 'DHHNGSP',
    unit: '美元',
    mode: 'return',
  },
  {
    id: 'btc',
    name: '比特币',
    category: 'crypto',
    series: 'CBBTCUSD',
    unit: '美元',
    mode: 'return',
  },
  {
    id: 'eth',
    name: '以太坊',
    category: 'crypto',
    series: 'CBETHUSD',
    unit: '美元',
    mode: 'return',
  },
  {
    id: 'stablecoins',
    name: '稳定币总供应',
    category: 'crypto',
    series: 'STABLECOINS_USD',
    source: 'defillama',
    unit: '美元',
    mode: 'return',
    releaseLagDays: 1,
  },
  {
    id: 'btccoreShare',
    name: 'BTC核心加密市值份额',
    category: 'crypto',
    series: 'BTC_CORE_SHARE',
    source: 'derived',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'ethcoreShare',
    name: 'ETH核心加密市值份额',
    category: 'crypto',
    series: 'ETH_CORE_SHARE',
    source: 'derived',
    unit: '%',
    mode: 'difference',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'btcactive',
    name: 'BTC活跃地址数',
    category: 'crypto',
    series: 'BTC_ACTIVE_ADDRESSES',
    source: 'coinmetrics',
    unit: '个',
    mode: 'return',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
  {
    id: 'ethactive',
    name: 'ETH活跃地址数',
    category: 'crypto',
    series: 'ETH_ACTIVE_ADDRESSES',
    source: 'coinmetrics',
    unit: '个',
    mode: 'return',
    releaseLagDays: 1,
    maxStaleDays: 7,
  },
]

const equityBreadthUniverse = [
  ['sp500', 'SP500'],
  ['nasdaq', 'NASDAQCOM'],
  ['nikkei', 'NIKKEI225'],
  ['shanghai', 'sh000001'],
  ['hangseng', 'hkHSI'],
  ['euro50', 'NASDAQNQEURO50'],
]
const riskBreadthUniverse = [
  ...equityBreadthUniverse,
  ['wti', 'DCOILWTICO'],
  ['copper', 'PCOPPUSDM'],
  ['btc', 'CBBTCUSD'],
  ['eth', 'CBETHUSD'],
]
const breadthTargetNames = {
  sp500: '标普500',
  nasdaq: '纳指',
  nikkei: '日经225',
  shanghai: '上证综指',
  hangseng: '恒生指数',
  euro50: '欧洲50',
  btc: 'BTC',
  wti: 'WTI',
}
const breadthExclusions = [
  ...equityBreadthUniverse.map(([id]) => ({
    id: `globalbreadth_ex_${id}`,
    targetId: id,
    universe: 'equity',
  })),
  ...['sp500', 'btc', 'wti'].map((id) => ({
    id: `riskbreadth_ex_${id}`,
    targetId: id,
    universe: 'risk',
  })),
]
definitions.push(
  ...breadthExclusions.map((item) => ({
    id: item.id,
    name: `${item.universe === 'equity' ? '全球股指' : '跨资产风险'}参与率（剔除${breadthTargetNames[item.targetId]}）`,
    category: item.universe === 'equity' ? 'stocks' : 'macro',
    series: item.id.toUpperCase(),
    source: 'derived',
    unit: '%',
    mode: 'absolute',
    hidden: true,
  })),
)

const fetchText = async (url) => {
  let lastError = null
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 finance-desk/1.0' },
        signal: AbortSignal.timeout(60_000),
      })
      if (!response.ok) throw new Error(`${response.status} ${url}`)
      return await response.text()
    } catch (error) {
      lastError = new Error(`数据源请求失败 ${url}: ${error.message}`, { cause: error })
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt))
    }
  }
  throw lastError
}

const defaultSourcePriority = [
  'Massive',
  'FRED',
  '新浪财经',
  '腾讯财经',
  'DefiLlama',
  'Coin Metrics',
]
const technicalConfigUrl =
  process.env.TECHNICAL_CONFIG_URL?.trim() ||
  'https://web3-quant-api.binson0426.workers.dev/api/technical-config'
const sourcePriority = await (async () => {
  try {
    const response = await fetch(technicalConfigUrl, { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const config = await response.json()
    if (!Array.isArray(config.sourcePriority) || !config.sourcePriority.length) {
      throw new Error('sourcePriority is empty')
    }
    return config.sourcePriority.map((source) => String(source).trim()).filter(Boolean)
  } catch (error) {
    console.warn(`读取运行时数据源优先级失败，使用仓库默认值: ${error.message}`)
    return defaultSourcePriority
  }
})()
const selectedProviderBySeries = {}
const providerUrls = {
  FRED: 'https://fred.stlouisfed.org/',
  新浪财经: 'https://finance.sina.com.cn/',
  腾讯财经: 'https://stockapp.finance.qq.com/',
  DefiLlama: 'https://defillama.com/',
  'Coin Metrics': 'https://github.com/coinmetrics/data',
  系统派生: '',
}
const sourceLabel = (definition) =>
  selectedProviderBySeries[definition.series] ??
  ({ derived: '系统派生', defillama: 'DefiLlama', coinmetrics: 'Coin Metrics' }[
    definition.source
  ] ||
    definition.source ||
    'FRED')
const calendarForDefinition = (definition) => {
  if (['btc', 'eth'].includes(definition.id)) return 'crypto-24x7'
  if (definition.id === 'shanghai') return 'sse'
  if (definition.id === 'hangseng') return 'hkex'
  if (definition.id === 'nikkei') return 'jpx'
  if (definition.id === 'euro50') return 'europe'
  if (['sp500', 'nasdaq', 'vix'].includes(definition.id)) return 'nyse'
  if (definition.id === 'copper') return 'monthly'
  return 'fred-business'
}

const seriesIds = definitions.filter((item) => !item.source).map((item) => item.series)
const histories = Object.fromEntries(
  await Promise.all(
    seriesIds.map(async (id) => {
      const csv = await fetchText(
        `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=2015-01-01`,
      )
      const history = csv
        .trim()
        .split(/\r?\n/)
        .slice(1)
        .map((line) => {
          const [date, rawValue] = line.split(',')
          return { date, value: rawValue?.trim() ? Number(rawValue) : Number.NaN }
        })
        .filter((item) => Number.isFinite(item.value))
      return [id, history]
    }),
  ),
)
for (const id of seriesIds) selectedProviderBySeries[id] = 'FRED'

const marketBars = {}
const [sinaShanghaiResult, tencentShanghaiResult] = await Promise.allSettled([
  fetchText(
    'https://quotes.sina.cn/cn/api/jsonp.php/var%20_data=/CN_MarketDataService.getKLineData?symbol=sh000001&scale=240&ma=no&datalen=400',
  ),
  fetchText('https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh000001,day,,,400,qfq'),
])
const sinaMatch =
  sinaShanghaiResult.status === 'fulfilled'
    ? sinaShanghaiResult.value.match(/var _data=\((\[[\s\S]*\])\);/)
    : null
const sinaShanghaiBars = sinaMatch
  ? JSON.parse(sinaMatch[1]).map((item) => ({
      date: item.day,
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume),
    }))
  : []
const tencentShanghaiPayload =
  tencentShanghaiResult.status === 'fulfilled' ? JSON.parse(tencentShanghaiResult.value) : {}
const tencentShanghaiBars = (
  tencentShanghaiPayload.data?.sh000001?.qfqday ??
  tencentShanghaiPayload.data?.sh000001?.day ??
  []
).map((item) => ({
  date: item[0],
  open: Number(item[1]),
  close: Number(item[2]),
  high: Number(item[3]),
  low: Number(item[4]),
  volume: Number(item[5]),
}))
const selectedShanghai = selectSourceCandidate([
  {
    source: '新浪财经',
    bars: sinaShanghaiBars,
    history: sinaShanghaiBars.map((item) => ({ date: item.date, value: item.close })),
  },
  {
    source: '腾讯财经',
    bars: tencentShanghaiBars,
    history: tencentShanghaiBars.map((item) => ({ date: item.date, value: item.close })),
  },
], sourcePriority)
if (!selectedShanghai) throw new Error('上证综指的新浪与腾讯数据源均不可用')
marketBars.shanghai = selectedShanghai.bars
histories.sh000001 = selectedShanghai.history
selectedProviderBySeries.sh000001 = selectedShanghai.source
const tencentPayload = JSON.parse(
  await fetchText('https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=hkHSI,day,,,400,qfq'),
)
marketBars.hangseng = (tencentPayload.data?.hkHSI?.day ?? []).map((item) => ({
  date: item[0],
  open: Number(item[1]),
  close: Number(item[2]),
  high: Number(item[3]),
  low: Number(item[4]),
  volume: Number(item[5]),
}))
histories.hkHSI = marketBars.hangseng.map((item) => ({ date: item.date, value: item.close }))
selectedProviderBySeries.hkHSI = '腾讯财经'
const stablecoinPayload = JSON.parse(
  await fetchText('https://stablecoins.llama.fi/stablecoincharts/all'),
)
histories.STABLECOINS_USD = stablecoinPayload
  .map((item) => ({
    date: new Date(Number(item.date) * 1000).toISOString().slice(0, 10),
    value: Number(item.totalCirculatingUSD?.peggedUSD),
  }))
  .filter((item) => Number.isFinite(item.value) && item.value > 0)

const parseCoinMetrics = (csv) => {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/)
  const headers = headerLine.split(',')
  const indexes = Object.fromEntries(headers.map((header, index) => [header, index]))
  return lines.map((line) => {
    const values = line.split(',')
    return {
      date: values[indexes.time],
      marketCap: Number(values[indexes.CapMrktCurUSD]),
      activeAddresses: Number(values[indexes.AdrActCnt]),
      price: Number(values[indexes.PriceUSD]),
    }
  })
}
const [btcMetrics, ethMetrics] = await Promise.all(
  [
    'https://cdn.jsdelivr.net/gh/coinmetrics/data@master/csv/btc.csv',
    'https://cdn.jsdelivr.net/gh/coinmetrics/data@master/csv/eth.csv',
  ].map(async (url) => parseCoinMetrics(await fetchText(url))),
)
for (const [series, metrics] of [
  ['CBBTCUSD', btcMetrics],
  ['CBETHUSD', ethMetrics],
]) {
  const coinMetricsHistory = metrics
    .filter((item) => Number.isFinite(item.price) && item.price > 0)
    .map((item) => ({ date: item.date, value: item.price }))
  const selected = selectSourceCandidate([
    { source: 'FRED', history: histories[series] ?? [] },
    { source: 'Coin Metrics', history: coinMetricsHistory },
  ], sourcePriority)
  if (selected) {
    histories[series] = selected.history
    selectedProviderBySeries[series] = selected.source
  }
}
histories.BTC_ACTIVE_ADDRESSES = btcMetrics
  .filter((item) => Number.isFinite(item.activeAddresses) && item.activeAddresses > 0)
  .map((item) => ({ date: item.date, value: item.activeAddresses }))
histories.ETH_ACTIVE_ADDRESSES = ethMetrics
  .filter((item) => Number.isFinite(item.activeAddresses) && item.activeAddresses > 0)
  .map((item) => ({ date: item.date, value: item.activeAddresses }))
const ethCapByDate = new Map(
  ethMetrics
    .filter((item) => Number.isFinite(item.marketCap) && item.marketCap > 0)
    .map((item) => [item.date, item.marketCap]),
)
const stablecoinByDate = new Map(histories.STABLECOINS_USD.map((item) => [item.date, item.value]))
let latestStablecoinValue = null
const coreShares = btcMetrics
  .filter((item) => Number.isFinite(item.marketCap) && item.marketCap > 0)
  .map((item) => {
    latestStablecoinValue = stablecoinByDate.get(item.date) ?? latestStablecoinValue
    const ethCap = ethCapByDate.get(item.date)
    if (!ethCap || !latestStablecoinValue) return null
    const total = item.marketCap + ethCap + latestStablecoinValue
    return {
      date: item.date,
      btc: (item.marketCap / total) * 100,
      eth: (ethCap / total) * 100,
    }
  })
  .filter(Boolean)
histories.BTC_CORE_SHARE = coreShares.map((item) => ({ date: item.date, value: item.btc }))
histories.ETH_CORE_SHARE = coreShares.map((item) => ({ date: item.date, value: item.eth }))

const round = (value, digits = 2) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
const shiftDate = (date, days = 0) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

const buildParticipationRate = (series, minimumMarkets) => {
  const movesBySeries = series.map((seriesId) => {
    const history = histories[seriesId] ?? []
    return new Map(
      history
        .slice(1)
        .map((item, index) => [
          item.date,
          history[index].value === 0 ? 0 : item.value / history[index].value - 1,
        ]),
    )
  })
  const dates = [...new Set(movesBySeries.flatMap((moves) => [...moves.keys()]))].toSorted()
  return dates
    .map((date) => {
      const available = movesBySeries
        .map((moves) => moves.get(date))
        .filter((value) => value !== undefined)
      if (available.length < minimumMarkets) return null
      return {
        date,
        value: (available.filter((value) => value > 0).length / available.length) * 100,
      }
    })
    .filter(Boolean)
}
histories.GLOBAL_EQUITY_BREADTH = buildParticipationRate(
  ['SP500', 'NASDAQCOM', 'NIKKEI225', 'sh000001', 'hkHSI', 'NASDAQNQEURO50'],
  3,
)
histories.CROSS_ASSET_RISK_BREADTH = buildParticipationRate(
  [
    'SP500',
    'NASDAQCOM',
    'NIKKEI225',
    'sh000001',
    'hkHSI',
    'NASDAQNQEURO50',
    'DCOILWTICO',
    'PCOPPUSDM',
    'CBBTCUSD',
    'CBETHUSD',
  ],
  5,
)
for (const exclusion of breadthExclusions) {
  const universe = exclusion.universe === 'equity' ? equityBreadthUniverse : riskBreadthUniverse
  const remainingSeries = universe
    .filter(([id]) => id !== exclusion.targetId)
    .map(([, series]) => series)
  histories[exclusion.id.toUpperCase()] = buildParticipationRate(
    remainingSeries,
    exclusion.universe === 'equity' ? 3 : 5,
  )
}

const alignedDifference = (leftSeries, rightSeries) => {
  const rightHistory = histories[rightSeries]
  let rightIndex = 0
  let rightValue = null
  return histories[leftSeries]
    .map((item) => {
      while (rightIndex < rightHistory.length && rightHistory[rightIndex].date <= item.date) {
        rightValue = rightHistory[rightIndex].value
        rightIndex += 1
      }
      return rightValue === null ? null : { date: item.date, value: item.value - rightValue }
    })
    .filter(Boolean)
}
histories.POLICY_GAP = alignedDifference('DGS2', 'DFF')
histories.FUNDING_SPREAD = alignedDifference('SOFR', 'DFF')
histories.EXPECTED_RATE_10Y_PROXY = alignedDifference('DGS10', 'THREEFYTP10')

const buildRiskStressResonance = () => {
  const components = [
    { series: 'VIXCLS', mode: 'return', releaseLagDays: 0 },
    { series: 'BAMLH0A0HYM2', mode: 'difference', releaseLagDays: 0 },
    { series: 'DTWEXBGS', mode: 'return', releaseLagDays: 0 },
    { series: 'DFII10', mode: 'difference', releaseLagDays: 0 },
  ].map((component) => {
    const history = histories[component.series] ?? []
    const moves = history.slice(1).map((item, index) => ({
      date: shiftDate(item.date, component.releaseLagDays),
      value:
        component.mode === 'difference'
          ? item.value - history[index].value
          : item.value / history[index].value - 1,
    }))
    const standardizedByDate = new Map()
    for (let index = 0; index < moves.length; index += 1) {
      const reference = moves.slice(Math.max(0, index - 60), index).map((item) => item.value)
      if (reference.length < 20) continue
      const mean = reference.reduce((sum, value) => sum + value, 0) / reference.length
      const deviation = Math.sqrt(
        reference.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
          Math.max(1, reference.length - 1),
      )
      if (deviation > 0)
        standardizedByDate.set(moves[index].date, (moves[index].value - mean) / deviation)
    }
    return standardizedByDate
  })
  const dates = [...new Set(components.flatMap((component) => [...component.keys()]))].toSorted()
  return dates
    .map((date) => {
      const scores = components
        .map((component) => component.get(date))
        .filter((value) => value !== undefined)
      if (scores.length < 3) return null
      return {
        date,
        value: round(scores.reduce((sum, value) => sum + value, 0) / scores.length, 4),
      }
    })
    .filter(Boolean)
}
histories.GLOBAL_RISK_STRESS_RESONANCE = buildRiskStressResonance()
const relativeChange = (history, offset, mode) => {
  if (history.length <= offset) return null
  const latest = history.at(-1).value
  const previous = history.at(-offset - 1).value
  return round(
    mode === 'difference'
      ? (latest - previous) * 100
      : mode === 'absolute'
        ? latest - previous
        : (latest / previous - 1) * 100,
  )
}
const ytdChange = (history, mode) => {
  const latest = history.at(-1)
  const previous = history.filter((item) => item.date < `${latest.date.slice(0, 4)}-01-01`).at(-1)
  if (!previous) return null
  return round(
    mode === 'difference'
      ? (latest.value - previous.value) * 100
      : mode === 'absolute'
        ? latest.value - previous.value
        : (latest.value / previous.value - 1) * 100,
  )
}

const generationDate = new Date().toISOString().slice(0, 10)
const daysBetween = (left, right) =>
  Math.floor((Date.parse(`${right}T00:00:00Z`) - Date.parse(`${left}T00:00:00Z`)) / 86_400_000)
const assets = definitions.map((definition) => {
  const history = histories[definition.series].filter(
    (item) => shiftDate(item.date, definition.releaseLagDays ?? 0) <= generationDate,
  )
  const latest = history.at(-1)
  const week = relativeChange(history, 5, definition.mode)
  const availableDate = latest ? shiftDate(latest.date, definition.releaseLagDays ?? 0) : null
  const stale =
    availableDate !== null && definition.maxStaleDays !== undefined
      ? daysBetween(availableDate, generationDate) > definition.maxStaleDays
      : false
  return {
    ...definition,
    source: sourceLabel(definition),
    sourceUrl: providerUrls[sourceLabel(definition)] ?? '',
    calendar: calendarForDefinition(definition),
    value: latest?.value ?? null,
    date: latest?.date ?? null,
    availableDate,
    stale,
    changes: {
      day: relativeChange(history, 1, definition.mode),
      week,
      month: relativeChange(history, 21, definition.mode),
      quarter: relativeChange(history, 63, definition.mode),
      halfYear: relativeChange(history, 126, definition.mode),
      yearToDate: ytdChange(history, definition.mode),
      year: relativeChange(history, 252, definition.mode),
    },
    flow: {
      status: 'proxy',
      label: definition.mode === 'return' ? '5日价格动量代理' : '5日水平变化代理',
      value: week,
      note: '不是申赎或净买入数据',
    },
  }
})

const dailyMoves = (definition) => {
  const history = histories[definition.series]
  return history
    .slice(1)
    .map((item, index) => ({
      date: shiftDate(item.date, definition.releaseLagDays ?? 0),
      value:
        definition.mode === 'difference' || definition.mode === 'absolute'
          ? item.value - history[index].value
          : item.value / history[index].value - 1,
    }))
    .filter((item) => item.date <= generationDate)
}
const standardizedLatestMove = (moves) => {
  if (moves.length < 21) return null
  const current = moves.at(-1).value
  const reference = moves.slice(-61, -1)
  const mean = reference.reduce((sum, item) => sum + item.value, 0) / reference.length
  const deviation = Math.sqrt(
    reference.reduce((sum, item) => sum + (item.value - mean) ** 2, 0) /
      Math.max(1, reference.length - 1),
  )
  return deviation > 0 ? (current - mean) / deviation : 0
}
const moveZAtDate = (definition, date = generationDate) =>
  standardizedLatestMove(dailyMoves(definition).filter((item) => item.date <= date))
const normalCdf = (value) => {
  const absolute = Math.abs(value)
  const t = 1 / (1 + 0.2316419 * absolute)
  const density = Math.exp(-(absolute ** 2) / 2) / Math.sqrt(2 * Math.PI)
  const tail =
    density *
    t *
    (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return value >= 0 ? 1 - tail : tail
}
const forwardMoves = (definition, horizon = 5) => {
  const history = histories[definition.series]
  return history.slice(0, -horizon).map((item, index) => {
    const future = history[index + horizon]
    return {
      date: item.date,
      outcomeDate: future.date,
      value:
        definition.mode === 'difference' || definition.mode === 'absolute'
          ? future.value - item.value
          : future.value / item.value - 1,
    }
  })
}
const correlationStats = (left, right, window = 60) => {
  const rightByDate = new Map(right.map((item) => [item.date, item.value]))
  const pairs = left
    .filter((item) => rightByDate.has(item.date))
    .map((item) => [item.value, rightByDate.get(item.date)])
    .slice(-window)
  if (pairs.length < Math.max(12, Math.min(30, Math.floor(window * 0.6))))
    return { value: null, samples: pairs.length, ciLow: null, ciHigh: null, pValue: null }
  const leftMean = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length
  const rightMean = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length
  const numerator = pairs.reduce(
    (sum, pair) => sum + (pair[0] - leftMean) * (pair[1] - rightMean),
    0,
  )
  const denominator = Math.sqrt(
    pairs.reduce((sum, pair) => sum + (pair[0] - leftMean) ** 2, 0) *
      pairs.reduce((sum, pair) => sum + (pair[1] - rightMean) ** 2, 0),
  )
  if (!denominator)
    return { value: null, samples: pairs.length, ciLow: null, ciHigh: null, pValue: null }
  const rawValue = numerator / denominator
  const value = round(rawValue)
  const bounded = Math.max(-0.9999, Math.min(0.9999, rawValue))
  const fisherZ = Math.atanh(bounded)
  const margin = 1.96 / Math.sqrt(pairs.length - 3)
  const testStatistic = Math.abs(fisherZ) * Math.sqrt(pairs.length - 3)
  return {
    value,
    samples: pairs.length,
    ciLow: round(Math.tanh(fisherZ - margin)),
    ciHigh: round(Math.tanh(fisherZ + margin)),
    pValue: round(2 * (1 - normalCdf(testStatistic)), 6),
  }
}
const pearson = (left, right, window = 60) => correlationStats(left, right, window).value

const matrixIds = [
  'sp500',
  'nasdaq',
  'shanghai',
  'hangseng',
  'euro50',
  'us10y',
  'hyspread',
  'usd',
  'usdjpy',
  'wti',
  'gold',
  'btc',
  'eth',
  'stablecoins',
]
const matrixDefinitions = matrixIds.map((id) => definitions.find((item) => item.id === id))
const correlations = matrixDefinitions.map((left) => ({
  id: left.id,
  values: matrixDefinitions.map((right) =>
    left.id === right.id ? 1 : pearson(dailyMoves(left), dailyMoves(right)),
  ),
}))

const getCorrelation = (left, right) => {
  const leftDefinition = definitions.find((item) => item.id === left)
  const rightDefinition = definitions.find((item) => item.id === right)
  return leftDefinition && rightDefinition
    ? pearson(dailyMoves(leftDefinition), dailyMoves(rightDefinition))
    : null
}
const correlationProfile = (leftMoves, rightMoves) => {
  const statistics = {
    short: correlationStats(leftMoves, rightMoves, 20),
    medium: correlationStats(leftMoves, rightMoves, 60),
    long: correlationStats(leftMoves, rightMoves, 120),
  }
  const windows = Object.fromEntries(
    Object.entries(statistics).map(([key, stats]) => [key, stats.value]),
  )
  const weighted = [
    [windows.short, 0.25],
    [windows.medium, 0.5],
    [windows.long, 0.25],
  ].filter(([value]) => value !== null)
  const signal = weighted.length
    ? round(
        weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) /
          weighted.reduce((sum, [, weight]) => sum + weight, 0),
      )
    : null
  const meaningfulSigns = Object.values(windows)
    .filter((value) => value !== null && Math.abs(value) >= 0.1)
    .map((value) => Math.sign(value))
  const stability =
    meaningfulSigns.length < 2
      ? 'insufficient'
      : new Set(meaningfulSigns).size === 1
        ? 'stable'
        : 'mixed'
  const regimeShift =
    windows.short !== null &&
    windows.long !== null &&
    (Math.sign(windows.short) !== Math.sign(windows.long) ||
      Math.abs(windows.short - windows.long) >= 0.35)
  const evidenceWindows = [statistics.medium, statistics.long].filter(
    (stats) =>
      stats.value !== null &&
      stats.ciLow !== null &&
      stats.ciHigh !== null &&
      ((stats.value > 0 && stats.ciLow > 0) || (stats.value < 0 && stats.ciHigh < 0)),
  )
  const evidence =
    evidenceWindows.length >= 2
      ? 'strong'
      : evidenceWindows.length === 1
        ? 'supported'
        : 'uncertain'
  return { signal, windows, statistics, stability, regimeShift, evidence }
}
const nonOverlappingOutcomes = (leftMoves, outcomes) => {
  const leftDates = new Set(leftMoves.map((item) => item.date))
  let previousOutcomeDate = null
  return outcomes.filter((item) => {
    if (!leftDates.has(item.date)) return false
    if (previousOutcomeDate !== null && item.date < previousOutcomeDate) return false
    previousOutcomeDate = item.outcomeDate
    return true
  })
}
const predictiveProfile = (leftDefinition, rightDefinition, cutoffDate = null) => {
  const leftMoves = dailyMoves(leftDefinition).filter(
    (item) => cutoffDate === null || item.date <= cutoffDate,
  )
  const availableOutcomes = forwardMoves(rightDefinition, 5).filter(
    (item) => cutoffDate === null || item.outcomeDate <= cutoffDate,
  )
  const outcomes = nonOverlappingOutcomes(leftMoves, availableOutcomes)
  const stats = correlationStats(leftMoves, outcomes, 260)
  const evidence =
    stats.value !== null &&
    stats.ciLow !== null &&
    stats.ciHigh !== null &&
    ((stats.value > 0 && stats.ciLow > 0) || (stats.value < 0 && stats.ciHigh < 0))
      ? 'supported'
      : 'uncertain'
  return { horizon: 5, overlapping: false, ...stats, qValue: null, evidence }
}
const quantile = (values, probability) => {
  if (!values.length) return null
  const sorted = values.toSorted((left, right) => left - right)
  const position = (sorted.length - 1) * probability
  const lower = Math.floor(position)
  const fraction = position - lower
  return sorted[lower + 1] === undefined
    ? sorted[lower]
    : sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower])
}
const shockProfile = (leftDefinition, rightDefinition, tail = 'upper10pct', cutoffDate = null) => {
  const leftMoves = dailyMoves(leftDefinition).filter(
    (item) => cutoffDate === null || item.date <= cutoffDate,
  )
  const leftByDate = new Map(leftMoves.map((item) => [item.date, item.value]))
  const availableOutcomes = forwardMoves(rightDefinition, 5).filter(
    (item) => cutoffDate === null || item.outcomeDate <= cutoffDate,
  )
  const outcomes = nonOverlappingOutcomes(leftMoves, availableOutcomes).slice(-520)
  const paired = outcomes
    .map((outcome) => ({ outcome, driverMove: leftByDate.get(outcome.date) }))
    .filter((item) => item.driverMove !== undefined)
  const threshold = quantile(
    paired.map((item) => item.driverMove),
    tail === 'upper10pct' ? 0.9 : 0.1,
  )
  const events =
    threshold === null
      ? []
      : paired.filter((item) =>
          tail === 'upper10pct' ? item.driverMove >= threshold : item.driverMove <= threshold,
        )
  const controls =
    threshold === null
      ? []
      : paired.filter((item) =>
          tail === 'upper10pct' ? item.driverMove < threshold : item.driverMove > threshold,
        )
  const eventUp = events.filter((item) => item.outcome.value > 0).length
  const controlUp = controls.filter((item) => item.outcome.value > 0).length
  const eventUpRatePct = events.length ? round((eventUp / events.length) * 100) : null
  const baselineUpRatePct = controls.length ? round((controlUp / controls.length) * 100) : null
  const pooledRate =
    events.length && controls.length
      ? (eventUp + controlUp) / (events.length + controls.length)
      : null
  const standardError =
    pooledRate === null
      ? null
      : Math.sqrt(pooledRate * (1 - pooledRate) * (1 / events.length + 1 / controls.length))
  const zScore =
    standardError && eventUpRatePct !== null && baselineUpRatePct !== null
      ? Math.abs(eventUpRatePct / 100 - baselineUpRatePct / 100) / standardError
      : null
  const pValue = zScore === null ? null : round(2 * (1 - normalCdf(zScore)), 6)
  const currentMove = leftMoves.at(-1)?.value ?? null
  return {
    tail,
    horizon: 5,
    threshold: threshold === null ? null : round(threshold, 6),
    currentMove: currentMove === null ? null : round(currentMove, 6),
    triggered:
      threshold !== null &&
      currentMove !== null &&
      (tail === 'upper10pct' ? currentMove >= threshold : currentMove <= threshold),
    eventSamples: events.length,
    controlSamples: controls.length,
    eventUpRatePct,
    baselineUpRatePct,
    liftPct:
      eventUpRatePct === null || baselineUpRatePct === null
        ? null
        : round(eventUpRatePct - baselineUpRatePct),
    medianOutcome:
      events.length > 0
        ? round(
            quantile(
              events.map((item) => item.outcome.value),
              0.5,
            ),
            6,
          )
        : null,
    pValue,
    qValue: null,
    evidence: 'uncertain',
  }
}
const chain = ({ left, right, expectedSign, ...definition }) => {
  const leftDefinition = definitions.find((item) => item.id === left)
  const rightDefinition = definitions.find((item) => item.id === right)
  const leftAsset = assets.find((item) => item.id === left)
  const rightAsset = assets.find((item) => item.id === right)
  const currentDataAvailable = !(leftAsset?.stale || rightAsset?.stale)
  const profile =
    leftDefinition && rightDefinition
      ? correlationProfile(dailyMoves(leftDefinition), dailyMoves(rightDefinition))
      : {
          signal: getCorrelation(left, right),
          windows: { short: null, medium: null, long: null },
          statistics: {
            short: { value: null, samples: 0, ciLow: null, ciHigh: null, pValue: null },
            medium: { value: null, samples: 0, ciLow: null, ciHigh: null, pValue: null },
            long: { value: null, samples: 0, ciLow: null, ciHigh: null, pValue: null },
          },
          stability: 'insufficient',
          regimeShift: false,
          evidence: 'uncertain',
        }
  const { signal } = profile
  const predictive =
    leftDefinition && rightDefinition
      ? predictiveProfile(leftDefinition, rightDefinition)
      : {
          horizon: 5,
          overlapping: false,
          value: null,
          samples: 0,
          ciLow: null,
          ciHigh: null,
          pValue: null,
          qValue: null,
          evidence: 'uncertain',
        }
  const shock =
    leftDefinition && rightDefinition
      ? shockProfile(leftDefinition, rightDefinition, 'upper10pct')
      : {
          tail: 'upper10pct',
          horizon: 5,
          threshold: null,
          currentMove: null,
          triggered: false,
          eventSamples: 0,
          controlSamples: 0,
          eventUpRatePct: null,
          baselineUpRatePct: null,
          liftPct: null,
          medianOutcome: null,
          pValue: null,
          qValue: null,
          evidence: 'uncertain',
        }
  const lowerShock =
    leftDefinition && rightDefinition
      ? shockProfile(leftDefinition, rightDefinition, 'lower10pct')
      : {
          tail: 'lower10pct',
          horizon: 5,
          threshold: null,
          currentMove: null,
          triggered: false,
          eventSamples: 0,
          controlSamples: 0,
          eventUpRatePct: null,
          baselineUpRatePct: null,
          liftPct: null,
          medianOutcome: null,
          pValue: null,
          qValue: null,
          evidence: 'uncertain',
        }
  const strength =
    signal === null || !currentDataAvailable
      ? 'unavailable'
      : Math.abs(signal) >= 0.5
        ? 'strong'
        : Math.abs(signal) >= 0.25
          ? 'medium'
          : 'weak'
  const signMatches =
    expectedSign === 'context' ||
    (expectedSign === 'positive' && (signal ?? 0) > 0) ||
    (expectedSign === 'negative' && (signal ?? 0) < 0)
  const status =
    signal === null || !currentDataAvailable
      ? 'unavailable'
      : Math.abs(signal) < 0.15
        ? 'dormant'
        : expectedSign === 'context'
          ? 'context'
          : signMatches
            ? 'confirming'
            : 'diverging'
  return {
    ...definition,
    left,
    right,
    expectedSign,
    ...profile,
    predictive,
    shock: { ...shock, triggered: currentDataAvailable && shock.triggered },
    lowerShock: { ...lowerShock, triggered: currentDataAvailable && lowerShock.triggered },
    strength,
    status,
  }
}
const applyPredictiveFdr = (chains) => {
  const predictiveRanked = chains
    .filter((item) => item.predictive.pValue !== null)
    .toSorted((left, right) => left.predictive.pValue - right.predictive.pValue)
  let nextQ = 1
  const predictiveQValues = new Map()
  for (let index = predictiveRanked.length - 1; index >= 0; index -= 1) {
    const item = predictiveRanked[index]
    const adjusted = Math.min(1, (item.predictive.pValue * predictiveRanked.length) / (index + 1))
    nextQ = Math.min(nextQ, adjusted)
    predictiveQValues.set(item.title, round(nextQ, 6))
  }
  const predictiveAdjusted = chains.map((item) => {
    const qValue = predictiveQValues.get(item.title) ?? null
    return {
      ...item,
      predictive: {
        ...item.predictive,
        qValue,
        evidence: qValue !== null && qValue <= 0.1 ? 'supported' : 'uncertain',
      },
    }
  })
  const shockRanked = predictiveAdjusted
    .flatMap((item) => [
      { title: item.title, key: 'upper', profile: item.shock },
      { title: item.title, key: 'lower', profile: item.lowerShock },
    ])
    .filter((item) => item.profile.pValue !== null && item.profile.eventSamples >= 10)
    .toSorted((left, right) => left.profile.pValue - right.profile.pValue)
  nextQ = 1
  const shockQValues = new Map()
  for (let index = shockRanked.length - 1; index >= 0; index -= 1) {
    const item = shockRanked[index]
    const adjusted = Math.min(1, (item.profile.pValue * shockRanked.length) / (index + 1))
    nextQ = Math.min(nextQ, adjusted)
    shockQValues.set(`${item.title}:${item.key}`, round(nextQ, 6))
  }
  return predictiveAdjusted.map((item) => {
    const upperQValue = shockQValues.get(`${item.title}:upper`) ?? null
    const lowerQValue = shockQValues.get(`${item.title}:lower`) ?? null
    return {
      ...item,
      shock: {
        ...item.shock,
        qValue: upperQValue,
        evidence: upperQValue !== null && upperQValue <= 0.1 ? 'supported' : 'uncertain',
      },
      lowerShock: {
        ...item.lowerShock,
        qValue: lowerQValue,
        evidence: lowerQValue !== null && lowerQValue <= 0.1 ? 'supported' : 'uncertain',
      },
    }
  })
}
const riskStressTargets = [
  ['sp500', '标普500'],
  ['nasdaq', '纳指'],
  ['shanghai', '上证综指'],
  ['hangseng', '恒生指数'],
  ['euro50', '欧洲50'],
  ['nikkei', '日经225'],
  ['wti', 'WTI原油'],
  ['gold', '黄金'],
  ['btc', 'BTC'],
  ['eth', 'ETH'],
]
const officialStressTargets = riskStressTargets
const rateDecompositionChains = [
  [
    'termpremium10y',
    'us10y',
    '10Y期限溢价—10Y收益率链',
    'positive',
    '美债期限补偿上升',
    '10Y名义收益率承压上行',
  ],
  [
    'termpremium10y',
    'sp500',
    '10Y期限溢价—标普500链',
    'negative',
    '长期债券风险补偿上升',
    '股票估值贴现率与融资成本承压',
  ],
  [
    'termpremium10y',
    'nasdaq',
    '10Y期限溢价—纳指链',
    'negative',
    '长期债券风险补偿上升',
    '长久期科技股估值承压',
  ],
  [
    'termpremium10y',
    'gold',
    '10Y期限溢价—黄金链',
    'negative',
    '持有长期债券所需补偿上升',
    '无息黄金的机会成本变化',
  ],
  [
    'termpremium10y',
    'usd',
    '10Y期限溢价—美元链',
    'context',
    '美国长期收益率风险补偿变化',
    '美元利差吸引力与风险偏好重新定价',
  ],
  [
    'expectedrate10y',
    'us10y',
    '预期短率成分—10Y收益率链',
    'positive',
    '未来短端政策利率路径上修',
    '10Y名义收益率承压上行',
  ],
  [
    'expectedrate10y',
    'sp500',
    '预期短率成分—标普500链',
    'negative',
    '预期政策路径抬升',
    '股票融资与贴现成本提高',
  ],
  [
    'expectedrate10y',
    'nasdaq',
    '预期短率成分—纳指链',
    'negative',
    '预期政策路径抬升',
    '长久期科技股现金流折现压力提高',
  ],
  [
    'expectedrate10y',
    'gold',
    '预期短率成分—黄金链',
    'negative',
    '预期政策利率维持高位',
    '无息黄金机会成本提高',
  ],
  [
    'expectedrate10y',
    'usd',
    '预期短率成分—美元链',
    'positive',
    '预期美国短率路径上修',
    '美元利差支撑增强',
  ],
]
const transmissionChains = applyPredictiveFdr([
  chain({
    group: '流动性与汇率',
    title: '日元套息链',
    left: 'usdjpy',
    right: 'nasdaq',
    expectedSign: 'positive',
    steps: ['日元走强（USD/JPY下跌）', '套息头寸去杠杆', '全球高估值资产承压'],
    interpretation: 'USD/JPY与纳指收益相关性；正相关更符合典型套息风险偏好',
    sourceTitle: 'ECB · Carry trades and exchange rates',
    sourceUrl: 'https://www.ecb.europa.eu/pub/pdf/other/mb201003_focus10.en.pdf',
  }),
  chain({
    group: '利率与估值',
    title: '利率—科技股链',
    left: 'us10y',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['美债10Y收益率上行', '远期现金流贴现率提高', '科技成长估值承压'],
    interpretation: '10Y收益率日变化与纳指收益相关性',
    sourceTitle: 'Federal Reserve · Financial stability',
    sourceUrl: 'https://www.federalreserve.gov/publications/financial-stability-report.htm',
  }),
  chain({
    group: '信用与风险偏好',
    title: '信用利差—美股链',
    left: 'hyspread',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['高收益信用利差走阔', '融资压力与违约风险上升', '美股风险偏好下降'],
    interpretation: '高收益利差日变化与标普500收益相关性',
    sourceTitle: 'FRED · ICE BofA High Yield OAS',
    sourceUrl: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2',
  }),
  chain({
    group: '美元流动性',
    title: '美元—全球股票链',
    left: 'usd',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['美元走强', '全球美元融资条件收紧', '风险资产估值承压'],
    interpretation: '美元广义指数与标普500收益相关性',
    sourceTitle: 'BIS · Global dollar cycle',
    sourceUrl: 'https://www.bis.org/publ/work819.htm',
  }),
  chain({
    group: '美元流动性',
    title: '美元—加密链',
    left: 'usd',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['美元流动性收紧', '高波动资产资金边际下降', 'BTC承压'],
    interpretation: '美元广义指数与BTC收益相关性',
    sourceTitle: 'BIS · Crypto and financial conditions',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '美元与避险',
    title: '美元—黄金链',
    left: 'usd',
    right: 'gold',
    expectedSign: 'negative',
    steps: ['美元走强', '非美元买家黄金成本提高', '黄金相对承压'],
    interpretation: '美元指数与黄金策略价格代理收益相关性',
    sourceTitle: 'FRED · Gold series',
    sourceUrl: 'https://fred.stlouisfed.org/tags/series?t=daily%3Bgold',
  }),
  chain({
    group: '通胀与商品',
    title: '原油—长端利率链',
    left: 'wti',
    right: 'us10y',
    expectedSign: 'positive',
    steps: ['原油价格上涨', '通胀预期与期限溢价上升', '长端收益率上行'],
    interpretation: 'WTI收益与10Y收益率日变化相关性',
    sourceTitle: 'Federal Reserve · Oil shocks',
    sourceUrl:
      'https://www.federalreserve.gov/econres/feds/are-oil-shocks-inflationary-asymmetric-and-nonlinear-specifications-versus-changes-in-regime.htm',
  }),
  chain({
    group: '增长与商品',
    title: '原油—美股增长链',
    left: 'wti',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['原油变化', '区分需求繁荣或供给冲击', '美股反应取决于宏观情景'],
    interpretation: '同涨偏需求繁荣；油涨股跌偏供给冲击或通胀压力',
    sourceTitle: 'Federal Reserve · Oil regime switching',
    sourceUrl:
      'https://www.federalreserve.gov/econres/feds/macroeconomic-implications-of-oil-price-fluctuations-a-regime-switching-framework-for-the-euro-area.htm',
  }),
  chain({
    group: '中国与全球需求',
    title: '中国—港股链',
    left: 'shanghai',
    right: 'hangseng',
    expectedSign: 'positive',
    steps: ['中国增长与政策预期', '离岸中国资产重估', '港股风险偏好变化'],
    interpretation: '上证综指与恒生指数收益相关性',
    sourceTitle: 'IMF · China spillovers',
    sourceUrl:
      'https://www.imf.org/-/media/files/publications/wp/2025/english/wpiea2025133-print-pdf.pdf',
  }),
  chain({
    group: '中国与全球需求',
    title: '中国—原油需求链',
    left: 'shanghai',
    right: 'wti',
    expectedSign: 'positive',
    steps: ['中国增长预期改善', '全球需求预期上修', '原油价格获得支撑'],
    interpretation: '上证综指与WTI收益相关性；仅作为中国需求高频代理',
    sourceTitle: 'IMF · Chinese macro surprises and commodities',
    sourceUrl: 'https://www.elibrary.imf.org/view/journals/001/2025/133/article-A001-en.xml',
  }),
  chain({
    group: '全球股市传染',
    title: '美股—欧股链',
    left: 'sp500',
    right: 'euro50',
    expectedSign: 'positive',
    steps: ['美国风险偏好变化', '跨境资产配置与盈利预期传导', '欧洲股市跟随重估'],
    interpretation: '标普500与Euro 50收益相关性',
    sourceTitle: 'BIS · Asset price fluctuations',
    sourceUrl: 'https://www.bis.org/publ/econ40.htm',
  }),
  chain({
    group: '避险与流动性',
    title: '黄金—股票状态链',
    left: 'gold',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['黄金与股票相关性切换', '识别避险或共同流动性驱动', '判断当前宏观状态'],
    interpretation: '负相关偏传统避险；正相关可能是流动性或通胀共同驱动',
    sourceTitle: 'BIS · Asset prices and monetary policy',
    sourceUrl: 'https://www.bis.org/publ/confp05.htm',
  }),
  chain({
    group: '加密风险偏好',
    title: '科技股—BTC链',
    left: 'nasdaq',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['全球流动性与风险偏好变化', '科技成长资产重估', 'BTC同步放大波动'],
    interpretation: '纳指与BTC收益相关性',
    sourceTitle: 'BIS · Cryptoassets',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '信用与加密',
    title: '信用利差—BTC链',
    left: 'hyspread',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['信用利差走阔', '杠杆与风险预算收缩', 'BTC等高波动资产承压'],
    interpretation: '高收益利差日变化与BTC收益相关性',
    sourceTitle: 'FRED · Financial stress series',
    sourceUrl: 'https://fred.stlouisfed.org/categories/32255',
  }),
  chain({
    group: '波动率与去杠杆',
    title: 'VIX—美股去杠杆链',
    left: 'vix',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['VIX快速上行', '风险预算与波动率控制仓位收缩', '美股抛压上升'],
    interpretation: 'VIX收益与标普500收益相关性',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '波动率与去杠杆',
    title: 'VIX—科技股链',
    left: 'vix',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['隐含波动率上升', '高久期资产风险溢价提高', '科技成长股承压'],
    interpretation: 'VIX收益与纳指收益相关性',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '波动率与加密',
    title: 'VIX—BTC风险链',
    left: 'vix',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['传统市场波动率上升', '跨市场风险预算收缩', 'BTC波动与去杠杆压力上升'],
    interpretation: 'VIX收益与BTC收益相关性',
    sourceTitle: 'BIS · Cryptoassets and financial stability',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '实际利率与贵金属',
    title: '实际利率—黄金链',
    left: 'real10y',
    right: 'gold',
    expectedSign: 'negative',
    steps: ['实际利率上行', '持有无息黄金的机会成本提高', '黄金估值承压'],
    interpretation: '10Y实际利率日变化与黄金策略代理收益相关性',
    sourceTitle: 'Federal Reserve · Real interest rates',
    sourceUrl: 'https://fred.stlouisfed.org/series/DFII10',
  }),
  chain({
    group: '实际利率与估值',
    title: '实际利率—科技估值链',
    left: 'real10y',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['实际利率上行', '真实贴现率提高', '科技股远期现金流现值下降'],
    interpretation: '10Y实际利率日变化与纳指收益相关性',
    sourceTitle: 'Federal Reserve · Real interest rates',
    sourceUrl: 'https://fred.stlouisfed.org/series/DFII10',
  }),
  chain({
    group: '通胀预期与商品',
    title: '通胀预期—原油链',
    left: 'breakeven10y',
    right: 'wti',
    expectedSign: 'positive',
    steps: ['原油供需冲击或需求改善', '通胀补偿重新定价', '盈亏平衡通胀率与油价共振'],
    interpretation: '10Y盈亏平衡通胀率日变化与WTI收益相关性',
    sourceTitle: 'FRED · 10-Year Breakeven Inflation',
    sourceUrl: 'https://fred.stlouisfed.org/series/T10YIE',
  }),
  chain({
    group: '通胀预期与黄金',
    title: '通胀预期—黄金链',
    left: 'breakeven10y',
    right: 'gold',
    expectedSign: 'positive',
    steps: ['通胀预期上升', '货币购买力对冲需求增强', '黄金获得支撑'],
    interpretation: '10Y盈亏平衡通胀率日变化与黄金策略代理收益相关性',
    sourceTitle: 'FRED · 10-Year Breakeven Inflation',
    sourceUrl: 'https://fred.stlouisfed.org/series/T10YIE',
  }),
  chain({
    group: '金融条件与风险偏好',
    title: '金融条件—美股链',
    left: 'nfci',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['金融条件收紧（NFCI上行）', '融资与风险预算承压', '美股风险偏好下降'],
    interpretation: 'NFCI周变化与标普500收益相关性；负相关符合收紧传导',
    sourceTitle: 'Chicago Fed · National Financial Conditions Index',
    sourceUrl: 'https://www.chicagofed.org/research/data/nfci/current-data',
  }),
  chain({
    group: '金融条件与高波动资产',
    title: '金融条件—BTC链',
    left: 'nfci',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['金融条件收紧', '杠杆与边际流动性减少', 'BTC等高波动资产承压'],
    interpretation: 'NFCI周变化与BTC收益相关性',
    sourceTitle: 'Chicago Fed · National Financial Conditions Index',
    sourceUrl: 'https://www.chicagofed.org/research/data/nfci/current-data',
  }),
  chain({
    group: '短端利率与估值',
    title: '2Y利率—科技股链',
    left: 'us2y',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['2Y美债利率上行', '政策利率路径预期上修', '科技股估值与风险偏好承压'],
    interpretation: '2Y收益率日变化与纳指收益相关性',
    sourceTitle: 'Federal Reserve · Monetary policy and financial conditions',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy.htm',
  }),
  chain({
    group: '人民币与离岸中国资产',
    title: 'USD/CNY—港股链',
    left: 'usdcny',
    right: 'hangseng',
    expectedSign: 'negative',
    steps: ['USD/CNY上行（人民币走弱）', '资金流与中国风险溢价承压', '离岸中国股票承压'],
    interpretation: 'USD/CNY与恒生指数收益相关性',
    sourceTitle: 'BIS · Exchange rates and capital flows',
    sourceUrl: 'https://www.bis.org/topics/exchange_rates.htm',
  }),
  chain({
    group: '避险资产状态',
    title: '黄金—BTC状态链',
    left: 'gold',
    right: 'btc',
    expectedSign: 'context',
    steps: ['黄金与BTC相关性变化', '识别货币贬值共振或风险偏好分化', '判断数字资产当前属性'],
    interpretation: '正相关可能反映流动性/货币属性；负相关偏风险资产属性',
    sourceTitle: 'BIS · Cryptoassets and financial stability',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '央行资产负债表',
    title: '美联储资产—美股流动性链',
    left: 'fedassets',
    right: 'sp500',
    expectedSign: 'positive',
    steps: ['美联储总资产扩张', '银行体系流动性环境改变', '美股风险偏好重估'],
    interpretation: '美联储总资产周变化与标普500收益的共振和领先统计',
    sourceTitle: 'Federal Reserve · H.4.1 balance sheet',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/default.htm',
  }),
  chain({
    group: '央行资产负债表',
    title: '美联储资产—BTC流动性链',
    left: 'fedassets',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['美联储资产负债表变化', '边际美元流动性变化', 'BTC高波动属性放大反应'],
    interpretation: '美联储总资产周变化与BTC收益关系',
    sourceTitle: 'Federal Reserve · H.4.1 balance sheet',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/default.htm',
  }),
  chain({
    group: '银行准备金与风险资产',
    title: '准备金—美股链',
    left: 'reserves',
    right: 'sp500',
    expectedSign: 'positive',
    steps: ['准备金余额增加', '银行体系流动性缓冲增强', '美股融资条件变化'],
    interpretation: '银行准备金周变化与标普500收益关系',
    sourceTitle: 'Federal Reserve · Factors affecting reserve balances',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/about.htm',
  }),
  chain({
    group: '银行准备金与风险资产',
    title: '准备金—BTC链',
    left: 'reserves',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['准备金余额变化', '美元流动性与风险预算变化', 'BTC需求边际变化'],
    interpretation: '银行准备金周变化与BTC收益关系',
    sourceTitle: 'Federal Reserve · Factors affecting reserve balances',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/about.htm',
  }),
  chain({
    group: '货币市场流动性',
    title: '隔夜逆回购—美股状态链',
    left: 'rrp',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['ON RRP使用量变化', '货币市场现金配置变化', '风险资产流动性环境变化'],
    interpretation: '逆回购下降不必然直接流入股市，仅作流动性状态线索',
    sourceTitle: 'New York Fed · Repo and reverse repo agreements',
    sourceUrl:
      'https://www.newyorkfed.org/markets/domestic-market-operations/monetary-policy-implementation/repo-reverse-repo-agreements',
  }),
  chain({
    group: '期限结构与周期',
    title: '10Y–2Y期限利差—美股状态链',
    left: 'termspread',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['期限利差变化', '增长/政策预期与银行利差变化', '股市周期定价变化'],
    interpretation: '曲线变陡可来自增长改善或降息预期，需结合利率方向解读',
    sourceTitle: 'FRED · 10-Year minus 2-Year Treasury spread',
    sourceUrl: 'https://fred.stlouisfed.org/series/T10Y2Y',
  }),
  chain({
    group: '就业与增长',
    title: '初请失业金—美股状态链',
    left: 'claims',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['初请失业金人数上升', '就业与增长动能转弱', '盈利压力与降息预期并存'],
    interpretation: '对股市的方向取决于增长恶化与政策宽松哪个占主导',
    sourceTitle: 'U.S. Department of Labor · Weekly claims',
    sourceUrl: 'https://www.dol.gov/ui/data.pdf',
  }),
  chain({
    group: '就业与商品需求',
    title: '初请失业金—原油需求链',
    left: 'claims',
    right: 'wti',
    expectedSign: 'negative',
    steps: ['初请失业金人数上升', '美国需求走弱风险增加', '原油需求预期承压'],
    interpretation: '初请失业金周变化与WTI收益关系',
    sourceTitle: 'U.S. Department of Labor · Weekly claims',
    sourceUrl: 'https://www.dol.gov/ui/data.pdf',
  }),
  chain({
    group: '央行资产负债表',
    title: '美联储资产—黄金链',
    left: 'fedassets',
    right: 'gold',
    expectedSign: 'positive',
    steps: ['美联储总资产扩张', '流动性与货币贬值预期变化', '黄金需求重估'],
    interpretation: '美联储总资产周变化与黄金策略指数关系',
    sourceTitle: 'Federal Reserve · H.4.1 balance sheet',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/default.htm',
  }),
  chain({
    group: '信用与估值',
    title: '高收益利差—科技股链',
    left: 'hyspread',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['高收益信用利差走阔', '融资条件与风险溢价上升', '高久期科技股承压'],
    interpretation: '高收益信用利差日变化与纳指收益关系',
    sourceTitle: 'Federal Reserve · Financial Stability Report',
    sourceUrl: 'https://www.federalreserve.gov/publications/financial-stability-report.htm',
  }),
  chain({
    group: '央行资产负债表',
    title: '美联储资产—科技股流动性链',
    left: 'fedassets',
    right: 'nasdaq',
    expectedSign: 'positive',
    steps: ['美联储总资产变化', '美元流动性与贴现环境变化', '科技股估值重估'],
    interpretation: '美联储总资产周变化与纳指后续收益关系',
    sourceTitle: 'Federal Reserve · H.4.1 balance sheet',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/default.htm',
  }),
  chain({
    group: '银行准备金与风险资产',
    title: '准备金—科技股链',
    left: 'reserves',
    right: 'nasdaq',
    expectedSign: 'positive',
    steps: ['准备金余额变化', '银行体系流动性缓冲变化', '科技股风险预算调整'],
    interpretation: '银行准备金周变化与纳指后续收益关系',
    sourceTitle: 'Federal Reserve · Factors affecting reserve balances',
    sourceUrl: 'https://www.federalreserve.gov/releases/h41/about.htm',
  }),
  chain({
    group: '波动率与全球去杠杆',
    title: 'VIX—欧洲股市链',
    left: 'vix',
    right: 'euro50',
    expectedSign: 'negative',
    steps: ['美国隐含波动率上升', '全球风险预算收缩', '欧洲股票承压'],
    interpretation: 'VIX收益与Euro 50收益关系，识别跨区域去杠杆',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '波动率与全球去杠杆',
    title: 'VIX—日本股市链',
    left: 'vix',
    right: 'nikkei',
    expectedSign: 'negative',
    steps: ['美国隐含波动率上升', '全球套息与风险头寸收缩', '日本股票承压'],
    interpretation: 'VIX收益与日经225收益关系',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '波动率与全球去杠杆',
    title: 'VIX—港股链',
    left: 'vix',
    right: 'hangseng',
    expectedSign: 'negative',
    steps: ['全球波动率上升', '离岸风险预算与资金流收缩', '港股承压'],
    interpretation: 'VIX收益与恒生指数收益关系',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '日元与日本资产',
    title: 'USD/JPY—日股链',
    left: 'usdjpy',
    right: 'nikkei',
    expectedSign: 'positive',
    steps: ['日元走弱（USD/JPY上行）', '出口企业折算盈利改善', '日股获得支撑'],
    interpretation: 'USD/JPY与日经225收益关系；风险冲击期可能发生反转',
    sourceTitle: 'Bank of Japan · Financial System Report',
    sourceUrl: 'https://www.boj.or.jp/en/research/brp/fsr/index.htm',
  }),
  chain({
    group: '人民币与中国资产',
    title: 'USD/CNY—A股链',
    left: 'usdcny',
    right: 'shanghai',
    expectedSign: 'negative',
    steps: ['USD/CNY上行（人民币走弱）', '资本流与风险溢价压力上升', 'A股估值承压'],
    interpretation: 'USD/CNY与上证综指收益关系',
    sourceTitle: 'BIS · Exchange rates and capital flows',
    sourceUrl: 'https://www.bis.org/topics/exchange_rates.htm',
  }),
  chain({
    group: '全球增长与工业品',
    title: '铜—美股增长链',
    left: 'copper',
    right: 'sp500',
    expectedSign: 'positive',
    steps: ['铜价走强', '全球制造业与需求预期改善', '美股盈利预期获得支撑'],
    interpretation: '铜价与标普500收益关系；需区分供给扰动',
    sourceTitle: 'IMF · Primary Commodity Prices',
    sourceUrl: 'https://www.imf.org/en/Research/commodity-prices',
  }),
  chain({
    group: '中国增长与工业品',
    title: '铜—A股周期链',
    left: 'copper',
    right: 'shanghai',
    expectedSign: 'positive',
    steps: ['铜价变化', '中国工业需求预期变化', 'A股周期与盈利预期重估'],
    interpretation: '铜价与上证综指收益关系；供给冲击时仅作状态线索',
    sourceTitle: 'IMF · Primary Commodity Prices',
    sourceUrl: 'https://www.imf.org/en/Research/commodity-prices',
  }),
  chain({
    group: '美元与全球风险偏好',
    title: '美元—欧洲股市链',
    left: 'usd',
    right: 'euro50',
    expectedSign: 'negative',
    steps: ['美元走强', '全球美元金融条件收紧', '欧洲风险资产承压'],
    interpretation: '美元广义指数与Euro 50收益关系',
    sourceTitle: 'BIS · Global dollar cycle',
    sourceUrl: 'https://www.bis.org/publ/work819.htm',
  }),
  chain({
    group: '通胀与估值',
    title: '通胀预期—科技股链',
    left: 'breakeven10y',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['通胀预期上升', '名义利率与政策紧缩预期上升', '科技股估值承压'],
    interpretation: '10Y盈亏平衡通胀率日变化与纳指收益关系；增长型再通胀时可能反转',
    sourceTitle: 'Federal Reserve · Financial Stability Report',
    sourceUrl: 'https://www.federalreserve.gov/publications/financial-stability-report.htm',
  }),
  chain({
    group: '政策路径与估值',
    title: '政策路径差—科技股链',
    left: 'policygap',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['2Y相对EFFR上行', '未来政策路径被上修', '科技股贴现率压力上升'],
    interpretation: '2Y−EFFR差值变化与纳指后续收益关系',
    sourceTitle: 'Federal Reserve · Policy expectations and Treasury yields',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy.htm',
  }),
  chain({
    group: '政策路径与风险偏好',
    title: '政策路径差—美股链',
    left: 'policygap',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['短端政策路径预期上修', '金融条件趋紧', '美股风险溢价重估'],
    interpretation: '2Y−EFFR差值变化与标普500后续收益关系',
    sourceTitle: 'Federal Reserve · Monetary policy',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy.htm',
  }),
  chain({
    group: '政策路径与贵金属',
    title: '政策路径差—黄金链',
    left: 'policygap',
    right: 'gold',
    expectedSign: 'negative',
    steps: ['未来政策利率预期上修', '美元与实际持有成本上升', '黄金承压'],
    interpretation: '2Y−EFFR差值变化与黄金策略指数后续收益关系',
    sourceTitle: 'Federal Reserve · Monetary policy',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy.htm',
  }),
  chain({
    group: '政策路径与美元',
    title: '政策路径差—美元链',
    left: 'policygap',
    right: 'usd',
    expectedSign: 'positive',
    steps: ['美国政策路径预期上修', '相对利差预期扩大', '美元获得支撑'],
    interpretation: '2Y−EFFR差值变化与美元广义指数收益关系',
    sourceTitle: 'BIS · Exchange rates and monetary policy',
    sourceUrl: 'https://www.bis.org/topics/exchange_rates.htm',
  }),
  chain({
    group: '隔夜融资压力',
    title: 'SOFR−EFFR—美股链',
    left: 'fundingspread',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['SOFR相对EFFR走高', '担保隔夜融资压力上升', '美股杠杆与风险预算承压'],
    interpretation: 'SOFR−EFFR差值变化与标普500后续收益关系；日常微幅变化可能无效',
    sourceTitle: 'New York Fed · SOFR',
    sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  }),
  chain({
    group: '隔夜融资压力',
    title: 'SOFR−EFFR—科技股链',
    left: 'fundingspread',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['隔夜融资压力上升', '杠杆资金成本提高', '高久期科技股承压'],
    interpretation: 'SOFR−EFFR差值变化与纳指后续收益关系',
    sourceTitle: 'New York Fed · SOFR',
    sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  }),
  chain({
    group: '隔夜融资压力',
    title: 'SOFR−EFFR—BTC链',
    left: 'fundingspread',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['美元隔夜融资压力上升', '跨市场杠杆与边际流动性收缩', 'BTC承压'],
    interpretation: 'SOFR−EFFR差值变化与BTC后续收益关系',
    sourceTitle: 'New York Fed · SOFR',
    sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  }),
  chain({
    group: '资金价格与信用',
    title: 'SOFR—高收益信用链',
    left: 'sofr',
    right: 'hyspread',
    expectedSign: 'positive',
    steps: ['隔夜资金成本上升', '再融资与杠杆成本上升', '高收益信用利差承压走阔'],
    interpretation: 'SOFR变化与高收益信用利差后续变化关系',
    sourceTitle: 'New York Fed · SOFR',
    sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  }),
  chain({
    group: '加密内部轮动',
    title: 'BTC—ETH风险偏好链',
    left: 'btc',
    right: 'eth',
    expectedSign: 'positive',
    steps: ['BTC风险偏好变化', '加密市场资金与杠杆扩散', 'ETH跟随或放大波动'],
    interpretation: 'BTC收益与ETH后续收益关系；只表示市场内部传导而非单向因果',
    sourceTitle: 'BIS · Cryptoassets',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '稳定币流动性',
    title: '稳定币供应—BTC链',
    left: 'stablecoins',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['稳定币总供应扩张', '链上可用美元流动性增加', 'BTC边际需求可能获得支撑'],
    interpretation: '稳定币总供应变化与BTC后续收益关系；供应增长不等于资金必然买入',
    sourceTitle: 'DefiLlama · Stablecoins',
    sourceUrl: 'https://defillama.com/stablecoins',
  }),
  chain({
    group: '稳定币流动性',
    title: '稳定币供应—ETH链',
    left: 'stablecoins',
    right: 'eth',
    expectedSign: 'positive',
    steps: ['稳定币总供应扩张', '链上交易与抵押流动性增加', 'ETH生态风险偏好可能改善'],
    interpretation: '稳定币总供应变化与ETH后续收益关系',
    sourceTitle: 'DefiLlama · Stablecoins',
    sourceUrl: 'https://defillama.com/stablecoins',
  }),
  chain({
    group: '美元与加密',
    title: '美元—ETH链',
    left: 'usd',
    right: 'eth',
    expectedSign: 'negative',
    steps: ['美元走强', '全球美元流动性收紧', 'ETH等高波动资产承压'],
    interpretation: '美元广义指数与ETH后续收益关系',
    sourceTitle: 'BIS · Crypto and financial conditions',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '波动率与加密',
    title: 'VIX—ETH风险链',
    left: 'vix',
    right: 'eth',
    expectedSign: 'negative',
    steps: ['传统市场波动率上升', '跨市场风险预算收缩', 'ETH去杠杆压力上升'],
    interpretation: 'VIX变化与ETH后续收益关系',
    sourceTitle: 'CBOE · VIX methodology',
    sourceUrl: 'https://www.cboe.com/tradable_products/vix/',
  }),
  chain({
    group: '科技与加密',
    title: '科技股—ETH链',
    left: 'nasdaq',
    right: 'eth',
    expectedSign: 'positive',
    steps: ['科技成长风险偏好变化', '高久期与高波动资产共同重估', 'ETH跟随全球风险周期'],
    interpretation: '纳指收益与ETH后续收益关系',
    sourceTitle: 'BIS · Cryptoassets',
    sourceUrl: 'https://www.bis.org/topics/fintech.htm',
  }),
  chain({
    group: '实际利率与加密',
    title: '实际利率—ETH链',
    left: 'real10y',
    right: 'eth',
    expectedSign: 'negative',
    steps: ['实际利率上行', '无现金流高波动资产机会成本提高', 'ETH估值承压'],
    interpretation: '10Y实际利率变化与ETH后续收益关系',
    sourceTitle: 'Federal Reserve · Real interest rates',
    sourceUrl: 'https://fred.stlouisfed.org/series/DFII10',
  }),
  chain({
    group: '隔夜融资压力',
    title: 'SOFR−EFFR—ETH链',
    left: 'fundingspread',
    right: 'eth',
    expectedSign: 'negative',
    steps: ['美元隔夜融资压力上升', '杠杆和边际流动性收缩', 'ETH承压'],
    interpretation: 'SOFR−EFFR差值变化与ETH后续收益关系',
    sourceTitle: 'New York Fed · SOFR',
    sourceUrl: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  }),
  chain({
    group: '加密主导率轮动',
    title: 'BTC核心份额—ETH链',
    left: 'btccoreShare',
    right: 'eth',
    expectedSign: 'negative',
    steps: ['BTC核心市值份额上升', '加密资金向BTC集中', 'ETH相对风险偏好承压'],
    interpretation: 'BTC在BTC+ETH+稳定币核心池中的份额变化与ETH后续收益关系；不是全市场官方主导率',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '加密主导率轮动',
    title: 'BTC核心份额—BTC状态链',
    left: 'btccoreShare',
    right: 'btc',
    expectedSign: 'context',
    steps: ['BTC核心市值份额变化', '识别防御性抱团或BTC独立行情', '判断BTC收益状态'],
    interpretation: '份额上升可能来自BTC上涨，也可能来自ETH下跌，必须结合绝对价格解读',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '加密主导率轮动',
    title: 'ETH核心份额—ETH链',
    left: 'ethcoreShare',
    right: 'eth',
    expectedSign: 'positive',
    steps: ['ETH核心市值份额上升', '加密风险偏好向ETH扩散', 'ETH趋势可能延续'],
    interpretation: 'ETH在BTC+ETH+稳定币核心池中的份额变化与ETH后续收益关系',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '链上活跃度',
    title: 'BTC活跃地址—BTC链',
    left: 'btcactive',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['BTC活跃地址增加', '链上使用和参与度上升', 'BTC需求可能获得支撑'],
    interpretation: '活跃地址变化与BTC后续收益关系；地址数不等于独立用户数',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '链上活跃度',
    title: 'ETH活跃地址—ETH链',
    left: 'ethactive',
    right: 'eth',
    expectedSign: 'positive',
    steps: ['ETH活跃地址增加', '链上应用与交易参与度上升', 'ETH需求可能获得支撑'],
    interpretation: '活跃地址变化与ETH后续收益关系；机器人和多地址会影响读数',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '链上风险扩散',
    title: 'ETH活跃地址—BTC链',
    left: 'ethactive',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['ETH生态活跃度变化', '加密整体风险偏好扩散', 'BTC市场情绪同步变化'],
    interpretation: 'ETH活跃地址与BTC后续收益关系，仅作跨链风险偏好代理',
    sourceTitle: 'Coin Metrics · Community data',
    sourceUrl: 'https://github.com/coinmetrics/data',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—标普链',
    left: 'globalbreadth_ex_sp500',
    right: 'sp500',
    expectedSign: 'positive',
    steps: ['全球主要股指上涨参与率提高', '风险偏好由局部扩散', '标普趋势获得更广确认'],
    interpretation: '六大股指上涨参与率变化与标普后续收益关系；不是美股成分股上涨家数',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—科技股链',
    left: 'globalbreadth_ex_nasdaq',
    right: 'nasdaq',
    expectedSign: 'positive',
    steps: ['全球股指同步上涨', '区域风险偏好改善', '科技股趋势获得外部确认'],
    interpretation: '六大股指上涨参与率变化与纳指后续收益关系',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—欧洲股市链',
    left: 'globalbreadth_ex_euro50',
    right: 'euro50',
    expectedSign: 'positive',
    steps: ['全球上涨参与率提高', '跨区域配置风险偏好改善', '欧洲股市获得支撑'],
    interpretation: '全球股指参与率变化与Euro 50后续收益关系',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—日股链',
    left: 'globalbreadth_ex_nikkei',
    right: 'nikkei',
    expectedSign: 'positive',
    steps: ['全球上涨参与率提高', '风险预算扩张', '日本股市获得外部确认'],
    interpretation: '全球股指参与率变化与日经225后续收益关系',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—A股链',
    left: 'globalbreadth_ex_shanghai',
    right: 'shanghai',
    expectedSign: 'positive',
    steps: ['全球主要股指同步改善', '外部风险偏好与资金环境改善', 'A股获得外围支撑'],
    interpretation: '全球股指参与率变化与上证综指后续收益关系',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '全球市场广度',
    title: '全球股指广度—港股链',
    left: 'globalbreadth_ex_hangseng',
    right: 'hangseng',
    expectedSign: 'positive',
    steps: ['全球上涨参与率提高', '离岸风险资金偏好改善', '港股获得支撑'],
    interpretation: '全球股指参与率变化与恒生指数后续收益关系',
    sourceTitle: 'Derived · Tracked index participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '跨资产风险广度',
    title: '风险广度—美股链',
    left: 'riskbreadth_ex_sp500',
    right: 'sp500',
    expectedSign: 'positive',
    steps: ['股票商品加密上涨参与率提高', '风险偏好跨资产扩散', '美股趋势获得确认'],
    interpretation: '十项跟踪资产上涨参与率变化与标普后续收益关系',
    sourceTitle: 'Derived · Cross-asset participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '跨资产风险广度',
    title: '风险广度—BTC链',
    left: 'riskbreadth_ex_btc',
    right: 'btc',
    expectedSign: 'positive',
    steps: ['全球风险资产同步上涨', '跨市场风险预算扩张', 'BTC获得流动性支撑'],
    interpretation: '十项跟踪资产上涨参与率变化与BTC后续收益关系',
    sourceTitle: 'Derived · Cross-asset participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '跨资产风险广度',
    title: '风险广度—原油链',
    left: 'riskbreadth_ex_wti',
    right: 'wti',
    expectedSign: 'positive',
    steps: ['跨资产上涨参与率提高', '增长和风险偏好共振', '原油需求预期获得支撑'],
    interpretation: '十项跟踪资产上涨参与率变化与WTI后续收益关系',
    sourceTitle: 'Derived · Cross-asset participation',
    sourceUrl: 'https://fred.stlouisfed.org/',
  }),
  chain({
    group: '期限结构与衰退定价',
    title: '10Y−3M曲线—美股状态链',
    left: 'termspread3m',
    right: 'sp500',
    expectedSign: 'context',
    steps: ['10Y−3M曲线变化', '增长与政策路径重新定价', '美股盈利和估值预期变化'],
    interpretation: '曲线倒挂加深偏衰退预警，快速变陡也可能来自降息或压力，需结合利率方向',
    sourceTitle: 'FRED · 10-Year minus 3-Month Treasury spread',
    sourceUrl: 'https://fred.stlouisfed.org/series/T10Y3M',
  }),
  chain({
    group: '期限结构与需求',
    title: '10Y−3M曲线—原油链',
    left: 'termspread3m',
    right: 'wti',
    expectedSign: 'positive',
    steps: ['期限曲线走陡', '中期增长预期改善', '原油需求预期获得支撑'],
    interpretation: '10Y−3M利差变化与WTI后续收益关系；政策宽松型陡峭化可能不同',
    sourceTitle: 'FRED · 10-Year minus 3-Month Treasury spread',
    sourceUrl: 'https://fred.stlouisfed.org/series/T10Y3M',
  }),
  chain({
    group: '长期通胀预期',
    title: '5Y5Y通胀预期—黄金链',
    left: 'forwardinflation5y5y',
    right: 'gold',
    expectedSign: 'positive',
    steps: ['长期通胀预期上升', '购买力对冲需求提高', '黄金获得支撑'],
    interpretation: '5Y5Y远期通胀预期变化与黄金后续收益关系',
    sourceTitle: 'FRED · 5-Year, 5-Year Forward Inflation Expectation Rate',
    sourceUrl: 'https://fred.stlouisfed.org/series/T5YIFR',
  }),
  chain({
    group: '长期通胀与估值',
    title: '5Y5Y通胀预期—科技股链',
    left: 'forwardinflation5y5y',
    right: 'nasdaq',
    expectedSign: 'negative',
    steps: ['长期通胀预期上升', '长期名义贴现率压力增加', '科技股估值承压'],
    interpretation: '5Y5Y远期通胀预期变化与纳指后续收益关系',
    sourceTitle: 'FRED · 5-Year, 5-Year Forward Inflation Expectation Rate',
    sourceUrl: 'https://fred.stlouisfed.org/series/T5YIFR',
  }),
  chain({
    group: '长期通胀与利率',
    title: '5Y5Y通胀预期—10Y利率链',
    left: 'forwardinflation5y5y',
    right: 'us10y',
    expectedSign: 'positive',
    steps: ['长期通胀预期上升', '期限补偿和名义利率重新定价', '10Y收益率上行'],
    interpretation: '5Y5Y远期通胀预期变化与10Y收益率后续变化关系',
    sourceTitle: 'FRED · 5-Year, 5-Year Forward Inflation Expectation Rate',
    sourceUrl: 'https://fred.stlouisfed.org/series/T5YIFR',
  }),
  chain({
    group: '全球信用风险',
    title: '新兴市场HY收益率—美股链',
    left: 'emhyyield',
    right: 'sp500',
    expectedSign: 'negative',
    steps: ['新兴市场高收益融资成本上升', '全球信用风险偏好恶化', '美股风险预算承压'],
    interpretation: '新兴市场HY有效收益率变化与标普后续收益关系',
    sourceTitle: 'FRED · ICE BofA Emerging Markets High Yield Corporate Plus',
    sourceUrl: 'https://fred.stlouisfed.org/series/BAMLEMHBHYCRPIEY',
  }),
  chain({
    group: '全球信用风险',
    title: '新兴市场HY收益率—BTC链',
    left: 'emhyyield',
    right: 'btc',
    expectedSign: 'negative',
    steps: ['全球高风险信用融资成本上升', '杠杆和风险预算收缩', 'BTC承压'],
    interpretation: '新兴市场HY有效收益率变化与BTC后续收益关系',
    sourceTitle: 'FRED · ICE BofA Emerging Markets High Yield Corporate Plus',
    sourceUrl: 'https://fred.stlouisfed.org/series/BAMLEMHBHYCRPIEY',
  }),
  chain({
    group: '全球信用与需求',
    title: '新兴市场HY收益率—原油链',
    left: 'emhyyield',
    right: 'wti',
    expectedSign: 'negative',
    steps: ['新兴市场融资压力上升', '全球需求和贸易预期转弱', '原油需求预期承压'],
    interpretation: '新兴市场HY有效收益率变化与WTI后续收益关系',
    sourceTitle: 'FRED · ICE BofA Emerging Markets High Yield Corporate Plus',
    sourceUrl: 'https://fred.stlouisfed.org/series/BAMLEMHBHYCRPIEY',
  }),
  chain({
    group: '美元与全球信用',
    title: '美元—新兴市场HY收益率链',
    left: 'usd',
    right: 'emhyyield',
    expectedSign: 'positive',
    steps: ['美元走强', '美元债偿付和再融资压力上升', '新兴市场HY收益率上行'],
    interpretation: '美元广义指数变化与新兴市场HY收益率后续变化关系',
    sourceTitle: 'BIS · Global dollar cycle',
    sourceUrl: 'https://www.bis.org/publ/work819.htm',
  }),
  ...riskStressTargets.map(([right, targetName]) =>
    chain({
      group: '全球风险压力共振',
      title: `风险压力共振—${targetName}链`,
      left: 'riskstress',
      right,
      expectedSign: right === 'gold' ? 'context' : 'negative',
      steps: [
        'VIX、HY利差、美元与实际利率的日冲击同步增强',
        '融资条件与风险预算发生共振收缩',
        `${targetName}${right === 'gold' ? '的避险与实际利率效应重新定价' : '的风险偏好承压'}`,
      ],
      interpretation:
        '合成指标逐日只使用当时可得数据，并以各分量此前60个观测的波动标准化；正值代表当日风险压力共振增强',
      sourceTitle: 'Federal Reserve · Financial Stability Report',
      sourceUrl: 'https://www.federalreserve.gov/publications/financial-stability-report.htm',
    }),
  ),
  ...officialStressTargets.map(([right, targetName]) =>
    chain({
      group: '官方金融压力确认',
      title: `圣路易斯金融压力—${targetName}链`,
      left: 'stlfsi',
      right,
      expectedSign: right === 'gold' ? 'context' : 'negative',
      steps: [
        '18项利率、利差及市场指标共同显示金融压力变化',
        '融资条件和风险承受能力重新定价',
        `${targetName}${right === 'gold' ? '的避险与利率效应变化' : '的风险预算受到影响'}`,
      ],
      interpretation:
        '独立官方周度压力指标；零为长期正常水平，正值代表高于平均的金融压力，按发布日期后移后参与检验',
      sourceTitle: 'FRED · St. Louis Fed Financial Stress Index',
      sourceUrl: 'https://fred.stlouisfed.org/series/STLFSI4',
    }),
  ),
  ...rateDecompositionChains.map(([left, right, title, expectedSign, firstStep, finalStep]) =>
    chain({
      group: '美债利率来源分解',
      title,
      left,
      right,
      expectedSign,
      steps: [firstStep, '区分期限风险补偿与预期政策路径', finalStep],
      interpretation:
        left === 'termpremium10y'
          ? 'Kim–Wright三因子模型估计的10Y零息债期限溢价变化与目标后续变化关系'
          : '10Y恒定期限收益率减Kim–Wright期限溢价的透明代理；不是可直接观测的政策预期',
      sourceTitle: 'Federal Reserve · Three-Factor Nominal Term Structure Model',
      sourceUrl:
        left === 'termpremium10y'
          ? 'https://fred.stlouisfed.org/series/THREEFYTP10'
          : 'https://www.federalreserve.gov/data/three-factor-nominal-term-structure-model.htm',
    }),
  ),
]).sort((left, right) => Math.abs(right.signal ?? 0) - Math.abs(left.signal ?? 0))

const forecastIds = [
  'sp500',
  'nasdaq',
  'shanghai',
  'hangseng',
  'euro50',
  'nikkei',
  'wti',
  'gold',
  'btc',
  'eth',
]
const assetById = (id) => assets.find((asset) => asset.id === id)
const sign = (value) => (value === null || Math.abs(value) < 0.05 ? 0 : value > 0 ? 1 : -1)
const directionText = (value, mode = 'return') =>
  value === null
    ? '数据不足'
    : `${value > 0 ? '上涨' : value < 0 ? '下跌' : '持平'} ${Math.abs(value).toFixed(2)}${mode === 'difference' ? 'bp' : mode === 'absolute' ? '点' : '%'}`

const levelAtDate = (id, date) => {
  const definition = definitions.find((item) => item.id === id)
  return definition
    ? (histories[definition.series].filter((item) => item.date <= date).at(-1)?.value ?? null)
    : null
}
const periodMoveAtDate = (id, date, observations) => {
  const definition = definitions.find((item) => item.id === id)
  if (!definition) return null
  const available = histories[definition.series].filter(
    (item) => shiftDate(item.date, definition.releaseLagDays ?? 0) <= date,
  )
  if (available.length <= observations) return null
  const latest = available.at(-1).value
  const previous = available.at(-(observations + 1)).value
  return definition.mode === 'difference'
    ? (latest - previous) * 100
    : definition.mode === 'absolute'
      ? latest - previous
      : (latest / previous - 1) * 100
}
const volatilityRegime = (vix) =>
  vix === null ? 'unknown' : vix >= 25 ? 'stress' : vix >= 18 ? 'cautious' : 'calm'
const volatilityRegimeNames = {
  stress: '压力市',
  cautious: '谨慎市',
  calm: '平稳市',
  unknown: '未知状态',
}
const macroRegimeNames = {
  reflation: '再通胀增长',
  goldilocks: '金发姑娘',
  stagflation: '滞胀压力',
  slowdown: '增长放缓',
  stress: '流动性压力',
  unknown: '宏观状态未知',
}
const macroRegimeAtDate = (date) => {
  const copperMonth = periodMoveAtDate('copper', date, 21)
  const breakevenMonth = periodMoveAtDate('breakeven10y', date, 21)
  const highYieldWeek = periodMoveAtDate('hyspread', date, 5)
  const dollarWeek = periodMoveAtDate('usd', date, 5)
  if (copperMonth === null || breakevenMonth === null) return 'unknown'
  if (
    (highYieldWeek !== null && highYieldWeek >= 15) ||
    (dollarWeek !== null && dollarWeek >= 0.5 && copperMonth <= -2)
  )
    return 'stress'
  const growthUp = copperMonth >= 0
  const inflationUp = breakevenMonth >= 0
  if (growthUp && inflationUp) return 'reflation'
  if (growthUp && !inflationUp) return 'goldilocks'
  if (!growthUp && inflationUp) return 'stagflation'
  return 'slowdown'
}
const wilsonIntervalPct = (successes, samples) => {
  if (!samples) return { low: null, high: null }
  const z = 1.96
  const proportion = successes / samples
  const denominator = 1 + z ** 2 / samples
  const center = (proportion + z ** 2 / (2 * samples)) / denominator
  const margin =
    (z / denominator) *
    Math.sqrt((proportion * (1 - proportion)) / samples + z ** 2 / (4 * samples ** 2))
  return { low: round((center - margin) * 100), high: round((center + margin) * 100) }
}
const summarizePredictionBucket = (returns, direction) => {
  const successes = returns.filter((value) =>
    direction === 'bullish' ? value > 0 : value < 0,
  ).length
  return {
    direction,
    samples: returns.length,
    directionalAccuracyPct: returns.length ? round((successes / returns.length) * 100) : null,
    accuracyIntervalPct: wilsonIntervalPct(successes, returns.length),
    medianReturnPct: returns.length ? round(quantile(returns, 0.5)) : null,
    q25ReturnPct: returns.length ? round(quantile(returns, 0.25)) : null,
    q75ReturnPct: returns.length ? round(quantile(returns, 0.75)) : null,
  }
}
const ruleFamilies = [
  {
    id: 'momentumBalancedNormalized',
    name: '纯动量均衡（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.56,
    monthWeight: 0.44,
    driverWeight: 0,
  },
  {
    id: 'momentumFastNormalized',
    name: '纯动量短线（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.75,
    monthWeight: 0.25,
    driverWeight: 0,
  },
  {
    id: 'momentumPersistentNormalized',
    name: '纯动量趋势（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.31,
    monthWeight: 0.69,
    driverWeight: 0,
  },
  {
    id: 'momentumBalancedDirection',
    name: '纯动量均衡方向',
    featureMode: 'direction',
    weekWeight: 0.56,
    monthWeight: 0.44,
    driverWeight: 0,
  },
  {
    id: 'momentumFastDirection',
    name: '纯动量短线方向',
    featureMode: 'direction',
    weekWeight: 0.75,
    monthWeight: 0.25,
    driverWeight: 0,
  },
  {
    id: 'momentumPersistentDirection',
    name: '纯动量趋势方向',
    featureMode: 'direction',
    weekWeight: 0.31,
    monthWeight: 0.69,
    driverWeight: 0,
  },
  {
    id: 'balancedNormalized',
    name: '均衡动量（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.42,
    monthWeight: 0.33,
    driverWeight: 0.25,
  },
  {
    id: 'fastNormalized',
    name: '短线动量（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.6,
    monthWeight: 0.2,
    driverWeight: 0.2,
  },
  {
    id: 'persistentNormalized',
    name: '趋势延续（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.25,
    monthWeight: 0.55,
    driverWeight: 0.2,
  },
  {
    id: 'crossAssetNormalized',
    name: '跨资产增强（波动调整）',
    featureMode: 'normalized',
    weekWeight: 0.3,
    monthWeight: 0.2,
    driverWeight: 0.5,
  },
  {
    id: 'balancedDirection',
    name: '均衡方向',
    featureMode: 'direction',
    weekWeight: 0.42,
    monthWeight: 0.33,
    driverWeight: 0.25,
  },
  {
    id: 'fastDirection',
    name: '短线方向',
    featureMode: 'direction',
    weekWeight: 0.6,
    monthWeight: 0.2,
    driverWeight: 0.2,
  },
  {
    id: 'persistentDirection',
    name: '趋势方向',
    featureMode: 'direction',
    weekWeight: 0.25,
    monthWeight: 0.55,
    driverWeight: 0.2,
  },
  {
    id: 'crossAssetDirection',
    name: '跨资产方向',
    featureMode: 'direction',
    weekWeight: 0.3,
    monthWeight: 0.2,
    driverWeight: 0.5,
  },
]
const historicalMove = (definition, history, fromIndex, toIndex) =>
  definition.mode === 'difference'
    ? (history[toIndex].value - history[fromIndex].value) * 100
    : definition.mode === 'absolute'
      ? history[toIndex].value - history[fromIndex].value
      : (history[toIndex].value / history[fromIndex].value - 1) * 100
const momentumSignalAtIndex = (definition, history, index, horizon) => {
  if (index < Math.max(horizon, 22)) return 0
  const move = historicalMove(definition, history, index - horizon, index)
  const dailyMoves = []
  for (let cursor = Math.max(1, index - 60); cursor <= index; cursor += 1)
    dailyMoves.push(historicalMove(definition, history, cursor - 1, cursor))
  if (dailyMoves.length < 20) return sign(move)
  const mean = dailyMoves.reduce((sum, value) => sum + value, 0) / dailyMoves.length
  const deviation = Math.sqrt(
    dailyMoves.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      Math.max(1, dailyMoves.length - 1),
  )
  if (!Number.isFinite(deviation) || deviation === 0) return sign(move)
  const standardized = move / (deviation * Math.sqrt(horizon))
  return Math.tanh(standardized / 2)
}
const ruleScore = (rule, weekSignal, monthSignal, driverScore) =>
  (rule.featureMode === 'direction' ? sign(weekSignal) : weekSignal) * rule.weekWeight +
  (rule.featureMode === 'direction' ? sign(monthSignal) : monthSignal) * rule.monthWeight +
  driverScore * rule.driverWeight
const backtestMarket = (id) => {
  const target = definitions.find((item) => item.id === id)
  const history = histories[target.series]
  const relatedChains = transmissionChains.filter((item) => item.right === id)
  let correct = 0
  let baselineCorrect = 0
  let majorityBaselineCorrect = 0
  let samples = 0
  let regimeCorrect = 0
  let regimeBaselineCorrect = 0
  let regimeSamples = 0
  const bullishReturns = []
  const bearishReturns = []
  const evaluationRecords = []
  const allEvaluationRecords = []
  const currentRegime = volatilityRegime(assetById('vix')?.value ?? null)
  const currentMacroRegime = macroRegimeAtDate(history.at(-1).date)
  const targetForwardOutcomes = forwardMoves(target, 5)
  const start = Math.max(22, history.length - 500)
  for (let index = start; index < history.length - 5; index += 5) {
    const date = history[index].date
    const week =
      target.mode === 'difference'
        ? (history[index].value - history[index - 5].value) * 100
        : (history[index].value / history[index - 5].value - 1) * 100
    const weekSignal = momentumSignalAtIndex(target, history, index, 5)
    const monthSignal = momentumSignalAtIndex(target, history, index, 21)
    const driverSignals = relatedChains
      .map((item) => {
        const driver = definitions.find((definition) => definition.id === item.left)
        const profile = driver && target ? predictiveProfile(driver, target, date) : null
        const correlation = profile?.value ?? null
        const moveZ = driver ? moveZAtDate(driver, date) : null
        const signals = []
        if (
          moveZ !== null &&
          correlation !== null &&
          Math.abs(correlation) >= 0.1 &&
          profile?.pValue !== null &&
          profile.pValue <= 0.05 / Math.max(1, relatedChains.length * 3)
        )
          signals.push(Math.tanh(moveZ / 2) * correlation)
        const shocks =
          driver && target
            ? [
                shockProfile(driver, target, 'upper10pct', date),
                shockProfile(driver, target, 'lower10pct', date),
              ]
            : []
        for (const shock of shocks)
          if (
            shock.triggered &&
            shock.eventSamples >= 10 &&
            shock.pValue !== null &&
            shock.pValue <= 0.05 / Math.max(1, relatedChains.length * 3) &&
            shock.liftPct !== null
          )
            signals.push(Math.max(-0.75, Math.min(0.75, shock.liftPct / 100)))
        return signals.length
          ? signals.reduce((sum, value) => sum + value, 0) / signals.length
          : null
      })
      .filter((value) => value !== null)
    const driverScore = driverSignals.length
      ? driverSignals.reduce((sum, value) => sum + value, 0) / driverSignals.length
      : 0
    const score = ruleScore(ruleFamilies[0], weekSignal, monthSignal, driverScore)
    const forward =
      target.mode === 'difference'
        ? (history[index + 5].value - history[index].value) * 100
        : (history[index + 5].value / history[index].value - 1) * 100
    const knownOutcomes = targetForwardOutcomes.filter((item) => item.outcomeDate <= date)
    const knownPositive = knownOutcomes.filter((item) => item.value > 0).length
    const majorityDirection = knownPositive >= knownOutcomes.length - knownPositive ? 1 : -1
    const majorityCorrect = majorityDirection === sign(forward)
    const commonRecord = {
      date,
      forward,
      weekSignal,
      monthSignal,
      macroRegime: macroRegimeAtDate(date),
      baselineCorrect: sign(week) === sign(forward),
      majorityCorrect,
    }
    allEvaluationRecords.push({
      ...commonRecord,
      ruleScores: Object.fromEntries(
        ruleFamilies.map((rule) => [
          rule.id,
          ruleScore(rule, weekSignal, monthSignal, driverScore),
        ]),
      ),
    })
    if (Math.abs(score) < 0.2) continue
    if (sign(score) === sign(forward)) correct += 1
    if (score > 0) bullishReturns.push(forward)
    if (score < 0) bearishReturns.push(forward)
    if (sign(week) === sign(forward)) baselineCorrect += 1
    if (majorityCorrect) majorityBaselineCorrect += 1
    evaluationRecords.push({
      ...commonRecord,
      score,
      prediction: score > 0 ? 'bullish' : 'bearish',
      correct: sign(score) === sign(forward),
    })
    samples += 1
    if (volatilityRegime(levelAtDate('vix', date)) === currentRegime) {
      if (sign(score) === sign(forward)) regimeCorrect += 1
      if (sign(week) === sign(forward)) regimeBaselineCorrect += 1
      regimeSamples += 1
    }
  }
  const directionalAccuracyPct = samples ? round((correct / samples) * 100) : null
  const baselineAccuracyPct = samples ? round((baselineCorrect / samples) * 100) : null
  const majorityBaselineAccuracyPct = samples
    ? round((majorityBaselineCorrect / samples) * 100)
    : null
  const bestBaselineAccuracyPct = Math.max(
    baselineAccuracyPct ?? 0,
    majorityBaselineAccuracyPct ?? 0,
  )
  const regimeAccuracyPct = regimeSamples ? round((regimeCorrect / regimeSamples) * 100) : null
  const regimeBaselineAccuracyPct = regimeSamples
    ? round((regimeBaselineCorrect / regimeSamples) * 100)
    : null
  const accuracyIntervalPct = wilsonIntervalPct(correct, samples)
  const validationStart = Math.floor(evaluationRecords.length * 0.7)
  const validationRecords = evaluationRecords.slice(validationStart)
  const validationCorrect = validationRecords.filter((item) => item.correct).length
  const validationBaselineCorrect = validationRecords.filter((item) => item.baselineCorrect).length
  const validationMajorityCorrect = validationRecords.filter((item) => item.majorityCorrect).length
  const validationAccuracyPct = validationRecords.length
    ? round((validationCorrect / validationRecords.length) * 100)
    : null
  const validationBaselineAccuracyPct = validationRecords.length
    ? round((validationBaselineCorrect / validationRecords.length) * 100)
    : null
  const validationMajorityBaselineAccuracyPct = validationRecords.length
    ? round((validationMajorityCorrect / validationRecords.length) * 100)
    : null
  const validationBestBaselineAccuracyPct = Math.max(
    validationBaselineAccuracyPct ?? 0,
    validationMajorityBaselineAccuracyPct ?? 0,
  )
  const validationBullishReturns = validationRecords
    .filter((item) => item.prediction === 'bullish')
    .map((item) => item.forward)
  const validationBearishReturns = validationRecords
    .filter((item) => item.prediction === 'bearish')
    .map((item) => item.forward)
  const summarizeRecords = (records) => {
    const recordCorrect = records.filter((item) => item.correct).length
    const recordMomentumCorrect = records.filter((item) => item.baselineCorrect).length
    const recordMajorityCorrect = records.filter((item) => item.majorityCorrect).length
    const accuracyPct = records.length ? round((recordCorrect / records.length) * 100) : null
    const momentumAccuracyPct = records.length
      ? round((recordMomentumCorrect / records.length) * 100)
      : null
    const majorityAccuracyPct = records.length
      ? round((recordMajorityCorrect / records.length) * 100)
      : null
    const bestBaselinePct = Math.max(momentumAccuracyPct ?? 0, majorityAccuracyPct ?? 0)
    const bullish = records
      .filter((item) => item.prediction === 'bullish')
      .map((item) => item.forward)
    const bearish = records
      .filter((item) => item.prediction === 'bearish')
      .map((item) => item.forward)
    return {
      samples: records.length,
      directionalAccuracyPct: accuracyPct,
      accuracyIntervalPct: wilsonIntervalPct(recordCorrect, records.length),
      momentumBaselineAccuracyPct: momentumAccuracyPct,
      majorityBaselineAccuracyPct: majorityAccuracyPct,
      bestBaselineAccuracyPct: bestBaselinePct,
      liftVsBestBaselinePct: accuracyPct === null ? null : round(accuracyPct - bestBaselinePct),
      directionalBuckets: {
        bullish: summarizePredictionBucket(bullish, 'bullish'),
        bearish: summarizePredictionBucket(bearish, 'bearish'),
      },
    }
  }
  const candidateBoundary = Math.floor(allEvaluationRecords.length * 0.7)
  const candidateTrainingPool = allEvaluationRecords.slice(0, candidateBoundary)
  const candidateValidationPool = allEvaluationRecords.slice(candidateBoundary)
  const materializeRuleRecords = (records, rule, threshold) =>
    records
      .map((item) => ({
        ...item,
        score: item.ruleScores[rule.id],
        prediction: item.ruleScores[rule.id] > 0 ? 'bullish' : 'bearish',
        correct: sign(item.ruleScores[rule.id]) === sign(item.forward),
      }))
      .filter((item) => Math.abs(item.score) >= threshold)
  const thresholdCandidates = ruleFamilies.flatMap((rule) =>
    [0.2, 0.35, 0.5].map((threshold) => {
      const training = summarizeRecords(
        materializeRuleRecords(candidateTrainingPool, rule, threshold),
      )
      return {
        rule,
        threshold,
        training,
        conservativeEdgePct:
          training.accuracyIntervalPct.low === null
            ? null
            : round(training.accuracyIntervalPct.low - training.bestBaselineAccuracyPct),
      }
    }),
  )
  const selectedCandidate =
    thresholdCandidates
      .filter((item) => item.training.samples >= 15)
      .toSorted(
        (left, right) =>
          (right.conservativeEdgePct ?? -100) - (left.conservativeEdgePct ?? -100) ||
          (right.training.liftVsBestBaselinePct ?? -100) -
            (left.training.liftVsBestBaselinePct ?? -100) ||
          right.training.samples - left.training.samples,
      )[0] ?? thresholdCandidates[0]
  const selectedThreshold = selectedCandidate.threshold
  const selectedRule = selectedCandidate.rule
  const selectedTrainingRecords = materializeRuleRecords(
    candidateTrainingPool,
    selectedRule,
    selectedThreshold,
  )
  const selectedValidationRecords = materializeRuleRecords(
    candidateValidationPool,
    selectedRule,
    selectedThreshold,
  )
  const selectedOverallRecords = materializeRuleRecords(
    allEvaluationRecords,
    selectedRule,
    selectedThreshold,
  )
  const selectedTraining = summarizeRecords(selectedTrainingRecords)
  const selectedValidation = summarizeRecords(selectedValidationRecords)
  const selectedOverall = summarizeRecords(selectedOverallRecords)
  const momentumWeightTotal = selectedRule.weekWeight + selectedRule.monthWeight
  const momentumOnlyRule = {
    ...selectedRule,
    id: `${selectedRule.id}Ablation`,
    name: `${selectedRule.name}（移除跨资产驱动）`,
    weekWeight: momentumWeightTotal ? selectedRule.weekWeight / momentumWeightTotal : 0.5,
    monthWeight: momentumWeightTotal ? selectedRule.monthWeight / momentumWeightTotal : 0.5,
    driverWeight: 0,
  }
  const driverAblationRows = selectedValidationRecords.map((item) => {
    const momentumOnlyScore = ruleScore(momentumOnlyRule, item.weekSignal, item.monthSignal, 0)
    const momentumCorrect = sign(momentumOnlyScore) === sign(item.forward)
    return {
      fullCorrect: item.correct,
      momentumCorrect,
    }
  })
  const fullWins = driverAblationRows.filter(
    (item) => item.fullCorrect && !item.momentumCorrect,
  ).length
  const momentumWins = driverAblationRows.filter(
    (item) => !item.fullCorrect && item.momentumCorrect,
  ).length
  const discordant = fullWins + momentumWins
  const binomialCoefficient = (n, k) => {
    let result = 1
    for (let index = 1; index <= k; index += 1) result = (result * (n - index + 1)) / index
    return result
  }
  const pairedAdvantagePValue = discordant
    ? round(
        Array.from({ length: discordant - fullWins + 1 }, (_, offset) => fullWins + offset)
          .filter((wins) => wins <= discordant)
          .reduce(
            (sum, wins) => sum + binomialCoefficient(discordant, wins) * 0.5 ** discordant,
            0,
          ),
        6,
      )
    : null
  const fullAccuracyPct = driverAblationRows.length
    ? round(
        (driverAblationRows.filter((item) => item.fullCorrect).length / driverAblationRows.length) *
          100,
      )
    : null
  const momentumOnlyAccuracyPct = driverAblationRows.length
    ? round(
        (driverAblationRows.filter((item) => item.momentumCorrect).length /
          driverAblationRows.length) *
          100,
      )
    : null
  const driverAblation = {
    selectedUsesCrossAsset: selectedRule.driverWeight > 0,
    samples: driverAblationRows.length,
    fullAccuracyPct,
    momentumOnlyAccuracyPct,
    liftPct:
      fullAccuracyPct === null || momentumOnlyAccuracyPct === null
        ? null
        : round(fullAccuracyPct - momentumOnlyAccuracyPct),
    fullWins,
    momentumWins,
    pairedAdvantagePValue,
    allowed:
      selectedRule.driverWeight > 0 &&
      driverAblationRows.length >= 8 &&
      fullWins > momentumWins &&
      (pairedAdvantagePValue ?? 1) <= 0.1,
  }
  const probabilityForDirection = (records, direction) => {
    const directionalRecords = records.filter((item) => item.prediction === direction)
    const upCount = directionalRecords.filter((item) => item.forward > 0).length
    return {
      direction,
      samples: directionalRecords.length,
      upProbabilityPct: round(((upCount + 1) / (directionalRecords.length + 2)) * 100),
      intervalPct: wilsonIntervalPct(upCount, directionalRecords.length),
    }
  }
  const scoreProbabilityModel = (trainingRecords, validationRecords, probabilities) => {
    const trainingUpCount = trainingRecords.filter((item) => item.forward > 0).length
    const climatologyProbability = (trainingUpCount + 1) / (trainingRecords.length + 2)
    const rows = validationRecords.map((item) => ({
      actual: item.forward > 0 ? 1 : 0,
      probability: probabilities[item.prediction].upProbabilityPct / 100,
    }))
    const modelLosses = rows.map((item) => (item.probability - item.actual) ** 2)
    const baselineLosses = rows.map((item) => (climatologyProbability - item.actual) ** 2)
    const brierScore = rows.length
      ? round(modelLosses.reduce((sum, value) => sum + value, 0) / rows.length, 4)
      : null
    const climatologyBrierScore = rows.length
      ? round(baselineLosses.reduce((sum, value) => sum + value, 0) / rows.length, 4)
      : null
    const advantages = rows.map((item, index) => baselineLosses[index] - modelLosses[index])
    const meanAdvantage = advantages.length
      ? advantages.reduce((sum, value) => sum + value, 0) / advantages.length
      : null
    const deviation =
      advantages.length >= 2 && meanAdvantage !== null
        ? Math.sqrt(
            advantages.reduce((sum, value) => sum + (value - meanAdvantage) ** 2, 0) /
              (advantages.length - 1),
          )
        : null
    const zScore =
      meanAdvantage !== null && deviation !== null && deviation > 0
        ? meanAdvantage / (deviation / Math.sqrt(advantages.length))
        : null
    return {
      samples: rows.length,
      brierScore,
      climatologyBrierScore,
      brierSkillPct:
        brierScore === null || climatologyBrierScore === null || climatologyBrierScore === 0
          ? null
          : round((1 - brierScore / climatologyBrierScore) * 100),
      brierAdvantagePValue: zScore === null ? null : round(1 - normalCdf(zScore), 6),
    }
  }
  const trainingProbabilities = {
    bullish: probabilityForDirection(selectedTrainingRecords, 'bullish'),
    bearish: probabilityForDirection(selectedTrainingRecords, 'bearish'),
  }
  const trainingUpCount = selectedTrainingRecords.filter((item) => item.forward > 0).length
  const climatologyUpProbability = (trainingUpCount + 1) / (selectedTrainingRecords.length + 2)
  const validationProbabilityRows = selectedValidationRecords.map((item) => ({
    actual: item.forward > 0 ? 1 : 0,
    probability: trainingProbabilities[item.prediction].upProbabilityPct / 100,
  }))
  const brierScore = validationProbabilityRows.length
    ? round(
        validationProbabilityRows.reduce(
          (sum, item) => sum + (item.probability - item.actual) ** 2,
          0,
        ) / validationProbabilityRows.length,
        4,
      )
    : null
  const climatologyBrierScore = validationProbabilityRows.length
    ? round(
        validationProbabilityRows.reduce(
          (sum, item) => sum + (climatologyUpProbability - item.actual) ** 2,
          0,
        ) / validationProbabilityRows.length,
        4,
      )
    : null
  const brierLossAdvantages = validationProbabilityRows.map(
    (item) => (climatologyUpProbability - item.actual) ** 2 - (item.probability - item.actual) ** 2,
  )
  const meanBrierAdvantage = brierLossAdvantages.length
    ? brierLossAdvantages.reduce((sum, value) => sum + value, 0) / brierLossAdvantages.length
    : null
  const brierAdvantageDeviation =
    brierLossAdvantages.length >= 2 && meanBrierAdvantage !== null
      ? Math.sqrt(
          brierLossAdvantages.reduce((sum, value) => sum + (value - meanBrierAdvantage) ** 2, 0) /
            (brierLossAdvantages.length - 1),
        )
      : null
  const brierAdvantageZ =
    meanBrierAdvantage !== null && brierAdvantageDeviation !== null && brierAdvantageDeviation > 0
      ? meanBrierAdvantage / (brierAdvantageDeviation / Math.sqrt(brierLossAdvantages.length))
      : null
  const probabilityValidation = {
    trainingProbabilities,
    trainingClimatologyUpPct: round(climatologyUpProbability * 100),
    samples: validationProbabilityRows.length,
    meanForecastUpPct: validationProbabilityRows.length
      ? round(
          (validationProbabilityRows.reduce((sum, item) => sum + item.probability, 0) /
            validationProbabilityRows.length) *
            100,
        )
      : null,
    observedUpPct: validationProbabilityRows.length
      ? round(
          (validationProbabilityRows.reduce((sum, item) => sum + item.actual, 0) /
            validationProbabilityRows.length) *
            100,
        )
      : null,
    brierScore,
    climatologyBrierScore,
    brierSkillPct:
      brierScore === null || climatologyBrierScore === null || climatologyBrierScore === 0
        ? null
        : round((1 - brierScore / climatologyBrierScore) * 100),
    brierAdvantagePValue:
      brierAdvantageZ === null ? null : round(1 - normalCdf(brierAdvantageZ), 6),
  }
  const macroRegimeTrainingRecords = selectedTrainingRecords.filter(
    (item) => item.macroRegime === currentMacroRegime,
  )
  const macroRegimeValidationRecords = selectedValidationRecords.filter(
    (item) => item.macroRegime === currentMacroRegime,
  )
  const macroTrainingProbabilities = {
    bullish: probabilityForDirection(macroRegimeTrainingRecords, 'bullish'),
    bearish: probabilityForDirection(macroRegimeTrainingRecords, 'bearish'),
  }
  const macroRegimeProfile = {
    id: currentMacroRegime,
    name: macroRegimeNames[currentMacroRegime],
    training: summarizeRecords(macroRegimeTrainingRecords),
    validation: summarizeRecords(macroRegimeValidationRecords),
    trainingProbabilities: macroTrainingProbabilities,
    probabilityValidation: scoreProbabilityModel(
      macroRegimeTrainingRecords,
      macroRegimeValidationRecords,
      macroTrainingProbabilities,
    ),
  }
  return {
    horizon: '后续5个观测日',
    samples,
    directionalAccuracyPct,
    accuracyIntervalPct,
    baselineAccuracyPct,
    majorityBaselineAccuracyPct,
    bestBaselineAccuracyPct,
    liftPct:
      directionalAccuracyPct === null || baselineAccuracyPct === null
        ? null
        : round(directionalAccuracyPct - baselineAccuracyPct),
    liftVsBestBaselinePct:
      directionalAccuracyPct === null
        ? null
        : round(directionalAccuracyPct - bestBaselineAccuracyPct),
    regime: volatilityRegimeNames[currentRegime],
    regimeSamples,
    regimeAccuracyPct,
    regimeBaselineAccuracyPct,
    regimeLiftPct:
      regimeAccuracyPct === null || regimeBaselineAccuracyPct === null
        ? null
        : round(regimeAccuracyPct - regimeBaselineAccuracyPct),
    directionalBuckets: {
      bullish: summarizePredictionBucket(bullishReturns, 'bullish'),
      bearish: summarizePredictionBucket(bearishReturns, 'bearish'),
    },
    validation: {
      split: '按时间顺序最后30%',
      startDate: validationRecords[0]?.date ?? null,
      endDate: validationRecords.at(-1)?.date ?? null,
      samples: validationRecords.length,
      directionalAccuracyPct: validationAccuracyPct,
      accuracyIntervalPct: wilsonIntervalPct(validationCorrect, validationRecords.length),
      baselineAccuracyPct: validationBaselineAccuracyPct,
      majorityBaselineAccuracyPct: validationMajorityBaselineAccuracyPct,
      bestBaselineAccuracyPct: validationBestBaselineAccuracyPct,
      liftPct:
        validationAccuracyPct === null || validationBaselineAccuracyPct === null
          ? null
          : round(validationAccuracyPct - validationBaselineAccuracyPct),
      liftVsBestBaselinePct:
        validationAccuracyPct === null
          ? null
          : round(validationAccuracyPct - validationBestBaselineAccuracyPct),
      directionalBuckets: {
        bullish: summarizePredictionBucket(validationBullishReturns, 'bullish'),
        bearish: summarizePredictionBucket(validationBearishReturns, 'bearish'),
      },
    },
    selectivity: {
      candidateCount: thresholdCandidates.length,
      selectedThreshold,
      selectedRule,
      selectedConservativeEdgePct: selectedCandidate.conservativeEdgePct,
      driverAblation,
      probabilityValidation,
      macroRegime: macroRegimeProfile,
      overall: selectedOverall,
      training: selectedTraining,
      validation: selectedValidation,
      validationCoveragePct: candidateValidationPool.length
        ? round((selectedValidation.samples / candidateValidationPool.length) * 100)
        : null,
    },
    note: '最近约500个观测日内按5日步长进行非重叠检验；历史与实时驱动均在每个目标的预设链家族内使用相同Bonferroni时点门槛。仅在前70%训练期从纯动量与跨资产增强共14组预设规则×3档门槛中按“命中率95%下界−最佳素朴基线”选择，最后30%留出验证；跨资产分量还需在同日样本消融检验中显著优于移除驱动后的规则，否则实时贡献归零。',
  }
}

const horizonDefinitions = [
  { id: 'day', label: '未来1日', horizon: 1, shortWindow: 1, longWindow: 5 },
  { id: 'week', label: '未来1周', horizon: 5, shortWindow: 5, longWindow: 21 },
  { id: 'month', label: '未来1月', horizon: 21, shortWindow: 21, longWindow: 63 },
  { id: 'quarter', label: '未来1季度', horizon: 63, shortWindow: 63, longWindow: 126 },
  { id: 'halfYear', label: '未来半年', horizon: 126, shortWindow: 126, longWindow: 252 },
  { id: 'year', label: '未来1年', horizon: 252, shortWindow: 252, longWindow: 504 },
]
const pureMomentumRules = ruleFamilies.filter((rule) => rule.driverWeight === 0)
const buildHorizonMomentumOutlook = (id, horizonDefinition) => {
  const target = definitions.find((item) => item.id === id)
  const history = histories[target.series]
  const records = []
  const start = Math.max(horizonDefinition.longWindow + 1, history.length - 2000)
  let knownUp = 0
  let knownDown = 0
  for (
    let index = start;
    index < history.length - horizonDefinition.horizon;
    index += horizonDefinition.horizon
  ) {
    const shortSignal = momentumSignalAtIndex(target, history, index, horizonDefinition.shortWindow)
    const longSignal = momentumSignalAtIndex(target, history, index, horizonDefinition.longWindow)
    const forward = historicalMove(target, history, index, index + horizonDefinition.horizon)
    const majorityDirection = knownUp >= knownDown ? 1 : -1
    records.push({
      date: history[index].date,
      forward,
      baselineCorrect: sign(shortSignal) === sign(forward),
      majorityCorrect: majorityDirection === sign(forward),
      scores: Object.fromEntries(
        pureMomentumRules.map((rule) => [rule.id, ruleScore(rule, shortSignal, longSignal, 0)]),
      ),
    })
    if (forward > 0) knownUp += 1
    else knownDown += 1
  }
  const boundary = Math.floor(records.length * 0.7)
  const trainingPool = records.slice(0, boundary)
  const validationPool = records.slice(boundary)
  const summarize = (rows) => {
    const correct = rows.filter((row) => row.correct).length
    const momentumCorrect = rows.filter((row) => row.baselineCorrect).length
    const majorityCorrect = rows.filter((row) => row.majorityCorrect).length
    const accuracyPct = rows.length ? round((correct / rows.length) * 100) : null
    const bestBaselinePct = rows.length
      ? round((Math.max(momentumCorrect, majorityCorrect) / rows.length) * 100)
      : null
    return {
      samples: rows.length,
      accuracyPct,
      accuracyIntervalPct: wilsonIntervalPct(correct, rows.length),
      bestBaselinePct,
      liftPct:
        accuracyPct === null || bestBaselinePct === null
          ? null
          : round(accuracyPct - bestBaselinePct),
    }
  }
  const materialize = (pool, rule, threshold) =>
    pool
      .map((row) => ({
        ...row,
        score: row.scores[rule.id],
        prediction: row.scores[rule.id] >= 0 ? 'bullish' : 'bearish',
        correct: sign(row.scores[rule.id]) === sign(row.forward),
      }))
      .filter((row) => Math.abs(row.score) >= threshold)
  const minimumTrainingSamples = horizonDefinition.horizon >= 63 ? 8 : 15
  const candidates = pureMomentumRules.flatMap((rule) =>
    [0.2, 0.35, 0.5].map((threshold) => {
      const training = summarize(materialize(trainingPool, rule, threshold))
      return {
        rule,
        threshold,
        training,
        conservativeEdgePct:
          training.accuracyIntervalPct.low === null || training.bestBaselinePct === null
            ? null
            : round(training.accuracyIntervalPct.low - training.bestBaselinePct),
      }
    }),
  )
  const selected =
    candidates
      .filter((candidate) => candidate.training.samples >= minimumTrainingSamples)
      .toSorted(
        (left, right) =>
          (right.conservativeEdgePct ?? -100) - (left.conservativeEdgePct ?? -100) ||
          (right.training.liftPct ?? -100) - (left.training.liftPct ?? -100) ||
          right.training.samples - left.training.samples,
      )[0] ?? candidates[0]
  const trainingRows = materialize(trainingPool, selected.rule, selected.threshold)
  const validationRows = materialize(validationPool, selected.rule, selected.threshold)
  const training = summarize(trainingRows)
  const validation = summarize(validationRows)
  const currentIndex = history.length - 1
  const shortSignal = momentumSignalAtIndex(
    target,
    history,
    currentIndex,
    horizonDefinition.shortWindow,
  )
  const longSignal = momentumSignalAtIndex(
    target,
    history,
    currentIndex,
    horizonDefinition.longWindow,
  )
  const score = ruleScore(selected.rule, shortSignal, longSignal, 0)
  const direction = score >= 0 ? 'bullish' : 'bearish'
  const directionRows = trainingRows.filter((row) => row.prediction === direction)
  const upCount = directionRows.filter((row) => row.forward > 0).length
  const upProbabilityPct = round(((upCount + 1) / (directionRows.length + 2)) * 100)
  const directionalReturns = directionRows.map((row) => row.forward)
  const historicalReturnRangePct = {
    low: directionalReturns.length ? round(quantile(directionalReturns, 0.25)) : null,
    high: directionalReturns.length ? round(quantile(directionalReturns, 0.75)) : null,
    samples: directionalReturns.length,
  }
  const minimumValidationSamples = horizonDefinition.horizon >= 63 ? 4 : 8
  const validated =
    Math.abs(score) >= selected.threshold &&
    training.samples >= minimumTrainingSamples &&
    (training.liftPct ?? 0) > 0 &&
    validation.samples >= minimumValidationSamples &&
    (validation.accuracyPct ?? 0) >= 50 &&
    (validation.liftPct ?? 0) > 0
  const shortMove = historicalMove(
    target,
    history,
    Math.max(0, currentIndex - horizonDefinition.shortWindow),
    currentIndex,
  )
  const longMove = historicalMove(
    target,
    history,
    Math.max(0, currentIndex - horizonDefinition.longWindow),
    currentIndex,
  )
  return {
    id: horizonDefinition.id,
    label: horizonDefinition.label,
    observations: horizonDefinition.horizon,
    direction,
    score: round(score),
    validated,
    confidence: validated ? 'validated' : 'watch',
    upProbabilityPct,
    historicalReturnRangePct,
    ruleName: selected.rule.name,
    threshold: selected.threshold,
    training,
    validation,
    factors: [
      {
        name: `${horizonDefinition.shortWindow}观测动量`,
        value: round(shortSignal),
        text: `${horizonDefinition.shortWindow}个观测期变化${directionText(round(shortMove), target.mode)}，波动调整信号${shortSignal >= 0 ? '+' : ''}${shortSignal.toFixed(2)}`,
      },
      {
        name: `${horizonDefinition.longWindow}观测趋势`,
        value: round(longSignal),
        text: `${horizonDefinition.longWindow}个观测期变化${directionText(round(longMove), target.mode)}，波动调整信号${longSignal >= 0 ? '+' : ''}${longSignal.toFixed(2)}`,
      },
    ],
  }
}

liveForecastHistory = liveForecastHistory.map((record) => {
  if (record.resolvedAt || !Number.isInteger(record.horizonObservations)) return record
  const definition = definitions.find((item) => item.id === record.marketId)
  const history = definition ? histories[definition.series] : null
  const originIndex = history?.findIndex((item) => item.date === record.marketDate) ?? -1
  const outcome = originIndex >= 0 ? history[originIndex + record.horizonObservations] : null
  if (!definition || !history || originIndex < 0 || !outcome) return record
  const origin = history[originIndex]
  const realizedMove =
    definition.mode === 'difference'
      ? (outcome.value - origin.value) * 100
      : definition.mode === 'absolute'
        ? outcome.value - origin.value
        : (outcome.value / origin.value - 1) * 100
  const actualUp = realizedMove > 0 ? 1 : 0
  return {
    ...record,
    resolvedAt: new Date().toISOString(),
    outcomeDate: outcome.date,
    realizedMove: round(realizedMove),
    directionCorrect:
      record.bias === 'neutral'
        ? null
        : (record.bias === 'bullish' && actualUp === 1) ||
          (record.bias === 'bearish' && actualUp === 0),
    brierLoss: round((record.upProbabilityPct / 100 - actualUp) ** 2, 4),
  }
})

const liveEvaluationById = Object.fromEntries(
  forecastIds.map((id) => {
    const records = liveForecastHistory.filter((record) => record.marketId === id)
    const versionRecords = records.filter((record) => record.modelVersion === modelVersion)
    const resolved = versionRecords.filter((record) => record.resolvedAt).slice(-100)
    const directional = resolved.filter((record) => record.directionCorrect !== null)
    return [
      id,
      {
        modelVersion,
        totalSnapshots: versionRecords.length,
        allVersionSnapshots: records.length,
        resolvedSamples: resolved.length,
        directionalSamples: directional.length,
        directionalAccuracyPct: directional.length
          ? round(
              (directional.filter((record) => record.directionCorrect).length /
                directional.length) *
                100,
            )
          : null,
        brierScore: resolved.length
          ? round(resolved.reduce((sum, record) => sum + record.brierLoss, 0) / resolved.length, 4)
          : null,
        latestOutcomeDate: resolved.at(-1)?.outcomeDate ?? null,
      },
    ]
  }),
)

const marketOutlooks = forecastIds.map((id) => {
  const target = assetById(id)
  const attributionChains = transmissionChains.filter(
    (item) =>
      item.right === id &&
      item.signal !== null &&
      Math.abs(item.signal) >= 0.15 &&
      item.status !== 'unavailable' &&
      item.stability !== 'mixed' &&
      !item.regimeShift &&
      item.evidence !== 'uncertain',
  )
  const drivers = attributionChains
    .map((item) => {
      const driver = assetById(item.left)
      const driverDefinition = definitions.find((definition) => definition.id === item.left)
      const driverMove = driver && !driver.stale ? driver.changes.day : null
      const driverZ = driverDefinition && !driver?.stale ? moveZAtDate(driverDefinition) : null
      const contribution = driverZ === null ? 0 : Math.tanh(driverZ / 2) * item.signal
      const effect = sign(contribution)
      return {
        chain: item.title,
        driver: driver?.name ?? item.left,
        driverMove,
        driverZ: driverZ === null ? null : round(driverZ),
        correlation: item.signal,
        contribution: round(contribution),
        effect: effect > 0 ? 'tailwind' : effect < 0 ? 'headwind' : 'neutral',
        text: `${driver?.name ?? item.left}${directionText(driverMove, driver?.mode)}（${driverZ === null ? '异常度不足' : `${driverZ >= 0 ? '+' : ''}${driverZ.toFixed(2)}σ`}），结合当前ρ ${item.signal.toFixed(2)}，对${target.name}的共振贡献${contribution >= 0 ? '+' : ''}${contribution.toFixed(2)}`,
      }
    })
    .toSorted((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
    .slice(0, 3)
  const relatedPredictiveChains = transmissionChains.filter((item) => item.right === id)
  const predictiveSignificanceThreshold = 0.05 / Math.max(1, relatedPredictiveChains.length * 3)
  const allPredictiveDrivers = relatedPredictiveChains
    .map((item) => {
      const driver = assetById(item.left)
      const driverDefinition = definitions.find((definition) => definition.id === item.left)
      const driverMove = driver && !driver.stale ? driver.changes.day : null
      const driverZ = driverDefinition && !driver?.stale ? moveZAtDate(driverDefinition) : null
      const signals = []
      const evidenceLabels = []
      if (
        driverZ !== null &&
        item.predictive.value !== null &&
        Math.abs(item.predictive.value) >= 0.1 &&
        item.predictive.pValue !== null &&
        item.predictive.pValue <= predictiveSignificanceThreshold
      ) {
        signals.push(Math.tanh(driverZ / 2) * item.predictive.value)
        evidenceLabels.push(
          `领先相关${item.predictive.value >= 0 ? '+' : ''}${item.predictive.value.toFixed(2)}（时点门槛p≤${predictiveSignificanceThreshold.toFixed(4)}）`,
        )
      }
      for (const [label, profile] of [
        ['上尾冲击', item.shock],
        ['下尾冲击', item.lowerShock],
      ]) {
        if (
          profile.triggered &&
          profile.eventSamples >= 10 &&
          profile.pValue !== null &&
          profile.pValue <= predictiveSignificanceThreshold &&
          profile.liftPct !== null
        ) {
          signals.push(Math.max(-0.75, Math.min(0.75, profile.liftPct / 100)))
          evidenceLabels.push(
            `${label}上涨率增量${profile.liftPct >= 0 ? '+' : ''}${profile.liftPct.toFixed(1)}pct`,
          )
        }
      }
      if (!signals.length) return null
      const contribution = signals.reduce((sum, value) => sum + value, 0) / signals.length
      const effect = sign(contribution)
      return {
        chain: item.title,
        driver: driver?.name ?? item.left,
        driverMove,
        driverZ: driverZ === null ? null : round(driverZ),
        correlation: item.predictive.value,
        contribution: round(contribution),
        effect: effect > 0 ? 'tailwind' : effect < 0 ? 'headwind' : 'neutral',
        text: `${driver?.name ?? item.left}${directionText(driverMove, driver?.mode)}；${evidenceLabels.join('，')}，与滚动回测同口径贡献${contribution >= 0 ? '+' : ''}${contribution.toFixed(2)}`,
      }
    })
    .filter(Boolean)
  const predictiveDrivers = allPredictiveDrivers
    .toSorted((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))
    .slice(0, 3)
  const backtest = backtestMarket(id)
  const selectedRule = backtest.selectivity.selectedRule
  const targetHistory = histories[target.series].filter(
    (item) => shiftDate(item.date, target.releaseLagDays ?? 0) <= generationDate,
  )
  const currentIndex = targetHistory.length - 1
  const weekMomentumSignal = momentumSignalAtIndex(target, targetHistory, currentIndex, 5)
  const monthMomentumSignal = momentumSignalAtIndex(target, targetHistory, currentIndex, 21)
  const momentumScore = ruleScore(selectedRule, weekMomentumSignal, monthMomentumSignal, 0)
  const rawDriverScore = allPredictiveDrivers.length
    ? allPredictiveDrivers.reduce(
        (sum, driver) => sum + Math.max(-0.75, Math.min(0.75, driver.contribution)),
        0,
      ) / allPredictiveDrivers.length
    : 0
  const driverScore = backtest.selectivity.driverAblation.allowed ? rawDriverScore : 0
  const selectiveTraining = backtest.selectivity.training
  const selectiveValidation = backtest.selectivity.validation
  const accuracyReliability =
    selectiveValidation.directionalAccuracyPct === null
      ? 0.35
      : Math.max(0.35, Math.min(1, (selectiveValidation.directionalAccuracyPct - 45) / 15))
  const liftReliability = Math.max(
    0.35,
    Math.min(1, 0.5 + (selectiveValidation.liftVsBestBaselinePct ?? 0) / 10),
  )
  const regimeReliability =
    backtest.regimeSamples >= 30
      ? Math.max(0.35, Math.min(1, 0.5 + (backtest.regimeLiftPct ?? 0) / 10))
      : 0.5
  const macroRegimeValidation = backtest.selectivity.macroRegime.validation
  const macroRegimeReliability =
    macroRegimeValidation.samples >= 8
      ? Math.max(0.35, Math.min(1, 0.5 + (macroRegimeValidation.liftVsBestBaselinePct ?? 0) / 10))
      : 0.75
  const sampleReliability = Math.min(1, selectiveValidation.samples / 12)
  const reliability =
    accuracyReliability *
    liftReliability *
    regimeReliability *
    macroRegimeReliability *
    sampleReliability
  const rawScore = Math.max(
    -1,
    Math.min(1, momentumScore + driverScore * selectedRule.driverWeight),
  )
  const score = round(rawScore * reliability)
  const selectedThreshold = backtest.selectivity.selectedThreshold
  const candidateDirection =
    rawScore >= selectedThreshold ? 'bullish' : rawScore <= -selectedThreshold ? 'bearish' : null
  const scenario = candidateDirection
    ? backtest.selectivity.overall.directionalBuckets[candidateDirection]
    : null
  const validationScenario = candidateDirection
    ? selectiveValidation.directionalBuckets[candidateDirection]
    : null
  const probabilityDirection = rawScore >= 0 ? 'bullish' : 'bearish'
  const macroProbabilityProfile =
    backtest.selectivity.macroRegime.trainingProbabilities[probabilityDirection]
  const usesMacroProbability =
    macroProbabilityProfile.samples >= 8 &&
    backtest.selectivity.macroRegime.probabilityValidation.samples >= 8
  const probabilityProfile = usesMacroProbability
    ? macroProbabilityProfile
    : backtest.selectivity.probabilityValidation.trainingProbabilities[probabilityDirection]
  const chosenProbabilityValidation = usesMacroProbability
    ? backtest.selectivity.macroRegime.probabilityValidation
    : backtest.selectivity.probabilityValidation
  const probability = {
    upProbabilityPct: probabilityProfile.upProbabilityPct,
    downProbabilityPct: round(100 - probabilityProfile.upProbabilityPct),
    intervalPct: probabilityProfile.intervalPct,
    trainingSamples: probabilityProfile.samples,
    signalDirection: probabilityDirection,
    source: usesMacroProbability ? 'macro-regime' : 'all-regimes',
    macroRegime: backtest.selectivity.macroRegime.name,
    validationBrierScore: chosenProbabilityValidation.brierScore,
    validationClimatologyBrierScore: chosenProbabilityValidation.climatologyBrierScore,
    validationBrierSkillPct: chosenProbabilityValidation.brierSkillPct,
    validationBrierAdvantagePValue: chosenProbabilityValidation.brierAdvantagePValue,
    validated:
      chosenProbabilityValidation.samples >= 8 &&
      (chosenProbabilityValidation.brierSkillPct ?? 0) > 0 &&
      (chosenProbabilityValidation.brierAdvantagePValue ?? 1) <= 0.1,
  }
  const directionEligible =
    candidateDirection !== null &&
    Math.abs(score) >= 0.2 &&
    selectiveTraining.samples >= 15 &&
    (selectiveTraining.liftVsBestBaselinePct ?? 0) > 0 &&
    selectiveValidation.samples >= 8 &&
    (selectiveValidation.directionalAccuracyPct ?? 0) >= 50 &&
    (selectiveValidation.liftVsBestBaselinePct ?? 0) > 0 &&
    probability.validated &&
    (macroRegimeValidation.samples < 8 || (macroRegimeValidation.liftVsBestBaselinePct ?? 0) > 0) &&
    (scenario?.samples ?? 0) >= 10 &&
    (scenario?.directionalAccuracyPct ?? 0) >= 50 &&
    (validationScenario?.samples ?? 0) >= 4 &&
    (validationScenario?.directionalAccuracyPct ?? 0) >= 50
  const directionGate = {
    eligible: directionEligible,
    reasons: [
      ...(candidateDirection === null
        ? [`当前原始得分未越过选定的±${selectedThreshold.toFixed(2)}门槛`]
        : []),
      ...(candidateDirection !== null && Math.abs(score) < 0.2
        ? [`可靠性收缩后得分仅${Math.abs(score).toFixed(2)}，低于0.20门槛`]
        : []),
      ...(selectiveTraining.samples < 15
        ? [`训练期强信号样本仅${selectiveTraining.samples}个，低于15个门槛`]
        : []),
      ...((selectiveTraining.liftVsBestBaselinePct ?? 0) <= 0
        ? [
            `训练期相对最佳素朴基线无正增量（${selectiveTraining.liftVsBestBaselinePct?.toFixed(1) ?? '—'}%）`,
          ]
        : []),
      ...(selectiveValidation.samples < 8
        ? [`留出期强信号样本仅${selectiveValidation.samples}个，低于8个门槛`]
        : []),
      ...((selectiveValidation.directionalAccuracyPct ?? 0) < 50
        ? [
            `留出期强信号命中率${selectiveValidation.directionalAccuracyPct?.toFixed(1) ?? '—'}%低于50%`,
          ]
        : []),
      ...((selectiveValidation.liftVsBestBaselinePct ?? 0) <= 0
        ? [
            `留出期强信号相对最佳基线无正增量（${selectiveValidation.liftVsBestBaselinePct?.toFixed(1) ?? '—'}%）`,
          ]
        : []),
      ...(chosenProbabilityValidation.samples < 8
        ? [`留出期概率评分样本仅${chosenProbabilityValidation.samples}个，低于8个门槛`]
        : []),
      ...((chosenProbabilityValidation.brierSkillPct ?? 0) <= 0
        ? [
            `留出期Brier技能未跑赢历史上涨频率（${chosenProbabilityValidation.brierSkillPct?.toFixed(1) ?? '—'}%）`,
          ]
        : []),
      ...((chosenProbabilityValidation.brierSkillPct ?? 0) > 0 &&
      (chosenProbabilityValidation.brierAdvantagePValue ?? 1) > 0.1
        ? [
            `Brier改善证据不足（单侧p=${chosenProbabilityValidation.brierAdvantagePValue?.toFixed(3) ?? '—'}）`,
          ]
        : []),
      ...(macroRegimeValidation.samples >= 8 &&
      (macroRegimeValidation.liftVsBestBaselinePct ?? 0) <= 0
        ? [
            `当前${backtest.selectivity.macroRegime.name}状态的留出表现未跑赢最佳基线（${macroRegimeValidation.liftVsBestBaselinePct?.toFixed(1) ?? '—'}%）`,
          ]
        : []),
      ...(candidateDirection !== null && (scenario?.samples ?? 0) < 10
        ? [`强信号同方向历史样本仅${scenario?.samples ?? 0}个，低于10个门槛`]
        : []),
      ...(candidateDirection !== null && (scenario?.directionalAccuracyPct ?? 0) < 50
        ? [`强信号同方向命中率${scenario?.directionalAccuracyPct?.toFixed(1) ?? '—'}%低于50%`]
        : []),
      ...(candidateDirection !== null && (validationScenario?.samples ?? 0) < 4
        ? [`留出期强信号同方向样本仅${validationScenario?.samples ?? 0}个，低于4个门槛`]
        : []),
      ...(candidateDirection !== null && (validationScenario?.directionalAccuracyPct ?? 0) < 50
        ? [
            `留出期强信号同方向命中率${validationScenario?.directionalAccuracyPct?.toFixed(1) ?? '—'}%低于50%`,
          ]
        : []),
    ],
  }
  const bias =
    directionEligible && score >= 0.2
      ? 'bullish'
      : directionEligible && score <= -0.2
        ? 'bearish'
        : 'neutral'
  const confidence =
    Math.abs(score) >= 0.4 &&
    directionEligible &&
    predictiveDrivers.length >= 2 &&
    (backtest.directionalAccuracyPct ?? 0) >= 53 &&
    (backtest.liftVsBestBaselinePct ?? 0) >= 2 &&
    backtest.regimeSamples >= 30 &&
    (backtest.regimeLiftPct ?? 0) >= 1
      ? 'medium'
      : 'low'
  const directionalDrivers = predictiveDrivers.filter((driver) => driver.effect !== 'neutral')
  const alignedDrivers = directionalDrivers.filter(
    (driver) =>
      (score > 0 && driver.effect === 'tailwind') || (score < 0 && driver.effect === 'headwind'),
  ).length
  const consensus = {
    aligned: alignedDrivers,
    total: directionalDrivers.length,
    pct: directionalDrivers.length
      ? round((alignedDrivers / directionalDrivers.length) * 100)
      : null,
  }
  const netAttributionContribution = round(
    drivers.reduce((sum, driver) => sum + driver.contribution, 0),
  )
  const attributionAlignment =
    drivers.length === 0 || Math.abs(netAttributionContribution) < 0.1
      ? 'insufficient'
      : sign(target.changes.day) === sign(netAttributionContribution)
        ? 'confirming'
        : 'diverging'
  const dailyAttribution = {
    alignment: attributionAlignment,
    netContribution: netAttributionContribution,
    alignedDrivers: drivers.filter(
      (driver) => sign(driver.contribution) === sign(target.changes.day),
    ).length,
    totalDrivers: drivers.length,
  }
  const reasons = [
    `近5个交易日${directionText(target.changes.week)}（波动标准化${weekMomentumSignal >= 0 ? '+' : ''}${weekMomentumSignal.toFixed(2)}），近1个月${directionText(target.changes.month)}（标准化${monthMomentumSignal >= 0 ? '+' : ''}${monthMomentumSignal.toFixed(2)}）`,
    backtest.selectivity.selectedRule.driverWeight === 0
      ? '训练期选择的是纯动量规则，跨资产驱动仅用于解释、不进入方向得分'
      : backtest.selectivity.driverAblation.allowed
        ? `跨资产驱动通过留出期消融检验：相对纯动量同日样本提升${backtest.selectivity.driverAblation.liftPct?.toFixed(1) ?? '—'}个百分点`
        : `跨资产驱动未通过留出期消融检验（完整模型${backtest.selectivity.driverAblation.fullAccuracyPct?.toFixed(1) ?? '—'}%，纯动量${backtest.selectivity.driverAblation.momentumOnlyAccuracyPct?.toFixed(1) ?? '—'}%），本次评分已将其归零`,
    ...(predictiveDrivers.length
      ? predictiveDrivers.slice(0, 2).map((driver) => driver.text)
      : ['当前没有通过95%区间筛选的跨资产领先线索']),
  ]
  const risks = [
    bias === 'bullish'
      ? '短期动量反转或关键驱动转为逆风'
      : bias === 'bearish'
        ? '超跌反弹或关键驱动快速缓和'
        : '当前驱动方向分化，突破前不宜给出强方向',
    '突发政策、地缘事件和数据意外可能使历史相关性失效',
  ]
  const horizonOutlooks = horizonDefinitions.map((definition) =>
    buildHorizonMomentumOutlook(id, definition),
  )
  return {
    id,
    name: target.name,
    date: target.date,
    dailyMove: target.changes.day,
    dailySummary: `${target.name}最近交易日${directionText(target.changes.day, target.mode)}。${attributionAlignment === 'confirming' ? `标准化共振贡献同向（净贡献${netAttributionContribution >= 0 ? '+' : ''}${netAttributionContribution.toFixed(2)}），主要来自${drivers.map((driver) => driver.driver).join('、')}。` : attributionAlignment === 'diverging' ? `现有跨资产贡献与价格方向相反（净贡献${netAttributionContribution >= 0 ? '+' : ''}${netAttributionContribution.toFixed(2)}），本次涨跌更可能由品种自身事件、新闻或尚未覆盖的驱动造成。` : '当前跨资产贡献不足，无法可靠解释本次涨跌。'}`,
    dailyAttribution,
    drivers,
    horizonOutlooks,
    outlook: {
      horizon: '未来5个交易日',
      bias,
      confidence,
      score,
      momentumSignals: { week: round(weekMomentumSignal), month: round(monthMomentumSignal) },
      probability,
      liveEvaluation: liveEvaluationById[id],
      directionGate,
      scenario,
      consensus,
      predictiveDrivers,
      reasons,
      risks,
      backtest,
    },
  }
})

const rankedDailyMarkets = marketOutlooks
  .filter((market) => market.dailyMove !== null)
  .toSorted((left, right) => (right.dailyMove ?? 0) - (left.dailyMove ?? 0))
const curve10y2y = round(((assetById('us10y')?.value ?? 0) - (assetById('us2y')?.value ?? 0)) * 100)
const curve10y3m = round((assetById('termspread3m')?.value ?? 0) * 100)
const policyGap = round((assetById('policygap')?.value ?? 0) * 100)
const fundingSpread = round((assetById('fundingspread')?.value ?? 0) * 100)
const btcCoreShare = assetById('btccoreShare')
const ethCoreShare = assetById('ethcoreShare')
const stablecoinFlow = assetById('stablecoins')?.changes.week ?? null
const cryptoStructureStale = Boolean(btcCoreShare?.stale || ethCoreShare?.stale)
const globalBreadth = assetById('globalbreadth')
const riskBreadth = assetById('riskbreadth')
const riskStress = assetById('riskstress')
const officialStress = assetById('stlfsi')
const longYieldMove = assetById('us10y')?.changes.day ?? null
const termPremiumMove = assetById('termpremium10y')?.changes.day ?? null
const expectedRateMove = assetById('expectedrate10y')?.changes.day ?? null
const rateMoveDominant =
  termPremiumMove === null || expectedRateMove === null
    ? 'unknown'
    : Math.abs(termPremiumMove) >= Math.abs(expectedRateMove)
      ? 'term-premium'
      : 'expected-rate'
const marketBrief = {
  asOfDate:
    rankedDailyMarkets
      .map((market) => market.date)
      .filter(Boolean)
      .toSorted()
      .at(-1) ?? null,
  methodology:
    '当日归因使用20/60/120日同期共振；全局规律表对全部链执行FDR，目标预测器则对其预设驱动家族使用历史与实时完全相同的Bonferroni时点门槛。自建风险压力共振与圣路易斯联储18分量周度压力指数用于跨来源确认。前70%训练期在纯动量和跨资产增强规则中选择并估计条件概率，最后30%检验方向、状态内增量、Brier技能及驱动消融增量；跨资产分量未显著优于纯动量时自动归零，其他闸门未通过时保持中性。',
  disclaimer: '归因是共振线索，不是已证明的单一因果；方向展望仅为低至中置信度情景。',
  regime: {
    title:
      (assetById('hyspread')?.changes.week ?? 0) > 10
        ? '信用条件收紧'
        : (assetById('usd')?.changes.week ?? 0) > 0.5
          ? '美元流动性偏紧'
          : '风险驱动分化',
    summary: `全球风险压力共振${riskStress?.value === null || riskStress?.value === undefined ? '—' : `${riskStress.value >= 0 ? '+' : ''}${riskStress.value.toFixed(2)}σ`}（单日变化${directionText(riskStress?.changes.day ?? null, 'absolute')}），圣路易斯联储金融压力${officialStress?.value?.toFixed(2) ?? '—'}（零以上为高于历史平均）；10Y–2Y曲线${curve10y2y >= 0 ? '正斜率' : '倒挂'}${Math.abs(curve10y2y).toFixed(0)}bp，10Y–3M${curve10y3m >= 0 ? '正斜率' : '倒挂'}${Math.abs(curve10y3m).toFixed(0)}bp；2Y−EFFR政策路径差${policyGap >= 0 ? '+' : ''}${policyGap.toFixed(0)}bp；5Y5Y通胀预期${assetById('forwardinflation5y5y')?.value?.toFixed(2) ?? '—'}%；新兴市场HY收益率${assetById('emhyyield')?.value?.toFixed(2) ?? '—'}%；SOFR−EFFR资金压力差${fundingSpread >= 0 ? '+' : ''}${fundingSpread.toFixed(0)}bp。`,
  },
  rateRegime: {
    title:
      longYieldMove === null || Math.abs(longYieldMove) < 3
        ? '长端利率波动有限'
        : rateMoveDominant === 'term-premium'
          ? '期限溢价主导长端利率'
          : rateMoveDominant === 'expected-rate'
            ? '政策路径预期主导长端利率'
            : '长端利率来源待确认',
    dominant: rateMoveDominant,
    yieldMoveBp: longYieldMove,
    termPremiumMoveBp: termPremiumMove,
    expectedRateMoveBp: expectedRateMove,
    summary: `10Y收益率最近观测变化${directionText(longYieldMove, 'difference')}；Kim–Wright期限溢价变化${directionText(termPremiumMove, 'difference')}，收益率减期限溢价得到的预期短率成分代理变化${directionText(expectedRateMove, 'difference')}。分量发布日期不同，归因只比较方向和相对幅度，不要求机械相加。`,
  },
  cryptoRegime: {
    title: cryptoStructureStale
      ? '链上结构数据待更新'
      : (btcCoreShare?.changes.week ?? 0) >= 50
        ? 'BTC抱团增强'
        : (ethCoreShare?.changes.week ?? 0) >= 50
          ? '风险向ETH扩散'
          : (stablecoinFlow ?? 0) >= 0.5
            ? '链上美元流动性扩张'
            : (stablecoinFlow ?? 0) <= -0.5
              ? '链上美元流动性收缩'
              : '加密内部轮动平稳',
    summary: `核心池代理中BTC占${btcCoreShare?.value?.toFixed(1) ?? '—'}%、ETH占${ethCoreShare?.value?.toFixed(1) ?? '—'}%（结构数据截至${btcCoreShare?.date ?? '—'}${cryptoStructureStale ? '，已过期且不参与当前信号' : ''}）；BTC份额5日${directionText(btcCoreShare?.changes.week ?? null, 'difference')}，ETH份额5日${directionText(ethCoreShare?.changes.week ?? null, 'difference')}，稳定币供应5日${directionText(stablecoinFlow)}。该口径仅覆盖BTC、ETH与稳定币，不等同于全市场主导率。`,
  },
  breadth: {
    title:
      (globalBreadth?.value ?? 50) >= 60 && (riskBreadth?.value ?? 50) >= 60
        ? '上涨参与广泛'
        : (globalBreadth?.value ?? 50) <= 40 && (riskBreadth?.value ?? 50) <= 40
          ? '风险广度收缩'
          : '市场参与度分化',
    summary: `最近交易日有数据的六大股指跟踪池中${globalBreadth?.value?.toFixed(0) ?? '—'}%上涨，股票/商品/加密十项风险跟踪池中${riskBreadth?.value?.toFixed(0) ?? '—'}%上涨；5日参与率分别${directionText(globalBreadth?.changes.week ?? null, 'absolute')}、${directionText(riskBreadth?.changes.week ?? null, 'absolute')}。这是跟踪标的参与率，不是交易所成分股涨跌家数。`,
  },
  leaders: rankedDailyMarkets
    .slice(0, 3)
    .map((market) => ({ id: market.id, name: market.name, move: market.dailyMove })),
  laggards: rankedDailyMarkets
    .slice(-3)
    .reverse()
    .map((market) => ({ id: market.id, name: market.name, move: market.dailyMove })),
  markets: marketOutlooks,
}

const forecastKeys = new Set(
  liveForecastHistory.map(
    (record) =>
      `${record.marketId}:${record.marketDate}:${record.horizonObservations}:${record.modelVersion}`,
  ),
)
for (const market of marketOutlooks) {
  const key = `${market.id}:${market.date}:5:${modelVersion}`
  if (!market.date || forecastKeys.has(key)) continue
  liveForecastHistory.push({
    marketId: market.id,
    marketName: market.name,
    marketDate: market.date,
    recordedAt: new Date().toISOString(),
    modelVersion,
    horizonObservations: 5,
    bias: market.outlook.bias,
    score: market.outlook.score,
    upProbabilityPct: market.outlook.probability.upProbabilityPct,
    probabilityValidated: market.outlook.probability.validated,
    directionGateEligible: market.outlook.directionGate.eligible,
    ruleId: market.outlook.backtest.selectivity.selectedRule.id,
    ruleName: market.outlook.backtest.selectivity.selectedRule.name,
    threshold: market.outlook.backtest.selectivity.selectedThreshold,
    macroRegime: market.outlook.backtest.selectivity.macroRegime.name,
    probabilitySource: market.outlook.probability.source,
    predictiveDrivers: market.outlook.predictiveDrivers.map((driver) => ({
      chain: driver.chain,
      driver: driver.driver,
      driverZ: driver.driverZ,
      contribution: driver.contribution,
    })),
  })
  forecastKeys.add(key)
}
for (const market of marketOutlooks) {
  for (const horizon of market.horizonOutlooks) {
    const key = `${market.id}:${market.date}:${horizon.observations}:${homeModelVersion}`
    if (!market.date || forecastKeys.has(key)) continue
    liveForecastHistory.push({
      marketId: market.id,
      marketName: market.name,
      marketDate: market.date,
      recordedAt: new Date().toISOString(),
      modelVersion: homeModelVersion,
      forecastTrack: 'homepage-momentum',
      horizonId: horizon.id,
      horizonObservations: horizon.observations,
      bias: horizon.direction,
      score: horizon.score,
      upProbabilityPct: horizon.upProbabilityPct,
      probabilityValidated: horizon.validated,
      directionGateEligible: horizon.validated,
      ruleId: horizon.ruleName,
      ruleName: horizon.ruleName,
      threshold: horizon.threshold,
      macroRegime: market.outlook.backtest.selectivity.macroRegime.name,
      probabilitySource: 'horizon-momentum',
      predictiveDrivers: horizon.factors.map((factor) => ({
        chain: factor.name,
        driver: factor.name,
        driverZ: factor.value,
        contribution: factor.value,
      })),
    })
    forecastKeys.add(key)
  }
}
liveForecastHistory = liveForecastHistory.slice(-2000)

for (const market of marketOutlooks) {
  const allMarketRecords = liveForecastHistory.filter((record) => record.marketId === market.id)
  const versionRecords = allMarketRecords.filter((record) => record.modelVersion === modelVersion)
  const resolved = versionRecords.filter((record) => record.resolvedAt).slice(-100)
  const directional = resolved.filter((record) => record.directionCorrect !== null)
  market.outlook.liveEvaluation = {
    modelVersion,
    totalSnapshots: versionRecords.length,
    allVersionSnapshots: allMarketRecords.length,
    resolvedSamples: resolved.length,
    directionalSamples: directional.length,
    directionalAccuracyPct: directional.length
      ? round(
          (directional.filter((record) => record.directionCorrect).length / directional.length) *
            100,
        )
      : null,
    brierScore: resolved.length
      ? round(resolved.reduce((sum, record) => sum + record.brierLoss, 0) / resolved.length, 4)
      : null,
    latestOutcomeDate: resolved.at(-1)?.outcomeDate ?? null,
  }
}

const output = {
  updatedAt: new Date().toISOString(),
  correlationWindow: '20/60/120个共同观测日',
  source: 'FRED、新浪、腾讯、DefiLlama、Coin Metrics公开数据及透明派生指标',
  sourceUrl: 'https://fred.stlouisfed.org/',
  limitations: [
    '资金流当前使用5日价格或收益率变化代理，不等同于真实净申购或净持仓。',
    '市场广度使用跟踪池上涨参与率，并在传导检验中剔除被预测目标；不等同于交易所全部成分股涨跌家数。',
    '全球风险压力共振指数是VIX、美国HY利差、美元广义指数和10Y实际利率日冲击的等权标准化合成值；它衡量同步压力而非可交易价格，也不证明单向因果。',
    '10Y期限溢价来自Kim–Wright研究模型并可能修订；“预期短率成分”以10Y恒定期限收益率减该期限溢价构造，仅作透明近似。两者发布日期不同，单日变化不应被视为严格会计分解。',
    'BTC/ETH核心份额仅以BTC市值、ETH市值和稳定币供应构造，不等同于全加密市场官方主导率；过期链上数据会被新鲜度门控排除。',
    '估值分位仍等待覆盖全球市场且许可稳定的数据适配器。',
    '月度序列（例如铜）在短周期可能显示为空，相关性只在至少30个共同观测值时计算。',
    '黄金暂用FRED收录的Credit Suisse NASDAQ Gold FLOWS103价格指数作为相关性代理，并非黄金现货报价。',
    '95%相关区间使用Fisher变换的近似值，未校正序列相关和多重比较，因此只作证据筛选而非因果检验。',
    '领先5日统计使用互不重叠的未来区间，以减少重叠标签造成的伪样本扩张；最终可用性仍以时序滚动回测相对基线的增量为准。',
    '冲击事件研究预先固定为驱动变化的上尾和下尾各10%，采用两比例正态近似并对双向检验联合FDR校正；小样本或未当前触发的结果不进入预测。',
  ],
  assets: assets.filter((asset) => !asset.hidden),
  matrix: { ids: matrixIds, correlations },
  transmissionChains,
  marketBrief,
}
const homeOutput = {
  updatedAt: output.updatedAt,
  transmissionChains: transmissionChains.slice(0, 3),
  marketBrief: {
    asOfDate: marketBrief.asOfDate,
    disclaimer: marketBrief.disclaimer,
    regime: marketBrief.regime,
    rateRegime: marketBrief.rateRegime,
    breadth: marketBrief.breadth,
    markets: marketOutlooks.map((market) => ({
      id: market.id,
      name: market.name,
      date: market.date,
      dailyMove: market.dailyMove,
      drivers: market.drivers,
      horizonOutlooks: market.horizonOutlooks,
    })),
  },
}

const technicalAssetIds = new Set([
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
])
const technicalSignalsOutput = {
  updatedAt: output.updatedAt,
  source: output.source,
  sourceUrl: output.sourceUrl,
  sourcePriority,
  limitations: [
    '多数公开宏观与跨资产序列只提供收盘值，因此仅在数据源提供真实开高低收时开放K线。',
    '技术指标用于描述价格状态，不构成买卖建议；不同资产的数据频率和交易日历可能不同。',
    '黄金使用公开策略指数代理，铜为月度序列，短周期技术指标可能不可用。',
    '统一交易日历使用各市场时区、工作日、收盘时间和发布延迟，并以两至五个会话容忍交易所假期与临时休市；不替代交易所官方日历。',
  ],
  limitationsEn: [
    'Most public macro and cross-asset series provide closing values only, so candlesticks are enabled only when the source supplies genuine OHLC data.',
    'Technical indicators describe price conditions and are not trading advice. Data frequency and trading calendars differ across assets.',
    'Gold uses a public strategy-index proxy and copper is monthly, so short-horizon indicators may be unavailable.',
    'The unified calendar applies market time zones, business days, closing times, and publication delays, with a two-to-five-session tolerance for holidays and temporary closures. It does not replace official exchange calendars.',
  ],
  assets: assets
    .filter((asset) => technicalAssetIds.has(asset.id))
    .map((asset) => {
      const definition = definitions.find((item) => item.id === asset.id)
      const closeHistory = (histories[definition?.series] ?? []).slice(-1260)
      const bars = marketBars[asset.id]
      return {
        id: asset.id,
        name: asset.name,
        category: asset.category,
        series: asset.series,
        unit: asset.unit,
        mode: asset.mode,
        date: asset.date,
        stale: asset.stale,
        source: asset.source,
        sourceUrl: asset.sourceUrl,
        calendar: asset.calendar,
        dataShape: bars?.length ? 'ohlcv' : 'close',
        adjustmentBasis:
          asset.source === '腾讯财经'
            ? 'forward-adjusted'
            : bars?.length
              ? 'as-published'
              : 'not-applicable',
        points: bars?.length
          ? bars.slice(-1260)
          : closeHistory.map((item) => ({ date: item.date, close: item.value })),
      }
    })
    .filter((asset) => asset.points.length >= 2),
}

await writeJsonBatchAtomic([
  { outputPath, value: output },
  { outputPath: homeOutputPath, value: homeOutput },
  { outputPath: technicalSignalsPath, value: technicalSignalsOutput },
  {
    outputPath: forecastHistoryPath,
    value: { updatedAt: output.updatedAt, records: liveForecastHistory },
  },
])
process.stdout.write(
  `wrote ${output.assets.length} visible assets and ${matrixIds.length}x${matrixIds.length} matrix\n`,
)
