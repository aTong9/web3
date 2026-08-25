import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { writeJsonAtomic, writeJsonBatchAtomic } from '../scripts/lib/write-json-atomic.mjs'

test('atomic JSON writer replaces the target with parseable complete content', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'web3-atomic-json-'))
  const outputPath = join(directory, 'dataset.json')
  try {
    await writeFile(outputPath, '{"version":1}\n')
    await writeJsonAtomic(outputPath, { version: 2, rows: [{ id: 'ok' }] })
    assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), {
      version: 2,
      rows: [{ id: 'ok' }],
    })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('serialization failure preserves the previous valid dataset', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'web3-atomic-json-'))
  const outputPath = join(directory, 'dataset.json')
  try {
    await writeFile(outputPath, '{"version":1}\n')
    const circular = {}
    circular.self = circular
    await assert.rejects(writeJsonAtomic(outputPath, circular))
    assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), { version: 1 })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('batch JSON writer commits all related datasets together', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'web3-atomic-json-'))
  const firstPath = join(directory, 'first.json')
  const secondPath = join(directory, 'second.json')
  try {
    await Promise.all([
      writeFile(firstPath, '{"version":1}\n'),
      writeFile(secondPath, '{"version":1}\n'),
    ])
    await writeJsonBatchAtomic([
      { outputPath: firstPath, value: { version: 2, dataset: 'first' } },
      { outputPath: secondPath, value: { version: 2, dataset: 'second' } },
    ])
    assert.equal(JSON.parse(await readFile(firstPath, 'utf8')).version, 2)
    assert.equal(JSON.parse(await readFile(secondPath, 'utf8')).version, 2)
    assert.deepEqual((await readdir(directory)).toSorted(), ['first.json', 'second.json'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('batch JSON writer restores every old dataset when a commit rename fails', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'web3-atomic-json-'))
  const firstPath = join(directory, 'first.json')
  const secondPath = join(directory, 'second.json')
  try {
    await Promise.all([
      writeFile(firstPath, '{"version":1,"dataset":"first"}\n'),
      writeFile(secondPath, '{"version":1,"dataset":"second"}\n'),
    ])
    let renameCount = 0
    const failFourthRename = async (from, to) => {
      renameCount += 1
      if (renameCount === 4) throw new Error('simulated second commit failure')
      await rename(from, to)
    }
    await assert.rejects(
      writeJsonBatchAtomic(
        [
          { outputPath: firstPath, value: { version: 2, dataset: 'first' } },
          { outputPath: secondPath, value: { version: 2, dataset: 'second' } },
        ],
        { renameFile: failFourthRename },
      ),
      /simulated second commit failure/,
    )
    assert.equal(JSON.parse(await readFile(firstPath, 'utf8')).version, 1)
    assert.equal(JSON.parse(await readFile(secondPath, 'utf8')).version, 1)
    assert.deepEqual((await readdir(directory)).toSorted(), ['first.json', 'second.json'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
