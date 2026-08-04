<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import embeddedData from '@/data/market-news.json'
import type { MarketNewsCategory, MarketNewsDataset, MarketNewsImpact } from '@/types'
import { useI18n } from '@/composables/use-i18n'

const dataset = ref(embeddedData as MarketNewsDataset)
const impact = ref<'all' | MarketNewsImpact>('all')
const category = ref<'all' | MarketNewsCategory>('all')
const query = ref('')
const liveStatus = ref<'idle' | 'checking' | 'updated' | 'error'>('idle')
let refreshTimer: number | undefined
const { t } = useI18n()

const impactNames: Record<MarketNewsImpact, string> = {
  critical: t('marketNews.urgent'),
  high: t('marketNews.high'),
  medium: t('marketNews.medium'),
  low: t('marketNews.low'),
}
const categoryNames: Record<MarketNewsCategory, string> = {
  macro: t('marketNews.categories.macro'),
  geopolitics: t('marketNews.categories.geopolitics'),
  equities: t('marketNews.categories.equities'),
  commodities: t('marketNews.categories.commodities'),
  technology: t('marketNews.categories.technology'),
}

const articles = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return dataset.value.articles.filter(
    (article) =>
      (impact.value === 'all' || article.impact === impact.value) &&
      (category.value === 'all' || article.category === category.value) &&
      (!needle ||
        [
          article.title,
          article.translatedTitle ?? '',
          article.source,
          ...article.affectedAssets,
        ].some((value) => value.toLocaleLowerCase().includes(needle))),
  )
})
const urgentCount = computed(
  () => dataset.value.articles.filter((article) => article.impact === 'critical').length,
)
const highCount = computed(
  () => dataset.value.articles.filter((article) => article.impact === 'high').length,
)
const officialCount = computed(
  () => dataset.value.articles.filter((article) => article.sourceType === 'official').length,
)

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))

