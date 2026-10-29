import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = (
  await readFile(new URL('../src/utils/market-dataset-loading.ts', import.meta.url), 'utf8')
)
  .replace(
    /import aShareDatasetUrl from .+/,
    "const aShareDatasetUrl = 'https://fixture.test/a-share.json'",
  )
  .replace(
    /import usFundDatasetUrl from .+/,
    "const usFundDatasetUrl = 'https://fixture.test/funds.json'",
  )
  .replace(
    /import \{ recoverStaleVersionOnce \} from .+/,
    'const recoverStaleVersionOnce = () => { globalThis.__marketRecoveryCalls = (globalThis.__marketRecoveryCalls ?? 0) + 1 }',
  )
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const loader = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)
const sectors = {
  updatedAt: '2026-10-23',
  tradingDate: '2026-10-23',
  marketStatus: 'closed',
  source: 'fixture',
  periods: { day: '2026-10-23' },
  sectors: [
    {
      name: '证券',
      kind: 'industry',
      representativeFundCode: '512880',
      fundCount: 1,
      returns: { day: 1 },
    },
  ],
  funds: [
    {
      code: '512880',
      name: 'ETF',
      sector: '证券',
      returns: { day: 1 },
      priceHistory: [],
      navHistory: [],
    },
  ],
}
const funds = {
  updatedAt: '2026-10-23',
  source: 'fixture',
  funds: [
    {
      code: '513100',
      name: 'ETF',
      venue: 'exchange',
      index: 'Nasdaq',
      priceHistory: [],
      navHistory: [],
      investmentLimitHistory: [],
    },
  ],
}

test('A-share request retries after an actual failed download and preserves valid ranking data', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return calls === 1 ? new Response('', { status: 503 }) : Response.json(sectors)
  })
  await assert.rejects(loader.loadAShareSectorDataset(), /503/)
  assert.deepEqual(await loader.loadAShareSectorDataset(), sectors)
  assert.equal(calls, 2)
})

test('HTML fallback and empty market datasets are rejected', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return calls === 1
      ? new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } })
      : Response.json({ ...funds, funds: [] })
  })
  await assert.rejects(loader.loadUsFundDataset(), /content type/i)
  await assert.rejects(loader.loadUsFundDataset(), /invalid/i)
  assert.equal(calls, 2)
})

test('a removed versioned JSON causes one recovery attempt and still allows a new request', async (t) => {
  let calls = 0
  globalThis.__marketRecoveryCalls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return calls === 1 ? new Response('', { status: 404 }) : Response.json(sectors)
  })
  await assert.rejects(loader.loadAShareSectorDataset(), /404/)
  assert.equal(globalThis.__marketRecoveryCalls, 1)
  assert.deepEqual(await loader.loadAShareSectorDataset(), sectors)
  assert.equal(calls, 2)
})

test('the shipped A-share and US fund snapshots pass the page loaders', async (t) => {
  const aShare = JSON.parse(
    await readFile(new URL('../src/data/a-share-sectors.json', import.meta.url)),
  )
  const usFunds = JSON.parse(await readFile(new URL('../src/data/us-funds.json', import.meta.url)))
  t.mock.method(globalThis, 'fetch', async (url) =>
    Response.json(url.includes('a-share') ? aShare : usFunds),
  )
  assert.equal((await loader.loadAShareSectorDataset()).sectors.length, aShare.sectors.length)
  assert.equal((await loader.loadUsFundDataset()).funds.length, usFunds.funds.length)
})
