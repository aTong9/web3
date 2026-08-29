<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { navigationData } from '@/utils/data'
import type { NavLink, NavTerm } from '@/types'
import { useI18n } from '@/composables/use-i18n'

const FAVORITES_KEY = 'finance-desk-favorites'
const query = ref('')
const categoryQuery = ref('')
const ACTIVE_ALL_TERM = 'all'
const activeTerm = ref(ACTIVE_ALL_TERM)
const favoritesOnly = ref(false)
const favoriteUrls = ref<string[]>([])
const sortMode = ref<'default' | 'title'>('default')
const searchInput = ref<HTMLInputElement | null>(null)
const { t } = useI18n()

const terms = computed(() => navigationData.flatMap((taxonomy) => taxonomy.list))
const linkCount = computed(() => terms.value.reduce((total, term) => total + term.links.length, 0))
const categoryCount = computed(() => terms.value.length)
const githubCount = computed(() =>
  terms.value.reduce(
    (total, term) => total + term.links.filter((link) => getHost(link.url) === 'github.com').length,
    0,
  ),
)

const filteredCategories = computed(() => {
  const needle = categoryQuery.value.trim().toLocaleLowerCase()
  if (!needle) return terms.value
  return terms.value.filter((term) => term.term.toLocaleLowerCase().includes(needle))
})

const visibleTerms = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()

  return terms.value
    .filter((term) => activeTerm.value === ACTIVE_ALL_TERM || term.term === activeTerm.value)
    .map((term) => {
      const links = term.links.filter((link) => {
        const matchesQuery =
          !needle ||
          [link.title, link.description, link.url].some((value) =>
            value?.toLocaleLowerCase().includes(needle),
          )
        const matchesFavorite = !favoritesOnly.value || favoriteUrls.value.includes(link.url)
        return matchesQuery && matchesFavorite
      })

      return {
        ...term,
        links:
          sortMode.value === 'title'
            ? [...links].sort((a, b) => a.title.localeCompare(b.title))
            : links,
      }
    })
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
  activeTerm.value = term?.term ?? ACTIVE_ALL_TERM
  nextTick(() => document.querySelector('.content')?.scrollIntoView({ behavior: 'smooth' }))
}

const resetFilters = () => {
  query.value = ''
  activeTerm.value = ACTIVE_ALL_TERM
  favoritesOnly.value = false
  sortMode.value = 'default'
}

const focusSearch = (event: KeyboardEvent) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
  event.preventDefault()
  searchInput.value?.focus()
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
  window.addEventListener('keydown', focusSearch)
})

onUnmounted(() => window.removeEventListener('keydown', focusSearch))

watch(
  favoriteUrls,
  (urls) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(urls))
  },
  { deep: true },
)
</script>

