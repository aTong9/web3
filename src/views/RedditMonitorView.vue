<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RedditMonitorDataset } from '@/types'

const tabs = [
  { key: 'us', label: '美股', description: '股票社区 · 提及次数' },
  { key: 'crypto', label: '加密货币', description: '币圈社区 · 提及次数' },
] as const
const active = ref<'us' | 'crypto'>('us')
const dataset = ref<RedditMonitorDataset | null>(null)
const failed = ref(false)
const market = computed(() => dataset.value?.markets[active.value])
const stale = computed(
  () => market.value?.updatedAt && Date.now() - Date.parse(market.value.updatedAt) > 36 * 3600_000,
)
const total = computed(() => market.value?.rows.reduce((sum, row) => sum + row.mentions, 0) ?? 0)
const maxMentions = computed(() =>
  Math.max(1, ...(market.value?.rows.map((row) => row.mentions) ?? [])),
)
const timestamp = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    : '尚无数据'
const change = (value: number, previous: number | null) =>
  previous === null
    ? '—'
    : previous === 0
      ? '新增讨论'
      : `${value >= previous ? '+' : ''}${Math.round(((value - previous) / previous) * 100)}%`
const load = async () => {
  failed.value = false
  try {
    dataset.value = (await import('@/data/reddit-monitor.json')).default as RedditMonitorDataset
  } catch {
    failed.value = true
  }
}
onMounted(load)
</script>

<template>
  <div class="reddit-page">
    <header class="research-header">
      <div>
        <p class="eyebrow">REDDIT / DAILY DISCUSSION RADAR</p>
        <h1>Reddit监控</h1>
        <p>从讨论热度发现关注对象。每天一份快照，追踪近 24 小时的社区讨论。</p>
      </div>
      <div class="update">
        <span>每日 09:00 北京时间计划采集</span><strong>每类最多 20 个</strong
        ><small>热度不代表看涨，也不代表投资价值。</small>
      </div>
    </header>
    <nav class="category-panel" aria-label="Reddit市场分类">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: active === tab.key }"
        :aria-pressed="active === tab.key"
        @click="active = tab.key"
      >
        <span
          ><b>{{ tab.label }}</b
          ><small>{{ tab.description }}</small></span
        ><em>{{ dataset?.markets[tab.key].rows.length ?? '—' }}</em>
      </button>
    </nav>
    <p v-if="failed" role="alert">榜单加载失败。<button @click="load">重试</button></p>
    <p v-else-if="!dataset" role="status">正在加载讨论快照…</p>
    <template v-else-if="market">
      <section class="summary" aria-label="榜单概况">
        <div>
          <span>本榜提及合计</span><strong>{{ total.toLocaleString() }}</strong>
        </div>
        <div>
          <span>最近成功采集 · 北京时间</span
          ><strong class="date">{{ timestamp(market.updatedAt) }}</strong>
        </div>
        <div>
          <span>数据状态</span
          ><strong class="date">{{
            stale || market.status === 'stale'
              ? '历史快照 · 待更新'
              : market.status === 'ok'
                ? '已采集'
                : '暂不可用'
          }}</strong>
        </div>
      </section>
      <p v-if="market.message || stale" class="notice" role="status">
        {{ market.message || '快照已超过 36 小时，请查看数据更新时间。' }}
      </p>
      <p class="scope">
        ApeWisdom 的{{ active === 'us' ? '股票' : '加密货币' }}社区聚合榜，按近 24
        小时提及次数排序{{
          active === 'us' ? '，已过滤名称明确标注的 ETF / ETN / 基金' : ''
        }}。“24h变化”为提及次数变化，不是价格涨跌。
      </p>
      <div v-if="market.rows.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">排名 / 标的</th>
              <th scope="col">讨论热度</th>
              <th scope="col">点赞合计</th>
              <th scope="col">提及 24h变化</th>
              <th scope="col">查看讨论</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in market.rows" :key="row.symbol">
              <td>
                <div class="identity">
                  <span class="rank">{{ String(row.rank).padStart(2, '0') }}</span>
                  <div>
                    <strong>{{ row.symbol }}</strong
                    ><small>{{ row.name }}</small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{{ row.mentions.toLocaleString() }}</strong
                ><span class="bar" aria-hidden="true"
                  ><i :style="{ width: `${(row.mentions / maxMentions) * 100}%` }"
                /></span>
              </td>
              <td>{{ row.upvotes.toLocaleString() }}</td>
              <td>{{ change(row.mentions, row.previousMentions) }}</td>
              <td>
                <a :href="row.discussionUrl" target="_blank" rel="noopener noreferrer"
                  >Reddit搜索 ↗</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">
        <h2>{{ market.status === 'unavailable' ? '数据源尚未就绪' : '本次样本暂无匹配讨论' }}</h2>
        <p>只展示真实采集结果，数据不足时不补齐排名。</p>
      </div>
      <footer>
        <a :href="market.sourceUrl" target="_blank" rel="noopener noreferrer">查看统计来源 ↗</a
        ><span
          >搜索链接会展示实时结果，可能与快照不同。{{
            market.rows.length < 20 ? `当前仅 ${market.rows.length} 个，不补齐虚构排名。` : ''
          }}</span
        >
      </footer>
    </template>
  </div>
