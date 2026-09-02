import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCrossAssetDatasets } from '../scripts/validate-cross-asset-datasets.mjs'

const now = new Date('2026-08-25T08:00:00.000Z')
const updatedAt = '2026-08-25T07:30:00.000Z'

const completeFamily = () => ({
  'cross-asset': {
    updatedAt,
    assets: Array.from({ length: 40 }, () => ({})),
    matrix: {
      ids: Array.from({ length: 10 }, (_, index) => `a${index}`),
      correlations: Array.from({ length: 10 }, (_, index) => ({
        id: `a${index}`,
        values: Array.from({ length: 10 }, () => 1),
      })),
    },
  },
  'market-home': {
    updatedAt,
    marketBrief: { markets: Array.from({ length: 8 }, () => ({})) },
  },
  'asset-technical-signals': {
    updatedAt,
    assets: Array.from({ length: 20 }, () => ({})),
  },
  'cross-asset-forecast-history': { updatedAt, records: [{}] },
  'technical-events': { updatedAt, events: [{}] },
  'fund-transmission': { updatedAt, markets: [{}, {}, {}] },
})

test('cross-asset family gate accepts one fresh and structurally complete version', () => {
  const result = validateCrossAssetDatasets(completeFamily(), now)
  assert.equal(result.ok, true)
})

test('cross-asset family gate rejects mixed versions after a partial update', () => {
  const datasets = completeFamily()
  datasets['technical-events'].updatedAt = '2026-08-25T07:31:00.000Z'
  const result = validateCrossAssetDatasets(datasets, now)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('更新时间不一致')))
})

test('cross-asset family gate rejects a truncated correlation matrix', () => {
  const datasets = completeFamily()
  datasets['cross-asset'].matrix.correlations[0].values = [1]
  const result = validateCrossAssetDatasets(datasets, now)
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((error) => error.includes('完整方阵')))
})
