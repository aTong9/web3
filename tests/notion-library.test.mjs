import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url, {
  alias: { '@': new URL('../src', import.meta.url).pathname },
})
const { emptyNotionLibrary, parseNotionLibrary, mergeNotionLibrary, filterNotionEntries } = jiti(
  '../src/utils/notion-library.ts',
)
const entry = {
  id: 'a'.repeat(32),
  title: '财报工具',
  category: '创意与项目',
  status: '待评估',
  summary: '公开财报问答',
  nextAction: '验证一个例子',
  sourceUrl: `https://app.notion.com/p/${'a'.repeat(32)}`,
  sourceUpdatedAt: '',
  externalUrl: '',
  destination: '/research-workspace',
}
const library = (entries = [entry]) => ({
  version: 1,
  importedAt: '2026-11-03T00:00:00.000Z',
  coverage: '选择性快照',
  entries,
})
const parse = (data) => parseNotionLibrary(JSON.stringify(data))
test('library validates and strips unrelated data at the import boundary', () => {
  assert.deepEqual(parse(emptyNotionLibrary()), emptyNotionLibrary())
  const valid = parse({ ...library(), token: 'omit', entries: [{ ...entry, secret: 'omit' }] })
  assert.equal(valid.token, undefined)
  assert.equal(valid.entries[0].secret, undefined)
  for (const bad of [
    null,
    [],
    { ...library(), version: 2 },
    library([entry, entry]),
    library([{ ...entry, id: '../bad' }]),
    library([{ ...entry, title: ' ' }]),
    library([{ ...entry, sourceUpdatedAt: 'yesterday' }]),
    library([{ ...entry, category: 'unlisted' }]),
  ])
    assert.throws(() => parse(bad))
  assert.throws(() => parseNotionLibrary(' '.repeat(2_000_001)))
})
test('unsafe links and unapproved internal destinations are rejected', () => {
  for (const externalUrl of [
    'javascript:alert(1)',
    'data:text/html,test',
    'https://name:password@example.com/',
  ])
    assert.throws(() => parse(library([{ ...entry, externalUrl }])))
  for (const sourceUrl of [
    'https://evil.example/p/' + entry.id,
    entry.sourceUrl + '?token=secret',
    entry.sourceUrl + '0',
  ])
    assert.throws(() => parse(library([{ ...entry, sourceUrl }])))
  assert.throws(() => parse(library([{ ...entry, destination: '//evil.example' }])))
})
test('merge updates by source id, preserves other records and can be repeated', () => {
  const second = {
    ...entry,
    id: 'b'.repeat(32),
    sourceUrl: `https://app.notion.com/p/${'b'.repeat(32)}`,
  }
  const current = library([entry, second])
  const incoming = library([{ ...entry, summary: '更新后的摘要' }])
  const merged = mergeNotionLibrary(current, incoming)
  assert.equal(merged.entries.length, 2)
  assert.equal(merged.entries[0].summary, '更新后的摘要')
  assert.deepEqual(merged.entries[1], second)
  assert.deepEqual(mergeNotionLibrary(merged, incoming), merged)
  assert.equal(current.entries[0].summary, '公开财报问答')
})
test('search applies category and text together', () => {
  assert.equal(filterNotionEntries([entry], '', ' 财报 ').length, 1)
  assert.equal(filterNotionEntries([entry], '投资与资产', '').length, 0)
  assert.equal(filterNotionEntries([entry], '创意与项目', '验证').length, 1)
})

const report = () => ({
  title: '按主题合并的内容总结',
  overview: ['完整正文总览'],
  pagesRead: 1,
  databasesRead: 0,
  dataSourcesSearched: 0,
  limits: ['选择性读取'],
  sections: [
    {
      id: 'research',
      title: '投资研究',
      summary: '主题摘要',
      paragraphs: ['正文内容'],
      takeaways: ['内容要点'],
      actions: ['建议行动'],
      cautions: ['历史观点'],
      sourceIds: [entry.id],
    },
  ],
})
test('rich report survives parsing with all readable content and provenance', () => {
  const value = parse({ ...library(), report: report() })
  assert.deepEqual(value.report, report())
  assert.equal(value.report.sections[0].paragraphs[0], '正文内容')
  assert.deepEqual(parse(library()), library())
})
test('report rejects unknown sources, duplicate chapters, malformed lists and counts', () => {
  const base = report()
  for (const invalid of [
    { ...base, pagesRead: -1 },
    { ...base, databasesRead: 0.5 },
    { ...base, overview: 'bad' },
    { ...base, sections: [base.sections[0], base.sections[0]] },
    { ...base, sections: [{ ...base.sections[0], sourceIds: ['b'.repeat(32)] }] },
    { ...base, sections: [{ ...base.sections[0], id: '../bad' }] },
    { ...base, sections: [{ ...base.sections[0], paragraphs: [123] }] },
  ])
    assert.throws(() => parse({ ...library(), report: invalid }))
})
test('merging legacy imports keeps report; newer content replaces report without losing records', () => {
  const current = { ...library(), report: report() }
  assert.deepEqual(mergeNotionLibrary(current, library()).report, current.report)
  const next = { ...library(), report: { ...report(), title: '新版正文' } }
  assert.equal(mergeNotionLibrary(current, next).report.title, '新版正文')
  assert.deepEqual(mergeNotionLibrary(current, next).entries, current.entries)
})

test('work products validate table shape, status, action references and private notes', () => {
  const product = {
    id: 'research-one',
    actionIndex: 0,
    title: '研究卡',
    status: 'needs-input',
    result: '材料已准备，执行待补',
    columns: ['事项', '记录'],
    rows: [['证据', '待填']],
    nextStep: '补本人材料',
    notes: '保留我的补充',
  }
  const make = (item) => ({
    ...library(),
    report: { ...report(), sections: [{ ...report().sections[0], workProducts: [item] }] },
  })
  assert.deepEqual(parse(make(product)).report.sections[0].workProducts[0], product)
  for (const patch of [
    { actionIndex: 1 },
    { status: 'completed' },
    { status: ['prepared'] },
    { columns: [] },
    { rows: [['too', 'many', 'cells']] },
    { notes: 123 },
    { id: '../unsafe' },
  ])
    assert.throws(() => parse(make({ ...product, ...patch })))
  const duplicate = make(product)
  duplicate.report.sections[0].workProducts.push(product)
  assert.throws(() => parse(duplicate))
})
