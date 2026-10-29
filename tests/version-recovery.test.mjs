import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/version-recovery.ts', import.meta.url), 'utf8')
const load = async (dev, electron) => {
  const compiled = ts.transpileModule(
    source
      .replaceAll('import.meta.env.DEV', String(dev))
      .replaceAll('import.meta.env.VITE_APP_TARGET', JSON.stringify(electron ? 'electron' : 'web'))
      .replaceAll('sessionStorage', 'globalThis.__versionRecoveryStorage')
      .replaceAll('window.location.reload()', 'globalThis.__versionRecoveryReload()'),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
  ).outputText
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${dev}-${electron}`
  )
}

test('a stale asset reloads once per tab and only for missing module errors', async () => {
  const values = new Map()
  let reloads = 0
  globalThis.__versionRecoveryStorage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  }
  globalThis.__versionRecoveryReload = () => reloads++
  const recovery = await load(false, false)
  assert.equal(
    recovery.isMissingModuleError(new Error('Failed to fetch dynamically imported module')),
    true,
  )
  assert.equal(
    recovery.isMissingModuleError(new Error('Market dataset request failed: 503')),
    false,
  )
  assert.equal(recovery.recoverStaleVersionOnce(), true)
  assert.equal(recovery.recoverStaleVersionOnce(), false)
  assert.equal(reloads, 1)
})

test('unavailable session storage never creates a reload loop', async () => {
  let reloads = 0
  globalThis.__versionRecoveryStorage = {
    getItem: () => {
      throw new Error('blocked')
    },
  }
  globalThis.__versionRecoveryReload = () => reloads++
  const recovery = await load(false, false)
  assert.equal(recovery.recoverStaleVersionOnce(), false)
  assert.equal(reloads, 0)
})

test('development and Electron do not reload on a stale asset', async () => {
  let reloads = 0
  globalThis.__versionRecoveryStorage = { getItem: () => null, setItem: () => {} }
  globalThis.__versionRecoveryReload = () => reloads++
  assert.equal((await load(true, false)).recoverStaleVersionOnce(), false)
  assert.equal((await load(false, true)).recoverStaleVersionOnce(), false)
  assert.equal(reloads, 0)
})
