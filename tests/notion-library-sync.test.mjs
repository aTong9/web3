import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const { loadNotionLibrary, saveNotionLibrary } = jiti('../worker/notion-library-sync.ts')
const { default: worker } = jiti('../worker/index.ts')

const library = { version: 1, importedAt: '', coverage: '', entries: [] }
const rows = new Map()
const env = {
  ALLOWED_ORIGINS: '',
  DB: {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              const row = rows.get(args[0])
              return row ? { ...row } : null
            },
            async run() {
              if (sql.startsWith('INSERT')) {
                if (rows.has(args[0])) return { meta: { changes: 0 } }
                rows.set(args[0], { payload: args[1], revision: 1, updated_at: args[2] })
              } else {
                const row = rows.get(args[2])
                if (!row || row.revision !== args[3]) return { meta: { changes: 0 } }
                rows.set(args[2], {
                  payload: args[0],
                  revision: row.revision + 1,
                  updated_at: args[1],
                })
              }
              return { meta: { changes: 1 } }
            },
          }
        },
      }
    },
  },
}

test('Notion API rejects unauthenticated reads and writes', async () => {
  for (const method of ['GET', 'PUT']) {
    const response = await worker.fetch(
      new Request('https://api.test/api/notion-library', { method }),
      env,
    )
    assert.equal(response.status, 401)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  }
})

test('Notion sync validates data, isolates users and rejects stale revisions', async () => {
  rows.clear()
  assert.equal((await loadNotionLibrary(env, 'alice')).revision, 0)
  await assert.rejects(saveNotionLibrary(env, 'alice', null), { status: 400 })
  await assert.rejects(
    saveNotionLibrary(env, 'alice', { library: { ...library, version: 2 }, revision: 0 }),
    { status: 400 },
  )
  await assert.rejects(saveNotionLibrary(env, 'alice', { library, revision: -1 }), { status: 400 })
  const saved = await saveNotionLibrary(env, 'alice', { library, revision: 0 })
  assert.equal(saved.revision, 1)
  assert.deepEqual((await loadNotionLibrary(env, 'alice')).library, library)
  assert.equal((await loadNotionLibrary(env, 'bob')).library, null)
  await assert.rejects(saveNotionLibrary(env, 'alice', { library, revision: 0 }), { status: 409 })
  await assert.rejects(saveNotionLibrary(env, 'alice', { library, revision: 3 }), { status: 409 })
  assert.equal((await saveNotionLibrary(env, 'alice', { library, revision: 1 })).revision, 2)
  assert.equal((await saveNotionLibrary(env, 'bob', { library, revision: 0 })).revision, 1)
  assert.equal((await loadNotionLibrary(env, 'alice')).revision, 2)
})
