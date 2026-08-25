import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

test('production data contains no placeholder URLs presented as research evidence', () => {
  const files = readdirSync('src/data', { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => `src/data/${entry.name}`)
  const placeholderUrls = files.flatMap((file) => {
    const content = readFileSync(file, 'utf8')
    return [...content.matchAll(/https?:\/\/[^\s"']*(?:example\.(?:com|org)|\/example\d*)[^\s"']*/gi)].map(
      (match) => `${file}: ${match[0]}`,
    )
  })

  assert.deepEqual(placeholderUrls, [])
})
