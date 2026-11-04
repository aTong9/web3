import assert from 'node:assert/strict'
import test from 'node:test'
import cities from '../src/data/china-city-population-2020.json' with { type: 'json' }

test('2020 city population ranking is complete and ordered for its declared coverage', () => {
  assert.equal(cities.length, 337)
  assert.equal(new Set(cities.map(([name, province]) => `${province}/${name}`)).size, 337)
  assert.equal(new Set(cities.map(([, province]) => province)).size, 31)
  assert.ok(
    cities.every(
      ([name, province, population]) =>
        typeof name === 'string' &&
        name &&
        typeof province === 'string' &&
        province &&
        Number.isSafeInteger(population) &&
        population > 0,
    ),
  )
  assert.ok(
    cities.every(([, , population], index) => index === 0 || cities[index - 1][2] >= population),
  )
  assert.deepEqual(cities[0], ['重庆市', '重庆市', 32054159])
  assert.deepEqual(cities.at(-1), ['三沙市', '海南省', 2333])
  assert.ok(!cities.some(([name]) => name === '济源市'))
})
