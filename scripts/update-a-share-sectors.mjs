import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/a-share-sectors.json')

const fundConfigs = [
  { code: '512880', name: '证券ETF', sector: '证券', kind: 'industry' },
  { code: '512800', name: '银行ETF', sector: '银行', kind: 'industry' },
  { code: '512070', name: '证券保险ETF', sector: '非银金融', kind: 'industry' },
  { code: '512690', name: '酒ETF', sector: '白酒', kind: 'theme' },
  { code: '159928', name: '消费ETF', sector: '消费', kind: 'industry' },
  { code: '512170', name: '医疗ETF', sector: '医疗', kind: 'industry' },
  { code: '512010', name: '医药ETF', sector: '医药', kind: 'industry' },
  { code: '159992', name: '创新药ETF', sector: '创新药', kind: 'theme' },
  { code: '512400', name: '有色金属ETF', sector: '有色金属', kind: 'industry' },
  { code: '515220', name: '煤炭ETF', sector: '煤炭', kind: 'industry' },
  { code: '516020', name: '化工ETF', sector: '化工', kind: 'industry' },
  { code: '515030', name: '新能源车ETF', sector: '新能源车', kind: 'theme' },
  { code: '515790', name: '光伏ETF', sector: '光伏', kind: 'theme' },
  { code: '516160', name: '新能源ETF', sector: '新能源', kind: 'theme' },
  { code: '159869', name: '游戏ETF', sector: '游戏', kind: 'theme' },
  { code: '512660', name: '军工ETF', sector: '国防军工', kind: 'industry' },
  { code: '512480', name: '半导体ETF', sector: '半导体', kind: 'theme' },
  { code: '159995', name: '芯片ETF', sector: '半导体', kind: 'theme' },
  { code: '515000', name: '科技ETF', sector: '科技', kind: 'theme' },
  { code: '512720', name: '计算机ETF', sector: '计算机', kind: 'industry' },
  { code: '515880', name: '通信ETF', sector: '通信', kind: 'industry' },
  { code: '512980', name: '传媒ETF', sector: '传媒', kind: 'industry' },
  { code: '159996', name: '家电ETF', sector: '家电', kind: 'industry' },
  { code: '512200', name: '房地产ETF', sector: '房地产', kind: 'industry' },
  { code: '159825', name: '农业ETF', sector: '农业', kind: 'industry' },
  { code: '159865', name: '养殖ETF', sector: '养殖', kind: 'theme' },
  { code: '159766', name: '旅游ETF', sector: '旅游', kind: 'theme' },
  { code: '516510', name: '云计算ETF', sector: '云计算', kind: 'theme' },
  { code: '159819', name: '人工智能ETF', sector: '人工智能', kind: 'theme' },
  { code: '562500', name: '机器人ETF', sector: '机器人', kind: 'theme' },
  { code: '516950', name: '基建ETF', sector: '基建', kind: 'industry' },
  { code: '159745', name: '建材ETF', sector: '建材', kind: 'industry' },
  { code: '512580', name: '环保ETF', sector: '环保', kind: 'industry' },
  { code: '159611', name: '电力ETF', sector: '电力', kind: 'industry' },
  { code: '159852', name: '软件ETF', sector: '软件', kind: 'theme' },
]

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 finance-desk/1.0' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.text()
}

const fetchOptionalText = async (url) => {
  try {
    return await fetchText(url)
  } catch {
    return ''
  }
}

const match = (text, pattern) => text.match(pattern)?.[1]?.trim() ?? null
const number = (value) => (value ? Number.parseFloat(value.replaceAll(',', '')) : null)
const round = (value) => Math.round(value * 100) / 100

const periodReturn = (prices, tradingDays) => {
  if (prices.length <= tradingDays) return null
  return round((prices.at(-1).close / prices.at(-tradingDays - 1).close - 1) * 100)
}

const yearToDateReturn = (prices) => {
  const latest = prices.at(-1)
  const year = latest.date.slice(0, 4)
  const previous = prices.filter((item) => item.date < `${year}-01-01`).at(-1)
  return previous ? round((latest.close / previous.close - 1) * 100) : null
}

