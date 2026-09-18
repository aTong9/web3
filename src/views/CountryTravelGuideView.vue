<script setup lang="ts">
import { computed, ref } from 'vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { countryTravelGuides, countryTravelGuidesUpdatedAt } from '@/data/country-travel-guides'
import type { TravelRegion } from '@/data/country-travel-guides'

const region = ref<'all' | TravelRegion>('all')
const query = ref('')
const regions: Array<{ value: 'all' | TravelRegion; label: string }> = [
  { value: 'all', label: '全部地区' },
  { value: 'north-america', label: '北美' },
  { value: 'south-america', label: '南美' },
  { value: 'europe', label: '欧洲' },
  { value: 'east-asia', label: '东亚' },
  { value: 'south-asia', label: '南亚' },
  { value: 'southeast-asia', label: '东南亚' },
  { value: 'oceania', label: '大洋洲' },
  { value: 'middle-east', label: '中东' },
  { value: 'africa', label: '非洲' },
]
const visible = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return countryTravelGuides.filter(
    (item) =>
      (region.value === 'all' || item.region === region.value) &&
      (!needle ||
        [
          item.name,
          item.englishName,
          item.currency,
          ...item.clothing,
          ...item.food,
          ...item.stay,
          ...item.transport,
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(needle)),
  )
})
</script>

<template>
  <main class="travel-view">
    <ResearchPageHeader density="workbench"
      eyebrow="GLOBAL COUNTRY ESSENTIALS · OFFICIAL CHECKS"
      title="全球国家衣食住行指南"
      description="识别主要旅行国家当地常见的服饰、餐饮零售、住宿与交通品牌，并在出发前完成入境、支付、交通、电气和安全准备。"
      :updated-at="countryTravelGuidesUpdatedAt"
      variant="plain"
    />

    <div class="travel-workbench"><aside class="travel-tools">
    <section class="filters" aria-label="筛选国家">
      <input v-model="query" type="search" aria-label="搜索国家、货币或品牌" placeholder="搜索国家、货币或品牌…" />
      <select v-model="region" aria-label="筛选地区">
        <option v-for="item in regions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      <strong role="status">{{ visible.length }} 个国家</strong>
    </section>
    <section class="warning">
      <b>入境规则不可缓存为结论</b
      ><span
        >签证、电子许可、健康申报和转机要求会变化，请按护照、居住地、目的和停留时间进入各国政府网站重新核验。</span
      >
    </section>
    </aside><div class="country-results">
    <section v-if="!visible.length" class="empty-state" role="status">
      <h2>没有匹配的国家</h2>
      <p>试试其他国家、货币或品牌关键词。</p>
      <button type="button" @click="query = ''; region = 'all'">清除筛选</button>
    </section>
    <section v-else class="grid">
      <article v-for="country in visible" :key="country.id" class="country-card">
        <header>
          <div>
            <small>{{ country.englishName }}</small>
            <h2>{{ country.name }}</h2>
          </div>
          <b>{{ country.currency }}</b>
        </header>
        <div class="brands">
          <section>
            <h3>衣</h3>
            <p>{{ country.clothing.join(' · ') }}</p>
          </section>
          <section>
            <h3>食</h3>
            <p>{{ country.food.join(' · ') }}</p>
          </section>
          <section>
            <h3>住</h3>
            <p>{{ country.stay.join(' · ') }}</p>
          </section>
          <section>
            <h3>行</h3>
            <p>{{ country.transport.join(' · ') }}</p>
          </section>
        </div>
        <details>
          <summary>首次旅行注意事项 <b aria-hidden="true">⌄</b></summary>
          <dl>
            <div>
              <dt>支付与小费</dt>
              <dd>{{ country.payment }}</dd>
            </div>
            <div>
              <dt>当地交通</dt>
              <dd>{{ country.mobility }}</dd>
            </div>
            <div>
              <dt>插头与电压</dt>
              <dd>{{ country.electricity }}</dd>
            </div>
            <div>
              <dt>紧急号码</dt>
              <dd>{{ country.emergency }}</dd>
            </div>
            <div>
              <dt>礼仪</dt>
              <dd>{{ country.etiquette }}</dd>
            </div>
            <div>
              <dt>高频风险</dt>
              <dd>{{ country.risks.join(' · ') }}</dd>
            </div>
          </dl>
          <a :href="country.entryUrl" target="_blank" rel="noopener noreferrer"
            >去 {{ country.entryAuthority }} 核验入境要求 ↗</a
          >
        </details>
      </article>
    </section>
    </div></div>
  </main>
