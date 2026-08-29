<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { navigationData } from '@/utils/data'
import type { LifelongBookCatalog, NavLink, NavTerm } from '@/types'
import { useI18n } from '@/composables/use-i18n'

const FAVORITES_KEY = 'finance-desk-favorites'
const query = ref('')
const categoryQuery = ref('')
const ACTIVE_ALL_TERM = 'all'
const ACTIVE_OVERVIEW_GROUP = 'overview'
const activeTerm = ref(ACTIVE_ALL_TERM)
const activeGroup = ref(ACTIVE_OVERVIEW_GROUP)
const expandedCategories = ref(false)
const favoritesOnly = ref(false)
const favoriteUrls = ref<string[]>([])
const sortMode = ref<'default' | 'title'>('default')
const contentMode = ref<'resources' | 'books'>('resources')
const bookCatalog = shallowRef<LifelongBookCatalog | null>(null)
const booksLoading = ref(false)
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

const groupDetails: Record<string, { icon: string; description: string }> = {
  开源应用: { icon: '⌘', description: '可安装、可自托管与专业工具' },
  终身成长: { icon: '↗', description: '从学习、生活到长期发展的能力地图' },
  认知入口: { icon: '◉', description: '理解世界、建立判断与减少信息差' },
  全球网站: { icon: '◎', description: '跨地区的信息、服务与公共入口' },
  语言学习: { icon: '文', description: '全球语言课程、练习资源与国际能力证书' },
  市场资讯: { icon: '⌁', description: '市场数据、财经资讯与股票研究入口' },
  加密生态: { icon: '◈', description: '链上平台、以太坊、身份与社区工具' },
  'AI 与开发': { icon: '✦', description: '人工智能、前端开发与在线效率工具' },
  创作与实用: { icon: '◇', description: '音视频创作与日常实用资源' },
}

const ageGuides: Record<
  string,
  { eyebrow: string; title: string; description: string; focuses: string[]; note: string }
> = {
  '终身成长 · 0-6岁早期发展': {
    eyebrow: '亲子陪伴优先',
    title: '从游戏、故事和真实互动开始',
    description: '优先选择可一起说、唱、画、搭建和活动身体的内容，不以提前完成学科课程为目标。',
    focuses: ['语言与绘本', '音乐与律动', '感官与手工', '情绪与习惯'],
    note: '建议短时、共同使用；看完动画或玩完 App 后，用复述、模仿或实物游戏把体验带回现实。',
  },
  '终身成长 · 6-12岁基础能力': {
    eyebrow: '兴趣探索阶段',
    title: '让孩子做出作品，而不只是完成练习',
    description: '从自然、美术、棋类、阅读和编程中轮换尝试，用小项目观察真正愿意持续投入的方向。',
    focuses: ['阅读与表达', '自然与科学', '艺术与创造', '逻辑与协作'],
    note: '每次选择一个主题，配合一次可展示的成果：观察记录、绘画、棋局复盘、动画或小程序。',
  },
  '终身成长 · 12-18岁科学探索': {
    eyebrow: '自主成长阶段',
    title: '把兴趣连接到真实项目和未来路径',
    description: '在科学、创作、技术、公民参与和职业体验中建立作品集，同时练习研究、沟通与自我管理。',
    focuses: ['项目与作品集', '研究与写作', '金融与生活技能', '专业与职业探索'],
    note: '鼓励青少年自己设定目标和复盘；涉及社区投稿、公开作品或账号互动时，先核对隐私与平台规则。',
  },
}

const standaloneTermGroups: Record<string, string> = {
  News: '市场资讯',
  Stock: '市场资讯',
  'Crypto Platform': '加密生态',
  ETH: '加密生态',
  'Social Contact': '加密生态',
  AI: 'AI 与开发',
  FE: 'AI 与开发',
  'Video & Audio': '创作与实用',
  Other: '创作与实用',
}

