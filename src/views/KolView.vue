<script setup lang="ts">
import { computed, ref } from 'vue'
import kolData from '@/data/kol-monitor.json'
import type { KolMonitorDataset, KolPlatform, KolStockMention } from '@/types'

const dataset = kolData as KolMonitorDataset
const query = ref('')
const activePlatform = ref<'all' | KolPlatform>('all')
const expandedKols = ref<string[]>(dataset.kols.map((kol) => kol.id))
const subscription = ref({ name: '', url: '', feedUrl: '', tags: '' })
const updateState = ref<'idle' | 'updating' | 'success' | 'error'>('idle')
const updateMessage = ref('')

const platformNames: Record<KolPlatform, string> = {
  youtube: 'YouTube',
  xiaohongshu: '小红书',
  wechat: '微信',
  bilibili: 'B站',
  x: 'X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  douyin: '抖音',
  weibo: '微博',
  zhihu: '知乎',
  rss: 'RSS',
  web: '网页',
}

const visibleKols = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return dataset.kols.filter(
    (kol) =>
      (activePlatform.value === 'all' || kol.platform === activePlatform.value) &&
      (!needle ||
        [kol.name, ...kol.tags, ...kol.items.map((item) => item.title)].some((value) =>
          value.toLocaleLowerCase().includes(needle),
        )),
  )
})

const platforms = computed(() => [...new Set(dataset.kols.map((kol) => kol.platform))])
const contentCount = computed(() =>
  dataset.kols.reduce((total, kol) => total + kol.items.length, 0),
)
const syncedCount = computed(
  () => dataset.kols.filter((kol) => ['ok', 'partial'].includes(kol.status)).length,
)

const stockMentions = computed(() => {
  const stocks = new Map<string, KolStockMention & { count: number }>()
  dataset.kols.forEach((kol) =>
    kol.items.forEach((item) =>
      item.stocks.forEach((stock) => {
        const previous = stocks.get(`${stock.market}-${stock.code}`)
        stocks.set(`${stock.market}-${stock.code}`, { ...stock, count: (previous?.count ?? 0) + 1 })
      }),
    ),
  )
  return [...stocks.values()].sort((a, b) => b.count - a.count)
})

const toggleKol = (id: string) => {
  expandedKols.value = expandedKols.value.includes(id)
    ? expandedKols.value.filter((item) => item !== id)
    : [...expandedKols.value, id]
}

const formatDate = (value: string | null) => {
  if (!value) return '日期未知'
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const addSubscription = async () => {
  updateState.value = 'updating'
  updateMessage.value = '正在保存订阅并抓取最新内容…'
  try {
    const response = await fetch('/api/kols/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: subscription.value.name,
        url: subscription.value.url,
        feedUrl: subscription.value.feedUrl,
        tags: subscription.value.tags
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    })
    const contentType = response.headers.get('content-type') ?? ''
    const result = contentType.includes('application/json')
      ? await response.json()
      : { error: '当前是静态部署环境，无法写入本地订阅配置' }
    if (!response.ok || !result.ok) throw new Error(result.error ?? '更新失败')
    updateState.value = 'success'
    updateMessage.value = '订阅已保存并完成同步，正在载入最新数据…'
    window.setTimeout(() => window.location.reload(), 700)
  } catch (error) {
    updateState.value = 'error'
    updateMessage.value = error instanceof Error ? error.message : '更新失败'
  }
}
</script>

