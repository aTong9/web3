import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
})
const {
  emptyResearchWorkspace,
  parseResearchWorkspace,
  mergeResearchWorkspaces,
  isResearchNoteDue,
} = jiti('../src/utils/research-workspace.ts')
const { useResearchWorkspace } = jiti('../src/composables/use-research-workspace.ts')

const createdAt = '2026-09-26T00:00:00.000Z'
const makeWatch = (overrides = {}) => ({
  id: 'watch-1',
  assetId: 'asset-1',
  group: '长期观察',
  reason: '财报待核查',
  createdAt,
  updatedAt: createdAt,
  ...overrides,
})
const makeNote = (overrides = {}) => ({
  id: 'note-1',
  assetId: 'asset-1',
  title: '研究观点',
  thesis: '等待数据验证',
  invalidation: '下一期财报证伪',
  reviewDate: '2026-09-27',
  conclusion: '',
  sources: ['https://example.com/report'],
  status: 'active',
  paperTradeId: null,
  createdAt,
  updatedAt: createdAt,
  ...overrides,
})
const makeWorkspace = (overrides = {}) => ({
  version: 1,
  watchlist: [makeWatch()],
  notes: [makeNote()],
  ...overrides,
})
const parse = (data) => parseResearchWorkspace(JSON.stringify(data))

test('workspace round-trips and preserves unknown assets and paper trade references', () => {
  const data = makeWorkspace({
    watchlist: [makeWatch({ assetId: 'no-longer-listed' })],
    notes: [makeNote({ assetId: 'custom-asset', paperTradeId: 'archived-paper-trade' })],
  })
  assert.deepEqual(parse(data), data)
  assert.deepEqual(parse(emptyResearchWorkspace()), { version: 1, watchlist: [], notes: [] })
  const fresh = emptyResearchWorkspace()
  fresh.notes.push(makeNote())
  assert.equal(emptyResearchWorkspace().notes.length, 0)
})

test('parser rejects invalid shapes, types, unsupported versions and oversized fields', () => {
  assert.throws(() => parseResearchWorkspace('{broken'), SyntaxError)
  for (const data of [
    null,
    [],
    {},
    { ...makeWorkspace(), version: 2 },
    { ...makeWorkspace(), unexpected: true },
    makeWorkspace({ notes: {} }),
    makeWorkspace({ watchlist: [null] }),
    makeWorkspace({ notes: [makeNote({ title: '' })] }),
    makeWorkspace({ notes: [makeNote({ title: 'a'.repeat(161) })] }),
    makeWorkspace({ notes: [makeNote({ thesis: 'a'.repeat(10001) })] }),
    makeWorkspace({ watchlist: [makeWatch({ group: 'a'.repeat(61) })] }),
    makeWorkspace({ notes: [makeNote({ status: ['active'] })] }),
    makeWorkspace({ notes: [makeNote({ paperTradeId: 5 })] }),
    makeWorkspace({ notes: [makeNote({ createdAt: 'yesterday' })] }),
    makeWorkspace({ notes: [makeNote({ updatedAt: '2026-02-30T00:00:00.000Z' })] }),
    makeWorkspace({ notes: [makeNote({ updatedAt: '2026-09-26T24:00:00.000Z' })] }),
  ])
    assert.throws(() => parse(data))
})

test('sources allow only absolute HTTP(S) URLs and reject the entire invalid import', () => {
  for (const source of [
    'javascript:alert(1)',
    'data:text/html,<script>',
    'file:///tmp/x',
    'https:example.com',
    '/relative',
    'bad url',
    null,
  ]) {
    assert.throws(() => parse(makeWorkspace({ notes: [makeNote({ sources: [source] })] })))
  }
  assert.throws(() =>
    parse(makeWorkspace({ notes: [makeNote({ sources: Array(21).fill('https://example.com') })] })),
  )
  assert.deepEqual(
    parse(
      makeWorkspace({
        notes: [makeNote({ sources: ['http://example.org', 'https://example.com'] })],
      }),
    ).notes[0].sources,
    ['http://example.org', 'https://example.com'],
  )
})

test('duplicate watch assets, watch IDs or note IDs are rejected without dropping user records', () => {
  assert.throws(
    () => parse(makeWorkspace({ watchlist: [makeWatch(), makeWatch({ assetId: 'asset-2' })] })),
    /重复/,
  )
  assert.throws(
    () => parse(makeWorkspace({ watchlist: [makeWatch(), makeWatch({ id: 'watch-2' })] })),
    /重复/,
  )
  assert.throws(
    () => parse(makeWorkspace({ notes: [makeNote(), makeNote({ title: 'different content' })] })),
    /重复/,
  )
  assert.equal(
    parse(makeWorkspace({ notes: [makeNote(), makeNote({ id: 'note-2' })] })).notes.length,
    2,
  )
})

test('research catalog has unique IDs, real technical charts and same-instrument quote mappings', () => {
  const { researchAssets } = jiti('../src/utils/research-assets.ts')
  const technicalIds = new Set(
    ['asset-technical-signals', 'us-stock-technical-signals'].flatMap((name) => {
      const snapshot = JSON.parse(
        readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'),
      )
      return snapshot.assets.map((asset) => asset.id)
    }),
  )
  assert.ok(researchAssets.length > 0)
  assert.equal(new Set(researchAssets.map((asset) => asset.id)).size, researchAssets.length)
  for (const asset of researchAssets) {
    if (asset.technicalId !== null) assert.ok(technicalIds.has(asset.technicalId), asset.id)
  }
  for (const id of ['gold', 'usd', 'wti', 'euro50']) {
    assert.equal(researchAssets.find((asset) => asset.id === id)?.quoteSymbol, null, id)
  }
  for (const [id, symbol] of Object.entries({
    sp500: '^GSPC',
    nasdaq: '^IXIC',
    nikkei: '^N225',
    shanghai: '000001.SS',
    hangseng: '^HSI',
    vix: '^VIX',
    btc: 'BTC-USD',
    eth: 'ETH-USD',
  })) {
    assert.equal(researchAssets.find((asset) => asset.id === id)?.quoteSymbol, symbol, id)
  }
  assert.equal(researchAssets.find((asset) => asset.symbol === 'BRK/A')?.quoteSymbol, 'BRK-A')
})

