import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Vite resolves these two asset URLs; keep the actual loader implementation in this test.
const source = (
  await readFile(new URL('../src/utils/asset-technical-data.ts', import.meta.url), 'utf8')
)
  .replace(
    /import baseDatasetUrl from .+/,
    "const baseDatasetUrl = 'https://fixture.test/base.json'",
  )
  .replace(
    /import usStockDatasetUrl from .+/,
    "const usStockDatasetUrl = 'https://fixture.test/stocks.json'",
  )
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const fixture = {
  updatedAt: '2026-09-19',
  source: 'fixture',
  sourceUrl: 'https://fixture.test',
  assets: [],
  limitations: [],
}

test('switching between technical and quant pages reuses downloads and parsed data', async (t) => {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    requests.push(url)
    return Response.json(fixture)
  })
  const loader = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#reuse`
  )
  await Promise.all([loader.loadAssetTechnicalDataset(), loader.loadUsStockTechnicalDataset()])
  await loader.loadAssetTechnicalDataset()
  assert.equal(
    requests.length,
    2,
    'page switches must not download and parse the same large JSON again',
  )
})

test('a failed download can be retried and snapshots expire after five minutes', async (t) => {
  let calls = 0
  let time = 1_000
  t.mock.method(Date, 'now', () => time)
  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1
    return calls === 1 ? new Response('', { status: 503 }) : Response.json(fixture)
  })
  const loader = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#retry`
  )
  await assert.rejects(loader.loadUsStockTechnicalDataset(), /503/)
  await loader.loadUsStockTechnicalDataset()
  await loader.loadUsStockTechnicalDataset()
  assert.equal(calls, 2)
  time += 5 * 60_000
  await loader.loadUsStockTechnicalDataset()
  assert.equal(calls, 3)
})
