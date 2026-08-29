<script setup lang="ts">
import { computed, ref } from 'vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { incomeOpportunities, incomeOpportunitiesUpdatedAt } from '@/data/income-opportunities'
import type {
  GameIncomePayout,
  GameIncomeStartCost,
  IncomeOpportunityCategory,
  IncomeOpportunityCoverage,
  IncomeOpportunityMethod,
} from '@/types'

type CategoryFilter = 'all' | IncomeOpportunityCategory
type PayoutFilter = 'all' | GameIncomePayout
type CostFilter = 'all' | GameIncomeStartCost
type MethodFilter = 'all' | IncomeOpportunityMethod
type CoverageFilter = 'all' | IncomeOpportunityCoverage

const activeCategory = ref<CategoryFilter>('all')
const payoutFilter = ref<PayoutFilter>('all')
const costFilter = ref<CostFilter>('all')
const methodFilter = ref<MethodFilter>('all')
const coverageFilter = ref<CoverageFilter>('all')
const query = ref('')

const categoryOptions: Array<{
  value: CategoryFilter
  label: string
  description: string
}> = [
  { value: 'all', label: '全部项目', description: '浏览所有已核验收入路径' },
  { value: 'freelance', label: '远程接单', description: '设计、开发、写作与运营项目' },
  { value: 'creator', label: '内容创作', description: '视频、文章、订阅与社区收入' },
  { value: 'digital-product', label: '数字产品', description: '模板、素材、软件与下载商品' },
  { value: 'teaching', label: '在线教学', description: '课程、语言、专业技能与辅导' },
  { value: 'research', label: '测试研究', description: '产品测试、访谈与研究任务' },
  { value: 'local-service', label: '本地服务', description: '清洁、安装、搬运与现场技能服务' },
  { value: 'game', label: '游戏经营', description: '官方许可的游戏价值兑现路径' },
]

const payoutOptions: Array<{ value: PayoutFilter; label: string }> = [
  { value: 'all', label: '全部收款方式' },
  { value: 'fiat', label: '法币收款' },
  { value: 'crypto', label: '加密资产' },
  { value: 'mixed', label: '混合路径' },
]

const costOptions: Array<{ value: CostFilter; label: string }> = [
  { value: 'all', label: '全部启动成本' },
  { value: 'free', label: '可免费开始' },
  { value: 'low', label: '低成本' },
  { value: 'capital', label: '需要本金' },
]

const methodOptions: Array<{ value: MethodFilter; label: string }> = [
  { value: 'all', label: '全部赚钱模式' },
  { value: 'client-work', label: '为客户交付' },
  { value: 'audience', label: '积累受众' },
  { value: 'product', label: '销售产品' },
  { value: 'teaching', label: '提供教学' },
  { value: 'tasks', label: '完成任务' },
  { value: 'digital-economy', label: '数字经济经营' },
]

const coverageOptions: Array<{ value: CoverageFilter; label: string }> = [
  { value: 'all', label: '全部覆盖范围' },
  { value: 'broad', label: '广泛跨国开放' },
  { value: 'multi-country', label: '多国清单限制' },
  { value: 'limited', label: '明显地区受限' },
]

const categoryLabels = Object.fromEntries(
  categoryOptions.filter(({ value }) => value !== 'all').map(({ value, label }) => [value, label]),
) as Record<IncomeOpportunityCategory, string>

const payoutLabels: Record<GameIncomePayout, string> = {
  fiat: '法币收款',
  crypto: '链上资产',
  mixed: '混合路径',
}

const costLabels: Record<GameIncomeStartCost, string> = {
  free: '可免费开始',
  low: '低成本起步',
  capital: '需要本金',
}

const categoryCounts = computed(() =>
  incomeOpportunities.reduce<Partial<Record<IncomeOpportunityCategory, number>>>((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1
    return counts
  }, {}),
)

const visibleOpportunities = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return incomeOpportunities.filter((item) => {
    const matchesCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    const matchesPayout = payoutFilter.value === 'all' || item.payout === payoutFilter.value
    const matchesCost = costFilter.value === 'all' || item.startCost === costFilter.value
    const matchesMethod = methodFilter.value === 'all' || item.method === methodFilter.value
    const matchesCoverage = coverageFilter.value === 'all' || item.coverage === coverageFilter.value
    const searchable = [
      item.name,
      item.model,
      item.workMode,
      item.platforms,
      item.availability,
      item.summary,
      ...item.skills,
      ...item.earningRoutes,
    ]
      .join(' ')
      .toLocaleLowerCase()
    return (
      matchesCategory &&
      matchesPayout &&
      matchesCost &&
      matchesMethod &&
      matchesCoverage &&
      (!needle || searchable.includes(needle))
    )
  })
})

const resetFilters = () => {
  activeCategory.value = 'all'
  payoutFilter.value = 'all'
  costFilter.value = 'all'
  methodFilter.value = 'all'
  coverageFilter.value = 'all'
  query.value = ''
}
</script>

