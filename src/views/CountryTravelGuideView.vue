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
    <ResearchPageHeader
      eyebrow="GLOBAL COUNTRY ESSENTIALS · OFFICIAL CHECKS"
      title="全球国家衣食住行指南"
      description="识别主要旅行国家当地常见的服饰、餐饮零售、住宿与交通品牌，并在出发前完成入境、支付、交通、电气和安全准备。"
      :updated-at="countryTravelGuidesUpdatedAt"
      density="comfortable"
      variant="plain"
    />
    <section class="warning">
      <b>入境规则不可缓存为结论</b
      ><span
        >签证、电子许可、健康申报和转机要求会变化，请按护照、居住地、目的和停留时间进入各国政府网站重新核验。</span
      >
    </section>
    <section class="filters" aria-label="筛选国家">
      <input v-model="query" type="search" placeholder="搜索国家、货币或品牌…" />
      <select v-model="region">
        <option v-for="item in regions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      <strong>{{ visible.length }} 个国家</strong>
    </section>
    <section class="grid">
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
          <summary>查看首次旅行注意事项 <b>展开</b></summary>
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
  </main>
</template>

<style scoped>
.travel-view {
  max-width: var(--content-workbench);
  margin: auto;
  padding: var(--space-section) var(--page-gutter) 80px;
}
.warning {
  margin-bottom: 20px;
  padding: 16px 18px;
  border: 1px solid #d8a744;
  border-radius: 10px;
  background: #fff7dc;
  display: grid;
  gap: 5px;
  color: #5e481a;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.country-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
header {
  display: flex;
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
  background: var(--surface-muted);
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
</style>
