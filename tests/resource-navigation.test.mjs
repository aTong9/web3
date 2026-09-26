import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { load } from 'js-yaml'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const { createResourceMatcher, parseResourceFavorites } = jiti('../src/utils/resource-search.ts')

test('resource search combines fields, normalizes full-width input and requires every keyword', () => {
  const matches = createResourceMatcher('  ＦＲＥＤ　 宏观  ')
  assert.equal(matches('FRED API', undefined, '市场资讯 · 全球宏观数据'), true)
  assert.equal(matches('FRED API', '公司披露'), false)
  assert.equal(createResourceMatcher('   ')('Anything'), true)
  assert.equal(createResourceMatcher('writer 2020')('Title', 'A Writer', '2020'), true)
  assert.equal(createResourceMatcher('C++')('C++ Reference'), true)
})

test('saved favorites accept only unique HTTP(S) URLs and reject malformed JSON', () => {
  assert.deepEqual(
    parseResourceFavorites(
      JSON.stringify([
        'https://example.org/',
        'https://example.org/',
        null,
        12,
        {},
        'javascript:alert(1)',
        'broken',
        'http://localhost:2333/',
      ]),
    ),
    ['https://example.org/', 'http://localhost:2333/'],
  )
  assert.deepEqual(parseResourceFavorites('{}'), [])
  assert.throws(() => parseResourceFavorites('{broken'), SyntaxError)
})

test('resource catalog has unique categories and URLs with complete, safe entries', () => {
  const catalog = load(readFileSync('src/data/webstack.yml', 'utf8'))
  const categories = new Set()
  const urls = new Set()
  assert.ok(Array.isArray(catalog) && catalog.length > 0)
  for (const taxonomy of catalog) {
    assert.ok(taxonomy.taxonomy && Array.isArray(taxonomy.list))
    for (const { term, links } of taxonomy.list) {
      assert.ok(typeof term === 'string' && term.trim() && !categories.has(term), term)
      categories.add(term)
      assert.ok(Array.isArray(links) && links.length > 0, term)
      for (const link of links) {
        assert.ok(typeof link.title === 'string' && link.title.trim(), term)
        assert.ok(link.description === undefined || typeof link.description === 'string', link.title)
        assert.equal(typeof link.logo, 'string', link.title)
        const url = new URL(link.url)
        assert.ok(['https:', 'http:'].includes(url.protocol), link.title)
        const key = url.href.replace(/\/$/, '')
        assert.ok(!urls.has(key), `Duplicate resource: ${key}`)
        urls.add(key)
      }
    }
  }
})
