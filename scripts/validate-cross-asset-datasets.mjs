import { appendFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedFiles = [
  'cross-asset',
  'market-home',
  'asset-technical-signals',
  'cross-asset-forecast-history',
  'technical-events',
  'fund-transmission',
]

export const validateCrossAssetDatasets = (datasets, now = new Date()) => {
  const errors = []
  const facts = []
  for (const name of expectedFiles) {
    if (!datasets[name] || typeof datasets[name] !== 'object') errors.push(`缺少${name}数据`)
  }
  const timestamps = expectedFiles.map((name) => datasets[name]?.updatedAt).filter(Boolean)
  const uniqueTimestamps = new Set(timestamps)
  if (timestamps.length !== expectedFiles.length) errors.push('部分数据缺少更新时间')
  if (uniqueTimestamps.size !== 1) errors.push('六份关联数据的更新时间不一致')
  const updatedAt = timestamps[0]
  const parsedUpdatedAt = Date.parse(updatedAt)
  if (!Number.isFinite(parsedUpdatedAt)) errors.push('更新时间格式无效')
  else {
    const ageMs = now.getTime() - parsedUpdatedAt
    if (ageMs > 2 * 60 * 60 * 1000) errors.push('更新时间距校验时刻超过2小时')
    if (ageMs < -10 * 60 * 1000) errors.push('更新时间超过当前时间10分钟')
  }

  const crossAsset = datasets['cross-asset'] ?? {}
  const home = datasets['market-home'] ?? {}
  const technical = datasets['asset-technical-signals'] ?? {}
  const history = datasets['cross-asset-forecast-history'] ?? {}
  const events = datasets['technical-events'] ?? {}
  const transmission = datasets['fund-transmission'] ?? {}
  if (!Array.isArray(crossAsset.assets) || crossAsset.assets.length < 40)
    errors.push('跨资产记录少于40条')
  const matrixIds = crossAsset.matrix?.ids ?? []
  const correlations = crossAsset.matrix?.correlations ?? []
  if (!Array.isArray(matrixIds) || matrixIds.length < 10) errors.push('相关矩阵资产少于10个')
  if (
    !Array.isArray(correlations) ||
    correlations.length !== matrixIds.length ||
    correlations.some(
      (row, index) =>
        row?.id !== matrixIds[index] ||
        !Array.isArray(row.values) ||
        row.values.length !== matrixIds.length,
    )
  )
    errors.push('相关矩阵不是完整方阵')
  if (!Array.isArray(home.marketBrief?.markets) || home.marketBrief.markets.length < 8)
    errors.push('首页市场摘要少于8个市场')
  if (!Array.isArray(technical.assets) || technical.assets.length < 20)
    errors.push('技术信号资产少于20个')
  if (!Array.isArray(history.records) || history.records.length < 1)
    errors.push('预测历史为空')
  if (!Array.isArray(events.events) || events.events.length < 1) errors.push('技术事件为空')
  if (!Array.isArray(transmission.markets) || transmission.markets.length !== 3)
    errors.push('基金传导市场数量不是3')

  facts.push(
    ['共同更新时间', uniqueTimestamps.size === 1 ? updatedAt : `${uniqueTimestamps.size}个版本`],
    ['跨资产/矩阵', `${crossAsset.assets?.length ?? 0}/${matrixIds.length}`],
    ['技术资产/预测记录', `${technical.assets?.length ?? 0}/${history.records?.length ?? 0}`],
    ['技术事件/基金市场', `${events.events?.length ?? 0}/${transmission.markets?.length ?? 0}`],
  )
  return { ok: errors.length === 0, errors, facts }
}

export const formatCrossAssetSummary = (result) => [
  `## ${result.ok ? '✅' : '❌'} 跨资产六文件一致性门禁`,
  '',
  '| 指标 | 值 |',
  '| --- | --- |',
  ...result.facts.map(([label, value]) => `| ${label} | ${value} |`),
  ...(result.errors.length ? ['', '### 阻止提交的原因', '', ...result.errors.map((error) => `- ${error}`)] : []),
  '',
].join('\n')

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  const dataDirectory = resolve(process.argv[2] ?? 'src/data')
  const datasets = Object.fromEntries(
    await Promise.all(
      expectedFiles.map(async (name) => [
        name,
        JSON.parse(await readFile(resolve(dataDirectory, `${name}.json`), 'utf8')),
      ]),
    ),
  )
  const result = validateCrossAssetDatasets(datasets)
  const summary = formatCrossAssetSummary(result)
  process.stdout.write(`${summary}\n`)
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`)
  if (!result.ok) process.exitCode = 1
}