test('review dates are real local calendar dates and only active notes can become due', () => {
  for (const reviewDate of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-09-00',
    '2026-9-2',
    '0000-01-01',
  ]) {
    assert.throws(() => parse(makeWorkspace({ notes: [makeNote({ reviewDate })] })))
  }
  assert.equal(
    parse(makeWorkspace({ notes: [makeNote({ reviewDate: '2028-02-29' })] })).notes[0].reviewDate,
    '2028-02-29',
  )
  assert.equal(isResearchNoteDue(makeNote(), '2026-09-26'), false)
  assert.equal(isResearchNoteDue(makeNote(), '2026-09-27'), true)
  assert.equal(isResearchNoteDue(makeNote(), '2026-09-28'), true)
  assert.equal(isResearchNoteDue(makeNote({ reviewDate: '' }), '2026-09-28'), false)
  assert.equal(isResearchNoteDue(makeNote({ status: 'reviewed' }), '2026-09-28'), false)
  assert.equal(isResearchNoteDue(makeNote({ status: 'invalidated' }), '2026-09-28'), false)
  assert.equal(isResearchNoteDue(makeNote(), '2026-09-27T00:00:00.000Z'), false)
})

test('merge preserves both sets, picks newer records, compares instants and is deterministic', () => {
  const current = makeWorkspace()
  const incoming = makeWorkspace({
    watchlist: [
      makeWatch({ id: 'other-id', reason: '更新理由', updatedAt: '2026-09-26T10:00:00+08:00' }),
      makeWatch({ id: 'watch-2', assetId: 'unknown-asset' }),
    ],
    notes: [
      makeNote({ title: '更新观点', updatedAt: '2026-09-26T01:00:00.000Z' }),
      makeNote({ id: 'note-2' }),
    ],
  })
  const before = JSON.stringify({ current, incoming })
  const merged = mergeResearchWorkspaces(current, incoming)
  assert.equal(merged.watchlist.length, 2)
  assert.equal(merged.notes.length, 2)
  assert.equal(merged.watchlist.find((entry) => entry.assetId === 'asset-1').reason, '更新理由')
  assert.equal(merged.notes.find((note) => note.id === 'note-1').title, '更新观点')
  assert.deepEqual(merged, mergeResearchWorkspaces(incoming, current))
  assert.equal(JSON.stringify({ current, incoming }), before)
  merged.notes[0].sources.push('https://another.example')
  assert.equal(JSON.stringify({ current, incoming }), before)
  const tied = makeWorkspace({ notes: [makeNote({ title: '另一观点' })] })
  assert.deepEqual(mergeResearchWorkspaces(current, tied), mergeResearchWorkspaces(tied, current))
  assert.throws(() =>
    mergeResearchWorkspaces(
      current,
      makeWorkspace({ notes: [makeNote({ sources: ['javascript:alert(1)'] })] }),
    ),
  )
})

test('persistence keeps saved state on failures, protects unreadable data and detects stale tabs', () => {
  const originalWindow = globalThis.window
  let raw = null
  let denyRead = false
  let denyWrite = false
  globalThis.window = {
    localStorage: {
      getItem: () => {
        if (denyRead) throw new Error('denied')
        return raw
      },
      setItem: (_key, value) => {
        if (denyWrite) throw new Error('quota exceeded')
        raw = value
      },
    },
  }
  try {
    const first = useResearchWorkspace()
    assert.deepEqual(first.workspace.value, emptyResearchWorkspace())
    assert.equal(first.commit(makeWorkspace()), true)
    const saved = raw
    const second = useResearchWorkspace()
    denyWrite = true
    assert.equal(first.commit(emptyResearchWorkspace()), false)
    assert.equal(first.storageError.value, 'save')
    assert.equal(raw, saved)
    assert.deepEqual(first.workspace.value, makeWorkspace())
    denyWrite = false
    assert.equal(first.commit(makeWorkspace({ notes: [] })), true)
    const newer = raw
    assert.equal(second.commit(emptyResearchWorkspace()), false)
    assert.equal(second.storageError.value, 'conflict')
    assert.equal(raw, newer)
    second.reload()
    assert.equal(second.storageError.value, null)
    assert.equal(second.workspace.value.notes.length, 0)
    assert.equal(
      second.commit(makeWorkspace({ notes: [makeNote({ sources: ['javascript:alert(1)'] })] })),
      false,
    )
    assert.equal(second.storageError.value, 'save')
    assert.equal(raw, newer)
    raw = '{broken'
    const broken = useResearchWorkspace()
    assert.equal(broken.storageError.value, 'load')
    assert.equal(broken.commit(emptyResearchWorkspace()), false)
    assert.equal(raw, '{broken')
    raw = saved
    broken.reload()
    assert.equal(broken.storageError.value, null)
    assert.deepEqual(broken.workspace.value, makeWorkspace())
    denyRead = true
    broken.reload()
    assert.equal(broken.storageError.value, 'load')
    assert.deepEqual(broken.workspace.value, makeWorkspace())
    assert.equal(broken.commit(emptyResearchWorkspace()), false)
    assert.equal(raw, saved)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
})