<template>
  <main class="income-view">
    <ResearchPageHeader
      eyebrow="GLOBAL INCOME PATHS · OFFICIAL SOURCES"
      title="全球自由职业与赚钱项目"
      description="从远程接单、内容创作、数字产品、在线教学、用户研究到游戏经营，整理全球可参与的真实收入路径，并说明如何找到需求、完成交付和安全收款。"
      :updated-at="incomeOpportunitiesUpdatedAt"
      density="comfortable"
      variant="plain"
    />

    <section class="guardrail" aria-labelledby="guardrail-title">
      <div>
        <span>先完成最小收入闭环</span>
        <h2 id="guardrail-title">能力 → 需求 → 交付 → 收款</h2>
      </div>
      <ol>
        <li><b>选择能力</b><span>从已有技能和作品开始，不先购买昂贵课程</span></li>
        <li><b>验证需求</b><span>查看真实订单、买家搜索词和平台规则</span></li>
        <li><b>小单交付</b><span>先做范围清晰、可留下评价的小项目</span></li>
        <li><b>核算净收入</b><span>扣除平台费、税费、退款、汇率和工时</span></li>
      </ol>
    </section>

    <section class="category-panel" aria-label="赚钱项目分类">
      <button
        v-for="category in categoryOptions"
        :key="category.value"
        type="button"
        :class="{ active: activeCategory === category.value }"
        :aria-pressed="activeCategory === category.value"
        @click="activeCategory = category.value"
      >
        <span
          ><b>{{ category.label }}</b
          ><small>{{ category.description }}</small></span
        >
        <em>{{
          category.value === 'all'
            ? incomeOpportunities.length
            : (categoryCounts[category.value] ?? 0)
        }}</em>
      </button>
    </section>

    <section class="filters" aria-label="筛选赚钱项目">
      <label>
        <span>搜索技能、项目或平台</span>
        <input v-model="query" type="search" placeholder="例如：写作、设计、教学、视频、游戏…" />
      </label>
      <label>
        <span>赚钱模式</span>
        <select v-model="methodFilter">
          <option v-for="option in methodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label>
        <span>覆盖范围</span>
        <select v-model="coverageFilter">
          <option v-for="option in coverageOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label>
        <span>收款方式</span>
        <select v-model="payoutFilter">
          <option v-for="option in payoutOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label>
        <span>启动成本</span>
        <select v-model="costFilter">
          <option v-for="option in costOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </section>

    <div class="result-meta" role="status" aria-live="polite">
      <strong>{{ visibleOpportunities.length }} 个已核验项目</strong>
      <span>只展示操作路径，不承诺收入；注册前重新核对地区、税务和收款规则。</span>
    </div>

    <section v-if="visibleOpportunities.length" class="opportunity-grid" aria-label="赚钱项目列表">
      <article v-for="item in visibleOpportunities" :key="item.id" class="opportunity-card">
        <header>
          <div>
            <p>{{ categoryLabels[item.category] }} · {{ item.model }}</p>
            <h2>{{ item.name }}</h2>
          </div>
          <span class="payout-badge" :class="item.payout">{{ payoutLabels[item.payout] }}</span>
        </header>
        <p class="summary">{{ item.summary }}</p>
        <div class="earning-box">
          <span>具体怎么赚钱</span>
          <p>{{ item.earningRoutes.join(' · ') }}</p>
        </div>
        <dl>
          <div>
            <dt>工作方式</dt>
            <dd>{{ item.workMode }}</dd>
          </div>
          <div>
            <dt>启动</dt>
            <dd>{{ costLabels[item.startCost] }}</dd>
          </div>
          <div>
            <dt>平台 / 地区</dt>
            <dd>{{ item.platforms }} · {{ item.availability }}</dd>
          </div>
        </dl>
        <div class="skill-list">
          <span v-for="skill in item.skills" :key="skill">{{ skill }}</span>
        </div>
        <details>
          <summary><span>查看赚钱步骤、门槛与风险</span><b>展开</b></summary>
          <div class="detail-grid">
            <section>
              <h3>赚钱操作闭环</h3>
              <ol>
                <li v-for="step in item.steps" :key="step">{{ step }}</li>
              </ol>
            </section>
            <section>
              <h3>准入与收款条件</h3>
              <ul>
                <li v-for="requirement in item.requirements" :key="requirement">
                  {{ requirement }}
                </li>
              </ul>
              <h3>主要风险</h3>
              <ul class="risks">
                <li v-for="risk in item.risks" :key="risk">{{ risk }}</li>
              </ul>
            </section>
          </div>
          <footer>
            <span>官方核验</span>
            <a
              v-for="source in item.sources"
              :key="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ source.label }} ↗</a
            >
          </footer>
        </details>
      </article>
    </section>

    <section v-else class="empty-state">
      <strong>没有符合当前条件的项目</strong>
      <p>尝试更换分类、关键词或启动成本。</p>
      <button type="button" @click="resetFilters">清除全部筛选</button>
    </section>
  </main>
</template>

