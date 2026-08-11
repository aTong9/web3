import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = resolve(root, 'src/data/cross-asset-forecast-history.json')
const megaCapsPath = resolve(root, 'src/data/us-megacaps.json')
const outputPath = resolve(root, 'src/data/technical-events.json')
const history = JSON.parse(await readFile(inputPath, 'utf8'))
const megaCaps = JSON.parse(await readFile(megaCapsPath, 'utf8'))
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
const output = {
  updatedAt: history.updatedAt ?? new Date().toISOString(),
  methodology:
    '从只追加的跨资产预测账本按市场和日期选取绝对得分最高的当时多空记录；中性记录不标注，每个市场最多保留120条。',
  events,
  corporateEvents,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(
  `wrote ${events.length} technical chart events and ${corporateEvents.length} corporate events\n`,
)
