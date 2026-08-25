import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeJsonAtomic } from './lib/write-json-atomic.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = process.env.NBIM_OUTPUT_PATH
  ? resolve(process.env.NBIM_OUTPUT_PATH)
  : resolve(root, 'src/data/norway-fund-snapshot.json')
const holdingsBase = 'https://www.nbim.no/api/investments/v2/'

const fetchText = async (url) => {
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'web3-norway-fund-monitor/1.0 (+https://github.com/aTong9/web3)' },
        signal: AbortSignal.timeout(45_000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt < 2) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000 * 2 ** attempt))
    }
  }
  throw lastError
}

const fetchJson = async (url) => JSON.parse(await fetchText(url))
const decodeHtml = (value = '') =>
  value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))

const plainText = (html) =>
  decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

const numberFrom = (value) => {
  const parsed = Number(String(value ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

const requireMatchNumber = (text, pattern, label) => {
  const value = numberFrom(text.match(pattern)?.[1])
  if (value === null) throw new Error(`Unable to parse ${label}`)
  return value
}

const parseTable = (html, id) => {
  const table = html.match(new RegExp(`<table[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/table>`, 'i'))?.[1]
  if (!table) throw new Error(`Missing official report table ${id}`)
  return [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) =>
      [...row[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((cell) => plainText(cell[1])),
    )
    .filter((row) => row.length)
}

const parseTableAfterHeading = (html, headingPattern, label) => {
  const heading = html.search(headingPattern)
  if (heading < 0) throw new Error(`Missing official report heading ${label}`)
  const tableId = html.slice(heading).match(/<table[^>]+id=["']([^"']+)["']/i)?.[1]
  if (!tableId) throw new Error(`Missing official report table after ${label}`)
  return parseTable(html, tableId)
}

const reportUrlFor = (detail) => {
  const year = detail.date.slice(0, 4)
  return detail.label.startsWith('H1')
    ? `https://www.nbim.no/en/news-and-insights/reports/${year}/half-year-report-${year}/web-report-half-year-report-${year}/`
    : `https://www.nbim.no/en/news-and-insights/reports/${year}/annual-report-${year}/web-report-annual-report-${year}/`
}

const publishedDateFrom = (html) => {
  const encoded = html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)/i)?.[1]
  const publishedAt = encoded
    ? new Date(decodeHtml(encoded).trim().replace(/:(?=[+-]\d{2}:\d{2}$)/, ''))
    : null
  if (!publishedAt || !Number.isFinite(publishedAt.valueOf()))
    throw new Error('Unable to parse official publication date')
  return publishedAt.toISOString().slice(0, 10)
}

const sectorNames = {
  Technology: '科技',
  Financials: '金融',
  'Consumer discretionary': '可选消费',
  'Consumer Discretionary': '可选消费',
  Industrials: '工业',
  'Health care': '医疗保健',
  'Real estate': '房地产（上市）',
  'Consumer staples': '必选消费',
  'Basic materials': '基础材料',
  Telecommunications: '通信',
  Energy: '能源',
  Utilities: '公用事业',
}
const regionNames = {
  'North America': '北美',
  Europe: '欧洲',
  'Asia and Oceania': '亚洲及大洋洲',
  'Emerging markets': '新兴市场',
}
const fixedIncomeNames = {
  'Government bonds': '政府债',
  'Government-related bonds': '政府相关债',
  'Inflation-linked bonds': '通胀挂钩债',
  'Corporate bonds': '公司债',
  'Securitised bonds': '证券化债券',
}
const countryNames = { US: '美国', TW: '台湾', KR: '韩国', NL: '荷兰' }

const init = await fetchJson(`${holdingsBase}init.json`)
const detailIndex = Number.parseInt(process.env.NBIM_DETAIL_INDEX ?? '0', 10)
const detail = init.data?.details?.[Number.isFinite(detailIndex) ? detailIndex : 0]
if (!detail?.fileName || !detail?.date || !detail?.v) throw new Error('NBIM holdings metadata is incomplete')
const isHalfYear = detail.label.startsWith('H1')
const reportUrl = reportUrlFor(detail)
const [holdingsPayload, reportHtml] = await Promise.all([
  fetchJson(`${holdingsBase}${detail.fileName}?v=${detail.v}`),
  fetchText(reportUrl),
])
const holdings = holdingsPayload.data
if (!Array.isArray(holdings) || holdings.length < 5_000) throw new Error('NBIM holdings file is unexpectedly small')
const reportText = plainText(reportHtml)
const table1 = parseTableAfterHeading(reportHtml, /TABLE 1[^<]*<\/strong>\s*Key figures/i, 'key figures')
const tableRegions = isHalfYear
  ? parseTableAfterHeading(
      reportHtml,
      /TABLE 4[^<]*<\/strong>\s*Return on the fund.s equity investments/i,
      'equity regions',
    )
  : []
const tableSectors = parseTableAfterHeading(
  reportHtml,
  /Return on the fund.s equity investments[^<]*sorted by sector/i,
  'equity sectors',
)
const tableFixedIncome = parseTableAfterHeading(
  reportHtml,
  /Return on the fund.s fixed-income investments[^<]*sorted by sector/i,
  'fixed income sectors',
)
const tableSectorValues = isHalfYear
  ? parseTableAfterHeading(
      reportHtml,
      /Table 5\.1 specifies investments in equities by sector\./i,
      'equity sector market values',
    )
  : []
const rowMap = (rows) => {
  const values = new Map()
  for (const row of rows.slice(1).filter((item) => item[0])) {
    const key = row[0].replace(/\d+$/g, '').trim()
    if (!values.has(key)) values.set(key, row.slice(1))
  }
  return values
}
const keyFigures = rowMap(table1)
const equityValues = rowMap(tableSectorValues)

const keyFigure = (name) => numberFrom(keyFigures.get(name)?.[0])
const requireKeyFigure = (name) => {
  const value = keyFigure(name)
  if (value === null) throw new Error(`Unable to parse key figure ${name}`)
  return value
}

const fundReturn = requireMatchNumber(reportText, /fund[^.]{0,80}? returned (-?[\d.]+) percent/i, 'fund return')
const relativeMatch = reportText.match(
  /(?:This was|return[^.]{0,80}?was) ([\d.]+) percentage point (higher|lower|above|below)/i,
)
if (!relativeMatch) throw new Error('Unable to parse relative return')
const relativeDirection = relativeMatch[2].toLowerCase()
const relativeReturn =
  numberFrom(relativeMatch[1]) * (['lower', 'below'].includes(relativeDirection) ? -1 : 1)
const annualNetInflow =
  (keyFigure('Inflow of capital') ?? 0) +
  (keyFigure('Withdrawal of capital') ?? 0) +
  (keyFigure('Paid management fees') ?? 0)
const summary = {
  asOfDate: detail.date.slice(0, 10),
  publishedDate: publishedDateFrom(reportHtml),
  periodLabel: detail.label,
  valueBillionNok: isHalfYear
    ? requireMatchNumber(reportText, /fund[’']s value was ([\d,]+) billion kroner/i, 'fund value')
    : requireKeyFigure('Fund value'),
  periodReturnPct: fundReturn,
  periodReturnBillionNok: isHalfYear
    ? requireMatchNumber(
        reportText,
        /accounting return amounted to (-?[\d,]+) billion kroner/i,
        'accounting return',
      )
    : requireKeyFigure('Return on fund'),
  relativeReturnPctPoints: relativeReturn,
  netInflowBillionNok: isHalfYear
    ? requireMatchNumber(reportText, /received inflows of (-?[\d,]+) billion kroner/i, 'net inflow')
    : annualNetInflow,
  currencyEffectBillionNok: isHalfYear
    ? requireMatchNumber(reportText, /reduced the value by (-?[\d,]+) billion kroner/i, 'currency effect')
    : requireKeyFigure('Changes due to fluctuations in krone'),
  expectedVolatilityPct: requireMatchNumber(
    reportText,
    /expected annual (?:value )?fluctuation[^.]{0,120}?of ([\d.]+) percent/i,
    'expected volatility',
  ),
  listedCompanies: holdings.filter((item) => item.at === 0 && item.eq).length,
}

const allocationDefinitions = [
  ['equity', '上市股票', 'Equity investments', isHalfYear ? /Equity investments accounted for ([\d.]+) percent/i : /investments comprised ([\d.]+) percent equities/i, /equity investments returned (-?[\d.]+) percent/i],
  ['fixed-income', '固定收益', 'Fixed-income investments', isHalfYear ? /fixed-income investments ([\d.]+) percent/i : /equities, ([\d.]+) percent fixed income/i, /fixed[- ]income (?:investments )?returned (-?[\d.]+) percent/i],
  ['real-estate', '非上市房地产', 'Unlisted real estate investments', isHalfYear ? /Unlisted real estate accounted for ([\d.]+) percent/i : /fixed income, ([\d.]+) percent unlisted real estate/i, /(?:Unlisted real estate investments|investments in unlisted real estate) returned (-?[\d.]+) percent/i],
  ['renewable', '非上市可再生能源基础设施', 'Unlisted infrastructure investments', isHalfYear ? /unlisted renewable energy infrastructure ([\d.]+) percent/i : /unlisted real estate and ([\d.]+) percent unlisted renewable energy infrastructure/i, /(?:unlisted )?renewable energy infrastructure returned (-?[\d.]+) percent/i],
]
const assetAllocation = allocationDefinitions.map(([id, label, rowName, weightPattern, returnPattern]) => ({
  id,
  label,
  weightPct: requireMatchNumber(reportText, weightPattern, `${label} weight`),
  valueBillionNok: numberFrom(keyFigures.get(rowName)?.[0]),
  returnPct: requireMatchNumber(reportText, returnPattern, `${label} return`),
}))

const equityRegions = tableRegions.slice(1).map(([name, returnPct, weightPct]) => ({
  label: regionNames[name] ?? name,
  weightPct: numberFrom(weightPct),
  returnPct: numberFrom(returnPct),
}))
const equitySectors = tableSectors.slice(1).map(([name, returnPct, weightPct]) => ({
  label: sectorNames[name] ?? name,
  weightPct: numberFrom(weightPct),
  marketValueBillionNok: isHalfYear
    ? (numberFrom(equityValues.get(name)?.[0]) ?? 0) / 1_000
    : Number((((numberFrom(weightPct) ?? 0) / 100) * requireKeyFigure('Equity investments')).toFixed(1)),
  returnPct: numberFrom(returnPct),
}))
const fixedIncome = tableFixedIncome.slice(1).map(([name, returnPct, weightPct]) => ({
  label: fixedIncomeNames[name.replace(/\d+$/g, '').trim()] ?? name,
  weightPct: numberFrom(weightPct),
  returnPct: numberFrom(returnPct),
}))
const topHoldings = holdings
  .filter((item) => item.at === 0 && item.eq && Number.isFinite(item.a?.n))
  .toSorted((left, right) => right.a.n - left.a.n)
  .slice(0, 10)
  .map((item, index) => ({
    rank: index + 1,
    company: item.n,
    country: countryNames[item.cc] ?? item.cc,
    sector: sectorNames[item.eq.s] ?? item.eq.s,
    marketValueBillionNok: Number((item.a.n / 1_000_000_000).toFixed(1)),
    ownershipPct: item.o,
  }))

const output = {
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
  status: 'complete',
  source: 'Norges Bank Investment Management official report and holdings API',
  sources: {
    report: reportUrl,
    holdings: 'https://www.nbim.no/en/investments/all-investments/',
    holdingsApi: `${holdingsBase}${detail.fileName}?v=${detail.v}`,
  },
  summary,
  availability: {
    equityRegions: isHalfYear ? 'reported' : 'not-reported',
  },
  assetAllocation,
  equitySectors,
  equityRegions,
  topHoldings,
  fixedIncome,
}
await writeJsonAtomic(outputPath, output)
process.stdout.write(`wrote NBIM ${summary.periodLabel}: ${summary.listedCompanies} equities, ${topHoldings.length} top holdings\n`)
