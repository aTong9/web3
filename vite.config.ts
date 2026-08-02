import { fileURLToPath, URL } from 'node:url'
import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { dump, load } from 'js-yaml'

interface KolSubscriptionInput {
  name?: string
  url?: string
  feedUrl?: string
  tags?: string[]
}

const runKolUpdate = (projectRoot: string) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/update-kols.mjs'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk.toString()))
    child.stderr.on('data', (chunk) => (output += chunk.toString()))
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolve(output.trim()) : reject(new Error(output.trim() || `更新退出码 ${code}`)),
    )
  })

const kolSubscriptionPlugin = (): Plugin => {
  let updating = false
  return {
    name: 'local-kol-subscription-api',
    configureServer(server) {
      server.middlewares.use('/api/kols/subscriptions', (request, response, next) => {
        if (request.method !== 'POST') return next()
        let body = ''
        request.on('data', (chunk) => {
          body += chunk.toString()
          if (body.length > 20_000) request.destroy(new Error('请求内容过大'))
        })
        request.on('end', async () => {
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          if (updating) {
            response.statusCode = 409
            response.end(JSON.stringify({ error: '已有更新任务正在运行' }))
            return
          }
          try {
            const input = JSON.parse(body) as KolSubscriptionInput
            const name = input.name?.trim()
            const feedUrl = input.feedUrl?.trim()
            const url = input.url?.trim() || feedUrl
            if (!name || !url) throw new Error('名称以及主页或RSS地址不能为空')
            for (const candidate of [url, feedUrl].filter(Boolean)) {
              const parsed = new URL(candidate as string)
              if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('仅支持HTTP(S)地址')
            }
            const configPath = fileURLToPath(
              new URL('./src/data/kols.yml', `file://${server.config.root}/`),
            )
            const current = load(await readFile(configPath, 'utf8'))
            if (!Array.isArray(current)) throw new Error('kols.yml 顶层必须是数组')
            if (
              current.some(
                (item) => item?.url === url || (feedUrl && item?.feedUrl === feedUrl),
              )
            )
              throw new Error('该主页或RSS订阅已经存在')
            current.push({
              name,
              url,
              ...(feedUrl ? { feedUrl } : {}),
              ...(input.tags?.length ? { tags: input.tags.map((tag) => tag.trim()).filter(Boolean) } : {}),
              enabled: true,
            })
            updating = true
            await writeFile(
              configPath,
              `# 可在KOL监控页直接添加；也可手动编辑。\n${dump(current, { lineWidth: 100, noRefs: true })}`,
            )
            const output = await runKolUpdate(server.config.root)
            response.statusCode = 200
            response.end(JSON.stringify({ ok: true, output }))
          } catch (error) {
            response.statusCode = 400
            response.end(
              JSON.stringify({ error: error instanceof Error ? error.message : '更新失败' }),
            )
          } finally {
            updating = false
          }
        })
      })
    },
  }
}

const githubPagesFallbackPlugin = (): Plugin => ({
  name: 'github-pages-spa-fallback',
  apply: 'build',
  async closeBundle() {
    const outputDirectory = fileURLToPath(new URL('./dist/', import.meta.url))
    const index = await readFile(resolve(outputDirectory, 'index.html'))
    await writeFile(resolve(outputDirectory, '404.html'), index)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), kolSubscriptionPlugin(), githubPagesFallbackPlugin()],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/web3/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender'))
            return 'chart-vendor'
          if (id.includes('node_modules/vue')) return 'vue-vendor'
        },
      },
    },
  },
  server: {
    port: 2333,
    open: true,
  },
})