<template>
  <section class="resource-shell">
    <header class="catalog-summary">
      <div>
        <p>{{ t('ui.navigation.catalogEyebrow') }}</p>
        <h1>{{ t('ui.navigation.catalogTitle') }}</h1>
        <span>{{ t('ui.navigation.catalogDescription') }}</span>
      </div>
      <dl>
        <div>
          <dt>{{ t('ui.navigation.resourcesStat') }}</dt>
          <dd>{{ linkCount }}</dd>
        </div>
        <div>
          <dt>{{ t('ui.navigation.categoriesStat') }}</dt>
          <dd>{{ categoryCount }}</dd>
        </div>
        <div>
          <dt>GitHub</dt>
          <dd>{{ githubCount }}</dd>
        </div>
      </dl>
    </header>

    <div class="workspace">
      <aside class="sidebar" :aria-label="t('ui.navigation.resourceView')">
        <div class="sidebar-heading">
          <span>{{ t('ui.navigation.resourceView') }}</span>
          <small>{{ categoryCount }}</small>
        </div>

        <label class="category-search">
          <span class="sr-only">{{ t('ui.navigation.categorySearch') }}</span>
          <input
            v-model="categoryQuery"
            type="search"
            :placeholder="t('ui.navigation.categorySearch')"
          />
        </label>

        <div class="category-list">
          <button
            :class="{ active: activeTerm === ACTIVE_ALL_TERM }"
            :aria-pressed="activeTerm === ACTIVE_ALL_TERM"
            @click="selectTerm(null)"
          >
            <span>{{ t('ui.navigation.allResources') }}</span
            ><em>{{ linkCount }}</em>
          </button>
          <button
            v-for="term in filteredCategories"
            :key="term.term"
            :class="{ active: activeTerm === term.term }"
            :aria-pressed="activeTerm === term.term"
            @click="selectTerm(term)"
          >
            <span>{{ term.term }}</span
            ><em>{{ term.links.length }}</em>
          </button>
          <p v-if="!filteredCategories.length" class="category-empty">
            {{ t('ui.navigation.noCategory') }}
          </p>
        </div>

        <div class="sidebar-note">
          <strong>{{ t('ui.navigation.tipTitle') }}</strong>
          <p>{{ t('ui.navigation.tipText') }}</p>
        </div>
      </aside>

      <div class="content">
        <div class="toolbar">
          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              ref="searchInput"
              v-model="query"
              type="search"
              :aria-label="t('ui.navigation.searchLabel')"
              :placeholder="t('ui.navigation.searchPlaceholder')"
            />
            <kbd>/</kbd>
          </label>
          <button
            class="favorite-filter"
            :class="{ active: favoritesOnly }"
            @click="favoritesOnly = !favoritesOnly"
          >
            <span aria-hidden="true">☆</span>
            {{ t('ui.navigation.favoriteOnly') }}
            <b>{{ favoriteUrls.length }}</b>
          </button>
          <label class="sort-control">
            <span class="sr-only">{{ t('ui.navigation.sortLabel') }}</span>
            <select v-model="sortMode" :aria-label="t('ui.navigation.sortLabel')">
              <option value="default">{{ t('ui.navigation.sortDefault') }}</option>
              <option value="title">{{ t('ui.navigation.sortTitle') }}</option>
            </select>
          </label>
        </div>

        <div class="result-meta" role="status" aria-live="polite">
          <div>
            <span>{{ activeTerm === ACTIVE_ALL_TERM ? t('ui.navigation.all') : activeTerm }}</span>
            <button
              v-if="query || activeTerm !== ACTIVE_ALL_TERM || favoritesOnly"
              type="button"
              @click="resetFilters"
            >
              {{ t('ui.navigation.clearFilters') }}
            </button>
          </div>
          <span>{{ t('ui.navigation.resultCount', { count: resultCount }) }}</span>
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
          <strong>{{ t('ui.navigation.noMatch') }}</strong>
          <p>{{ t('ui.navigation.noMatchTips') }}</p>
          <button type="button" @click="resetFilters">清除筛选</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.resource-shell {
  margin-top: 24px;
}

.catalog-summary {
  overflow: hidden;
  position: relative;
  padding: clamp(22px, 3vw, 36px);
  border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border));
  border-radius: 18px;
  background:
    radial-gradient(
      circle at 88% 12%,
      color-mix(in srgb, var(--accent) 16%, transparent),
      transparent 38%
    ),
    var(--surface);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 32px;
}

