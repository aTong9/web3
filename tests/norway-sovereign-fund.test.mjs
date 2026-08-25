import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const { buildAllocationBreakdown, getTurningPoints } = jiti('../src/utils/norway-sovereign-fund.ts')

test('持仓拆分按权重降序并保留官方口径覆盖率', () => {
  const result = buildAllocationBreakdown([
    { id: 'bonds', label: '固定收益', weightPct: 26.6 },
    { id: 'equity', label: '股票', weightPct: 71.4 },
    { id: 'real-estate', label: '未上市房地产', weightPct: 1.8 },
    { id: 'renewable', label: '未上市可再生能源基础设施', weightPct: 0.2 },
  ])

  assert.deepEqual(
    result.items.map((item) => item.id),
    ['equity', 'bonds', 'real-estate', 'renewable'],
  )
  assert.equal(result.totalWeightPct, 100)
  assert.equal(result.largest?.label, '股票')
})

test('历史筛选仅返回被官方制度或投资授权改变标记的转折点', () => {
  const result = getTurningPoints([
    { year: 1969, title: '发现石油', isTurningPoint: false },
    { year: 1990, title: '基金法案通过', isTurningPoint: true },
    { year: 1996, title: '首次注资', isTurningPoint: true },
    { year: 1997, title: '年度报告', isTurningPoint: false },
  ])

  assert.deepEqual(
    result.map((item) => item.year),
    [1990, 1996],
  )
})
