import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const cities = JSON.parse(
  readFileSync(new URL('../src/data/china-city-population-2020.json', import.meta.url)),
)
const data = JSON.parse(
  readFileSync(new URL('../src/data/china-city-indicators.json', import.meta.url)),
)

test('city indicators match the census list and published sample coverage', () => {
  const names = new Set(cities.map(([name]) => name))
  assert.equal(names.size, 337)
  assert.equal(data.gdpYear, 2025)
  assert.equal(data.housingMonth, '2026-10')
  for (const [kind, count] of [
    ['gdp', 325],
    ['resale', 96],
    ['rent', 50],
  ]) {
    assert.equal(Object.keys(data[kind]).length, count)
    for (const [name, value] of Object.entries(data[kind])) {
      assert.ok(names.has(name), `${kind}: ${name}`)
      assert.ok(Number.isFinite(value) && value > 0, `${kind}: ${name}`)
    }
  }
  assert.equal(data.gdp['深圳市'], 38731.8)
  assert.equal(data.gdp['上海市'], 56708.71)
  assert.equal(data.resale['北京市'], 60145)
  assert.equal(data.rent['上海市'], 85.04)
  assert.equal(data.resale['昆山市'], undefined)
})
