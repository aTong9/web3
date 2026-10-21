import assert from 'node:assert/strict'
import test from 'node:test'
import brands from '../src/data/china-foreign-brands.json' with { type: 'json' }

test('foreign brand cards have unique ids, bilingual copy and official links', () => {
  const categories = new Set([
    'grocery',
    'food',
    'home',
    'mobility',
    'sport',
    'apparel',
    'electronics',
    'personal',
    'beauty',
    'healthcare',
    'family',
    'dining',
    'hospitality',
    'leisure',
  ])
  assert.ok(brands.length >= 434, 'retain the existing 234 and add at least 200 brands')
  assert.equal(new Set(brands.map(({ id }) => id)).size, brands.length)
  assert.equal(new Set(brands.map(({ nameEn }) => nameEn.toLowerCase())).size, brands.length)
  for (const id of ['tesla', 'sams', 'costco', 'ikea', 'decathlon', 'uniqlo', 'apple']) {
    assert.ok(
      brands.some((brand) => brand.id === id),
      `retain original brand: ${id}`,
    )
  }
  for (const brand of brands) {
    assert.ok(categories.has(brand.category), `${brand.id}: unknown category`)
    for (const field of [
      'id',
      'category',
      'nameZh',
      'nameEn',
      'originZh',
      'originEn',
      'layoutZh',
      'layoutEn',
      'fitZh',
      'fitEn',
      'checkedAt',
    ]) {
      assert.ok(brand[field]?.trim(), `${brand.id}: ${field}`)
    }
    assert.match(brand.checkedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(new Date(brand.checkedAt).toISOString().slice(0, 10), brand.checkedAt)
    assert.ok(new URL(brand.site).protocol === 'https:')
    assert.ok(brand.sources.length > 0)
    for (const source of brand.sources) {
      assert.ok(source.label.trim())
      assert.ok(new URL(source.url).protocol === 'https:')
    }
  }
})