const refreshLatest = async () => {
  liveStatus.value = 'checking'
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/aTong9/web3/main/src/data/market-news.json?t=${Date.now()}`,
      { cache: 'no-store' },
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const latest = (await response.json()) as MarketNewsDataset
    if (new Date(latest.updatedAt) > new Date(dataset.value.updatedAt)) dataset.value = latest
    liveStatus.value = 'updated'
  } catch (error) {
    console.warn('Market news live refresh failed:', error)
    liveStatus.value = 'error'
  }
}

onMounted(() => {
  void refreshLatest()
  refreshTimer = window.setInterval(refreshLatest, 2 * 60 * 1000)
})
onUnmounted(() => window.clearInterval(refreshTimer))
</script>

<template>
  <main class="news-page">
    <header class="page-heading">
      <div>
        <p>{{ t('marketNews.badge') }}</p>
        <h1>{{ t('marketNews.heading') }}</h1>
        <span>{{ t('marketNews.intro') }}</span>
      </div>
      <DataUpdateStatus
        :updated-at="dataset.updatedAt"
        schedule="news"
        :label="t('marketNews.backendUpdate')"
      />
    </header>

    <section class="summary">
      <div>
        <span>{{ t('marketNews.recent24h') }}</span><strong>{{ dataset.articles.length }}</strong>
      </div>
      <div class="critical">
        <span>{{ t('marketNews.urgent') }}</span><strong>{{ urgentCount }}</strong>
      </div>
      <div>
        <span>{{ t('marketNews.high') }}</span><strong>{{ highCount }}</strong>
      </div>
      <div>
        <span>{{ t('marketNews.official') }}</span><strong>{{ officialCount }}</strong>
      </div>
    </section>

    <section class="notice">
      <strong>{{ t('marketNews.noticeTitle') }}</strong>
      <span>{{ t('marketNews.noticeTip') }}</span>
    </section>

    <div class="toolbar">
      <div class="filters">
        <select v-model="impact" :aria-label="t('marketNews.filterImpactLabel')">
          <option value="all">{{ t('marketNews.allImpact') }}</option>
          <option v-for="(name, key) in impactNames" :key="key" :value="key">{{ name }}</option>
        </select>
        <select v-model="category" :aria-label="t('marketNews.filterCategoryLabel')">
          <option value="all">{{ t('marketNews.allCategory') }}</option>
          <option v-for="(name, key) in categoryNames" :key="key" :value="key">{{ name }}</option>
        </select>
      </div>
      <input
        v-model="query"
        type="search"
        :placeholder="t('marketNews.searchPlaceholder')"
      />
    </div>

    <div class="news-list">
      <a
        v-for="article in articles"
        :key="article.id"
        :href="article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="news-row"
      >
        <time>{{ formatTime(article.publishedAt) }}</time>
        <span class="impact" :class="article.impact">{{ impactNames[article.impact] }}</span>
        <span class="copy">
            <strong class="translated-title">{{ article.translatedTitle || article.title }}</strong>
            <span
              v-if="article.translatedTitle && article.translatedTitle !== article.title"
              class="original-title"
            >
            {{ t('marketNews.translated') }} {{ article.title }}
            </span>
            <small>
              {{ article.source }} · {{ categoryNames[article.category] }}
              <b v-if="article.sourceType === 'official'">{{ t('marketNews.officialBadge') }}</b>
              <b v-if="article.translationStatus === 'translated'"
              >{{ t('marketNews.translateProvider', { provider: article.translationProvider }) }}</b
              >
              <b v-else-if="article.translationStatus === 'failed'" class="translation-failed"
              >{{ t('marketNews.translateFailed') }}</b
            >
          </small>
          <span v-if="article.affectedAssets.length" class="assets">
            <em v-for="asset in article.affectedAssets" :key="asset">{{ asset }}</em>
          </span>
        </span>
        <span>↗</span>
      </a>
      <div v-if="!articles.length" class="empty">{{ t('marketNews.noData') }}</div>
    </div>

    <footer>{{ t('marketNews.footer', { source: dataset.source }) }}</footer>
  </main>
</template>

<style scoped>
.news-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
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
  margin: 0 0 12px;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(36px, 4.5vw, 54px);
  font-weight: 500;
  letter-spacing: -0.04em;
}
.page-heading > div > span {
  color: var(--muted);
  font-size: 13px;
}
.freshness {
  padding: 12px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}
.freshness i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.freshness i.checking {
  animation: pulse 1s infinite;
}
.freshness i.error {
  background: var(--danger);
  box-shadow: 0 0 0 4px var(--danger-soft);
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
  margin: 38px 0 18px;
  border-block: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.summary div {
  padding: 18px 16px;
  border-right: 1px solid var(--border);
}
.summary div:last-child {
  border: 0;
}
.summary span,
.summary strong {
  display: block;
}
.summary span {
  color: var(--muted);
  font-size: 11px;
}
.summary strong {
  margin-top: 5px;
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 400;
}
.summary .critical strong {
  color: var(--danger);
}
.notice {
  padding: 13px 16px;
  border-left: 3px solid var(--warning);
  background: var(--warning-soft);
  display: flex;
  gap: 10px;
  font-size: 12px;
}
.notice span {
  color: var(--muted);
}
.toolbar {
  margin: 24px 0 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
select,
input {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
}
input {
  width: min(320px, 100%);
}
.news-list {
  border-top: 1px solid var(--ink);
}
.news-row {
  padding: 16px 8px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: 96px 64px 1fr 18px;
  gap: 14px;
  align-items: start;
  text-decoration: none;
}
.news-row:hover {
  background: var(--surface);
}
time {
  color: var(--muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.impact {
  width: fit-content;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--surface-soft);
  font-size: 10px;
  font-weight: 700;
}
.impact.critical {
  background: var(--danger);
  color: white;
}
.impact.high {
  background: var(--warning-soft);
  color: var(--warning);
}
.copy strong,
.copy small {
  display: block;
}
.original-title {
  margin-top: 5px;
  color: var(--muted);
  display: block;
  font-size: 11px;
  line-height: 1.45;
}
.copy small .translation-failed {
  color: var(--danger);
}
.copy strong {
  line-height: 1.45;
  font-size: 14px;
}
.copy small {
  margin-top: 6px;
  color: var(--muted);
  font-size: 11px;
}
.copy small b {
  margin-left: 6px;
  color: var(--accent);
}
.assets {
  margin-top: 8px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.assets em {
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 10px;
  font-style: normal;
}
.empty {
  padding: 50px;
  color: var(--muted);
  text-align: center;
}
footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}
@media (max-width: 720px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .summary div:nth-child(2) {
    border-right: 0;
  }
  .toolbar {
    flex-direction: column;
  }
  .toolbar input {
    width: 100%;
  }
  .notice {
    flex-direction: column;
  }
  .news-row {
    grid-template-columns: 74px 56px 1fr;
    gap: 8px;
  }
  .news-row > :last-child {
    display: none;
  }
}
</style>