<template>
  <div class="kol-page">
    <header class="page-heading">
      <div>
        <p>Cross-platform intelligence · 自动解析</p>
        <h1>KOL监控</h1>
      </div>
      <div class="freshness">
        <span></span>
        <div>
          <strong>每6小时同步</strong><small>{{ formatUpdatedAt(dataset.updatedAt) }}</small>
        </div>
      </div>
    </header>

    <section class="subscription-panel">
      <header>
        <div>
          <span>ADD & SYNC</span>
          <h2>添加 KOL / RSS 订阅</h2>
        </div>
        <small>提交后立即写入订阅配置，并调用 RSS 解析器刷新内容。</small>
      </header>
      <form @submit.prevent="addSubscription">
        <label>
          <span>名称 *</span>
          <input v-model.trim="subscription.name" required placeholder="例如：某宏观研究员" />
        </label>
        <label>
          <span>主页地址</span>
          <input v-model.trim="subscription.url" type="url" placeholder="https://example.com" />
        </label>
        <label>
          <span>RSS / Atom 地址</span>
          <input
            v-model.trim="subscription.feedUrl"
            type="url"
            placeholder="https://example.com/feed.xml"
          />
        </label>
        <label>
          <span>标签</span>
          <input v-model.trim="subscription.tags" placeholder="美股, 宏观, 科技" />
        </label>
        <button
          type="submit"
          :disabled="
            updateState === 'updating' ||
            !subscription.name ||
            (!subscription.url && !subscription.feedUrl)
          "
        >
          {{ updateState === 'updating' ? '同步中…' : '保存并立即更新' }}
        </button>
      </form>
      <p v-if="updateMessage" class="update-message" :class="updateState">
        {{ updateMessage }}
      </p>
      <p class="runtime-note">
        本地管理系统可直接更新；GitHub Pages 等纯静态部署没有服务器写权限，需要由自动任务更新。
      </p>
    </section>

    <section class="summary">
      <div>
        <span>监控账号</span><strong>{{ dataset.kols.length }}</strong>
      </div>
      <div>
        <span>可用连接</span><strong>{{ syncedCount }}</strong>
      </div>
      <div>
        <span>已解析内容</span><strong>{{ contentCount }}</strong>
      </div>
      <div>
        <span>股票提及</span><strong>{{ stockMentions.length }}</strong>
      </div>
    </section>

    <section v-if="stockMentions.length" class="stock-radar">
      <header>
        <h2>股票提及</h2>
        <span>按当前内容出现次数排序</span>
      </header>
      <div class="stock-list">
        <span v-for="stock in stockMentions" :key="`${stock.market}-${stock.code}`">
          <b>{{ stock.name }}</b
          ><small>{{ stock.market }} · {{ stock.code }} · {{ stock.count }}次</small>
        </span>
      </div>
    </section>

    <div class="toolbar">
      <div class="platform-tabs">
        <button :class="{ active: activePlatform === 'all' }" @click="activePlatform = 'all'">
          全部
        </button>
        <button
          v-for="platform in platforms"
          :key="platform"
          :class="{ active: activePlatform === platform }"
          @click="activePlatform = platform"
        >
          {{ platformNames[platform] }}
        </button>
      </div>
      <input v-model="query" type="search" placeholder="搜索账号或内容…" aria-label="搜索KOL" />
    </div>

    <div class="kol-list">
      <section v-for="kol in visibleKols" :key="kol.id" class="kol-card">
        <header>
          <button class="kol-toggle" @click="toggleKol(kol.id)">
            <span class="platform">{{ platformNames[kol.platform] }}</span>
            <span class="kol-name"
              ><strong>{{ kol.name }}</strong
              ><small>{{ kol.items.length }} 条内容</small></span
            >
            <span class="status" :class="kol.status">{{ kol.status }}</span>
            <span class="arrow" :class="{ open: expandedKols.includes(kol.id) }">⌄</span>
          </button>
          <a :href="kol.url" target="_blank" rel="noopener noreferrer">主页 ↗</a>
        </header>

        <p class="status-message">{{ kol.statusMessage }}</p>

        <div v-if="expandedKols.includes(kol.id)" class="content-list">
          <a
            v-for="item in kol.items"
            :key="item.id"
            :href="item.url || kol.url"
            target="_blank"
            rel="noopener noreferrer"
            class="content-row"
          >
            <span class="date">{{ formatDate(item.publishedAt) }}</span>
            <span class="content-copy">
              <strong>{{ item.title }}</strong>
              <small v-if="item.description">{{ item.description }}</small>
              <span v-if="item.stocks.length" class="stock-tags">
                <em v-for="stock in item.stocks" :key="`${stock.market}-${stock.code}`">
                  {{ stock.name }} · {{ stock.code }}
                </em>
              </span>
            </span>
            <span>↗</span>
          </a>
          <div v-if="!kol.items.length" class="empty">当前没有可展示的公开内容。</div>
        </div>
      </section>
    </div>

    <footer>
      {{ dataset.source }}。股票提及来自关键词匹配，仅表示内容中出现，不代表持仓或推荐。
    </footer>
  </div>
</template>

