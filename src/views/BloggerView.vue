<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/use-i18n'

const { embedded = false } = defineProps<{ embedded?: boolean }>()

interface NewsSite {
  id: string
  name: string
  url: string
  category: string
  description: string
}

const query = ref('')
const { t } = useI18n()

const newsSites: NewsSite[] = [
  {
    id: 'xueqiu',
    name: '雪球',
    url: 'https://xueqiu.com/hot/stock',
    category: '市场社区',
    description: '投资者社区、实时行情与热门讨论。',
  },
  {
    id: 'moomoo',
    name: 'moomoo',
    url: 'https://www.futunn.com/quote/us/most-active-stocks?chain_id=AyJZw--hDyOg-Z.1ku4g7u&global_content=%7B%22promote_id%22%3A13766,%22sub_promote_id%22%3A2,%22f%22%3A%22nn%2Fquote%2Fhk%22,%22b%22%3A%22Tab_%E4%B8%80%E7%BA%A7_Markets%22%7D',
    category: '行情',
    description: '美股活跃股票榜单与市场数据。',
  },
  {
    id: 'jinshi',
    name: '金十数据',
    url: 'https://www.jin10.com',
    category: '快讯',
    description: '全球宏观事件、财经快讯与经济数据。',
  },
  {
    id: 'earnings',
    name: '美股财报日历',
    url: 'https://longbridge.com/zh-CN/calendar/report',
    category: '财报',
    description: '按日期查看美股公司的财报安排。',
  },
  {
    id: 'xiaohongshu',
    name: '所有的烦恼都源于你穷',
    url: 'https://www.xiaohongshu.com/user/profile/61ba0abd0000000010008ffa?xsec_token=ABYP-ltqZbgdKeOY8Rn2QdgOgyYW_VwU0vEB6WxsyBQjw%3D&xsec_source=pc_search',
    category: '关注账号',
    description: '小红书个人主页。',
  },
]

const visibleSites = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return newsSites
  return newsSites.filter((site) =>
    [site.name, site.category, site.description].some((text) =>
      text.toLocaleLowerCase().includes(needle),
    ),
  )
})

const getHost = (url: string) => new URL(url).hostname.replace(/^www\./, '')
</script>

<template>
  <div class="desk-page" :class="{ embedded }">
    <header v-if="!embedded" class="page-heading">
      <p>{{ t('blogger.badge') }}</p>
      <h1>{{ t('blogger.heading') }}</h1>
      <div class="heading-row">
        <span>{{ t('blogger.desc') }}</span>
        <input
          v-model="query"
          type="search"
          :placeholder="t('blogger.searchPlaceholder')"
          aria-label="筛选资讯源"
        />
      </div>
    </header>

    <section v-else class="embedded-heading">
      <div>
        <h2>{{ t('blogger.heading') }}</h2>
        <p>{{ t('blogger.desc') }}</p>
      </div>
      <input
        v-model="query"
        type="search"
        :placeholder="t('blogger.searchPlaceholder')"
        :aria-label="t('blogger.filterAria')"
      />
    </section>

    <component :is="embedded ? 'section' : 'main'" class="source-list">
      <a
        v-for="(site, index) in visibleSites"
        :key="site.id"
        :href="site.url"
        target="_blank"
        rel="noopener noreferrer"
        class="source-row"
      >
        <span class="number">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="source-copy">
          <strong>{{ site.name }}</strong>
          <small>{{ site.description }}</small>
        </span>
        <span class="category">{{ site.category }}</span>
        <span class="host">{{ getHost(site.url) }}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </component>
  </div>
</template>

<style scoped>
.desk-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 64px clamp(20px, 5vw, 72px) 80px;
}
.desk-page.embedded {
  max-width: none;
  padding: 0;
}
.embedded-heading {
  margin-bottom: 24px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.embedded-heading h2 {
  margin: 0 0 6px;
  font: 500 24px Georgia, 'Songti SC', serif;
}
.embedded-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.embedded-heading input {
  width: min(280px, 100%);
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
}

.page-heading {
  margin-bottom: 54px;
}

.page-heading > p {
  margin: 0 0 16px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 26px;
  font-family: Georgia, "Songti SC", serif;
  font-size: clamp(42px, 7vw, 76px);
  font-weight: 400;
}

.heading-row {
  border-top: 1px solid var(--border);
  padding-top: 18px;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  font-size: 13px;
}

.heading-row input {
  width: min(280px, 100%);
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
}

.source-list {
  border-top: 1px solid var(--ink);
}

.source-row {
  min-height: 94px;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  display: grid;
  grid-template-columns: 36px minmax(220px, 1fr) 100px minmax(140px, 220px) 20px;
  align-items: center;
  gap: 18px;
  text-decoration: none;
}

.source-row:hover {
  padding: 0 10px;
  background: var(--surface);
}

.number,
.category,
.host {
  color: var(--muted);
  font-size: 11px;
}

.host {
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-copy strong,
.source-copy small {
  display: block;
}

.source-copy strong {
  margin-bottom: 6px;
  font-family: Georgia, "Songti SC", serif;
  font-size: 18px;
  font-weight: 500;
}

.source-copy small {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 700px) {
  .embedded-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .embedded-heading input {
    width: 100%;
  }
  .heading-row {
    align-items: stretch;
    flex-direction: column;
  }

  .heading-row input {
    width: 100%;
  }

  .source-row {
    padding: 16px 0;
    grid-template-columns: 28px minmax(0, 1fr) 18px;
  }

  .category,
  .host {
    display: none;
  }
}
</style>
