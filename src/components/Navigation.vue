<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigationData } from '@/utils/data'
import type { NavLink, NavTerm } from '@/types'

const FAVORITES_KEY = 'finance-desk-favorites'
const query = ref('')
const activeTerm = ref('全部')
const favoritesOnly = ref(false)
const favoriteUrls = ref<string[]>([])

const terms = computed(() => navigationData.flatMap((taxonomy) => taxonomy.list))
const linkCount = computed(() => terms.value.reduce((total, term) => total + term.links.length, 0))

const visibleTerms = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()

  return terms.value
    .filter((term) => activeTerm.value === '全部' || term.term === activeTerm.value)
    .map((term) => ({
      ...term,
      links: term.links.filter((link) => {
        const matchesQuery =
          !needle ||
          [link.title, link.description, link.url].some((value) =>
            value?.toLocaleLowerCase().includes(needle),
          )
        const matchesFavorite = !favoritesOnly.value || favoriteUrls.value.includes(link.url)
        return matchesQuery && matchesFavorite
      }),
    }))
    .filter((term) => term.links.length > 0)
})

const resultCount = computed(() =>
  visibleTerms.value.reduce((total, term) => total + term.links.length, 0),
)

const isFavorite = (link: NavLink) => favoriteUrls.value.includes(link.url)

const toggleFavorite = (link: NavLink) => {
  favoriteUrls.value = isFavorite(link)
    ? favoriteUrls.value.filter((url) => url !== link.url)
    : [...favoriteUrls.value, link.url]
}

const selectTerm = (term: NavTerm | null) => {
  activeTerm.value = term?.term ?? '全部'
}

const getHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
    favoriteUrls.value = Array.isArray(saved) ? saved : []
  } catch {
    favoriteUrls.value = []
  }
})

watch(
  favoriteUrls,
  (urls) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(urls))
  },
  { deep: true },
)
</script>

<template>
  <section class="workspace">
    <aside class="sidebar">
      <div class="sidebar-heading">
        <span>资源视图</span>
        <small>{{ linkCount }} 个站点</small>
      </div>

      <button :class="{ active: activeTerm === '全部' }" @click="selectTerm(null)">
        <span>全部资源</span><em>{{ linkCount }}</em>
      </button>
      <button
        v-for="term in terms"
        :key="term.term"
        :class="{ active: activeTerm === term.term }"
        @click="selectTerm(term)"
      >
        <span>{{ term.term }}</span
        ><em>{{ term.links.length }}</em>
      </button>

      <div class="sidebar-note">
        <strong>使用提示</strong>
        <p>搜索名称、描述或域名。星标保存在当前浏览器中。</p>
      </div>
    </aside>

    <div class="content">
      <div class="toolbar">
        <label class="search-box">
          <span>搜索</span>
          <input v-model="query" type="search" placeholder="输入站点、用途或域名…" />
        </label>
        <button
          class="favorite-filter"
          :class="{ active: favoritesOnly }"
          @click="favoritesOnly = !favoritesOnly"
        >
          <span aria-hidden="true">☆</span>
          只看星标
          <b>{{ favoriteUrls.length }}</b>
        </button>
      </div>

      <div class="result-meta">
        <span>{{ activeTerm }}</span>
        <span>{{ resultCount }} 项结果</span>
      </div>

      <div v-if="visibleTerms.length" class="term-list">
        <section v-for="term in visibleTerms" :key="term.term" class="term-section">
          <header>
            <h2>{{ term.term }}</h2>
            <span>{{ term.links.length }}</span>
          </header>

          <div class="link-list">
            <article v-for="link in term.links" :key="link.url" class="link-row">
              <a :href="link.url" target="_blank" rel="noopener noreferrer">
                <span class="link-copy">
                  <strong>{{ link.title }}</strong>
                  <small>{{ link.description || getHost(link.url) }}</small>
                </span>
                <span class="link-host">{{ getHost(link.url) }}</span>
                <span class="open-mark" aria-hidden="true">↗</span>
              </a>
              <button
                class="star-button"
                :class="{ saved: isFavorite(link) }"
                :aria-label="isFavorite(link) ? `取消收藏 ${link.title}` : `收藏 ${link.title}`"
                @click="toggleFavorite(link)"
              >
                {{ isFavorite(link) ? '★' : '☆' }}
              </button>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="empty-state">
        <strong>没有匹配的资源</strong>
        <p>换个关键词，或关闭“只看星标”。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.workspace {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  max-width: 1440px;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
}

.sidebar {
  padding: 32px 20px;
  border-right: 1px solid var(--border);
}

.sidebar-heading {
  padding: 0 10px 18px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-heading small {
  letter-spacing: normal;
  text-transform: none;
}

.sidebar > button {
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
}

.sidebar > button:hover,
.sidebar > button.active {
  background: var(--surface-soft);
  color: var(--ink);
}

.sidebar em {
  font-size: 11px;
  font-style: normal;
}

.sidebar-note {
  margin: 30px 10px 0;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.sidebar-note strong {
  color: var(--ink);
}

.content {
  min-width: 0;
  padding: 32px clamp(20px, 4vw, 60px) 72px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.search-box {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.search-box > span {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
}

.search-box input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  flex: 1;
}

.favorite-filter {
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
}

.favorite-filter.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.favorite-filter b {
  margin-left: 7px;
  font-size: 11px;
}

.result-meta {
  padding: 22px 2px 12px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
}

.term-list {
  display: grid;
  gap: 30px;
}

.term-section > header {
  margin-bottom: 8px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.term-section h2 {
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 20px;
  font-weight: 500;
}

.term-section header span {
  color: var(--muted);
  font-size: 11px;
}

.link-list {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.link-row {
  min-height: 72px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: stretch;
}

.link-row:last-child {
  border-bottom: 0;
}

.link-row > a {
  min-width: 0;
  padding: 14px 16px;
  color: var(--ink);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 220px) 20px;
  align-items: center;
  gap: 16px;
  flex: 1;
  text-decoration: none;
}

.link-row:hover {
  background: var(--surface-elevated);
}

.link-copy {
  min-width: 0;
}

.link-copy strong,
.link-copy small {
  display: block;
}

.link-copy strong {
  margin-bottom: 5px;
  font-size: 14px;
}

.link-copy small {
  overflow: hidden;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-host {
  overflow: hidden;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-mark {
  color: var(--muted);
}

.star-button {
  width: 48px;
  border: 0;
  border-left: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 19px;
}

.star-button:hover {
  border-left-color: var(--border);
  background: var(--surface-soft);
}

.star-button.saved {
  color: var(--warning);
}

.empty-state {
  padding: 72px 24px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  color: var(--muted);
  text-align: center;
}

.empty-state strong {
  color: var(--ink);
}

@media (max-width: 760px) {
  .workspace {
    display: block;
  }

  .sidebar {
    padding: 14px 18px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 6px;
    overflow-x: auto;
  }

  .sidebar-heading,
  .sidebar-note {
    display: none;
  }

  .sidebar > button {
    width: auto;
    flex: 0 0 auto;
    gap: 8px;
  }

  .content {
    padding-top: 20px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .favorite-filter {
    height: 40px;
  }

  .link-row > a {
    grid-template-columns: minmax(0, 1fr) 18px;
  }

  .link-host {
    display: none;
  }
}
</style>
