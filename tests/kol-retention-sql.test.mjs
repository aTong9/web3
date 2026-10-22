import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

const python = String.raw`
import json
import sqlite3
import sys

schema, retention_sql = json.load(sys.stdin)
original_sql = '''DELETE FROM kol_items WHERE owner_user_id=? AND subscription_id=? AND id NOT IN
  (SELECT id FROM kol_items WHERE owner_user_id=? AND subscription_id=?
   ORDER BY COALESCE(published_at,created_at) DESC LIMIT 100)'''

def retained(size, all_tied, sql, params):
    db = sqlite3.connect(':memory:')
    db.executescript(schema)
    rows = []
    for i in range(size):
        created = '2026-10-01T00:00:00Z' if all_tied else f'2026-10-{i % 5 + 1:02}T00:00:00Z'
        published = None if i % 3 == 0 else created
        rows.append(('owner-a', 'feed-a', f'item-{i}', f'title-{i}', '',
                     f'https://example.com/{i}', published, None, '[]', created))
    for owner, feed in [('owner-a', 'feed-b'), ('owner-b', 'feed-a')]:
        for i in range(5):
            rows.append((owner, feed, f'{owner}-{feed}-{i}', 'other', '',
                         f'https://example.com/{owner}/{feed}/{i}', None, None, '[]',
                         '2026-10-01T00:00:00Z'))
    db.executemany('INSERT INTO kol_items VALUES (?,?,?,?,?,?,?,?,?,?)', rows)
    db.execute(sql, params)
    result = db.execute('SELECT owner_user_id, subscription_id, id FROM kol_items ORDER BY 1,2,3').fetchall()
    db.close()
    return result

for size in (0, 1, 99, 100, 101, 150):
    for all_tied in (False, True):
        before = retained(size, all_tied, original_sql,
                          ('owner-a', 'feed-a', 'owner-a', 'feed-a'))
        after = retained(size, all_tied, retention_sql, ('owner-a', 'feed-a'))
        assert after == before, (size, all_tied)
        assert len([row for row in after if row[:2] == ('owner-a', 'feed-a')]) == min(size, 100)
        assert len([row for row in after if row[:2] != ('owner-a', 'feed-a')]) == 10
`

test('KOL retention SQL keeps the same 100 items and isolates owners', async () => {
  const [source, schema] = await Promise.all([
    readFile(new URL('../worker/kols.ts', import.meta.url), 'utf8'),
    readFile(new URL('../worker/kols-schema.sql', import.meta.url), 'utf8'),
  ])
  const retentionSql = source.match(/`(DELETE FROM kol_items WHERE rowid IN[\s\S]*?)`/)?.[1]
  assert.ok(retentionSql, 'retention SQL must be present in the Worker')
  const result = spawnSync('python3', ['-c', python], {
    input: JSON.stringify([schema, retentionSql]),
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
})

test('KOL existing-item lookup matches ID or URL only within the subscription owner', async () => {
  const [source, schema] = await Promise.all([
    readFile(new URL('../worker/kols.ts', import.meta.url), 'utf8'),
    readFile(new URL('../worker/kols-schema.sql', import.meta.url), 'utf8'),
  ])
  const sql = source.match(/`(SELECT id,url FROM kol_items[\s\S]*?)`/)?.[1]
  assert.ok(sql)
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(schema)
    const insertSubscription = db.prepare(
      `INSERT INTO kol_subscriptions (owner_user_id,id,name,url,feed_url,platform)
       VALUES (?,?,?,?,?,?)`,
    )
    const insertItem = db.prepare(
      `INSERT INTO kol_items (owner_user_id,subscription_id,id,title,url,created_at)
       VALUES (?,?,?,?,?,?)`,
    )
    for (const [owner, id] of [
      ['owner-a', 'feed-a'],
      ['owner-a', 'feed-b'],
      ['owner-b', 'feed-a'],
    ]) {
      insertSubscription.run(
        owner,
        id,
        id,
        `https://${owner}.test/${id}`,
        `https://${owner}.test/${id}.rss`,
        'rss',
      )
      insertItem.run(owner, id, 'same-id', 'post', `https://${owner}.test/${id}/post`, '2026-10-22')
    }
    const args = [
      'owner-a',
      'feed-a',
      ...Array(12).fill('same-id'),
      ...Array(12).fill('https://other.test'),
    ]
    const expandedSql = sql.replaceAll("${items.map(() => '?').join(',')}", Array(12).fill('?').join(','))
    assert.deepEqual(
      db
        .prepare(expandedSql)
        .all(...args)
        .map(({ id, url }) => ({ id, url })),
      [{ id: 'same-id', url: 'https://owner-a.test/feed-a/post' }],
    )
  } finally {
    db.close()
  }
})
