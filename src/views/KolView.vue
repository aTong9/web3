<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { KolMonitorDataset, KolPlatform, KolStockMention } from '@/types'
import { useAuth } from '@/composables/use-auth'
import { useI18n } from '@/composables/use-i18n'

const { embedded = false } = defineProps<{ embedded?: boolean }>()

const dataset = shallowRef<KolMonitorDataset>({ updatedAt: '', source: '', kols: [] })
const query = ref('')
const activeGroup = ref('all')
const activePlatform = ref<'all' | KolPlatform>('all')
const expandedKols = ref<string[]>([])
const { user } = useAuth()
const { t, locale } = useI18n()

const checking = ref(false)
const refreshError = ref(false)
const needsLogin = ref(false)
const localFallback = ref(false)
const isDev = import.meta.env.DEV
let timer: number | undefined
let controller: AbortController | undefined
let stopAuthWatch: (() => void) | undefined
let authEpoch = 0
let sessionToken: string | null = null
const apiBase =
  (import.meta.env.VITE_KOLS_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8788' : 'https://web3-kols-api.binson0426.workers.dev')
const safeUrl = (value: unknown) => {
  try {
    const url = new URL(String(value))
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}
const isContent = (
  kol: KolMonitorDataset['kols'][number],
  item: KolMonitorDataset['kols'][number]['items'][number],
) =>
  item.kind === 'content' ||
  (!item.kind && ['youtube', 'rss'].includes(kol.platform) && item.url !== kol.url)
const contentItems = (kol: KolMonitorDataset['kols'][number]) =>
  kol.items.filter((item) => isContent(kol, item))
const validateLatest = (value: unknown): KolMonitorDataset => {
  if (!value || typeof value !== 'object') throw new Error('Invalid KOL data')
  const data = value as KolMonitorDataset
  if (
    typeof data.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(data.updatedAt)) ||
    !Array.isArray(data.kols)
  )
    throw new Error('Invalid KOL data')
  return {
    ...data,
    source: typeof data.source === 'string' ? data.source : '',
    kols: data.kols
      .filter(
        (kol) =>
          kol &&
          typeof kol.id === 'string' &&
          typeof kol.name === 'string' &&
          typeof kol.platform === 'string' &&
          safeUrl(kol.url) &&
          Array.isArray(kol.tags) &&
          Array.isArray(kol.items) &&
          ['ok', 'partial', 'stale', 'failed'].includes(kol.status),
      )
      .map((kol) => ({
        ...kol,
        lastSuccessAt:
          typeof kol.lastSuccessAt === 'string' && Number.isFinite(Date.parse(kol.lastSuccessAt))
            ? kol.lastSuccessAt
            : null,
        tags: kol.tags.filter((tag) => typeof tag === 'string'),
        items: kol.items
          .filter(
            (item) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              (item.publishedAt === null ||
                (typeof item.publishedAt === 'string' &&
                  Number.isFinite(Date.parse(item.publishedAt)))) &&
              (item.publishedLabel == null || typeof item.publishedLabel === 'string') &&
              safeUrl(item.url) &&
              (item.kind === 'content' ||
                item.kind === 'profile' ||
                (!item.kind && ['youtube', 'rss'].includes(kol.platform) && item.url !== kol.url)),
          )
          .map((item) => ({
            ...item,
            description: typeof item.description === 'string' ? item.description : '',
            stocks: Array.isArray(item.stocks)
              ? item.stocks.filter(
                  (stock) =>
                    stock &&
                    typeof stock.code === 'string' &&
                    typeof stock.name === 'string' &&
                    typeof stock.market === 'string',
                )
              : [],
          })),
      })),
  }
}
const refresh = async () => {
  if (checking.value || document.hidden) return
  const token = localStorage.getItem('market-admin-session')
  if (token !== sessionToken) {
    sessionToken = token
    dataset.value = { updatedAt: '', source: '', kols: [] }
    localFallback.value = false
  }
  if ((!token || !user.value) && !isDev) {
    needsLogin.value = true
    return
  }
  const epoch = authEpoch
  checking.value = true
  refreshError.value = false
  needsLogin.value = !token || !user.value
  const requestController = new AbortController()
  controller = requestController
  const timeout = window.setTimeout(() => requestController.abort(), 15_000)
  try {
    if (!token || !user.value) throw new Error('Authentication required')
    const response = await fetch(`${apiBase}/api/kols`, {
      cache: 'no-store',
      signal: requestController.signal,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (epoch !== authEpoch || localStorage.getItem('market-admin-session') !== token) return
    if (response.status === 401 || response.status === 403) {
      needsLogin.value = true
      dataset.value = { updatedAt: '', source: '', kols: [] }
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const latest = validateLatest(await response.json())
    if (epoch !== authEpoch || localStorage.getItem('market-admin-session') !== token) return
    dataset.value = latest
    localFallback.value = false
  } catch (error) {
    if (epoch !== authEpoch) return
    if (requestController.signal.aborted && !document.hidden)
      console.warn('KOL refresh timed out:', error)
    else console.warn('KOL live refresh failed:', error)
    refreshError.value = true
    if (isDev && !dataset.value.kols.length) {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}src/data/kol-monitor.json?t=${Date.now()}`,
          {
            cache: 'no-store',
            signal: AbortSignal.timeout(5_000),
          },
        )
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const latest = validateLatest(await response.json())
        if (epoch !== authEpoch) return
        dataset.value = latest
        localFallback.value = true
      } catch (fallbackError) {
        console.warn('KOL local fallback failed:', fallbackError)
      }
    }
  } finally {
    window.clearTimeout(timeout)
    if (controller === requestController) {
      controller = undefined
      checking.value = false
    }
  }
}
const refreshIfVisible = () => {
  if (!document.hidden) void refresh()
}
onMounted(() => {
  stopAuthWatch = watch(
    user,
    (current) => {
      authEpoch += 1
      sessionToken = localStorage.getItem('market-admin-session')
      controller?.abort()
      controller = undefined
      checking.value = false
      dataset.value = { updatedAt: '', source: '', kols: [] }
      localFallback.value = false
      needsLogin.value = !current
      if (current || isDev) void refresh()
    },
    { immediate: true },
  )
  timer = window.setInterval(refreshIfVisible, 5 * 60_000)
  window.addEventListener('focus', refreshIfVisible)
  document.addEventListener('visibilitychange', refreshIfVisible)
})
onUnmounted(() => {
  authEpoch += 1
  stopAuthWatch?.()
  window.clearInterval(timer)
  window.removeEventListener('focus', refreshIfVisible)
  document.removeEventListener('visibilitychange', refreshIfVisible)
  controller?.abort()
})

const platformNames = computed(() =>
  locale.value === 'en'
    ? {
        youtube: 'YouTube',
        xiaohongshu: 'XiaoHongShu',
        wechat: 'WeChat',
        bilibili: 'Bilibili',
        x: 'X',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        douyin: 'Douyin',
        weibo: 'Weibo',
        zhihu: 'Zhihu',
        rss: 'RSS',
        web: 'Web',
      }
    : {
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
      },
)

const needle = computed(() => query.value.trim().toLocaleLowerCase())
const groups = computed(() =>
  ['加密', '技术', '新闻', '美股'].filter((group) =>
    dataset.value.kols.some((kol) => kol.tags.includes(group)),
  ),
)
const groupLabel = (group: string) =>
  locale.value === 'en'
    ? ({ 加密: 'Crypto', 技术: 'Tech', 新闻: 'News', 美股: 'US stocks' }[group] ?? group)
    : group
const matchingContent = (kol: KolMonitorDataset['kols'][number]) => {
  const items = contentItems(kol)
  if (
    !needle.value ||
    [kol.name, ...kol.tags].some((value) => value.toLocaleLowerCase().includes(needle.value))
  )
    return items
  return items.filter((item) =>
    `${item.title} ${item.description}`.toLocaleLowerCase().includes(needle.value),
  )
}
const visibleKols = computed(() => {
  const statusOrder = { ok: 0, partial: 1, stale: 2, failed: 3 }
  return dataset.value.kols
    .filter(
      (kol) =>
        (activeGroup.value === 'all' || kol.tags.includes(activeGroup.value)) &&
        (activePlatform.value === 'all' || kol.platform === activePlatform.value) &&
        (!needle.value ||
          [kol.name, ...kol.tags].some((value) =>
            value.toLocaleLowerCase().includes(needle.value),
          ) ||
          matchingContent(kol).length > 0),
    )
    .sort(
      (a, b) =>
        Number(matchingContent(b).length > 0) - Number(matchingContent(a).length > 0) ||
        statusOrder[a.status] - statusOrder[b.status],
    )
})
const allVisibleExpanded = computed(
  () =>
    visibleKols.value.length > 0 &&
    visibleKols.value.every((kol) => expandedKols.value.includes(kol.id)),
)

const platforms = computed(() => [...new Set(dataset.value.kols.map((kol) => kol.platform))])
const contentCount = computed(() =>
  dataset.value.kols.reduce((total, kol) => total + contentItems(kol).length, 0),
)
const syncedCount = computed(
  () =>
    dataset.value.kols.filter(
      (kol) => ['ok', 'partial'].includes(kol.status) && contentItems(kol).length,
    ).length,
)
const lastSuccessAt = computed(() => {
  const dates = dataset.value.kols
    .map((kol) => kol.lastSuccessAt)
    .filter((value): value is string => !!value)
    .sort()
  return dates[dates.length - 1] ?? (contentCount.value ? dataset.value.updatedAt : null)
})

const recentItems = computed(() =>
  visibleKols.value
    .flatMap((kol) =>
      matchingContent(kol).map((item) => ({ ...item, kolName: kol.name, platform: kol.platform })),
    )
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .slice(0, 60),
)

const stockMentions = computed(() => {
  const stocks = new Map<string, KolStockMention & { count: number }>()
  dataset.value.kols.forEach((kol) =>
    contentItems(kol).forEach((item) =>
      item.stocks.forEach((stock) => {
        const previous = stocks.get(`${stock.market}-${stock.code}`)
        stocks.set(`${stock.market}-${stock.code}`, {
          ...stock,
          count: (previous?.count ?? 0) + 1,
        })
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
const toggleAllVisible = () => {
  const visibleIds = visibleKols.value.map((kol) => kol.id)
  expandedKols.value = allVisibleExpanded.value
    ? expandedKols.value.filter((id) => !visibleIds.includes(id))
    : [...new Set([...expandedKols.value, ...visibleIds])]
}
const resetFilters = () => {
  query.value = ''
  activeGroup.value = 'all'
  activePlatform.value = 'all'
}

const formatDate = (value: string | null) => {
  if (!value || !Number.isFinite(Date.parse(value))) return t('kol.unknownDate')
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}
</script>

<template>
  <div class="kol-page" :class="{ embedded }">
    <header v-if="!embedded" class="page-heading">
      <div>
        <p>{{ t('kol.badge') }}</p>
        <h1>{{ t('kol.title') }}</h1>
      </div>
    </header>

    <div class="sync-bar" role="status">
      <span
        >{{ t('kol.lastSuccess') }} {{ formatDate(lastSuccessAt) }} ·
        {{ isDev ? t('kol.devSync') : t('kol.sync') }}</span
      >
      <span v-if="checking">{{ t('kol.checking') }}</span>
      <span v-else-if="needsLogin">{{
        t(localFallback ? 'kol.localLoginFallback' : 'kol.loginRequired')
      }}</span>
      <span v-else-if="localFallback">{{ t('kol.localFallback') }}</span>
      <span v-else-if="refreshError">{{ t('kol.checkFailed') }}</span>
      <button :disabled="checking" @click="refresh">{{ t('kol.checkNow') }}</button>
    </div>

    <section class="summary">
      <div>
        <span>{{ t('kol.monitors') }}</span
        ><strong>{{ dataset.kols.length }}</strong>
      </div>
      <div>
        <span>{{ t('kol.connected') }}</span
        ><strong>{{ syncedCount }}</strong>
      </div>
      <div>
        <span>{{ t('kol.parsed') }}</span
        ><strong>{{ contentCount }}</strong>
      </div>
      <div>
        <span>{{ t('kol.mentions') }}</span
        ><strong>{{ stockMentions.length }}</strong>
      </div>
    </section>

    <div class="toolbar">
      <input
        v-model="query"
        type="search"
        :placeholder="t('kol.searchPlaceholder')"
        :aria-label="t('kol.searchAria')"
      />
      <div class="filter-set" role="group" :aria-label="t('kol.groupFilter')">
        <span>{{ t('kol.groupFilter') }}</span>
        <div class="filter-options">
          <button
            :class="{ active: activeGroup === 'all' }"
            :aria-pressed="activeGroup === 'all'"
            @click="activeGroup = 'all'"
          >
            {{ t('kol.allGroups') }}
          </button>
          <button
            v-for="group in groups"
            :key="group"
            :class="{ active: activeGroup === group }"
            :aria-pressed="activeGroup === group"
            @click="activeGroup = group"
          >
            {{ groupLabel(group) }}
          </button>
        </div>
      </div>
      <div class="filter-set" role="group" :aria-label="t('kol.platformFilter')">
        <span>{{ t('kol.platformFilter') }}</span>
        <div class="filter-options">
          <button
            :class="{ active: activePlatform === 'all' }"
            :aria-pressed="activePlatform === 'all'"
            @click="activePlatform = 'all'"
          >
            {{ t('ui.navigation.allResources') }}
          </button>
          <button
            v-for="platform in platforms"
            :key="platform"
            :class="{ active: activePlatform === platform }"
            :aria-pressed="activePlatform === platform"
            @click="activePlatform = platform"
          >
            {{ platformNames[platform] }}
          </button>
        </div>
      </div>
    </div>

    <div class="reading-layout">
      <div class="reading-column">
        <section class="recent-feed" aria-labelledby="recent-feed-title">
          <header>
            <h2 id="recent-feed-title">{{ t('kol.recentTitle') }}</h2>
            <span>{{ t('kol.recentHint') }}</span>
          </header>
          <div v-if="recentItems.length" class="feed-list">
            <article
              v-for="item in recentItems"
              :key="`${item.kolName}-${item.id}`"
              class="feed-row"
            >
              <div class="feed-meta">
                <span class="feed-source"
                  >{{ item.kolName }} · {{ platformNames[item.platform] }}</span
                ><span class="feed-date">{{
                  item.publishedLabel || formatDate(item.publishedAt)
                }}</span>
              </div>
              <a :href="item.url" target="_blank" rel="noopener noreferrer"
                ><strong>{{ item.title }}</strong
                ><span aria-hidden="true">↗</span></a
              >
              <p v-if="item.description" class="feed-summary">{{ item.description }}</p>
            </article>
          </div>
          <div v-else class="empty">
            <p>{{ t('kol.noRecentContent') }}</p>
            <button
              v-if="query || activeGroup !== 'all' || activePlatform !== 'all'"
              @click="resetFilters"
            >
              {{ t('kol.clearFilters') }}
            </button>
          </div>
        </section>

        <section v-if="stockMentions.length" class="stock-radar">
          <header>
            <h2>{{ t('kol.mentionTitle') }}</h2>
            <span>{{ t('kol.mentionSort') }}</span>
          </header>
          <div class="stock-list">
            <span v-for="stock in stockMentions" :key="`${stock.market}-${stock.code}`">
              <b>{{ stock.name }}</b
              ><small
                >{{ stock.market }} · {{ stock.code }} ·
                {{ t('kol.contentCount', { count: stock.count }) }}</small
              >
            </span>
          </div>
        </section>
      </div>
      <aside class="subscription-panel" aria-labelledby="subscriptions-title">
        <header class="subscription-heading">
          <h2 id="subscriptions-title">{{ t('kol.subscriptionsTitle') }}</h2>
          <span>{{ visibleKols.length }} / {{ dataset.kols.length }}</span>
        </header>

        <div class="result-state" role="status">
          <button v-if="visibleKols.length" @click="toggleAllVisible">
            {{ allVisibleExpanded ? t('kol.collapseAll') : t('kol.expandAll') }}
          </button>
        </div>

        <div class="kol-list">
          <section v-for="kol in visibleKols" :key="kol.id" class="kol-card">
            <header>
              <button
                class="kol-toggle"
                :aria-expanded="expandedKols.includes(kol.id)"
                @click="toggleKol(kol.id)"
              >
                <span class="kol-name"
                  ><strong>{{ kol.name }}</strong
                  ><span class="kol-meta"
                    ><small
                      >{{ platformNames[kol.platform] }} ·
                      {{ t('kol.contentCount', { count: matchingContent(kol).length }) }}</small
                    ><span class="status" :class="kol.status">{{
                      t(`kol.status.${kol.status}`)
                    }}</span></span
                  ></span
                >
                <span class="arrow" :class="{ open: expandedKols.includes(kol.id) }">⌄</span>
              </button>
            </header>

            <div v-if="expandedKols.includes(kol.id)" class="content-list">
              <p v-if="kol.platform === 'x' && kol.status !== 'ok'" class="status-message">
                {{ t('kol.xNeedsCredentials') }}
              </p>
              <p class="status-message">{{ kol.statusMessage }}</p>
              <a
                v-for="item in matchingContent(kol)"
                :key="item.id"
                :href="item.url || kol.url"
                target="_blank"
                rel="noopener noreferrer"
                class="content-row"
              >
                <span class="date">{{ item.publishedLabel || formatDate(item.publishedAt) }}</span>
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
              <div v-if="!matchingContent(kol).length" class="empty">
                {{ t('kol.noContent') }}
              </div>
              <a class="kol-home" :href="kol.url" target="_blank" rel="noopener noreferrer"
                >{{ t('kol.home') }} ↗</a
              >
            </div>
          </section>
        </div>
      </aside>
    </div>

    <footer v-if="dataset.kols.length">
      {{ dataset.source }}{{ locale === 'en' ? '. ' : '。' }}{{ t('kol.footerNotice') }}
    </footer>
  </div>
</template>

<style scoped>
.kol-page {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 24px clamp(18px, 3vw, 40px) 64px;
}
.kol-page.embedded {
  width: 100%;
  padding: 0;
}
.page-heading p {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 11px;
}
.page-heading h1 {
  margin: 0;
  font:
    500 clamp(28px, 3vw, 38px) Georgia,
    'Songti SC',
    serif;
  text-wrap: balance;
}
.sync-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 0 0 10px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}
.sync-bar > span:first-child {
  flex: 1 1 360px;
}
.sync-bar button,
.empty button {
  min-height: 34px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.sync-bar button:disabled {
  opacity: 0.5;
  cursor: default;
}
.summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0 0 18px;
  border-block: 1px solid var(--border);
}
.summary > div {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 12px;
  border-right: 1px solid var(--border);
}
.summary > div:first-child {
  padding-left: 0;
}
.summary > div:last-child {
  border-right: 0;
}
.summary span {
  color: var(--muted);
  font-size: 11px;
}
.summary strong {
  font:
    600 18px Georgia,
    serif;
  font-variant-numeric: tabular-nums;
}
.toolbar {
  display: grid;
  grid-template-columns: minmax(210px, 1fr) auto auto;
  align-items: end;
  gap: 14px;
  margin: 0 0 24px;
}
.toolbar input {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
}
.filter-set > span {
  display: block;
  margin-bottom: 5px;
  color: var(--muted);
  font-size: 10px;
}
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.filter-options button {
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.filter-options button.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}
.reading-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}
.reading-column {
  min-width: 0;
}
.recent-feed > header,
.stock-radar > header,
.subscription-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.recent-feed > header {
  margin-bottom: 12px;
}
.recent-feed h2 {
  margin: 0;
  font:
    500 23px Georgia,
    'Songti SC',
    serif;
  text-wrap: balance;
}
.recent-feed header span,
.stock-radar header span,
.subscription-heading span {
  color: var(--muted);
  font-size: 11px;
}
.feed-list {
  border-top: 1px solid var(--ink);
}
.feed-row {
  padding: 17px 2px 18px;
  border-bottom: 1px solid var(--border);
}
.feed-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-bottom: 7px;
}
.feed-source,
.feed-date {
  color: var(--muted);
  font-size: 11px;
}
.feed-date {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.feed-row > a {
  display: flex;
  align-items: start;
  gap: 10px;
  color: var(--ink);
  text-decoration: none;
}
.feed-row > a strong {
  min-width: 0;
  flex: 1;
  font-size: 16px;
  line-height: 1.45;
  font-weight: 600;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
.feed-row > a span {
  color: var(--accent);
  font-size: 12px;
}
.feed-row > a:hover strong {
  color: var(--accent);
}
.feed-summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 7px 20px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
  text-wrap: pretty;
}
.stock-radar {
  margin-top: 26px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.stock-radar h2 {
  margin: 0;
  font:
    500 17px Georgia,
    'Songti SC',
    serif;
}
.stock-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 11px;
}
.stock-list > span {
  padding: 7px 9px;
  border-radius: 6px;
  background: var(--surface-soft);
}
.stock-list b,
.stock-list small {
  display: block;
}
.stock-list b {
  font-size: 11px;
}
.stock-list small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.subscription-panel {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid var(--border);
  overflow-y: auto;
}
.subscription-heading h2 {
  margin: 0;
  font:
    500 18px Georgia,
    'Songti SC',
    serif;
  text-wrap: balance;
}
.subscription-heading span {
  font-variant-numeric: tabular-nums;
}
.result-state {
  display: flex;
  justify-content: flex-end;
  min-height: 30px;
  margin: 3px 0 6px;
}
.result-state button {
  border: 0;
  background: none;
  color: var(--accent);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.kol-list {
  border-top: 1px solid var(--ink);
}
.kol-card {
  border-bottom: 1px solid var(--border);
}
.kol-card > header {
  display: flex;
  align-items: stretch;
  min-height: 61px;
}
.kol-toggle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 12px;
  align-items: start;
  gap: 7px;
  flex: 1;
  min-width: 0;
  padding: 10px 7px 10px 0;
  border: 0;
  background: none;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.kol-toggle:hover {
  background: var(--surface-soft);
}
.kol-name {
  min-width: 0;
}
.kol-name strong {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.kol-name small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kol-name strong {
  font-size: 12px;
  font-weight: 600;
}
.kol-name small {
  color: var(--muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.kol-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 8px;
  margin-top: 5px;
}
.status {
  padding: 4px 5px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
  white-space: nowrap;
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
  font-size: 14px;
}
.arrow.open {
  transform: rotate(180deg);
}
.kol-home {
  display: inline-flex;
  margin-top: 8px;
  padding: 6px 0;
  color: var(--muted);
  font-size: 10px;
  text-decoration: none;
}
.kol-home:hover {
  color: var(--accent);
}
.content-list {
  padding: 0 0 10px;
}
.status-message {
  margin: 0;
  padding: 0 6px 9px 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
.content-row {
  display: block;
  padding: 9px 5px;
  border-top: 1px solid var(--border);
  color: var(--ink);
  font-size: 11px;
  text-decoration: none;
}
.content-row:hover {
  background: var(--surface-soft);
}
.content-row .date {
  display: block;
  margin-bottom: 4px;
  color: var(--muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.content-copy {
  display: block;
}
.content-copy strong {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.content-copy small {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 4px;
  color: var(--muted);
  line-height: 1.4;
}
.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.stock-tags em {
  padding: 3px 5px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
  font-style: normal;
}
.empty {
  padding: 24px 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.empty p {
  margin: 0 0 10px;
  text-wrap: pretty;
}
footer {
  margin-top: 24px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
  text-wrap: pretty;
}
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@media (max-width: 1000px) {
  .toolbar {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 10px;
  }
  .filter-options {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
@media (max-width: 900px) {
  .reading-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .subscription-panel {
    position: static;
    max-height: none;
    padding: 22px 0 0;
    border-left: 0;
    border-top: 1px solid var(--border);
    overflow: visible;
  }
}
@media (max-width: 620px) {
  .kol-page {
    padding: 18px 14px 48px;
  }
  .kol-page.embedded {
    padding: 0;
  }
  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .summary > div {
    padding: 9px 8px;
  }
  .summary > div:nth-child(2) {
    border-right: 0;
  }
  .summary > div:nth-child(-n + 2) {
    border-bottom: 1px solid var(--border);
  }
  .sync-bar > span:first-child {
    flex-basis: 100%;
  }
  .recent-feed > header {
    display: block;
  }
  .recent-feed header span {
    display: block;
    margin-top: 5px;
  }
  .feed-row > a strong {
    font-size: 15px;
  }
}
</style>
