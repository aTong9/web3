import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const { backtestTechnicalSignals } = jiti('../src/utils/technical-backtest.ts')
const { defaultTechnicalIndicatorConfig: config } = jiti('../src/utils/technical-config-default.ts')
const now = new Date('2026-09-19T00:00:00Z')

test('optimized backtest preserves the existing calibration and holdout results', () => {
  const points = Array.from({ length: 420 }, (_, i) => ({
    date: new Date(Date.UTC(2024, 0, i + 1)).toISOString().slice(0, 10),
    close: 100 + i * 0.03 + Math.sin(i / 9) * 12,
    high: 115 + i * 0.03,
    low: 85 + i * 0.03,
    volume: 1000 + (i % 23) * 55,
  }))
  const result = backtestTechnicalSignals(points, config, now)
  assert.equal(
    createHash('sha256').update(JSON.stringify(result)).digest('hex'),
    '079a3b578781da45f7fc5708a6c9a18089c3c44bdf7595be3c608e0861913b7a',
  )
})

test('default page backtest stays below an 800 ms main-thread budget', () => {
  const data = JSON.parse(
    readFileSync(new URL('../src/data/asset-technical-signals.json', import.meta.url), 'utf8'),
  )
  const asset = data.assets.find((asset) => asset.id === 'sp500')
  const start = performance.now()
  backtestTechnicalSignals(asset.points, config, now)
  const elapsed = performance.now() - start
  console.log(`default asset backtest: ${elapsed.toFixed(1)} ms`)
  assert.ok(elapsed < 800, `backtest blocked the main thread for ${elapsed.toFixed(1)} ms`)
})

test('precomputed indicators match each historical prefix without future leakage', () => {
  const { analyzeTechnicalSignals, calculateTechnicalSeries } = jiti(
    '../src/utils/technical-analysis.ts',
  )
  const points = Array.from({ length: 150 }, (_, i) => ({
    date: String(i),
    close: 100 + Math.sin(i / 3) * 5 + i / 20,
    high: 108 + i / 20,
    low: 92 + i / 20,
    ...(i % 3 ? { volume: 1000 + i * 5 } : {}),
  }))
  points[90].close = NaN
  for (const settings of [
    config,
    { ...config, parameters: { ...config.parameters, rsiPeriod: 7, maLongPeriod: 40 } },
  ]) {
    const series = calculateTechnicalSeries(points, settings)
    for (const length of [5, 35, 60, 90, 91, 120, 150]) {
      const prefix = points.slice(0, length)
      assert.deepEqual(
        analyzeTechnicalSignals(prefix, 0, false, settings, series),
        analyzeTechnicalSignals(prefix, 0, false, settings),
      )
    }
  }
})
