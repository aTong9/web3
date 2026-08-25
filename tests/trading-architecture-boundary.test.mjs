import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('system notes expose Nautilus as a staged sidecar rather than a browser dependency', async () => {
  const [view, translations] = await Promise.all([
    readProjectFile('src/views/AboutView.vue'),
    readProjectFile('src/composables/use-i18n.ts'),
  ])

  assert.match(view, /PRIMARY ENGINE TARGET/)
  assert.doesNotMatch(view, /import readmeMd from/)
  assert.match(view, /await import\('\.\.\/\.\.\/README\.md\?raw'\)/)
  assert.match(view, /:aria-expanded="readmeOpen"/)
  assert.match(translations, /NautilusTrader 独立侧车/)
  assert.match(translations, /不会开启双执行器/)
  assert.match(translations, /LIVE 与真实资金始终关闭/)
})

test('repository documentation preserves one order owner and denies live authorization', async () => {
  const readme = await readProjectFile('README.md')

  assert.match(readme, /NautilusTrader.*交易研究与执行主引擎/)
  assert.match(readme, /必须停用 Worker 对同一账户的竞争执行与对账路径/)
  assert.match(readme, /构建、部署或测试通过都不构成实盘授权/)
})