const standaloneTermLabels: Record<string, string> = {
  News: '新闻资讯',
  Stock: '股票市场',
  'Crypto Platform': '加密平台',
  ETH: '以太坊生态',
  'Social Contact': '社交与身份',
  AI: 'AI 工具',
  FE: '开发与在线工具',
  'Video & Audio': '音视频创作',
  Other: '日常实用',
}

const getGroupKey = (term: string): string => {
  if (term.includes(' · ')) return term.split(' · ')[0] ?? '创作与实用'
  return standaloneTermGroups[term] ?? '创作与实用'
}

const groups = computed(() => {
  const grouped = new Map<string, NavTerm[]>()
  terms.value.forEach((term) => {
    const key = getGroupKey(term.term)
    grouped.set(key, [...(grouped.get(key) ?? []), term])
  })

  return [...grouped.entries()].map(([key, groupTerms]) => ({
    key,
    icon: groupDetails[key]?.icon ?? '◇',
    description: groupDetails[key]?.description ?? '按主题浏览相关资源',
    terms: groupTerms,
    resourceCount: groupTerms.reduce((total, term) => total + term.links.length, 0),
  }))
})

const currentGroup = computed(() => groups.value.find((group) => group.key === activeGroup.value))
const scopedTerms = computed(() => currentGroup.value?.terms ?? terms.value)

const filteredCategories = computed(() => {
  const needle = categoryQuery.value.trim().toLocaleLowerCase()
  if (!needle) return scopedTerms.value
  return scopedTerms.value.filter((term) => term.term.toLocaleLowerCase().includes(needle))
})

const categoryPreviewLimit = 18
const visibleCategories = computed(() =>
  categoryQuery.value.trim() || expandedCategories.value
    ? filteredCategories.value
    : filteredCategories.value.slice(0, categoryPreviewLimit),
)

const visibleTerms = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()

  if (activeGroup.value === ACTIVE_OVERVIEW_GROUP && !needle && !favoritesOnly.value) {
    return []
  }

  return scopedTerms.value
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

const activeBookCategory = computed(() =>
  activeTerm.value.startsWith('终身成长 · ') ? activeTerm.value.replace('终身成长 · ', '') : null,
)

const activeBooks = computed(
  () =>
    bookCatalog.value?.categories.find((entry) => entry.category === activeBookCategory.value)
      ?.books ?? [],
)

const visibleBooks = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  const books = activeBooks.value.filter(
    (book) =>
      !needle ||
      [book.title, book.authors.join(' '), String(book.firstPublishYear ?? '')].some((value) =>
        value.toLocaleLowerCase().includes(needle),
      ),
  )

  return sortMode.value === 'title'
    ? [...books].sort((a, b) => a.title.localeCompare(b.title))
    : books
})

const displayedResultCount = computed(() =>
  contentMode.value === 'books' ? visibleBooks.value.length : resultCount.value,
)

const loadBookCatalog = async () => {
  if (bookCatalog.value || booksLoading.value) return
  booksLoading.value = true
  try {
    const module = await import('@/data/lifelong-books.json')
    bookCatalog.value = module.default as LifelongBookCatalog
  } catch (error) {
    console.error('Lifelong book catalog loading failed:', error)
  } finally {
    booksLoading.value = false
  }
}

const showBooks = () => {
  contentMode.value = 'books'
  void loadBookCatalog()
}

const isFavorite = (link: NavLink) => favoriteUrls.value.includes(link.url)

const toggleFavorite = (link: NavLink) => {
  favoriteUrls.value = isFavorite(link)
    ? favoriteUrls.value.filter((url) => url !== link.url)
    : [...favoriteUrls.value, link.url]
}

const selectTerm = (term: NavTerm | null) => {
  activeTerm.value = term?.term ?? ACTIVE_ALL_TERM
  contentMode.value = 'resources'
  if (term?.term.startsWith('终身成长 · ')) void loadBookCatalog()
  nextTick(() => document.querySelector('.content')?.scrollIntoView({ behavior: 'smooth' }))
}

