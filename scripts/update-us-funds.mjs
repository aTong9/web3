import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/us-funds.json')

const funds = [
  { code: '513100', venue: 'exchange', index: '纳斯达克 100' },
  { code: '159941', venue: 'exchange', index: '纳斯达克 100' },
  { code: '513300', venue: 'exchange', index: '纳斯达克 100' },
  { code: '159501', venue: 'exchange', index: '纳斯达克 100' },
  { code: '159659', venue: 'exchange', index: '纳斯达克 100' },
  { code: '513110', venue: 'exchange', index: '纳斯达克 100' },
  { code: '513500', venue: 'exchange', index: '标普 500' },
  { code: '513650', venue: 'exchange', index: '标普 500' },
  { code: '159612', venue: 'exchange', index: '标普 500' },
  { code: '159655', venue: 'exchange', index: '标普 500' },
  { code: '270042', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '006479', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '040046', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '014978', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '161130', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '012870', venue: 'offExchange', index: '纳斯达克 100' },
  { code: '050025', venue: 'offExchange', index: '标普 500' },
  { code: '006075', venue: 'offExchange', index: '标普 500' },
  { code: '007721', venue: 'offExchange', index: '标普 500' },
  { code: '007722', venue: 'offExchange', index: '标普 500' },
]

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 finance-desk/1.0' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.text()
}

const match = (text, pattern) => text.match(pattern)?.[1]?.trim() ?? null
const number = (value) => (value ? Number.parseFloat(value.replaceAll(',', '')) : null)
const round = (value) => Math.round(value * 100) / 100

const readFund = async (config) => {
  const { code } = config
  const market = code.startsWith('5') ? 'sh' : 'sz'
  const [page, profile, detail, historyResponse] = await Promise.all([
    fetchText(`https://fund.eastmoney.com/${code}.html`),
    fetchText(`https://fund.eastmoney.com/pingzhongdata/${code}.js`),
    fetchText(`https://fundf10.eastmoney.com/jbgk_${code}.html`),
    config.venue === 'exchange'
      ? fetchText(
          `https://quotes.sina.cn/cn/api/jsonp.php/var%20_data=/CN_MarketDataService.getKLineData?symbol=${market}${code}&scale=240&ma=no&datalen=5`,
        )
      : Promise.resolve(''),
  ])

  const scaleBlock = match(profile, /Data_fluctuationScale\s*=\s*([^;]+)/)
  const scaleData = scaleBlock ? JSON.parse(scaleBlock) : null
  const scaleSeries = scaleData?.series?.at(-1)
  const dailyLimit = number(match(page, /单日累计购买上限([\d,.]+)元/))
  const purchaseStatus = page.includes('暂停申购')
    ? 'suspended'
    : page.includes('限大额')
      ? 'limited'
      : 'open'
  const navBlock = match(profile, /Data_netWorthTrend\s*=\s*([^;]+)/)
  const navSeries = navBlock ? JSON.parse(navBlock) : []
  const latestNavPoint = navSeries.at(-1)
  const historyJson = match(historyResponse, /var _data=\((\[[\s\S]*\])\);/)
  const latestPrice = historyJson ? JSON.parse(historyJson).at(-1) : null
  const latestClose = latestPrice ? Number(latestPrice.close) : null
  const latestNav = latestNavPoint?.y ?? null

  return {
    ...config,
    name: match(profile, /fS_name\s*=\s*"([^"]+)"/) ?? code,
    scaleBillionCny: scaleSeries?.y ?? null,
    scaleDate: scaleData?.categories?.at(-1) ?? null,
    managementFeePct: number(match(detail, /管理费率<\/th><td>([\d.]+)%/)),
    custodianFeePct: number(match(detail, /托管费率<\/th><td>([\d.]+)%/)),
    serviceFeePct: number(match(detail, /销售服务费率<\/th><td>([\d.]+)%/)),
    purchaseFeePct: number(match(profile, /fund_Rate\s*=\s*"([\d.]+)"/)),
    latestClose,
    latestCloseDate: latestPrice?.day ?? null,
    latestNav,
    navDate: latestNavPoint?.x
      ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(
          new Date(latestNavPoint.x),
        )
      : null,
    premiumRatePct:
      latestClose !== null && latestNav !== null
        ? round((latestClose / latestNav - 1) * 100)
        : null,
    dailyInvestmentLimitCny: config.venue === 'offExchange' ? dailyLimit : null,
    purchaseStatus: config.venue === 'offExchange' ? purchaseStatus : null,
    recurringInvestmentOpen:
      config.venue === 'offExchange'
        ? match(page, /fundDtStatus\s*=\s*"(true|false)"/) === 'true'
        : null,
    sourceUrl: `https://fund.eastmoney.com/${code}.html`,
  }
}

const results = []
for (const fund of funds) {
  try {
    results.push(await readFund(fund))
    process.stdout.write(`updated ${fund.code}\n`)
  } catch (error) {
    process.stderr.write(`failed ${fund.code}: ${error.message}\n`)
  }
}

if (results.length !== funds.length) {
  throw new Error(`Only ${results.length}/${funds.length} funds updated; refusing partial output`)
}

const output = {
  updatedAt: new Date().toISOString(),
  source: '天天基金公开基金页面，最终额度以基金公司公告及实际销售渠道为准',
  funds: results,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(`wrote ${results.length} funds to ${outputPath}\n`)