.catalog-summary p {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.catalog-summary h1 {
  max-width: 720px;
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(24px, 3vw, 38px);
  font-weight: 500;
  letter-spacing: -0.025em;
  line-height: 1.15;
  text-wrap: balance;
}

.catalog-summary > div > span {
  max-width: 64ch;
  margin-top: 12px;
  color: var(--muted);
  display: block;
  font-size: 13px;
  line-height: 1.7;
}

.catalog-summary dl {
  margin: 0;
  display: flex;
  gap: clamp(20px, 3vw, 42px);
}

.catalog-summary dl div {
  min-width: 76px;
}

.catalog-summary dt {
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-summary dd {
  margin: 5px 0 0;
  color: var(--ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: clamp(22px, 2.4vw, 32px);
  font-variant-numeric: tabular-nums;
}

.workspace {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  margin-top: 22px;
  min-height: calc(100vh - 72px);
  gap: clamp(24px, 4vw, 56px);
}

.sidebar {
  max-height: calc(100dvh - 104px);
  padding-right: 12px;
  position: sticky;
  top: 88px;
  align-self: start;
  display: flex;
  flex-direction: column;
}

.sidebar-heading {
  padding: 0 8px 12px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-heading small {
  font-variant-numeric: tabular-nums;
  letter-spacing: normal;
  text-transform: none;
}

.category-search {
  margin-bottom: 8px;
}

.category-search input {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: 0;
  background: var(--surface);
  color: var(--ink);
  font-size: 13px;
}

.category-search input:focus-visible,
.search-box:focus-within,
.sort-control:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.category-list {
  min-height: 160px;
  padding-right: 4px;
  overflow-y: auto;
  scrollbar-color: var(--border) transparent;
  scrollbar-width: thin;
}

.category-list button {
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
}

.category-list button:hover,
.category-list button.active {
  background: var(--surface-soft);
  color: var(--ink);
}

.category-list button.active {
  box-shadow: inset 3px 0 var(--accent);
}

.sidebar em {
  font-size: 11px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}

.category-empty {
  padding: 18px 8px;
  color: var(--muted);
  font-size: 12px;
}

.sidebar-note {
  margin: 16px 8px 0;
  padding-top: 14px;
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
  padding-bottom: 72px;
}

.toolbar {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  position: sticky;
  top: 76px;
  z-index: 2;
  display: flex;
  gap: 12px;
  backdrop-filter: blur(16px);
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
  font-size: 21px;
  color: var(--muted);
}

.search-box input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  flex: 1;
  font-size: 14px;
}

.search-box kbd {
  min-width: 22px;
  height: 22px;
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--muted);
  display: grid;
  place-items: center;
  font:
    11px ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
}

.favorite-filter,
.sort-control select {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}

.favorite-filter {
  white-space: nowrap;
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

.sort-control select {
  outline: 0;
}

.favorite-filter,
.star-button,
.category-list button,
.result-meta button,
.link-row {
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.favorite-filter:active,
.star-button:active,
.category-list button:active,
.result-meta button:active {
  transform: translateY(1px);
}

.favorite-filter:focus-visible,
.star-button:focus-visible,
.category-list button:focus-visible,
.result-meta button:focus-visible,
.link-row a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.result-meta {
  padding: 20px 2px 12px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
}

.result-meta div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-meta div > span {
  color: var(--ink);
  font-weight: 600;
}

.result-meta button {
  min-height: 30px;
  padding: 0 9px;
  border: 0;
  border-radius: 6px;
  background: var(--surface-soft);
  color: var(--muted);
  cursor: pointer;
  font-size: 11px;
}

.term-list {
  display: grid;
  gap: 36px;
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
  font-size: 21px;
  font-weight: 500;
}

.term-section header span {
  color: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.link-list {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
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

.link-row:has(a:focus-visible) {
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
  font-weight: 600;
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

.empty-state button {
  min-height: var(--control-height);
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}

@media (max-width: 960px) {
  .catalog-summary {
    grid-template-columns: 1fr;
  }

  .catalog-summary dl {
    padding-top: 18px;
    border-top: 1px solid var(--border);
  }

  .workspace {
    display: block;
    min-height: 0;
  }

  .sidebar {
    max-height: none;
    padding: 0;
    position: static;
  }

  .sidebar-heading,
  .sidebar-note,
  .category-search {
    display: none;
  }

  .category-list {
    min-height: 0;
    margin: 0 calc(var(--page-gutter) * -1);
    padding: 0 var(--page-gutter) 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
  }

  .category-list button {
    width: auto;
    min-height: 44px;
    flex: 0 0 auto;
    gap: 8px;
  }

  .category-list button.active {
    box-shadow: inset 0 -3px var(--accent);
  }

  .content {
    padding-top: 14px;
  }

  .toolbar {
    top: 68px;
  }
}

@media (max-width: 640px) {
  .resource-shell {
    margin-top: 16px;
  }

  .catalog-summary {
    padding: 20px;
    border-radius: 14px;
  }

  .catalog-summary dl {
    justify-content: space-between;
    gap: 10px;
  }

  .catalog-summary dl div {
    min-width: 0;
  }

  .catalog-summary dt {
    font-size: 9px;
  }

  .workspace {
    margin-top: 14px;
  }

  .toolbar {
    padding: 8px;
    align-items: stretch;
    flex-wrap: wrap;
  }

  .search-box {
    flex-basis: 100%;
  }

  .search-box kbd {
    display: none;
  }

  .favorite-filter {
    flex: 1;
  }

  .sort-control {
    flex: 1;
  }

  .sort-control select {
    width: 100%;
  }

  .link-row > a {
    padding: 13px 12px;
    grid-template-columns: minmax(0, 1fr) 18px;
    gap: 8px;
  }

  .link-host {
    display: none;
  }

  .star-button {
    width: 44px;
  }

  .result-meta {
    align-items: flex-end;
  }
}

@media (hover: hover) {
  .link-row:hover .open-mark {
    color: var(--accent);
    transform: translate(2px, -2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .favorite-filter,
  .star-button,
  .category-list button,
  .result-meta button,
  .link-row {
    transition: none;
  }
}

.sr-only {
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
