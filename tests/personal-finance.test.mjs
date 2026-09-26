import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
})
const { emptyPersonalFinance, financeInputNumber, parsePersonalFinance, calculatePersonalFinance } =
  jiti('../src/utils/personal-finance.ts')
const complete = (overrides = {}) => ({
  ...emptyPersonalFinance(),
  assets: [
    { id: 'cash', name: '可投资资金', amount: 200000, kind: 'investable' },
    { id: 'home', name: '自住房', amount: 1000000, kind: 'home' },
  ],
  liabilities: [{ id: 'loan', name: '未偿贷款', amount: 50000 }],
  monthlyIncome: 10000,
  monthlyExpenses: 6000,
  annualTargetExpenses: 60000,
  annualRetirementIncome: 12000,
  withdrawalRate: 4,
  nominalReturn: 0,
  inflationRate: 0,
  scenarioSpread: 0,
  ...overrides,
})
const close = (actual, expected) =>
  assert.ok(
    Math.abs(actual - expected) < Math.max(1, Math.abs(expected)) * 1e-10,
    `${actual} ≈ ${expected}`,
  )

test('assets, cash flow and FIRE targets use investable capital and constant-purchasing-power income', () => {
  const data = complete()
  const before = JSON.stringify(data)
  const result = calculatePersonalFinance(data)
  assert.equal(result.totalAssets, 1200000)
  assert.equal(result.totalLiabilities, 50000)
  assert.equal(result.netWorth, 1150000)
  assert.equal(result.investableAssets, 200000)
  assert.equal(result.fireCapital, 150000)
  assert.equal(result.monthlyCashFlow, 4000)
  assert.equal(result.savingsRate, 40)
  assert.equal(result.targetCapital, 1200000)
  assert.equal(result.fundingGap, 1050000)
  assert.equal(result.scenarios[1].monthsToTarget, 263)
  assert.equal(result.scenarios[1].endBalance, 2070000)
  assert.equal(result.scenarios[1].balances.length, 41)
  assert.equal(JSON.stringify(data), before)
  assert.deepEqual(parsePersonalFinance(before), data)
})

test('empty profiles contain no invented personal amounts and do not calculate missing income as zero', () => {
  const empty = emptyPersonalFinance()
  assert.deepEqual(empty.assets, [])
  assert.deepEqual(empty.liabilities, [])
  const result = calculatePersonalFinance(empty)
  assert.equal(result.monthlyCashFlow, null)
  assert.equal(result.savingsRate, null)
  assert.equal(result.targetCapital, null)
  assert.equal(result.fundingGap, null)
  assert.deepEqual(result.scenarios, [])
  empty.assets.push({ id: 'new', name: '新资产', amount: 0, kind: 'other' })
  assert.deepEqual(emptyPersonalFinance().assets, [])
})

test('zero income and negative savings retain losses, with no invented savings rate or false future target', () => {
  const result = calculatePersonalFinance(complete({ monthlyIncome: 0, monthlyExpenses: 1000 }))
  assert.equal(result.savingsRate, null)
  assert.equal(result.monthlyCashFlow, -1000)
  assert.equal(result.scenarios[1].monthsToTarget, null)
  assert.equal(result.scenarios[1].endBalance, -330000)
  assert.equal(
    calculatePersonalFinance(complete({ monthlyIncome: 1000, monthlyExpenses: 2000 })).savingsRate,
    -100,
  )
})

test('negative net capital is not erased and debt deficits do not earn an investment return', () => {
  const result = calculatePersonalFinance(
    complete({
      assets: [],
      liabilities: [{ id: 'loan', name: '贷款', amount: 100000 }],
      monthlyIncome: 2000,
      monthlyExpenses: 1000,
      annualTargetExpenses: 4000,
      annualRetirementIncome: 0,
      nominalReturn: 10,
      horizonYears: 5,
    }),
  )
  assert.equal(result.netWorth, -100000)
  assert.equal(result.fireCapital, -100000)
  assert.equal(result.fundingGap, 200000)
  assert.equal(result.scenarios[1].endBalance, -40000)
  assert.equal(result.scenarios[1].monthsToTarget, null)
})

