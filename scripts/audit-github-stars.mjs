import fs from 'node:fs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { load } from 'js-yaml'

// Read-only GitHub audit; unknown or inaccessible repositories are never deletion candidates.
const source = fs.readFileSync('src/data/webstack.yml', 'utf8')
const entries = load(source).flatMap(c => (c.list ?? []).flatMap(g =>
  (g.links ?? []).filter(l => /^https:\/\/github\.com\//i.test(l.url))
    .map(l => ({ category: g.term, ...l }))))
const results = []
for (let offset = 0; offset < entries.length; offset += 40) {
  const batch = entries.slice(offset, offset + 40)
  const query = '{' + batch.map((entry, i) => {
    const [owner, name] = new URL(entry.url).pathname.split('/').filter(Boolean)
    return `r${i}:repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name?.replace(/\.git$/, '') ?? '')}){nameWithOwner stargazerCount url}`
  }).join('\n') + '}'
  let response
  try {
    response = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
  } catch (error) {
    try { response = JSON.parse(String(error.stdout)) } catch { response = {} }
  }
  batch.forEach((entry, i) => {
    const repo = response.data?.[`r${i}`]
    results.push({ ...entry, checkedAt: new Date().toISOString(), repository: repo?.nameWithOwner ?? null,
      stars: repo?.stargazerCount ?? null, status: repo ? 'verified' : 'unverified' })
  })
  console.log(`Checked ${results.length}/${entries.length}`)
}
const report = { threshold: 100, entries: results }
assert.equal(results.length, entries.length)
assert.ok(results.every(r => r.stars === null || (Number.isInteger(r.stars) && r.stars >= 0)))
fs.writeFileSync('docs/research/github-stars-audit-2026-09-04.json', JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ total: results.length, remove: results.filter(r => r.stars !== null && r.stars < 100).length,
  unverified: results.filter(r => r.stars === null).length }))
