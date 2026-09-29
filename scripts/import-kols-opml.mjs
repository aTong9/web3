import { readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dump, load } from 'js-yaml'
import { mergeSubscriptions, readOpmlSubscriptions } from './lib/import-kols-opml.mjs'

const [, , filename, flag] = process.argv
if (!filename || (flag && flag !== '--apply'))
  throw new Error('用法: npm run import:kols -- /path/to/export.opml [--apply]')
const configPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/kols.yml')
const existing = load(await readFile(configPath, 'utf8'))
if (!Array.isArray(existing)) throw new Error('kols.yml 顶层必须是数组')
const incoming = await readOpmlSubscriptions(await readFile(resolve(filename), 'utf8'))
if (!incoming.length) throw new Error('OPML 中没有有效的 RSS/Atom 订阅')
const merged = mergeSubscriptions(existing, incoming)
process.stdout.write(
  `OPML 有效订阅 ${incoming.length} 条；新增 ${merged.length - existing.length} 条。\n`,
)
if (flag === '--apply') {
  const temporary = `${configPath}.${process.pid}.tmp`
  await writeFile(temporary, dump(merged, { lineWidth: 100, noRefs: true }))
  await rename(temporary, configPath)
  process.stdout.write('已写入 kols.yml；运行 npm run update:kols 抓取内容。\n')
} else process.stdout.write('预览完成；加 --apply 才会写入。\n')