const selectGroup = (group: string) => {
  activeGroup.value = group
  activeTerm.value = ACTIVE_ALL_TERM
  contentMode.value = 'resources'
  categoryQuery.value = ''
  expandedCategories.value = false
  nextTick(() => document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth' }))
}

const displayTermTitle = (term: string) => {
  if (standaloneTermLabels[term]) return standaloneTermLabels[term]
  if (activeGroup.value === ACTIVE_OVERVIEW_GROUP || !term.includes(' · ')) return term
  return term.split(' · ').slice(1).join(' · ')
}

const activeContext = computed(() => {
  if (activeTerm.value !== ACTIVE_ALL_TERM) return displayTermTitle(activeTerm.value)
  if (activeGroup.value !== ACTIVE_OVERVIEW_GROUP) return activeGroup.value
  return t('ui.navigation.all')
})

const activeAgeGuide = computed(() => ageGuides[activeTerm.value] ?? null)

const showOverview = computed(
  () => activeGroup.value === ACTIVE_OVERVIEW_GROUP && !query.value.trim() && !favoritesOnly.value,
)

const showGroupLanding = computed(
  () =>
    activeGroup.value !== ACTIVE_OVERVIEW_GROUP &&
    activeTerm.value === ACTIVE_ALL_TERM &&
    !query.value.trim() &&
    !favoritesOnly.value,
)

const resetFilters = () => {
  query.value = ''
  categoryQuery.value = ''
  activeGroup.value = ACTIVE_OVERVIEW_GROUP
  expandedCategories.value = false
  activeTerm.value = ACTIVE_ALL_TERM
  favoritesOnly.value = false
  sortMode.value = 'default'
  contentMode.value = 'resources'
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

    <nav class="group-switcher" :aria-label="t('ui.navigation.groupLabel')">
      <button
        :class="{ active: activeGroup === ACTIVE_OVERVIEW_GROUP }"
        :aria-pressed="activeGroup === ACTIVE_OVERVIEW_GROUP"
        @click="selectGroup(ACTIVE_OVERVIEW_GROUP)"
      >
        <span aria-hidden="true">⌂</span>
        {{ t('ui.navigation.overview') }}
      </button>
      <button
        v-for="group in groups"
        :key="group.key"
        :class="{ active: activeGroup === group.key }"
        :aria-pressed="activeGroup === group.key"
        @click="selectGroup(group.key)"
      >
        <span aria-hidden="true">{{ group.icon }}</span>
        {{ group.key }}
        <small>{{ group.terms.length }}</small>
      </button>
    </nav>

    <div class="workspace" :class="{ 'workspace--wide': activeGroup === ACTIVE_OVERVIEW_GROUP }">
      <aside
        v-if="activeGroup !== ACTIVE_OVERVIEW_GROUP"
        class="sidebar"
        :aria-label="t('ui.navigation.categoryLabel')"
      >
        <div class="sidebar-heading">
          <span>{{ activeGroup }}</span>
          <small>{{ scopedTerms.length }}</small>
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
            <span>{{ t('ui.navigation.groupAll') }}</span>
            <em>{{ currentGroup?.resourceCount ?? linkCount }}</em>
          </button>
          <button
            v-for="term in visibleCategories"
            :key="term.term"
            :class="{ active: activeTerm === term.term }"
            :aria-pressed="activeTerm === term.term"
            @click="selectTerm(term)"
          >
            <span>{{ displayTermTitle(term.term) }}</span>
            <em>{{ term.links.length }}</em>
          </button>
          <p v-if="!filteredCategories.length" class="category-empty">
            {{ t('ui.navigation.noCategory') }}
          </p>
        </div>

        <button
          v-if="!categoryQuery && filteredCategories.length > categoryPreviewLimit"
          class="category-more"
          type="button"
          @click="expandedCategories = !expandedCategories"
        >
          {{
            expandedCategories
              ? t('ui.navigation.showLess')
              : t('ui.navigation.showAllCategories', { count: filteredCategories.length })
          }}
        </button>

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
            v-if="contentMode === 'resources'"
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

        <section v-if="showOverview" class="group-overview">
          <div class="overview-heading">
            <div>
              <p>{{ t('ui.navigation.startEyebrow') }}</p>
              <h2>{{ t('ui.navigation.startTitle') }}</h2>
            </div>
            <span>{{ t('ui.navigation.startDescription') }}</span>
          </div>
          <div class="group-grid">
            <button v-for="group in groups" :key="group.key" @click="selectGroup(group.key)">
              <span class="group-icon" aria-hidden="true">{{ group.icon }}</span>
              <span class="group-copy">
                <strong>{{ group.key }}</strong>
                <small>{{ group.description }}</small>
              </span>
              <span class="group-stats">
                <b>{{ group.resourceCount }}</b>
                <small>{{ group.terms.length }} {{ t('ui.navigation.categoriesUnit') }}</small>
              </span>
              <span class="group-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section v-else-if="showGroupLanding" class="category-landing">
          <div class="overview-heading">
            <div>
              <p>{{ t('ui.navigation.chooseCategoryEyebrow') }}</p>
              <h2>{{ activeGroup }}</h2>
            </div>
            <span>{{ currentGroup?.description }}</span>
          </div>
          <div class="category-grid">
            <button v-for="term in visibleCategories" :key="term.term" @click="selectTerm(term)">
              <span>
                <strong>{{ displayTermTitle(term.term) }}</strong>
                <small>{{ term.links[0]?.description || t('ui.navigation.openCategory') }}</small>
              </span>
              <b>{{ term.links.length }}</b>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <button
            v-if="filteredCategories.length > categoryPreviewLimit"
            class="landing-more"
            type="button"
            @click="expandedCategories = !expandedCategories"
          >
            {{
              expandedCategories
                ? t('ui.navigation.showLess')
                : t('ui.navigation.showAllCategories', { count: filteredCategories.length })
            }}
          </button>
        </section>

        <div v-else class="result-meta" role="status" aria-live="polite">
          <div>
            <span>{{ activeContext }}</span>
            <button
              v-if="query || activeTerm !== ACTIVE_ALL_TERM || favoritesOnly"
              type="button"
              @click="resetFilters"
            >
              {{ t('ui.navigation.clearFilters') }}
            </button>
          </div>
          <span>{{ t('ui.navigation.resultCount', { count: displayedResultCount }) }}</span>
        </div>

        <div v-if="activeBookCategory && !showGroupLanding" class="content-tabs">
          <button
            :class="{ active: contentMode === 'resources' }"
            :aria-pressed="contentMode === 'resources'"
            @click="contentMode = 'resources'"
          >
            {{ t('ui.navigation.websiteResources') }}
            <span>{{ resultCount }}</span>
          </button>
          <button
            :class="{ active: contentMode === 'books' }"
            :aria-pressed="contentMode === 'books'"
            @click="showBooks"
          >
            {{ t('ui.navigation.bookCatalog') }}
            <span>{{ booksLoading ? '…' : activeBooks.length || 50 }}</span>
          </button>
        </div>

        <section v-if="activeAgeGuide && !showGroupLanding" class="age-guide">
          <div class="age-guide__marker" aria-hidden="true">◎</div>
          <div class="age-guide__content">
            <p>{{ activeAgeGuide.eyebrow }}</p>
            <h2>{{ activeAgeGuide.title }}</h2>
            <span>{{ activeAgeGuide.description }}</span>
            <ul aria-label="本年龄段培养重点">
              <li v-for="focus in activeAgeGuide.focuses" :key="focus">{{ focus }}</li>
            </ul>
            <small>{{ activeAgeGuide.note }}</small>
          </div>
        </section>

        <div
          v-if="visibleTerms.length && !showGroupLanding && contentMode === 'resources'"
          class="term-list"
        >
          <section v-for="term in visibleTerms" :key="term.term" class="term-section">
            <header>
              <h2>{{ displayTermTitle(term.term) }}</h2>
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

        <section v-else-if="contentMode === 'books' && activeBookCategory" class="book-catalog">
          <div v-if="booksLoading" class="book-loading">
            {{ t('ui.navigation.loadingBooks') }}
          </div>
          <template v-else>
            <div class="book-source-note">
              <div>
                <strong>{{ t('ui.navigation.bookSourceTitle') }}</strong>
                <p>{{ t('ui.navigation.bookSourceDescription') }}</p>
              </div>
              <a :href="bookCatalog?.source.url" target="_blank" rel="noopener noreferrer">
                Open Library ↗
              </a>
            </div>
            <div class="book-list">
              <a
                v-for="book in visibleBooks"
                :key="`${book.url}-${book.title}`"
                :href="book.url"
                target="_blank"
                rel="noopener noreferrer"
                class="book-row"
              >
                <span class="book-index">{{
                  String(visibleBooks.indexOf(book) + 1).padStart(2, '0')
                }}</span>
                <span class="book-copy">
                  <strong>{{ book.title }}</strong>
                  <small>{{ book.authors.join(' · ') }}</small>
                </span>
                <span class="book-meta">
                  <b>{{ book.firstPublishYear }}</b>
                  <small>{{
                    t('ui.navigation.editionsCount', { count: book.editionCount })
                  }}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </template>
        </section>

        <div
          v-else-if="!showOverview && !showGroupLanding && contentMode === 'resources'"
          class="empty-state"
        >
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

.group-switcher {
  margin-top: 14px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.group-switcher::-webkit-scrollbar {
  display: none;
}

.group-switcher button {
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.group-switcher button:hover {
  background: var(--surface-soft);
  color: var(--ink);
}

.group-switcher button.active {
  background: var(--ink);
  color: var(--surface);
}

.group-switcher small {
  opacity: 0.64;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.workspace {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  margin-top: 22px;
  min-height: calc(100vh - 72px);
  gap: clamp(24px, 4vw, 56px);
}

.workspace--wide {
  grid-template-columns: minmax(0, 1fr);
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

.category-more {
  min-height: 36px;
  margin: 8px 4px 0;
  border: 0;
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
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

.group-overview {
  padding-top: 22px;
}

.category-landing {
  padding-top: 22px;
}

.overview-heading {
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 440px);
  align-items: end;
  gap: 24px;
}

.overview-heading p {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.overview-heading h2 {
  margin: 0;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 500;
}

.overview-heading > span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.group-grid button {
  min-height: 116px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  color: var(--ink);
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto 18px;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.group-grid button:hover {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--border));
  background: var(--surface-elevated);
  transform: translateY(-2px);
}

.group-grid button:focus-visible,
.group-switcher button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.group-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-size: 17px;
}

.group-copy,
.group-copy strong,
.group-copy small,
.group-stats,
.group-stats small {
  display: block;
}

.group-copy strong {
  margin-bottom: 7px;
  font-size: 15px;
}

.group-copy small,
.group-stats small {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}

.group-stats {
  min-width: 62px;
  text-align: right;
}

.group-stats b {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 20px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.group-arrow {
  color: var(--muted);
  font-size: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.category-grid button {
  min-height: 96px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
  color: var(--ink);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 14px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
}

.category-grid button:hover {
  border-color: color-mix(in srgb, var(--accent) 36%, var(--border));
  background: var(--surface-elevated);
}

.category-grid strong,
.category-grid small {
  display: block;
}

.category-grid strong {
  margin-bottom: 7px;
  font-size: 13px;
}

.category-grid small {
  overflow: hidden;
  color: var(--muted);
  display: -webkit-box;
  font-size: 10px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.category-grid b {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 500;
}

.category-grid button > span:last-child {
  color: var(--muted);
}

.landing-more {
  width: 100%;
  min-height: 42px;
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.age-guide {
  margin: 16px 0 2px;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--border));
  border-radius: 13px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 72%, transparent), transparent 58%),
    var(--surface);
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

.age-guide__marker {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-size: 17px;
}

.age-guide__content p,
.age-guide__content h2,
.age-guide__content span,
.age-guide__content small {
  display: block;
}

.age-guide__content p {
  margin: 0 0 5px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.age-guide__content h2 {
  margin: 0 0 7px;
  font-family: Georgia, 'Songti SC', serif;
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 500;
}

.age-guide__content > span,
.age-guide__content small {
  color: var(--muted);
  line-height: 1.65;
}

.age-guide__content > span {
  font-size: 12px;
}

.age-guide__content ul {
  margin: 13px 0 11px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  list-style: none;
}

.age-guide__content li {
  padding: 5px 9px;
  border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-elevated) 86%, transparent);
  color: var(--ink);
  font-size: 10px;
}

.age-guide__content small {
  padding-left: 10px;
  border-left: 2px solid color-mix(in srgb, var(--accent) 42%, var(--border));
  font-size: 10px;
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

.content-tabs {
  margin-bottom: 14px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  display: inline-flex;
  gap: 4px;
}

.content-tabs button {
  min-height: 36px;
  padding: 0 13px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}

.content-tabs button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--ink) 9%, transparent);
}

.content-tabs span {
  margin-left: 7px;
  color: var(--muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.book-catalog {
  display: grid;
  gap: 12px;
}

.book-source-note {
  padding: 15px 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--border));
  border-radius: 11px;
  background: var(--accent-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.book-source-note strong {
  font-size: 12px;
}

.book-source-note p {
  max-width: 72ch;
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}

.book-source-note a {
  color: var(--accent);
  flex: 0 0 auto;
  font-size: 11px;
  text-decoration: none;
}

.book-list {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.book-row {
  min-height: 70px;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 92px 16px;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.book-row:last-child {
  border-bottom: 0;
}

.book-row:hover {
  background: var(--surface-elevated);
}

.book-index {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
}

.book-copy,
.book-copy strong,
.book-copy small,
.book-meta,
.book-meta small {
  min-width: 0;
  display: block;
}

.book-copy strong {
  margin-bottom: 5px;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 14px;
  font-weight: 500;
}

.book-copy small,
.book-meta small {
  overflow: hidden;
  color: var(--muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  text-align: right;
}

.book-meta b {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 500;
}

.book-loading {
  padding: 64px 20px;
  border: 1px dashed var(--border);
  border-radius: 11px;
  color: var(--muted);
  text-align: center;
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

  .group-switcher {
    margin-right: calc(var(--page-gutter) * -1);
    margin-left: calc(var(--page-gutter) * -1);
    padding-right: var(--page-gutter);
    padding-left: var(--page-gutter);
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .overview-heading {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .group-grid {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }

  .group-grid button {
    min-height: 104px;
    padding: 16px;
    grid-template-columns: 34px minmax(0, 1fr) auto;
  }

  .group-icon {
    width: 34px;
    height: 34px;
  }

  .group-arrow {
    display: none;
  }

  .book-source-note {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .book-row {
    padding: 12px;
    grid-template-columns: 24px minmax(0, 1fr) 14px;
  }

  .book-meta {
    display: none;
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

  .age-guide {
    padding: 16px;
    grid-template-columns: 1fr;
  }

  .age-guide__content ul {
    margin-top: 11px;
  }

  .age-guide__content li {
    padding: 5px 8px;
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

  .group-grid button {
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
