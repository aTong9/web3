import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const usPath = resolve(root, 'src/data/us-funds.json')
const aSharePath = resolve(root, 'src/data/a-share-sectors.json')
const outputPath = resolve(root, 'src/data/technical-funds.json')
const us = JSON.parse(await readFile(usPath, 'utf8'))
const aShare = JSON.parse(await readFile(aSharePath, 'utf8'))
const byScale = (left, right) => (right.scaleBillionCny ?? -1) - (left.scaleBillionCny ?? -1)
const usSelected = [
  ...us.funds.filter((fund) => fund.venue === 'exchange').toSorted(byScale).slice(0, 3),
  ...us.funds.filter((fund) => fund.venue === 'offExchange').toSorted(byScale).slice(0, 3),
]
const aShareSelected = aShare.funds.toSorted(byScale).slice(0, 6)

const mapFund = (fund, market) => {
  const isOffExchange = fund.venue === 'offExchange'
  const history = isOffExchange && fund.navHistory?.length ? fund.navHistory : fund.priceHistory
  const points = (history ?? []).map((point) => ({
    date: point.date,
    close: point.value,
  }))
  const latest = points[points.length - 1]
  return {
    id: `fund-${fund.code}`,
    name: fund.name,
    category: 'funds',
    series: fund.code,
    unit: '元',
    mode: 'return',
    date: latest?.date ?? fund.latestDate ?? fund.navDate ?? null,
    stale: false,
    source: market === 'us-related' ? '天天基金' : '新浪行情 / 东方财富',
    sourceUrl: fund.sourceUrl,
    calendar: 'sse',
    dataShape: 'close',
    adjustmentBasis: 'not-applicable',
    fundMetrics: {
      market,
      venue: isOffExchange ? 'offExchange' : 'exchange',
      latestNav: fund.latestNav ?? null,
      navDate: fund.navDate ?? null,
      premiumRatePct: fund.premiumRatePct ?? null,
      annualFeePct:
        (fund.managementFeePct ?? 0) +
        (fund.custodianFeePct ?? 0) +
        (fund.serviceFeePct ?? 0),
      dailyInvestmentLimitCny: fund.dailyInvestmentLimitCny ?? null,
      recurringInvestmentOpen: fund.recurringInvestmentOpen ?? null,
      investmentLimitHistory: (fund.investmentLimitHistory ?? []).slice(-30),
      trackingErrorPct: fund.trackingErrorPct ?? null,
    },
    points,
  }
}

const assets = [
  ...usSelected.map((fund) => mapFund(fund, 'us-related')),
  ...aShareSelected.map((fund) => mapFund(fund, 'a-share')),
].filter((asset) => asset.points.length >= 2)
const output = {
  updatedAt: [us.updatedAt, aShare.updatedAt].filter(Boolean).toSorted().at(-1) ?? null,
  methodology:
    '美股相关场内和场外基金各按规模选取前3，A股行业ETF按规模选取前6；场外基金优先使用净值历史，场内基金使用收盘价历史。',
  assets,
}
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(`wrote ${assets.length} technical fund assets\n`)