test('inflation uses the exact real return ratio, including returns below inflation', () => {
  const result = calculatePersonalFinance(
    complete({
      assets: [{ id: 'cash', name: '储蓄', amount: 100000, kind: 'investable' }],
      liabilities: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      nominalReturn: 2,
      inflationRate: 5,
      scenarioSpread: 1,
      horizonYears: 1,
    }),
  )
  close(result.scenarios[1].realReturn, (1.02 / 1.05 - 1) * 100)
  close(result.scenarios[1].endBalance, (100000 * 1.02) / 1.05)
  assert.ok(result.scenarios[0].endBalance < result.scenarios[1].endBalance)
  assert.ok(result.scenarios[1].endBalance < result.scenarios[2].endBalance)
  assert.equal(result.scenarios[1].monthsToTarget, null)
})

test('already funded and fully income-covered targets have zero gap without selling the home', () => {
  const already = calculatePersonalFinance(complete({ annualTargetExpenses: 16000 }))
  assert.equal(already.targetCapital, 100000)
  assert.equal(already.fundingGap, 0)
  assert.equal(already.scenarios[1].monthsToTarget, 0)
  const covered = calculatePersonalFinance(complete({ annualTargetExpenses: 10000 }))
  assert.equal(covered.targetCapital, 0)
  assert.equal(covered.fundingGap, 0)
  const homeOnly = calculatePersonalFinance(
    complete({
      assets: [{ id: 'home', name: '住房', amount: 9000000, kind: 'home' }],
      liabilities: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
    }),
  )
  assert.equal(homeOnly.fireCapital, 0)
  assert.equal(homeOnly.scenarios[1].monthsToTarget, null)
})

test('money input rejects blanks, nonfinite values and coercion tricks while accepting explicit zero', () => {
  for (const value of [
    '',
    ' ',
    'Infinity',
    'NaN',
    '0x10',
    true,
    null,
    [],
    NaN,
    Infinity,
    -Infinity,
  ]) {
    assert.throws(() => financeInputNumber(value))
  }
  assert.equal(financeInputNumber('0'), 0)
  assert.equal(financeInputNumber(0), 0)
  assert.equal(financeInputNumber(' 1234.56 '), 1234.56)
  assert.equal(financeInputNumber('-2.5'), -2.5)
  assert.throws(() => calculatePersonalFinance(complete({ monthlyIncome: NaN })))
  assert.throws(() => calculatePersonalFinance(complete({ monthlyIncome: Infinity })))
})

test('backup validation rejects bad records rather than dropping or normalizing them silently', () => {
  assert.throws(() => parsePersonalFinance('{bad'))
  assert.throws(() =>
    parsePersonalFinance(
      JSON.stringify(complete()).replace('"monthlyIncome":10000', '"monthlyIncome":1e309'),
    ),
  )
  for (const invalid of [
    {},
    null,
    [],
    complete({ version: 2 }),
    complete({ unknown: 'field' }),
    complete({ monthlyIncome: '' }),
    complete({ monthlyExpenses: -1 }),
    complete({ withdrawalRate: 0 }),
    complete({ horizonYears: 2.5 }),
    complete({ horizonYears: 101 }),
    complete({ nominalReturn: -100 }),
    complete({ inflationRate: -100 }),
    complete({ scenarioSpread: 31 }),
    complete({ assets: [{ id: 'x', name: '', amount: 1, kind: 'investable' }] }),
    complete({ assets: [{ id: 'x', name: '资产', amount: null, kind: 'investable' }] }),
    complete({ assets: [{ id: 'x', name: '资产', amount: 1, kind: 'unknown' }] }),
    complete({
      liabilities: [
        { id: 'x', name: '债务', amount: 1 },
        { id: 'x', name: '另笔债务', amount: 2 },
      ],
    }),
  ])
    assert.throws(() => parsePersonalFinance(JSON.stringify(invalid)))
})