<style scoped>
.income-view {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 80px;
}
.guardrail {
  margin-bottom: var(--space-section);
  padding: var(--panel-padding);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--inverse);
  color: var(--inverse-text);
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) minmax(0, 2fr);
  gap: 28px;
}
.guardrail > div > span {
  color: #92b7e9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
}
.guardrail h2 {
  margin: 7px 0 0;
  font:
    700 23px/1.25 Georgia,
    serif;
}
.guardrail ol {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.guardrail li {
  padding-left: 12px;
  border-left: 1px solid rgb(255 255 255 / 16%);
}
.guardrail li b,
.guardrail li span {
  display: block;
}
.guardrail li b {
  color: #8bd4b7;
  font-size: 12px;
}
.guardrail li span {
  margin-top: 5px;
  color: color-mix(in srgb, var(--inverse-text) 68%, transparent);
  font-size: 11px;
  line-height: 1.55;
}
.category-panel {
  margin-bottom: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.category-panel button {
  min-width: 0;
  min-height: 72px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  text-align: left;
}
.category-panel button:hover,
.category-panel button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.category-panel span,
.category-panel b,
.category-panel small {
  min-width: 0;
  display: block;
}
.category-panel b {
  font-size: 12px;
}
.category-panel small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.4;
}
.category-panel em {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--surface-soft);
  color: var(--muted);
  display: grid;
  place-items: center;
  flex: none;
  font-size: 10px;
  font-style: normal;
}
.filters {
  margin-bottom: 14px;
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 160px 155px 145px 145px;
  gap: 10px;
}
@media (max-width: 1120px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filters label:first-child {
    grid-column: 1 / -1;
  }
}
.filters label {
  min-width: 0;
  height: 58px;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: grid;
}
.filters label > span {
  color: var(--muted);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.filters input,
.filters select {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 12px;
}
.result-meta {
  margin-bottom: 18px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 11px;
}
.result-meta strong {
  color: var(--ink);
}
.opportunity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.opportunity-card {
  min-width: 0;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
}
.opportunity-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.opportunity-card header p {
  margin: 0 0 4px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.opportunity-card h2 {
  margin: 0;
  font:
    700 24px/1.2 Georgia,
    serif;
}
.payout-badge {
  flex: none;
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
}
.payout-badge.crypto {
  background: var(--warning-soft);
  color: var(--warning);
}
.payout-badge.mixed {
  background: color-mix(in srgb, var(--accent-soft) 70%, var(--warning-soft));
}
.summary {
  min-height: 50px;
  margin: 14px 0 10px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}
.earning-box {
  padding: 11px 12px;
  border-left: 3px solid var(--accent);
  border-radius: 0 7px 7px 0;
  background: var(--accent-soft);
}
.earning-box span {
  color: var(--accent);
  font-size: 9px;
  font-weight: 800;
}
.earning-box p {
  margin: 4px 0 0;
  color: var(--ink);
  font-size: 11px;
  line-height: 1.55;
}
dl {
  margin: 12px 0 0;
  padding: 12px 0;
  border-block: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1fr 0.7fr 1.5fr;
  gap: 12px;
}
dt {
  color: var(--muted);
  font-size: 9px;
}
dd {
  margin: 4px 0 0;
  color: var(--ink);
  font-size: 11px;
  line-height: 1.45;
}
.skill-list {
  min-height: 54px;
  padding: 12px 0;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  gap: 6px;
}
.skill-list span {
  padding: 4px 7px;
  border-radius: 5px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 10px;
}
details {
  border-top: 1px solid var(--border);
}
summary {
  min-height: 42px;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
}
summary b {
  font-size: 9px;
}
details[open] summary b {
  transform: rotate(180deg);
}
.detail-grid {
  padding: 8px 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.detail-grid h3 {
  margin: 0 0 8px;
  font-size: 11px;
}
.detail-grid h3:not(:first-child) {
  margin-top: 16px;
}
.detail-grid ol,
.detail-grid ul {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.65;
}
.detail-grid li + li {
  margin-top: 5px;
}
.risks li::marker {
  color: var(--danger);
}
details footer {
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
details footer span {
  margin-right: 4px;
  color: var(--muted);
  font-size: 9px;
}
details footer a {
  color: var(--accent);
  font-size: 10px;
  text-decoration: none;
}
.empty-state {
  padding: 54px 20px;
  border: 1px dashed var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  text-align: center;
}
.empty-state p {
  color: var(--muted);
  font-size: 12px;
}
.empty-state button {
  padding: 0 14px;
  border: 0;
  border-radius: 7px;
  background: var(--accent);
  color: white;
  cursor: pointer;
}
@media (max-width: 1050px) {
  .category-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 980px) {
  .guardrail {
    grid-template-columns: 1fr;
  }
  .guardrail ol {
    grid-template-columns: repeat(2, 1fr);
  }
  .opportunity-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 680px) {
  .income-view {
    padding-bottom: 60px;
  }
  .category-panel,
  .filters {
    grid-template-columns: 1fr;
  }
  .result-meta {
    display: grid;
  }
  .guardrail ol,
  .detail-grid {
    grid-template-columns: 1fr;
  }
  dl {
    grid-template-columns: 1fr 1fr;
  }
  dl div:last-child {
    grid-column: 1 / -1;
  }
}
</style>
