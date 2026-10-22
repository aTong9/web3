import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const run = (cwd, command, ...args) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_REF_NAME: 'main' },
  })
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

for (const conflict of [true, false])
  test(`rebases fund refresh with ${conflict ? 'conflicting' : 'mergeable'} projection changes`, () => {
    const temporary = mkdtempSync(join(tmpdir(), 'refresh-commit-'))
    try {
      const remote = join(temporary, 'remote.git')
      const seed = join(temporary, 'seed')
      const usClone = join(temporary, 'us')
      const aShareClone = join(temporary, 'a-share')
      mkdirSync(seed)
      run(temporary, 'git', 'init', '--bare', remote)
      run(seed, 'git', 'init', '-b', 'main')
      run(seed, 'git', 'config', 'user.name', 'test')
      run(seed, 'git', 'config', 'user.email', 'test@example.com')
      mkdirSync(join(seed, 'scripts/lib'), { recursive: true })
      mkdirSync(join(seed, 'src/data'), { recursive: true })
      for (const script of [
        'commit-refreshed-data.mjs',
        'update-technical-funds.mjs',
        'validate-market-dataset.mjs',
        'lib/write-json-atomic.mjs',
      ]) {
        cpSync(join(root, 'scripts', script), join(seed, 'scripts', script))
      }
      writeJson(join(seed, 'package.json'), { type: 'module' })
      const dates = Array.from({ length: 200 }, (_, index) =>
        new Date(Date.now() - (199 - index) * 86_400_000).toISOString().slice(0, 10),
      )
      const fund = (code, venue) => ({
        code,
        name: code,
        venue,
        scaleBillionCny: 1,
        priceHistory: dates.map((date) => ({ date, value: 1 })),
        navHistory: dates.map((date) => ({ date, value: 1 })),
      })
      const updatedAt = new Date().toISOString()
      writeJson(join(seed, 'src/data/us-funds.json'), {
        updatedAt,
        funds: Array.from({ length: 6 }, (_, i) =>
          fund(`US${i}`, i < 3 ? 'exchange' : 'offExchange'),
        ),
      })
      writeJson(join(seed, 'src/data/a-share-sectors.json'), {
        updatedAt,
        funds: Array.from({ length: 6 }, (_, i) => fund(`CN${i}`, 'exchange')),
      })
      run(seed, 'node', 'scripts/update-technical-funds.mjs')
      run(seed, 'git', 'add', '.')
      run(seed, 'git', 'commit', '-m', 'base')
      run(seed, 'git', 'remote', 'add', 'origin', remote)
      run(seed, 'git', 'push', '-u', 'origin', 'main')
      run(temporary, 'git', 'clone', '-b', 'main', remote, usClone)
      run(temporary, 'git', 'clone', '-b', 'main', remote, aShareClone)

      const aSharePath = join(aShareClone, 'src/data/a-share-sectors.json')
      const aShare = readJson(aSharePath)
      aShare.funds[0].name = 'new A-share'
      writeJson(aSharePath, aShare)
      const remoteProjectionPath = join(aShareClone, 'src/data/technical-funds.json')
      const remoteProjection = readJson(remoteProjectionPath)
      if (conflict) remoteProjection.methodology = 'remote change'
      else remoteProjection.assets[6].name = 'new A-share'
      writeJson(remoteProjectionPath, remoteProjection)
      run(aShareClone, 'git', 'config', 'user.name', 'test')
      run(aShareClone, 'git', 'config', 'user.email', 'test@example.com')
      run(aShareClone, 'git', 'add', '.')
      run(aShareClone, 'git', 'commit', '-m', 'new A-share snapshot')
      run(aShareClone, 'git', 'push')

      const usPath = join(usClone, 'src/data/us-funds.json')
      const us = readJson(usPath)
      us.funds[0].name = 'new US'
      writeJson(usPath, us)
      const localProjectionPath = join(usClone, 'src/data/technical-funds.json')
      const localProjection = readJson(localProjectionPath)
      if (conflict) localProjection.methodology = 'local change'
      else localProjection.assets[0].name = 'new US'
      writeJson(localProjectionPath, localProjection)
      run(
        usClone,
        'node',
        'scripts/commit-refreshed-data.mjs',
        'refresh US',
        'src/data/us-funds.json',
        'src/data/technical-funds.json',
      )
      run(usClone, 'git', 'fetch', 'origin', 'main')
      assert.equal(
        run(usClone, 'git', 'rev-parse', 'HEAD').trim(),
        run(usClone, 'git', 'rev-parse', 'origin/main').trim(),
      )
      assert.equal(
        readJson(join(usClone, 'src/data/a-share-sectors.json')).funds[0].name,
        'new A-share',
      )
      const projection = readJson(localProjectionPath)
      assert(projection.assets.some((asset) => asset.name === 'new A-share'))
      assert(projection.assets.some((asset) => asset.name === 'new US'))
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })
