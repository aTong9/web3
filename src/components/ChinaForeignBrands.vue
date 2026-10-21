<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/composables/use-i18n'
import brands from '@/data/china-foreign-brands.json'

const { locale, t } = useI18n()
const key = (name: string) => t(`chinaDemography.${name}`)
const category = ref('all')
const query = ref('')
const categories = [
  'all',
  'grocery',
  'food',
  'home',
  'electronics',
  'personal',
  'beauty',
  'healthcare',
  'family',
  'sport',
  'apparel',
  'dining',
  'hospitality',
  'leisure',
  'mobility',
]
const shownCount = ref(12)
const visibleBrands = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  return brands.filter(
    (brand) =>
      (category.value === 'all' || brand.category === category.value) &&
      (!term ||
        [brand.nameZh, brand.nameEn, brand.layoutZh, brand.layoutEn, brand.originZh, brand.originEn]
          .join(' ')
          .toLocaleLowerCase()
          .includes(term)),
  )
})
const shownBrands = computed(() => visibleBrands.value.slice(0, shownCount.value))
const categoryCount = (value: string) =>
  value === 'all' ? brands.length : brands.filter((brand) => brand.category === value).length
watch([category, query], () => {
  shownCount.value = 12
})
const clearFilters = () => {
  category.value = 'all'
  query.value = ''
}
</script>

<template>
  <section class="brand-observer" :aria-label="key('brandsTab')">
    <div class="intro">
      <div class="summary">
        <span
          ><strong>{{ brands.length }}</strong> {{ key('brandsCount') }}</span
        >
        <span
          ><strong>{{ categories.length - 1 }}</strong> {{ key('brandsCategoriesCount') }}</span
        >
      </div>
    </div>
    <div class="filters panel">
      <div class="search-row">
        <label>
          {{ key('brandsSearch') }}
          <input v-model="query" type="search" :placeholder="key('brandsSearchHint')" />
        </label>
        <button
          v-if="category !== 'all' || query"
          class="clear"
          type="button"
          @click="clearFilters"
        >
          {{ key('brandsClear') }}
        </button>
      </div>
      <div class="category-filter">
        <p>{{ key('brandsCategory') }}</p>
        <div class="category-list" role="group" :aria-label="key('brandsCategory')">
          <button
            v-for="value in categories"
            :key="value"
            type="button"
            :aria-pressed="category === value"
            @click="category = value"
          >
            {{ key(`brandsCategory_${value}`) }} <span>{{ categoryCount(value) }}</span>
          </button>
        </div>
      </div>
    </div>
    <p class="result-count" role="status">
      {{
        t('chinaDemography.brandsResult', {
          count: visibleBrands.length,
          shown: shownBrands.length,
        })
      }}
    </p>
    <div v-if="visibleBrands.length" class="brand-grid">
      <article v-for="brand in shownBrands" :key="brand.id" class="brand-card panel">
        <div class="brand-top">
          <div>
            <span class="category">{{ key(`brandsCategory_${brand.category}`) }}</span>
            <h3>{{ locale === 'zh' ? brand.nameZh : brand.nameEn }}</h3>
            <small>{{ locale === 'zh' ? brand.nameEn : brand.nameZh }}</small>
          </div>
          <a :href="brand.site" target="_blank" rel="noopener noreferrer"
            >{{ key('brandsWebsite') }} ↗</a
          >
        </div>
        <div class="layout">
          <span>{{ key('brandsLayout') }}</span>
          <p>{{ locale === 'zh' ? brand.layoutZh : brand.layoutEn }}</p>
        </div>
        <details>
          <summary>{{ key('brandsDetails') }}</summary>
          <dl>
            <dt>{{ key('brandsOrigin') }}</dt>
            <dd>{{ locale === 'zh' ? brand.originZh : brand.originEn }}</dd>
            <dt>{{ key('brandsFit') }}</dt>
            <dd>{{ locale === 'zh' ? brand.fitZh : brand.fitEn }}</dd>
          </dl>
          <div class="card-sources">
            <span>{{ key('brandsSources') }}</span>
            <a
              v-for="source in brand.sources"
              :key="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ source.label }} ↗</a
            >
          </div>
        </details>
        <small class="checked">{{ key('brandsChecked') }} · {{ brand.checkedAt }}</small>
      </article>
    </div>
    <div v-else class="empty panel">
      <p>{{ key('brandsEmpty') }}</p>
      <button type="button" @click="clearFilters">{{ key('brandsClear') }}</button>
    </div>
    <button
      v-if="shownCount < visibleBrands.length"
      class="load-more"
      type="button"
      @click="shownCount += 12"
    >
      {{ key('brandsLoadMore') }}
    </button>
    <p class="boundary">{{ key('brandsBoundary') }}</p>
  </section>
</template>

<style scoped>
.brand-observer {
  margin-bottom: 18px;
}
.panel {
  min-width: 0;
  padding: var(--panel-padding);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.brand-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
}
.brand-card h3 {
  margin: 0;
}
.boundary,
.result-count,
.brand-card small,
.card-sources span {
  color: var(--muted);
}
.boundary {
  line-height: 1.6;
}
.intro {
  margin-bottom: 12px;
}
.summary {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  color: var(--muted);
  font-size: 12px;
}
.summary span {
  white-space: nowrap;
}
.summary strong {
  display: block;
  color: var(--ink);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin-top: 18px;
}
.search-row {
  display: flex;
  align-items: end;
  gap: 12px;
}
.search-row label {
  display: grid;
  gap: 7px;
  flex: 1;
  min-width: 0;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
input {
  width: 100%;
  min-height: var(--control-height);
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-elevated);
  color: var(--ink);
  font: inherit;
}
.category-filter p {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  min-width: 0;
}
.category-list button,
.clear,
.empty button {
  min-height: 36px;
  padding: 6px 11px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-elevated);
  color: var(--ink);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.category-list button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
}
.category-list span {
  margin-left: 4px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.clear,
.empty button {
  color: var(--accent);
}
.result-count {
  margin: 14px 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.brand-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.brand-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.category {
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}
.brand-card h3 {
  margin-top: 5px;
  font-size: 20px;
}
.brand-top a,
.card-sources a {
  color: var(--accent);
}
.brand-top a {
  flex-shrink: 0;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 8px 10px;
  text-decoration: none;
}
.layout span,
dt {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}
.layout p {
  margin: 5px 0 0;
  line-height: 1.55;
}
details {
  border-top: 1px solid var(--border);
  padding-top: 11px;
}
summary {
  color: var(--accent);
  font-size: 12px;
  cursor: pointer;
}
dl {
  margin: 12px 0;
}
dt {
  margin-top: 13px;
}
dd {
  margin: 5px 0 0;
  line-height: 1.55;
}
.card-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
  font-size: 11px;
}
.checked {
  display: block;
  margin-top: auto;
  font-variant-numeric: tabular-nums;
}
.boundary {
  margin: 18px 0 0;
  font-size: 12px;
}
.empty {
  color: var(--muted);
}
.empty p {
  margin-top: 0;
}
.load-more {
  display: block;
  min-height: var(--control-height);
  margin: 18px auto 0;
  padding: 8px 18px;
  border: 1px solid var(--accent);
  border-radius: 9px;
  background: var(--surface-elevated);
  color: var(--accent);
  font: inherit;
  cursor: pointer;
}
@media (max-width: 650px) {
  .brand-grid {
    grid-template-columns: 1fr;
  }
  .intro {
    flex-wrap: wrap;
  }
  .category-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .category-list button {
    flex-shrink: 0;
  }
  .brand-top {
    gap: 10px;
  }
}
</style>
