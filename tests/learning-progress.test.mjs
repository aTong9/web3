import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { load } from 'js-yaml'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url)
const { learningPaths } = jiti('../src/data/learning-paths.ts')
const { emptyLearningProgress, parseLearningProgress } = jiti('../src/utils/learning-progress.ts')

test('learning routes reuse catalog resources and preserve unique stable step IDs', () => {
  const catalog = load(readFileSync('src/data/webstack.yml', 'utf8'))
  const urls = new Set(
    catalog.flatMap((group) => group.list.flatMap((term) => term.links.map((link) => link.url))),
  )
  const stepIds = learningPaths.flatMap((path) => path.steps.map((step) => step.id))
  assert.equal(new Set(stepIds).size, stepIds.length)
  assert.equal(new Set(learningPaths.map((path) => path.id)).size, learningPaths.length)
  for (const path of learningPaths) {
    assert.ok(path.destination.startsWith('/') && path.steps.length >= 3)
    for (const step of path.steps) {
      assert.ok(step.title && step.titleEn && step.task && step.taskEn)
      for (const resource of step.resources) assert.ok(urls.has(resource.url), resource.url)
    }
  }
})

test('learning backups validate all fields and keep unknown historical steps without data loss', () => {
  assert.deepEqual(
    parseLearningProgress(JSON.stringify(emptyLearningProgress())),
    emptyLearningProgress(),
  )
  const entry = {
    stepId: 'old-step',
    completed: false,
    note: 'Keep my draft',
    updatedAt: '2026-09-26T01:00:00.000Z',
  }
  const backup = { version: 1, entries: [entry] }
  assert.deepEqual(parseLearningProgress(JSON.stringify(backup)), backup)
  for (const invalid of [
    { ...entry, completed: 1 },
    { ...entry, stepId: '__proto__' },
    { ...entry, updatedAt: '2026-02-30' },
    { ...entry, note: 'x'.repeat(4001) },
  ])
    assert.throws(() => parseLearningProgress(JSON.stringify({ ...backup, entries: [invalid] })))
  assert.throws(() => parseLearningProgress(JSON.stringify({ ...backup, entries: [entry, entry] })))
  assert.throws(() => parseLearningProgress(JSON.stringify({ ...backup, unexpected: true })))
})
