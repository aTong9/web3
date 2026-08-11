import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = resolve(root, 'src/data/cross-asset.json')
const outputPath = resolve(root, 'src/data/fund-transmission.json')
const dataset = JSON.parse(await readFile(inputPath, 'utf8'))
const marketIds = new Set(['sp500', 'nasdaq', 'shanghai'])

const output = {
  updatedAt: dataset.updatedAt,
  asOfDate: dataset.marketBrief.asOfDate,
  markets: dataset.marketBrief.markets
    .filter((market) => marketIds.has(market.id))
    .map((market) => ({
      id: market.id,
      name: market.name,
      date: market.date,
      dailyMove: market.dailyMove,
      dailyAttribution: market.dailyAttribution,
      drivers: market.drivers,
    })),
  chains: dataset.transmissionChains
    .filter((chain) => marketIds.has(chain.left) || marketIds.has(chain.right))
    .map((chain) => ({
      title: chain.title,
      left: chain.left,
      right: chain.right,
      status: chain.status,
      strength: chain.strength,
      signal: chain.signal,
      interpretation: chain.interpretation,
    })),
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
process.stdout.write(
  `wrote ${output.markets.length} fund-market proxies and ${output.chains.length} related chains\n`,
)