<style scoped>
.kol-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
}
.page-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
}
.page-heading p {
  margin: 0 0 14px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(36px, 4.5vw, 54px);
  font-weight: 500;
  letter-spacing: -0.04em;
}
.freshness {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
}
.freshness > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.freshness strong,
.freshness small {
  display: block;
}
.freshness strong {
  font-size: 12px;
}
.freshness small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}
.summary {
  margin: 38px 0 28px;
  border-block: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.subscription-panel {
  margin-top: 34px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.subscription-panel > header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
}
.subscription-panel header span {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.subscription-panel h2 {
  margin: 5px 0 0;
  font: 400 25px Georgia, 'Songti SC', serif;
}
.subscription-panel header small,
.runtime-note {
  color: var(--muted);
  font-size: 10px;
}
.subscription-panel form {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 1.2fr 0.8fr auto;
  gap: 10px;
  align-items: end;
}
.subscription-panel label span {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 9px;
}
.subscription-panel input {
  width: 100%;
  min-width: 0;
  padding: 10px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--background);
  color: var(--text);
  font: inherit;
  font-size: 11px;
}
.subscription-panel button {
  padding: 11px 15px;
  border: 0;
  border-radius: 7px;
  background: var(--accent);
  color: white;
  white-space: nowrap;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}
.subscription-panel button:disabled {
  opacity: 0.45;
  cursor: wait;
}
.update-message {
  margin: 12px 0 0;
  font-size: 11px;
}
.update-message.error {
  color: var(--danger);
}
.update-message.success {
  color: var(--negative);
}
.runtime-note {
  margin: 9px 0 0;
}
.summary div {
  padding: 18px 16px;
  border-right: 1px solid var(--border);
}
.summary div:last-child {
  border-right: 0;
}
.summary span,
.summary strong {
  display: block;
}
.summary span {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.summary strong {
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 500;
}
.stock-radar {
  margin-bottom: 28px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.stock-radar header {
  margin-bottom: 14px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.stock-radar h2 {
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 18px;
  font-weight: 500;
}
.stock-radar header span {
  color: var(--muted);
  font-size: 10px;
}
.stock-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.stock-list > span {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--surface-soft);
}
.stock-list b,
.stock-list small {
  display: block;
}
.stock-list b {
  font-size: 12px;
}
.stock-list small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
}
.toolbar {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.platform-tabs {
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-soft);
  display: flex;
}
.platform-tabs button {
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.platform-tabs button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}
.toolbar input {
  min-width: 240px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
}
.kol-list {
  border-top: 1px solid var(--ink);
}
.kol-card {
  border-bottom: 1px solid var(--border);
}
.kol-card > header {
  min-height: 78px;
  display: flex;
  align-items: stretch;
}
.kol-toggle {
  padding: 12px 12px;
  border: 0;
  background: transparent;
  display: grid;
  grid-template-columns: 100px minmax(180px, 1fr) 80px 20px;
  align-items: center;
  gap: 18px;
  flex: 1;
  text-align: left;
  cursor: pointer;
}
.kol-toggle:hover {
  background: var(--surface);
}
.platform {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.kol-name strong,
.kol-name small {
  display: block;
}
.kol-name strong {
  font-family: Georgia, 'Songti SC', serif;
  font-size: 18px;
  font-weight: 500;
}
.kol-name small {
  margin-top: 5px;
  color: var(--muted);
  font-size: 10px;
}
.status {
  justify-self: end;
  padding: 4px 7px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 9px;
  text-transform: uppercase;
}
.status.partial,
.status.stale {
  background: var(--warning-soft);
  color: var(--warning);
}
.status.failed {
  background: var(--danger-soft);
  color: var(--danger);
}
.arrow {
  color: var(--muted);
  transition: transform 0.2s ease;
}
.arrow.open {
  transform: rotate(180deg);
}
.kol-card > header > a {
  width: 72px;
  border-left: 1px solid var(--border);
  color: var(--muted);
  display: grid;
  place-items: center;
  font-size: 10px;
  text-decoration: none;
}
.status-message {
  margin: -12px 0 14px;
  padding-left: 130px;
  color: var(--muted);
  font-size: 10px;
}
.content-list {
  margin: 0 18px 20px 118px;
  border-left: 1px solid var(--border);
}
.content-row {
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 18px;
  gap: 14px;
  text-decoration: none;
}
.content-row:hover {
  background: var(--surface);
}
.date {
  color: var(--muted);
  font-size: 10px;
}
.content-copy strong,
.content-copy small {
  display: block;
}
.content-copy strong {
  font-size: 13px;
}
.content-copy small {
  margin-top: 6px;
  overflow: hidden;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stock-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.stock-tags em {
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 9px;
  font-style: normal;
}
.empty {
  padding: 22px 14px;
  color: var(--muted);
  font-size: 11px;
}
.add-guide {
  margin-top: 54px;
  padding: 30px 0;
  border-block: 1px solid var(--ink);
  display: grid;
  grid-template-columns: 0.7fr 1fr;
  gap: 50px;
}
.add-guide > div > span {
  color: var(--accent);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.add-guide h2 {
  max-width: 300px;
  margin: 10px 0 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 30px;
  font-weight: 400;
}
.add-guide code,
.add-guide pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.add-guide > div > code {
  font-size: 11px;
}
.add-guide pre {
  padding: 14px;
  overflow-x: auto;
  border-radius: 7px;
  background: var(--code-bg);
  color: var(--inverse-text);
  font-size: 11px;
  line-height: 1.6;
}
.add-guide p,
footer {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
footer {
  margin-top: 24px;
}
@media (max-width: 760px) {
  .page-heading,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .freshness {
    align-self: flex-start;
  }
  .subscription-panel > header {
    align-items: start;
    flex-direction: column;
  }
  .subscription-panel form {
    grid-template-columns: 1fr;
  }
  .summary {
    grid-template-columns: 1fr 1fr;
  }
  .summary div:nth-child(2) {
    border-right: 0;
  }
  .platform-tabs {
    overflow-x: auto;
  }
  .platform-tabs button {
    flex: 0 0 auto;
  }
  .toolbar input {
    min-width: 0;
  }
  .kol-toggle {
    grid-template-columns: 70px minmax(0, 1fr) 16px;
    gap: 10px;
  }
  .status {
    display: none;
  }
  .status-message {
    margin-top: -8px;
    padding: 0 90px 0 82px;
  }
  .content-list {
    margin-left: 18px;
  }
  .content-row {
    grid-template-columns: 1fr 16px;
  }
  .content-row .date {
    display: none;
  }
  .add-guide {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
