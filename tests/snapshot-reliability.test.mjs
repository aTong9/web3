import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { createJiti } from 'jiti'

const run = promisify(execFile)
const repo = fileURLToPath(new URL('../', import.meta.url))
const sandbox = async (t, scripts) => {
  const root = await mkdtemp(join(tmpdir(), 'snapshot-reliability-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'scripts/lib'), { recursive: true })
  await mkdir(join(root, 'src/data'), { recursive: true })
  for (const name of [...scripts, 'lib/write-json-atomic.mjs', 'lib/news-translator.mjs']) {
    await copyFile(join(repo, 'scripts', name), join(root, 'scripts', name))
  }
  return root
}

test('missing earnings remain unknown, while actual zero EPS remains valid', async (t) => {
  const { fetchEarnings } = await import('../scripts/update-us-megacaps.mjs')
  let data = {}
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data }))
  const missing = await fetchEarnings('TEST')
  assert.equal(missing.lastActualEps, null)
  assert.equal(missing.nextConsensusEps, null)
  assert.equal(missing.lastSurprisePct, null)
  assert.equal(missing.lastResultReliable, false)
  data = {
    earningsSurpriseTable: {
      rows: [
        { eps: '0', consensusForecast: '0', percentageSurprise: '0', dateReported: '2026-10-21' },
      ],
    },
  }
  const zero = await fetchEarnings('TEST')
  assert.equal(zero.lastActualEps, 0)
  assert.equal(zero.lastSurprisePct, 0)
  assert.equal(zero.lastResultReliable, true)
})

test('research projection retains stale state and date from mega-cap fallback', async (t) => {
  const root = await sandbox(t, [])
  const fixture = JSON.parse(await readFile(join(repo, 'src/data/us-megacaps.json'), 'utf8'))
  fixture.status = 'stale'
  fixture.updatedAt = '2026-09-01T00:00:00Z'
  const path = join(root, 'src/data/us-megacaps.json')
  await writeFile(path, JSON.stringify(fixture))
  const jiti = createJiti(import.meta.url, {
    moduleCache: false,
    alias: {
      '@/data/us-megacaps.json': path,
      '@': resolve(repo, 'src'),
    },
  })
  const { researchAssets } = jiti(join(repo, 'src/utils/research-assets.ts'))
  for (const stock of fixture.stocks) {
    const row = researchAssets.find((item) => item.id === `us-${stock.symbol.toLowerCase()}`)
    assert.equal(row.stale, true)
    assert.equal(row.date, '2026-09-01')
  }
})

test('unchanged news still records the latest source failure and successful poll time', async (t) => {
  const root = await sandbox(t, ['update-market-news.mjs'])
  const hook = join(root, 'mock.mjs')
  await writeFile(
    hook,
    `
const published = new Date().toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\\.\\d+Z$/, 'Z')
globalThis.fetch = async (url) => {
  if (process.env.AUDIT_FAIL_ALL === '1') return new Response('unavailable', { status: 503 })
  if (url.includes('gdeltproject')) return Response.json({ articles: Array.from({ length: 12 }, (_, i) => ({ title: '经济数据更新' + i, url: 'https://example.org/' + i, seendate: published, domain: 'example.org' })) })
  if (process.env.AUDIT_FAIL_FEED === '1' && url.includes('federalreserve')) return new Response('unavailable', { status: 503 })
  return new Response('<rss></rss>')
}
`,
  )
  const script = join(root, 'scripts/update-market-news.mjs')
  const path = join(root, 'src/data/market-news.json')
  await run(process.execPath, ['--import', hook, script])
  const first = JSON.parse(await readFile(path, 'utf8'))
  assert.equal(first.articles.length, 12)
  await run(process.execPath, ['--import', hook, script], {
    env: { ...process.env, AUDIT_FAIL_FEED: '1' },
  })
  const second = JSON.parse(await readFile(path, 'utf8'))
  assert.deepEqual(
    second.articles.map((a) => a.id),
    first.articles.map((a) => a.id),
  )
  assert.ok(Date.parse(second.updatedAt) > Date.parse(first.updatedAt))
  assert.equal(second.sourceStatus.find((s) => s.source === '美联储').status, 'failed')
  await assert.rejects(
    run(process.execPath, ['--import', hook, script], {
      env: { ...process.env, AUDIT_FAIL_ALL: '1' },
    }),
  )
  assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), second)
})

test('mixed fund projection retains the oldest source time and source stale flags', async (t) => {
  const root = await sandbox(t, ['update-technical-funds.mjs'])
  const fund = (i, venue) => ({
    code: String(500000 + i),
    name: 'Fixture',
    venue,
    priceHistory: [
      { date: '2026-10-01', value: 1 },
      { date: '2026-10-02', value: 2 },
    ],
  })
  const us = {
    updatedAt: '2026-10-22T01:15:00Z',
    funds: Array.from({ length: 6 }, (_, i) => fund(i, i < 3 ? 'exchange' : 'offExchange')),
  }
  const aShare = {
    updatedAt: '2026-10-18T10:30:00Z',
    funds: Array.from({ length: 6 }, (_, i) => fund(i + 10, 'exchange')),
  }
  await writeFile(join(root, 'src/data/us-funds.json'), JSON.stringify(us))
  await writeFile(join(root, 'src/data/a-share-sectors.json'), JSON.stringify(aShare))
  await run(process.execPath, [join(root, 'scripts/update-technical-funds.mjs')])
  const result = JSON.parse(await readFile(join(root, 'src/data/technical-funds.json'), 'utf8'))
  assert.equal(result.dataUpdatedAt, aShare.updatedAt)
  assert.equal(result.assets.length, 12)
  const jiti = createJiti(import.meta.url)
  const { dataHealthDefinitions, inspectDataHealth, dataHealthStatus } = jiti(
    join(repo, 'src/utils/data-health.ts'),
  )
  const inspected = inspectDataHealth(
    dataHealthDefinitions.find((d) => d.id === 'technical-funds'),
    result,
  )
  assert.equal(inspected.updatedAt, aShare.updatedAt)
  assert.notEqual(dataHealthStatus(inspected, new Date(us.updatedAt)), 'current')
  aShare.status = 'stale'
  await writeFile(join(root, 'src/data/a-share-sectors.json'), JSON.stringify(aShare))
  await run(process.execPath, [join(root, 'scripts/update-technical-funds.mjs')])
  const stale = JSON.parse(await readFile(join(root, 'src/data/technical-funds.json'), 'utf8'))
  assert.ok(stale.assets.filter((a) => a.fundMetrics.market === 'a-share').every((a) => a.stale))
  aShare.updatedAt = 'invalid'
  await writeFile(join(root, 'src/data/a-share-sectors.json'), JSON.stringify(aShare))
  await run(process.execPath, [join(root, 'scripts/update-technical-funds.mjs')])
  const invalid = JSON.parse(await readFile(join(root, 'src/data/technical-funds.json'), 'utf8'))
  assert.equal(invalid.dataUpdatedAt, null)
  assert.equal(
    dataHealthStatus(
      inspectDataHealth(
        dataHealthDefinitions.find((d) => d.id === 'technical-funds'),
        invalid,
      ),
    ),
    'unavailable',
  )
})
