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
watch([category, query], () => {
  shownCount.value = 12
})
</script>

<template>
  <section class="brand-observer" :aria-label="key('brandsTab')">
    <div class="intro panel">
      <div>
        <h2>{{ key('brandsHeading') }}</h2>
        <p>{{ key('brandsIntro') }}</p>
      </div>
      <span>{{ key('brandsCount') }} · {{ brands.length }}</span>
    </div>
    <div class="filters panel">
      <label>
        {{ key('brandsCategory') }}
        <select v-model="category">
          <option v-for="value in categories" :key="value" :value="value">
            {{ key(`brandsCategory_${value}`) }}
          </option>
        </select>
      </label>
      <label>
        {{ key('brandsSearch') }}
        <input v-model="query" type="search" :placeholder="key('brandsSearchHint')" />
      </label>
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
        <dl>
          <dt>{{ key('brandsOrigin') }}</dt>
          <dd>{{ locale === 'zh' ? brand.originZh : brand.originEn }}</dd>
          <dt>{{ key('brandsLayout') }}</dt>
          <dd>{{ locale === 'zh' ? brand.layoutZh : brand.layoutEn }}</dd>
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
        <small class="checked">{{ key('brandsChecked') }}: {{ brand.checkedAt }}</small>
      </article>
    </div>
    <p v-else class="empty panel">{{ key('brandsEmpty') }}</p>
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
.intro,
.brand-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
}
.intro h2,
.brand-card h3 {
  margin: 0;
}
.intro p,
.boundary,
.result-count,
.brand-card small,
.card-sources span {
  color: var(--muted);
}
.intro p,
.boundary {
  line-height: 1.6;
}
.intro > span {
  color: var(--accent);
  white-space: nowrap;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 18px;
}
.filters label {
  display: grid;
  gap: 7px;
  min-width: min(100%, 220px);
  flex: 1;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
select,
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
.result-count {
  margin: 14px 0;
  font-size: 12px;
}
.brand-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.brand-card {
  display: flex;
  flex-direction: column;
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
}
dl {
  margin: 18px 0;
}
dt {
  margin-top: 13px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}
dd {
  margin: 5px 0 0;
  line-height: 1.55;
}
.card-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
  margin-top: auto;
  font-size: 11px;
}
.checked {
  display: block;
  margin-top: 14px;
}
.boundary {
  margin: 18px 0 0;
  font-size: 12px;
}
.empty {
  color: var(--muted);
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
}
</style>
