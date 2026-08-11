import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = resolve(root, 'src/data/cross-asset-forecast-history.json')
const megaCapsPath = resolve(root, 'src/data/us-megacaps.json')
const outputPath = resolve(root, 'src/data/technical-events.json')
const history = JSON.parse(await readFile(inputPath, 'utf8'))
const megaCaps = JSON.parse(await readFile(megaCapsPath, 'utf8'))
const previousOutput = await readFile(outputPath, 'utf8')
  .then((value) => JSON.parse(value))
  .catch(() => ({ macroEvents: [] }))
const records = Array.isArray(history.records) ? history.records : []
const strongestByMarketDate = new Map()

for (const record of records) {
  if (!record.marketId || !record.marketDate || !['bullish', 'bearish'].includes(record.bias))
    continue
  const key = `${record.marketId}:${record.marketDate}`
  const previous = strongestByMarketDate.get(key)
  if (!previous || Math.abs(record.score ?? 0) > Math.abs(previous.score ?? 0))
    strongestByMarketDate.set(key, record)
}

const eventsByMarket = new Map()
for (const record of strongestByMarketDate.values()) {
  const events = eventsByMarket.get(record.marketId) ?? []
  events.push({
    marketId: record.marketId,
    marketDate: record.marketDate,
    bias: record.bias,
    score: record.score ?? 0,
    horizonId: record.horizonId ?? null,
    ruleName: record.ruleName ?? record.ruleId ?? '历史预测记录',
  })
  eventsByMarket.set(record.marketId, events)
}

const events = [...eventsByMarket.values()].flatMap((items) =>
  items.toSorted((left, right) => left.marketDate.localeCompare(right.marketDate)).slice(-120),
)
const normalizeDate = (value) => {
  if (!value) return null
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
  if (iso) return iso
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
  return match
    ? `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
    : null
}
const corporateEvents = megaCaps.stocks.flatMap((stock) => {
  const reported = normalizeDate(stock.earnings?.lastReportedDate)
  const expected = normalizeDate(stock.earnings?.nextEarningsDate)
  return [
    ...(reported
      ? [
          {
            symbol: stock.symbol,
            date: reported,
            type: 'earningsReported',
            surprisePct: stock.earnings?.lastSurprisePct ?? null,
          },
        ]
      : []),
    ...(expected
      ? [
          {
            symbol: stock.symbol,
            date: expected,
            type: 'earningsExpected',
            surprisePct: null,
          },
        ]
      : []),
  ]
})
const monthIndex = new Map(
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ].map((month, index) => [month, index + 1]),
)
const isoDate = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const fetchOfficialHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'MarketDesk/1.0 (+https://github.com/aTong9/web3)',
    },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return response.text()
}
const parseFomcEvents = (html) => {
  const headings = [...html.matchAll(/<a id="[^"]+">(\d{4}) FOMC Meetings<\/a>/g)]
  return headings.flatMap((heading, index) => {
    const year = Number(heading[1])
    const section = html.slice(heading.index, headings[index + 1]?.index ?? html.length)
    return [...section.matchAll(
      /fomc-meeting__month[^>]*><strong>([^<]+)<\/strong>[\s\S]*?fomc-meeting__date[^>]*>([^<]+)/g,
    )].flatMap((match) => {
      const month = monthIndex.get(match[1].trim())
      const days = match[2].replace(/\*/g, '').trim().split('-')
      const day = Number(days[days.length - 1])
      if (!month || !Number.isInteger(day)) return []
      const date = isoDate(year, month, day)
      return [{
        date,
        type: 'fomcDecision',
        title: 'Federal Reserve interest-rate decision',
        titleZh: '美联储利率决议',
        status: date <= new Date().toISOString().slice(0, 10) ? 'released' : 'scheduled',
        source: 'Federal Reserve',
        sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
      }]
    })
  })
}
const decodeHtml = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const parseBeaEvents = (html) => {
  const year = Number(/Year\s+(\d{4})/.exec(html)?.[1])
  if (!Number.isInteger(year)) return []
  return [...html.matchAll(
    /<tr[^>]*>[\s\S]*?<div class="release-date">([^<]+)<\/div>[\s\S]*?<small[^>]*>([^<]+)<\/small>[\s\S]*?<td class="release-title[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/g,
  )].flatMap((match) => {
    const [monthName, dayText] = match[1].trim().split(/\s+/)
    const month = monthIndex.get(monthName)
    const day = Number(dayText)
    const title = decodeHtml(match[3])
    const isGdp = /\bGDP\b|Gross Domestic Product/i.test(title)
    const isPce = /Personal Income and Outlays/i.test(title)
    if (!month || !Number.isInteger(day) || (!isGdp && !isPce)) return []
    const date = isoDate(year, month, day)
    return [{
      date,
      type: isGdp ? 'usGdp' : 'usPce',
      title,
      titleZh: isGdp ? '美国 GDP 数据发布' : '美国个人收入与支出（含 PCE）',
      status: date <= new Date().toISOString().slice(0, 10) ? 'released' : 'scheduled',
      source: 'U.S. Bureau of Economic Analysis',
      sourceUrl: 'https://www.bea.gov/news/schedule',
    }]
  })
}
let macroEvents = previousOutput.macroEvents ?? []
let macroUpdatedAt = previousOutput.macroUpdatedAt ?? null
try {
  const [fomcHtml, beaHtml] = await Promise.all([
    fetchOfficialHtml('https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'),
    fetchOfficialHtml('https://www.bea.gov/news/schedule'),
  ])
  macroEvents = [...parseFomcEvents(fomcHtml), ...parseBeaEvents(beaHtml)]
    .filter((event, index, all) =>
      all.findIndex((candidate) => candidate.date === event.date && candidate.type === event.type) === index,
    )
    .toSorted((left, right) => left.date.localeCompare(right.date))
  macroUpdatedAt = new Date().toISOString()
} catch (error) {
  console.warn(`official macro calendar refresh failed; preserving previous events: ${error.message}`)
}
const output = {
  updatedAt: history.updatedAt ?? new Date().toISOString(),
  methodology:
    '从只追加的跨资产预测账本按市场和日期选取绝对得分最高的当时多空记录；中性记录不标注，每个市场最多保留120条。',
  events,
  corporateEvents,
  macroEvents,
  macroUpdatedAt,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(
  `wrote ${events.length} technical chart events, ${corporateEvents.length} corporate events and ${macroEvents.length} macro events\n`,
)