const readFund = async (config) => {
  const { code } = config
  const market = code.startsWith('5') ? 'sh' : 'sz'
  const historyResponse = await fetchText(
    `https://quotes.sina.cn/cn/api/jsonp.php/var%20_data=/CN_MarketDataService.getKLineData?symbol=${market}${code}&scale=240&ma=no&datalen=1023`,
  )
  const profile = await fetchOptionalText(`https://fund.eastmoney.com/pingzhongdata/${code}.js`)
  const detail = await fetchOptionalText(`https://fundf10.eastmoney.com/jbgk_${code}.html`)

  const historyJson = match(historyResponse, /var _data=\((\[[\s\S]*\])\);/)
  const history = historyJson ? JSON.parse(historyJson) : null
  if (!history?.length) throw new Error(`No price history for ${code}`)

  const prices = history.map((item) => ({
    date: item.day,
    close: Number(item.close),
    volume: Number(item.volume),
  }))
  const latest = prices.at(-1)
  const scaleBlock = match(profile, /Data_fluctuationScale\s*=\s*([^;]+)/)
  const scaleData = scaleBlock ? JSON.parse(scaleBlock) : null
  const navBlock = match(profile, /Data_netWorthTrend\s*=\s*([^;]+)/)
  const navSeries = navBlock ? JSON.parse(navBlock) : []
  const latestNavPoint = navSeries.at(-1)
  const latestNav = latestNavPoint?.y ?? null

  return {
    ...config,
    name: match(profile, /fS_name\s*=\s*"([^"]+)"/) ?? config.name,
    latestDate: latest.date,
    latestClose: latest.close,
    volumeMillion: round(latest.volume / 1_000_000),
    scaleBillionCny: scaleData?.series?.at(-1)?.y ?? null,
    scaleDate: scaleData?.categories?.at(-1) ?? null,
    managementFeePct: number(match(detail, /管理费率<\/th><td>([\d.]+)%/)),
    custodianFeePct: number(match(detail, /托管费率<\/th><td>([\d.]+)%/)),
    latestNav,
    navDate: latestNavPoint?.x
      ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(
          new Date(latestNavPoint.x),
        )
      : null,
    premiumRatePct: latestNav !== null ? round((latest.close / latestNav - 1) * 100) : null,
    priceHistory: prices.slice(-320).map((point) => ({ date: point.date, value: point.close })),
    navHistory: [],
    trackingErrorPct: null,
    trackingBenchmark: null,
    returns: {
      day: periodReturn(prices, 1),
      week: periodReturn(prices, 5),
      month: periodReturn(prices, 20),
      quarter: periodReturn(prices, 60),
      halfYear: periodReturn(prices, 125),
      yearToDate: yearToDateReturn(prices),
      year: periodReturn(prices, 250),
    },
    sourceUrl: `https://fund.eastmoney.com/${code}.html`,
  }
}

const annualizedTrackingError = (left, right) => {
  const rightByDate = new Map(right.map((point) => [point.date, point.value]))
  const common = left.filter((point) => rightByDate.has(point.date)).slice(-253)
  if (common.length < 21) return null
  const differences = []
  for (let index = 1; index < common.length; index += 1) {
    const previousRight = rightByDate.get(common[index - 1].date)
    const currentRight = rightByDate.get(common[index].date)
    if (!common[index - 1].value || !previousRight || !currentRight) continue
    const leftReturn = common[index].value / common[index - 1].value - 1
    const rightReturn = currentRight / previousRight - 1
    if (Math.abs(leftReturn) > 0.3 || Math.abs(rightReturn) > 0.3) continue
    differences.push(leftReturn - rightReturn)
  }
  if (differences.length < 20) return null
  const mean = differences.reduce((sum, value) => sum + value, 0) / differences.length
  const variance =
    differences.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (differences.length - 1)
  return round(Math.sqrt(variance) * Math.sqrt(252) * 100)
}

const funds = []
for (const config of fundConfigs) {
  try {
    funds.push(await readFund(config))
    process.stdout.write(`updated ${config.code}\n`)
  } catch (error) {
    process.stderr.write(`failed ${config.code}: ${error.message}\n`)
  }
}
if (funds.length !== fundConfigs.length) {
  throw new Error(
    `Only ${funds.length}/${fundConfigs.length} funds updated; refusing partial output`,
  )
}

for (const fund of funds) {
  const benchmark = funds
    .filter((candidate) => candidate.sector === fund.sector)
    .toSorted((left, right) => (right.scaleBillionCny ?? -1) - (left.scaleBillionCny ?? -1))[0]
  fund.trackingErrorPct = annualizedTrackingError(fund.priceHistory, benchmark.priceHistory)
  fund.trackingBenchmark = benchmark.code
}

const sectors = [...new Set(funds.map((fund) => fund.sector))].map((sector) => {
  const sectorFunds = funds.filter((fund) => fund.sector === sector)
  const representative = sectorFunds.toSorted(
    (a, b) => (b.scaleBillionCny ?? -1) - (a.scaleBillionCny ?? -1),
  )[0]
  return {
    name: sector,
    kind: representative.kind,
    representativeFundCode: representative.code,
    fundCount: sectorFunds.length,
    returns: representative.returns,
  }
})

const latestDate = funds
  .map((fund) => fund.latestDate)
  .toSorted()
  .at(-1)
const shanghaiDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(
  new Date(),
)
const output = {
  updatedAt: new Date().toISOString(),
  tradingDate: latestDate,
  marketStatus: latestDate === shanghaiDate ? 'closed' : 'holiday',
  source: '新浪公开日线行情与东方财富基金页面；行业收益使用该分类下规模最大的代表ETF收盘价计算',
  periods: {
    day: '最近1个交易日',
    week: '最近5个交易日',
    month: '最近20个交易日',
    quarter: '最近60个交易日',
    halfYear: '最近125个交易日',
    yearToDate: '今年以来',
    year: '最近250个交易日',
  },
  sectors,
  funds,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(`wrote ${sectors.length} sectors and ${funds.length} funds\n`)
