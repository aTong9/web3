import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { load } from 'js-yaml'

const args = process.argv.slice(2)
const owner = args[args.indexOf('--owner') + 1]
const output = args[args.indexOf('--output') + 1]
if (
  !/^[0-9a-f-]{36}$/i.test(owner ?? '') ||
  !output ||
  !args.includes('--owner') ||
  !args.includes('--output')
)
  throw new Error(
    '用法: node scripts/seed-kols-d1.mjs --owner <用户UUID> --output /tmp/kols-seed.sql',
  )

const quote = (value) => (value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`)
const config = load(await readFile('src/data/kols.yml', 'utf8')).filter(
  (item) => item.enabled !== false,
)
const snapshot = JSON.parse(await readFile('src/data/kol-monitor.json', 'utf8'))
if (
  config.length !== snapshot.kols.length ||
  new Set(config.map((item) => item.id)).size !== config.length
)
  throw new Error('配置与快照不一致或订阅 ID 重复')

const lines = []
let contentCount = 0
for (const kol of snapshot.kols) {
  const source = config.find((item) => item.id === kol.id)
  if (!source?.feedUrl || source.url !== kol.url) throw new Error(`缺失或不匹配的 Feed：${kol.id}`)
  const values = [
    owner,
    kol.id,
    kol.name,
    kol.url,
    source.feedUrl,
    kol.platform,
    JSON.stringify(source.tags ?? []),
    1,
    kol.status,
    kol.statusMessage,
    kol.checkedAt ?? kol.lastSuccessAt ?? null,
    kol.lastSuccessAt,
  ]
  lines.push(`INSERT OR IGNORE INTO kol_subscriptions
    (owner_user_id,id,name,url,feed_url,platform,tags_json,enabled,status,status_message,checked_at,last_success_at)
    VALUES (${values.map(quote).join(',')});`)
  for (const item of kol.items.filter((entry) => entry.kind === 'content')) {
    const fields = [
      owner,
      kol.id,
      item.id,
      item.title,
      item.description ?? '',
      item.url,
      item.publishedAt,
      item.publishedLabel ?? null,
      JSON.stringify(item.stocks ?? []),
      snapshot.updatedAt,
    ]
    lines.push(`INSERT OR IGNORE INTO kol_items
      (owner_user_id,subscription_id,id,title,description,url,published_at,published_label,stocks_json,created_at)
      VALUES (${fields.map(quote).join(',')});`)
    contentCount += 1
  }
}
await writeFile(resolve(output), `${lines.join('\n')}\n`, { mode: 0o600 })
process.stdout.write(`已生成 ${config.length} 条订阅与 ${contentCount} 条内容的种子 SQL。\n`)