</template>

<style scoped>
.travel-view {
  max-width: var(--content-workbench);
  margin: auto;
  padding: 32px var(--page-gutter) 80px;
}
.warning {
  margin-bottom: 20px;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--warning) 40%, var(--border));
  border-radius: 10px;
  background: var(--warning-soft);
  display: grid;
  gap: 5px;
  color: var(--warning);
}
.warning span {
  font-size: 12px;
  line-height: 1.6;
}
.filters {
  margin-bottom: 18px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px auto;
  gap: 10px;
  align-items: center;
}
.filters input,
.filters select {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
}
.grid {
  display: grid;
  align-items: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.country-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
}
header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14px;
}
header small {
  color: var(--muted);
}
h2 {
  margin: 3px 0 0;
  font:
    700 26px Georgia,
    serif;
}
.brands {
  margin: 18px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.brands section {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface-soft);
}
h3 {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 14px;
}
.brands p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}
details {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
summary {
  min-height: 44px;
  align-items: center;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
dl {
  display: grid;
  gap: 10px;
  margin: 14px 0;
}
dt {
  font-size: 11px;
  font-weight: 800;
  color: var(--muted);
}
dd {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.55;
}
details a {
  color: var(--accent);
  font-weight: 700;
  font-size: 12px;
}
@media (max-width: 760px) {
  .grid,
  .filters {
    grid-template-columns: 1fr;
  }
  .brands {
    grid-template-columns: 1fr;
  }
}
header > b {
  align-self: start;
  padding: 5px 9px;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
}
.filters strong { padding: 0 8px; color: var(--muted); font-size: 12px; }
.country-card:has(details[open]) { border-color: var(--accent); }
details[open] summary b { transform: rotate(180deg); }
.empty-state {
  padding: 40px 20px;
  border: 1px dashed var(--border);
  border-radius: var(--panel-radius);
  text-align: center;
}
.empty-state p { color: var(--muted); }
.empty-state button {
  padding: 8px 18px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  cursor: pointer;
}
@media (min-width: 761px) {
  .filters { position: sticky; top: 70px; z-index: 10; }
}
@media (max-width: 760px) {
  .filters { grid-template-columns: minmax(0, 1fr) auto; }
  .filters input { grid-column: 1 / -1; }
  .country-card { padding: 16px; }
  .brands section { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 10px; }
  .brands h3 { margin: 0; }
}

.travel-workbench { display:grid; grid-template-columns:240px minmax(0,1fr); gap:24px; align-items:start; }
.travel-tools { position:sticky; top:76px; }
.travel-tools .filters { position:static; display:grid; grid-template-columns:1fr; gap:12px; padding:16px; }
.travel-tools input, .travel-tools select { min-width:0; width:100%; }
.travel-tools .warning { margin:16px 0 0; }
.country-results { min-width:0; }
.country-card .brands { grid-template-columns:1fr; }
.country-card .brands section { display:grid; grid-template-columns:24px minmax(0,1fr); gap:10px; }
@media(max-width:1100px) { .travel-workbench { grid-template-columns:1fr; } .travel-tools { position:static; } .travel-tools .filters { grid-template-columns:minmax(0,1fr) 170px auto; } .travel-tools .warning { padding:10px 14px; } }
@media(max-width:600px) { .travel-tools .filters { grid-template-columns:minmax(0,1fr) auto; } .travel-tools input { grid-column:1/-1; } }

</style>
