import assert from 'node:assert/strict'
import test from 'node:test'
import sections from '../src/data/million-action-plan.json' with { type: 'json' }

test('action directory preserves original topics, valid destinations and actionable entries', () => {
  const items = sections.flatMap((section) => section.items)
  assert.equal(new Set(sections.map((section) => section.id)).size, sections.length)
  assert.equal(new Set(items.map((item) => item.id)).size, items.length)
  for (const id of [
    'japan',
    'iphone',
    'us',
    'hsbc-cn',
    'hsbc-card',
    'hsbc-hk',
    'pulse',
    'sc',
    'stocks',
    'star',
    'options',
    'futures',
    'private-fund',
    'sunflower',
    'global-private',
    'hospital',
  ]) {
    assert.ok(
      items.some((item) => item.id === id && item.kind === '原清单'),
      id,
    )
  }
  assert.equal(sections.length, 10)
  assert.equal(items.length, 57)
  assert.ok(items.filter((item) => item.kind === '扩展建议').length >= 30)
  for (const id of [
    'bocom',
    'bse',
    'margin',
    'deposit-insurance',
    'pension',
    'career-break',
    'eldercare',
    'digital-product',
    'down-payment',
  ]) {
    assert.ok(
      items.some((item) => item.id === id),
      `retain expanded topic: ${id}`,
    )
  }
  for (const item of items) {
    for (const field of ['title', 'threshold', 'verdict', 'action', 'source'])
      assert.ok(item[field].trim(), `${item.id}: ${field}`)
    if (item.url.startsWith('/'))
      assert.ok(['/personal-finance', '/income-ledger'].includes(item.url))
    else assert.equal(new URL(item.url).protocol, 'https:')
  }
})

test('merged wealth chapter keeps private sources and notes without duplicating the chapter', async () => {
  const { createJiti } = await import('jiti')
  const jiti = createJiti(import.meta.url, {
    alias: { '@': new URL('../src', import.meta.url).pathname },
  })
  const { integrateNotionWealthSection } = jiti('../src/utils/notion-library.ts')
  const fallback = integrateNotionWealthSection()
  assert.equal(fallback.length, 1)
  assert.equal(fallback[0].id, 'wealth')
  assert.deepEqual(fallback[0].sourceIds, [])
  const original = {
    ...fallback[0],
    summary: 'old summary',
    sourceIds: ['a'.repeat(32)],
    workProducts: [{ notes: 'keep private note' }],
  }
  const other = { ...fallback[0], id: 'other' }
  const merged = integrateNotionWealthSection([other, original])
  assert.equal(merged.length, 2)
  assert.deepEqual(merged[0].sourceIds, original.sourceIds)
  assert.equal(merged[0].workProducts[0].notes, 'keep private note')
  assert.deepEqual(integrateNotionWealthSection(merged), merged)
  assert.equal(original.summary, 'old summary')
})