</template>

<style scoped>
.reddit-page {
  max-width: 1440px;
  margin: auto;
  padding: 28px var(--page-gutter);
  color: var(--ink);
}
.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 22px;
}
.eyebrow {
  font: 11px var(--font-telemetry);
  letter-spacing: 0.12em;
  color: var(--muted);
}
h1 {
  margin: 8px 0;
  font-size: 36px;
}
.research-header p:last-child {
  color: var(--muted);
  font-size: 13px;
}
.update {
  display: grid;
  gap: 10px;
  min-width: 230px;
  border-left: 1px solid var(--border);
  padding-left: 24px;
}
.update span,
.update small {
  color: var(--muted);
  font-size: 11px;
}
.category-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.category-panel button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  padding: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
.category-panel small {
  display: block;
  font-size: 11px;
  margin-top: 6px;
  color: var(--muted);
}
.category-panel em {
  font-style: normal;
  background: var(--surface-soft);
  color: var(--ink);
  padding: 5px 9px;
  border-radius: 20px;
}
.summary {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 20px;
  gap: 20px;
}
.summary div {
  display: grid;
  gap: 10px;
}
.summary span {
  font-size: 11px;
  color: var(--muted);
}
.summary strong {
  font-size: 28px;
  font-variant-numeric: tabular-nums;
}
.summary .date {
  font-size: 14px;
}
.scope,
footer,
.notice {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}
.notice {
  padding: 12px;
  background: var(--warning-soft);
  color: var(--warning);
}
.scope {
  margin: 18px 0;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  background: var(--surface);
}
table {
  border-collapse: collapse;
  width: 100%;
  min-width: 740px;
  text-align: left;
}
th {
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
  padding: 16px;
  background: var(--surface-soft);
}
td {
  padding: 17px 16px;
  border-top: 1px solid var(--border);
  font-size: 13px;
}
tbody tr:hover {
  background: var(--surface-elevated);
}
.identity {
  display: flex;
  align-items: center;
  gap: 16px;
}
.rank {
  color: var(--muted);
  font: 12px var(--font-telemetry);
}
td small {
  display: block;
  color: var(--muted);
  font-size: 11px;
  margin-top: 5px;
}
td a {
  display: block;
  margin: 4px 0;
}
a {
  color: var(--ink);
  text-underline-offset: 4px;
}
.bar {
  display: block;
  width: 100px;
  background: var(--surface-soft);
  height: 3px;
  margin-top: 8px;
}
.bar i {
  display: block;
  height: 100%;
  background: var(--accent);
}
footer {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-top: 16px;
}
.empty {
  padding: 38px 22px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.empty h2 {
  font-size: 20px;
}
.empty p {
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 700px) {
  .reddit-page {
    padding: 18px;
  }
  .research-header {
    display: block;
  }
  .update {
    margin-top: 20px;
    border-left: 0;
    border-top: 1px solid var(--border);
    padding: 16px 0 0;
  }
  .category-panel {
    gap: 6px;
  }
  .category-panel button {
    padding: 12px 8px;
  }
  .category-panel small {
    display: none;
  }
  .summary {
    grid-template-columns: 1fr 1fr;
  }
  .summary div:nth-child(2) {
    grid-column: 1/-1;
    grid-row: 2;
  }
  footer {
    flex-direction: column;
    gap: 6px;
  }
  h1 {
    font-size: 30px;
  }
}
</style>
