import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import { load } from 'js-yaml'

const workflowDirectory = new URL('../.github/workflows/', import.meta.url)
const packageManifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)

const readWorkflow = async (filename) =>
  load(await readFile(new URL(filename, workflowDirectory), 'utf8'))

test('CI lint command never mutates the checked-out source', () => {
  assert.equal(packageManifest.scripts['lint:check'], 'eslint . --cache')
  assert.doesNotMatch(packageManifest.scripts['lint:check'], /--fix/)
})

test('Pages deployment follows every automated data-update workflow', async () => {
  const filenames = (await readdir(workflowDirectory)).filter(
    (filename) => filename.startsWith('update-') && filename.endsWith('.yml'),
  )
  const updateWorkflowNames = await Promise.all(
    filenames.map(async (filename) => (await readWorkflow(filename)).name),
  )
  const deployWorkflow = await readWorkflow('deploy.yml')
  const deploymentTriggers = deployWorkflow.on?.workflow_run?.workflows ?? []
  const missing = updateWorkflowNames.filter((name) => !deploymentTriggers.includes(name))

  assert.deepEqual(missing, [])
})

test('Pages deployment runs tests and read-only lint before its production build', async () => {
  const workflow = await readWorkflow('deploy.yml')
  const commands = workflow.jobs?.build?.steps?.map((step) => step.run).filter(Boolean)

  assert.ok(commands.indexOf('npm run test:trading') < commands.indexOf('npm run build'))
  assert.ok(commands.indexOf('npm run lint:check') < commands.indexOf('npm run build'))
})

test('Electron packaging waits for tests, lint and a production build', async () => {
  const workflow = await readWorkflow('release-electron.yml')
  const verificationCommands = workflow.jobs?.verify?.steps?.map((step) => step.run).filter(Boolean)

  assert.equal(workflow.jobs?.build?.needs, 'verify')
  assert.deepEqual(verificationCommands, [
    'npm ci --ignore-scripts',
    'npm run test:trading',
    'npm run lint:check',
    'npm run build',
  ])
})
