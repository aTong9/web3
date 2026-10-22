import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const [message, ...files] = process.argv.slice(2)
const branch = process.env.GITHUB_REF_NAME
if (!message || !files.length || !branch || !/^[\w./-]+$/.test(branch)) {
  throw new Error('Expected a commit message, data files, and GITHUB_REF_NAME')
}
if (files.some((file) => !/^src\/data\/[\w.-]+\.json$/.test(file))) {
  throw new Error('Only src/data JSON files may be committed')
}

function git(...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`)
  }
  return result.stdout.trim()
}

function run(command, ...args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`)
}

git('config', 'user.name', 'github-actions[bot]')
git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
if (git('diff', '--cached', '--name-only')) {
  throw new Error('Refusing to commit pre-staged files')
}
git('add', '--', ...files)
if (!git('diff', '--cached', '--name-only')) {
  process.stdout.write('No refreshed data changes\n')
  process.exit(0)
}
git('commit', '-m', message)

for (let attempt = 1; attempt <= 5; attempt++) {
  git('fetch', 'origin', branch)
  const upstream = git('rev-parse', 'FETCH_HEAD')
  try {
    git('rebase', upstream)
  } catch (error) {
    const conflicts = git('diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean)
    if (
      conflicts.length !== 1 ||
      conflicts[0] !== 'src/data/technical-funds.json' ||
      !files.includes('src/data/technical-funds.json')
    ) {
      git('rebase', '--abort')
      throw error
    }
    try {
      run('node', 'scripts/update-technical-funds.mjs')
      git('add', '--', 'src/data/technical-funds.json')
      const continued = spawnSync('git', ['-c', 'core.editor=true', 'rebase', '--continue'], {
        cwd: root,
        encoding: 'utf8',
      })
      if (continued.status !== 0) {
        throw new Error(`git rebase --continue failed: ${continued.stderr || continued.stdout}`)
      }
    } catch (recoveryError) {
      git('rebase', '--abort')
      throw recoveryError
    }
  }
  if (files.includes('src/data/technical-funds.json')) {
    run('node', 'scripts/update-technical-funds.mjs')
    const market = files.includes('src/data/us-funds.json') ? 'us-related' : 'a-share'
    run(
      'node',
      'scripts/validate-market-dataset.mjs',
      'technical-funds',
      'src/data/technical-funds.json',
      '--market',
      market,
    )
    if (git('diff', '--name-only', '--', 'src/data/technical-funds.json')) {
      git('add', '--', 'src/data/technical-funds.json')
      if (git('rev-parse', 'HEAD') === upstream) git('commit', '-m', message)
      else git('commit', '--amend', '--no-edit')
    }
  }
  const pushed = spawnSync('git', ['push', 'origin', `HEAD:refs/heads/${branch}`], {
    cwd: root,
    encoding: 'utf8',
  })
  if (pushed.status === 0) {
    process.stdout.write(`Published refreshed data on attempt ${attempt}\n`)
    process.exit(0)
  }
  if (attempt === 5) throw new Error(`git push failed after 5 attempts: ${pushed.stderr}`)
}
