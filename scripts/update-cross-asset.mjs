import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/cross-asset.json')

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
  { id: 'us2y', name: '美债2Y', category: 'bonds', series: 'DGS2', unit: '%', mode: 'difference' },
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
    id: 'usd',
    name: '美元广义指数',
    category: 'fx',
    series: 'DTWEXBGS',
    unit: '点',
    mode: 'return',
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
]

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 finance-desk/1.0' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.text()
}

const seriesIds = definitions.map((item) => item.series)
const histories = Object.fromEntries(
  await Promise.all(
    seriesIds.map(async (id) => {
      const csv = await fetchText(
        `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=2024-01-01`,
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

const round = (value, digits = 2) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
const relativeChange = (history, offset, mode) => {
  if (history.length <= offset) return null
  const latest = history.at(-1).value
  const previous = history.at(-offset - 1).value
  return round(mode === 'difference' ? (latest - previous) * 100 : (latest / previous - 1) * 100)
}
const ytdChange = (history, mode) => {
  const latest = history.at(-1)
  const previous = history.filter((item) => item.date < `${latest.date.slice(0, 4)}-01-01`).at(-1)
  if (!previous) return null
  return round(
    mode === 'difference'
      ? (latest.value - previous.value) * 100
      : (latest.value / previous.value - 1) * 100,
  )
}

const assets = definitions.map((definition) => {
  const history = histories[definition.series]
  const latest = history.at(-1)
  const week = relativeChange(history, 5, definition.mode)
  return {
    ...definition,
    value: latest?.value ?? null,
    date: latest?.date ?? null,
    changes: {
      day: relativeChange(history, 1, definition.mode),
      week,
      month: relativeChange(history, 21, definition.mode),
      quarter: relativeChange(history, 63, definition.mode),
      yearToDate: ytdChange(history, definition.mode),
    },
    flow: {
      status: 'proxy',
      label: definition.mode === 'difference' ? '5日水平变化代理' : '5日价格动量代理',
      value: week,
      note: '不是申赎或净买入数据',
    },
  }
})

const dailyMoves = (definition) => {
  const history = histories[definition.series]
  return history.slice(1).map((item, index) => ({
    date: item.date,
    value:
      definition.mode === 'difference'
        ? item.value - history[index].value
        : item.value / history[index].value - 1,
  }))
}
const pearson = (left, right) => {
  const rightByDate = new Map(right.map((item) => [item.date, item.value]))
  const pairs = left
    .filter((item) => rightByDate.has(item.date))
    .map((item) => [item.value, rightByDate.get(item.date)])
    .slice(-60)
  if (pairs.length < 30) return null
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
  return denominator ? round(numerator / denominator) : null
}

const matrixIds = ['sp500', 'nasdaq', 'us10y', 'hyspread', 'usd', 'usdjpy', 'wti', 'gold', 'btc']
const matrixDefinitions = matrixIds.map((id) => definitions.find((item) => item.id === id))
const correlations = matrixDefinitions.map((left) => ({
  id: left.id,
  values: matrixDefinitions.map((right) =>
    left.id === right.id ? 1 : pearson(dailyMoves(left), dailyMoves(right)),
  ),
}))

const getCorrelation = (left, right) =>
  correlations.find((row) => row.id === left)?.values[matrixIds.indexOf(right)] ?? null
const transmissionChains = [
  {
    title: '日元套息链',
    steps: ['日元走强（USD/JPY下跌）', '套息头寸去杠杆', '全球高估值资产波动'],
    signal: getCorrelation('usdjpy', 'nasdaq'),
    interpretation: 'USD/JPY与纳指60个共同交易日收益相关性',
  },
  {
    title: '利率—科技股链',
    steps: ['美债10Y收益率变化', '贴现率重估', '纳斯达克估值敏感度'],
    signal: getCorrelation('us10y', 'nasdaq'),
    interpretation: '10Y收益率日变化与纳指收益相关性',
  },
  {
    title: '风险偏好链',
    steps: ['高收益信用利差变化', '风险承受度变化', '美股与BTC波动'],
    signal: getCorrelation('hyspread', 'btc'),
    interpretation: '高收益利差日变化与BTC收益相关性',
  },
]

const output = {
  updatedAt: new Date().toISOString(),
  correlationWindow: '最近60个共同观测日',
  source: 'Federal Reserve Economic Data (FRED)',
  sourceUrl: 'https://fred.stlouisfed.org/',
  limitations: [
    '资金流当前使用5日价格或收益率变化代理，不等同于真实净申购或净持仓。',
    '估值分位、市场广度、稳定币市值、ETH主导率和链上数据等待可靠数据适配器。',
    '月度序列（例如铜）在短周期可能显示为空，相关性只在至少30个共同观测值时计算。',
    '黄金暂用FRED收录的Credit Suisse NASDAQ Gold FLOWS103价格指数作为相关性代理，并非黄金现货报价。',
  ],
  assets,
  matrix: { ids: matrixIds, correlations },
  transmissionChains,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(
  `wrote ${assets.length} assets and ${matrixIds.length}x${matrixIds.length} matrix\n`,
)
