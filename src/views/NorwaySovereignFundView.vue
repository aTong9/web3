<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AsyncDataState from '@/components/AsyncDataState.vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import TaskTabs from '@/components/research/TaskTabs.vue'
import {
  norwayFundMilestones,
  norwayFundSources,
  type NorwayFundMilestoneKind,
  type NorwayFundSnapshot,
} from '@/data/norway-sovereign-fund'
import { buildAllocationBreakdown, getTurningPoints } from '@/utils/norway-sovereign-fund'

type PageSection = 'overview' | 'history' | 'holdings' | 'methodology'
type TimelineFilter = '全部' | '仅转折点' | NorwayFundMilestoneKind

const activeSection = ref<PageSection>('overview')
const timelineFilter = ref<TimelineFilter>('仅转折点')
const snapshot = ref<NorwayFundSnapshot | null>(null)
const snapshotLoading = ref(true)
const snapshotError = ref(false)
const norwayFundSummary = computed(() => snapshot.value?.summary)
const equityRegionsReported = computed(
  () => snapshot.value?.availability.equityRegions === 'reported',
)
const norwayFundAssetAllocation = computed(() => snapshot.value?.assetAllocation ?? [])
const norwayFundEquityRegions = computed(() => snapshot.value?.equityRegions ?? [])
const norwayFundEquitySectors = computed(() => snapshot.value?.equitySectors ?? [])
const norwayFundFixedIncome = computed(() => snapshot.value?.fixedIncome ?? [])
const norwayFundTopHoldings = computed(() => snapshot.value?.topHoldings ?? [])
const allocation = computed(() => buildAllocationBreakdown(norwayFundAssetAllocation.value))
const turningPoints = computed(() => getTurningPoints(norwayFundMilestones))
const visibleMilestones = computed(() => {
  if (timelineFilter.value === '全部') return norwayFundMilestones
  if (timelineFilter.value === '仅转折点') return turningPoints.value
  return norwayFundMilestones.filter((item) => item.kind === timelineFilter.value)
})

const sections: Array<{ id: PageSection; label: string }> = [
  { id: 'overview', label: '基金总览' },
  { id: 'history', label: '历史转折' },
  { id: 'holdings', label: '持仓拆解' },
  { id: 'methodology', label: '口径与风险' },
]
const timelineFilters: TimelineFilter[] = [
  '仅转折点',
  '全部',
  '制度',
  '配置',
  '危机',
  '责任投资',
  '地缘政治',
]

const formatNok = (value: number) => `${value.toLocaleString('zh-CN')} 十亿 NOK`
const formatSigned = (value: number, suffix = '%', digits = 1) =>
  `${value > 0 ? '+' : ''}${value.toFixed(digits)}${suffix}`
const setSection = (section: string) => {
  activeSection.value = section as PageSection
}
const loadSnapshot = async () => {
  snapshotLoading.value = true
  snapshotError.value = false
  try {
    const module = await import('@/data/norway-fund-snapshot.json')
    snapshot.value = module.default as NorwayFundSnapshot
  } catch (error) {
    snapshotError.value = true
    console.warn('Norway sovereign-fund snapshot failed to load:', error)
  } finally {
    snapshotLoading.value = false
  }
}
onMounted(loadSnapshot)
</script>

<template>
  <main class="norway-fund-page">
    <ResearchPageHeader
      eyebrow="GOVERNMENT PENSION FUND GLOBAL · GPFG"
      title="挪威主权基金"
      description="把资源收入、财政纪律、全球分散和跨世代治理组合成一套长期制度。"
    >
      <template #meta>
        <div class="hero-meta">
          <span>数据截至 {{ norwayFundSummary?.asOfDate ?? '—' }}</span>
          <span>官方发布 {{ norwayFundSummary?.publishedDate ?? '—' }}</span>
          <a :href="snapshot?.sources.report ?? norwayFundSources.halfYear" target="_blank" rel="noopener noreferrer">
            NBIM 最新报告 ↗
          </a>
        </div>
      </template>
      <template #status><div class="hero-value">
        <small>基金价值</small>
        <strong>{{ norwayFundSummary ? (norwayFundSummary.valueBillionNok / 1000).toFixed(3) : '—' }}</strong>
        <span>万亿挪威克朗</span>
        <p>{{ norwayFundSummary?.periodLabel ?? '最新报告期' }}回报 {{ formatSigned(norwayFundSummary?.periodReturnPct ?? 0) }}</p>
      </div></template>
    </ResearchPageHeader>

    <AsyncDataState
      :loading="snapshotLoading"
      :error="snapshotError"
      loading-label="正在载入 NBIM 官方基金快照…"
      error-message="挪威主权基金快照暂时无法载入；页面不会用不完整数据生成持仓结论。"
      retry-label="重新载入"
      @retry="loadSnapshot"
    />

    <template v-if="snapshot">
      <DataUpdateStatus
        class="snapshot-status"
        :updated-at="snapshot.updatedAt"
        schedule="norwayFund"
        :as-of-date="snapshot.summary.asOfDate"
        source-label="NBIM 官方报告与持仓接口"
        :source-url="snapshot.sources.report"
        quality="complete"
      />

    <TaskTabs
      class="section-nav"
      :model-value="activeSection"
      :items="sections"
      label="挪威主权基金研究章节"
      @update:model-value="setSection"
    />

    <section v-if="activeSection === 'overview'" class="section-stack">
      <div class="metric-grid">
        <article>
          <small>投资回报</small><strong>{{ formatSigned(norwayFundSummary?.periodReturnBillionNok ?? 0, '', 0) }}</strong><span>十亿 NOK · {{ formatSigned(norwayFundSummary?.periodReturnPct ?? 0) }}</span>
        </article>
        <article>
          <small>相对基准</small><strong>{{ formatSigned(norwayFundSummary?.relativeReturnPctPoints ?? 0, '', 2) }}</strong><span>个百分点</span>
        </article>
        <article><small>扣除成本后净流入</small><strong>{{ formatSigned(norwayFundSummary?.netInflowBillionNok ?? 0, '', 0) }}</strong><span>十亿 NOK</span></article>
        <article class="negative">
          <small>NOK 汇率换算</small><strong>{{ formatSigned(norwayFundSummary?.currencyEffectBillionNok ?? 0, '', 0) }}</strong><span>十亿 NOK · 不是投资亏损</span>
        </article>
      </div>

      <article class="analysis-callout">
        <span>核心判断</span>
        <p>
          70% 战略股票比例决定了基金以股票风险为主。最新实际股票占比为
          {{ norwayFundAssetAllocation.find((item) => item.id === 'equity')?.weightPct.toFixed(1) }}%，股票内部又显著集中于北美与科技行业；非上市资产规模较小，但估值不确定性更高。
        </p>
      </article>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <small>PORTFOLIO</small>
            <h2>一级资产配置</h2>
          </div>
          <span>覆盖率 {{ allocation.totalWeightPct.toFixed(2) }}%</span>
        </div>
        <div class="allocation-list">
          <article v-for="item in allocation.items" :key="item.id">
            <div class="allocation-label">
              <strong>{{ item.label }}</strong
              ><span>{{ item.weightPct.toFixed(2) }}%</span>
            </div>
            <div class="bar"><i :style="{ width: `${item.weightPct}%` }"></i></div>
            <div class="allocation-meta">
              <span>{{ formatNok(item.valueBillionNok) }}</span>
              <span>本期回报 {{ formatSigned(item.returnPct) }}</span>
            </div>
          </article>
        </div>
      </section>

      <div class="two-columns">
        <section class="panel compact">
          <div class="panel-heading">
            <div>
              <small>RISK ENGINE</small>
              <h2>风险来自哪里</h2>
            </div>
          </div>
          <ul class="insight-list">
            <li><b>股票风险：</b>股票占比高于 70%，全球股市回撤将主导短期波动。</li>
            <li><b>集中度：</b>美国超过股票组合一半，科技行业约占三分之一。</li>
            <li><b>汇率：</b>基金以 NOK 报告规模，但投资分布于多币种，换算会放大规模变化。</li>
            <li><b>估值：</b>非上市资产缺少连续报价，依赖模型和不可观察参数。</li>
          </ul>
        </section>
        <section class="panel compact">
          <div class="panel-heading">
            <div>
              <small>GOVERNANCE</small>
              <h2>治理链条</h2>
            </div>
          </div>
          <div class="governance-flow">
            <span>挪威议会<small>法律与政治授权</small></span>
            <i>→</i><span>财政部<small>基准与管理授权</small></span> <i>→</i
            ><span>Norges Bank / NBIM<small>投资执行与报告</small></span>
          </div>
          <p class="note">基金不是个人缴费型养老金，也不是可复制的公开交易策略。</p>
        </section>
      </div>
    </section>

    <section v-else-if="activeSection === 'history'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>1969—2026</small>
          <h2>从石油收入到跨世代制度</h2>
        </div>
        <p>重点标记改变法律、财政规则、战略配置、投资范围或治理机制的节点。</p>
      </div>
      <div class="filter-row" role="group" aria-label="历史事件筛选">
        <button
          v-for="filter in timelineFilters"
          :key="filter"
          :class="{ active: timelineFilter === filter }"
          @click="timelineFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <div class="timeline">
        <article
          v-for="item in visibleMilestones"
          :key="`${item.year}-${item.title}`"
          :class="{ turning: item.isTurningPoint }"
        >
          <div class="year">
            <strong>{{ item.year }}</strong
            ><span>{{ item.kind }}</span>
          </div>
          <div>
            <div class="event-title">
              <h3>{{ item.title }}</h3>
              <b v-if="item.isTurningPoint">关键转折</b>
            </div>
            <p>{{ item.summary }}</p>
            <div class="impact"><small>长期影响</small>{{ item.impact }}</div>
            <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer">查看官方依据 ↗</a>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="activeSection === 'holdings'" class="section-stack">
      <div class="section-intro">
        <div>
          <small>SNAPSHOT · {{ norwayFundSummary?.asOfDate }}</small>
          <h2>持仓不是一张“抄作业”清单</h2>
        </div>
        <p>以下均为期末市值快照。权重变化可能来自交易、价格、汇率、指数调整和公司行动。</p>
      </div>

      <div class="two-columns holdings-summary">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <small>EQUITY</small>
              <h2>股票行业</h2>
            </div>
            <span>占股票组合</span>
          </div>
          <div class="mini-bars">
            <div v-for="sector in norwayFundEquitySectors" :key="sector.label">
              <span>{{ sector.label }}</span
              ><i><b :style="{ width: `${sector.weightPct * 2.8}%` }"></b></i
              ><strong>{{ sector.weightPct }}%</strong>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-heading">
            <div>
              <small>GEOGRAPHY</small>
              <h2>股票地域</h2>
            </div>
            <span>分类口径独立</span>
          </div>
          <div v-if="equityRegionsReported" class="region-grid">
            <article v-for="region in norwayFundEquityRegions" :key="region.label">
              <strong>{{ region.weightPct }}%</strong><span>{{ region.label }}</span>
            </article>
          </div>
          <p v-if="equityRegionsReported" class="note">
            地域表与国家表采用不同分类口径，并可能因现金与衍生品不合计为 100%。
          </p>
          <p v-else class="note">
            本期官方报告未发布与半年报一致的四区域收益表，因此不展示推算数据；国家与全量持仓仍以
            NBIM 官方持仓接口为准。
          </p>
        </section>
      </div>

      <section class="panel table-panel">
        <div class="panel-heading">
          <div>
            <small>TOP HOLDINGS</small>
            <h2>前十大股票持仓</h2>
          </div>
          <a :href="norwayFundSources.holdings" target="_blank" rel="noopener noreferrer"
            >官方全量持仓 ↗</a
          >
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>公司</th>
                <th>国家/地区</th>
                <th>NBIM 行业</th>
                <th class="number">市值（十亿 NOK）</th>
                <th class="number">持股比例</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="holding in norwayFundTopHoldings" :key="holding.rank">
                <td>{{ holding.rank }}</td>
                <td>
                  <strong>{{ holding.company }}</strong>
                </td>
                <td>{{ holding.country }}</td>
                <td>{{ holding.sector }}</td>
                <td class="number">{{ holding.marketValueBillionNok.toFixed(1) }}</td>
                <td class="number">{{ holding.ownershipPct.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          期末市值排名不代表主动买入金额或“最看好”排序；前十中
          {{ norwayFundTopHoldings.filter((item) => item.sector === '科技').length }} 家按 NBIM
          口径归为科技。
        </p>
      </section>

      <div class="two-columns">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <small>FIXED INCOME</small>
              <h2>固定收益结构</h2>
            </div>
            <span>占固收组合</span>
          </div>
          <div class="breakdown-rows">
            <div v-for="item in norwayFundFixedIncome" :key="item.label">
              <span>{{ item.label }}</span
              ><strong>{{ item.weightPct }}%</strong
              ><small>本期回报 {{ formatSigned(item.returnPct) }}</small>
            </div>
          </div>
          <p class="note">分类可能包含现金和衍生工具调整，不保证简单加总为 100%。</p>
        </section>
        <section class="panel">
          <div class="panel-heading">
            <div>
              <small>PRIVATE MARKETS</small>
              <h2>非上市资产</h2>
            </div>
            <span>
              约占基金
              {{
                (
                  (norwayFundAssetAllocation.find((item) => item.id === 'real-estate')
                    ?.weightPct ?? 0) +
                  (norwayFundAssetAllocation.find((item) => item.id === 'renewable')
                    ?.weightPct ?? 0)
                ).toFixed(1)
              }}%
            </span>
          </div>
          <ul class="insight-list">
            <li>
              <b>房地产：</b>本期回报
              {{
                formatSigned(
                  norwayFundAssetAllocation.find((item) => item.id === 'real-estate')
                    ?.returnPct ?? 0,
                )
              }}。
            </li>
            <li>
              <b>可再生基础设施：</b
              >{{
                formatNok(
                  norwayFundAssetAllocation.find((item) => item.id === 'renewable')
                    ?.valueBillionNok ?? 0,
                )
              }}，本期回报
              {{
                formatSigned(
                  norwayFundAssetAllocation.find((item) => item.id === 'renewable')
                    ?.returnPct ?? 0,
                )
              }}。
            </li>
            <li><b>Level 3：</b>非上市资产依赖不可观察估值输入，不等同于即时可成交价格。</li>
            <li><b>敏感性：</b>估值会随折现率、资本化率和可比交易假设变化。</li>
          </ul>
        </section>
      </div>
    </section>

    <section v-else class="section-stack methodology">
      <div class="section-intro">
        <div>
          <small>READ BEFORE USE</small>
          <h2>数据口径与分析边界</h2>
        </div>
        <p>这组信息适合研究基金制度和组合风险，不构成投资或交易建议。</p>
      </div>
      <div class="method-grid">
        <article>
          <b>01</b>
          <div>
            <h3>不是实时持仓</h3>
            <p>
              最新快照截至 {{ norwayFundSummary?.asOfDate }}，于
              {{ norwayFundSummary?.publishedDate }} 发布。所有榜单必须保留数据日期和发布日期。
            </p>
          </div>
        </article>
        <article>
          <b>02</b>
          <div>
            <h3>规模不等于投资收益</h3>
            <p>
              NOK 规模同时受到投资回报、国家净流入/提取和汇率换算影响。{{ norwayFundSummary?.periodLabel }}汇率影响为
              {{ norwayFundSummary?.currencyEffectBillionNok }} 十亿 NOK。
            </p>
          </div>
        </article>
        <article>
          <b>03</b>
          <div>
            <h3>权重变化不等于买卖</h3>
            <p>
              期末权重还受市场价格、汇率、指数调整和公司行动影响；两个市值快照不能直接推出交易方向。
            </p>
          </div>
        </article>
        <article>
          <b>04</b>
          <div>
            <h3>分类不可随意相加</h3>
            <p>
              地域、国家、币种和资产类别采用不同分母；部分表排除现金及衍生品，因此可能不合计为
              100%。
            </p>
          </div>
        </article>
        <article>
          <b>05</b>
          <div>
            <h3>非上市估值存在模型风险</h3>
            <p>
              房地产和可再生基础设施属于 Level 3
              资产，估值广泛依赖不可观察输入，不能等同于即时可成交价格。
            </p>
          </div>
        </article>
        <article>
          <b>06</b>
          <div>
            <h3>无法直接复制</h3>
            <p>
              GPFG
              拥有超长期期限、主权治理、持续资源收入、低成本和全球准入，复制前十大持仓不等于复制基金体系。
            </p>
          </div>
        </article>
      </div>
      <article class="sources-panel">
        <h2>官方来源</h2>
        <a :href="snapshot.sources.report" target="_blank" rel="noopener noreferrer"
          >NBIM 最新官方报告 ↗</a
        >
        <a :href="norwayFundSources.history" target="_blank" rel="noopener noreferrer"
          >NBIM 基金历史时间线 ↗</a
        >
        <a :href="norwayFundSources.holdings" target="_blank" rel="noopener noreferrer"
          >NBIM 全量投资持仓 ↗</a
        >
        <a :href="norwayFundSources.fiscalRule" target="_blank" rel="noopener noreferrer"
          >挪威政府财政政策框架 ↗</a
        >
      </article>
    </section>
    </template>
  </main>
</template>

<style scoped>
.norway-fund-page {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: 32px var(--page-gutter) 72px;
  color: var(--ink);
}
.hero {
  min-height: 280px;
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid var(--border);
  border-radius: 18px;
  background: linear-gradient(135deg, #102b2c 0%, #183d3b 58%, #7a2f31 100%);
  color: #f6f2e8;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 0.7fr);
  gap: 36px;
  align-items: end;
  overflow: hidden;
  position: relative;
}
.hero::after {
  content: '';
  position: absolute;
  width: 340px;
  height: 340px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 50%;
  right: -80px;
  top: -170px;
  box-shadow:
    0 0 0 52px rgb(255 255 255 / 3%),
    0 0 0 104px rgb(255 255 255 / 2%);
}
.eyebrow,
.panel-heading small,
.section-intro small {
  margin: 0;
  color: #9fd2c3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.hero h1 {
  margin: 12px 0;
  font:
    700 clamp(38px, 6vw, 72px)/1.04 Georgia,
    'Noto Serif SC',
    serif;
}
.lead {
  max-width: 760px;
  margin: 0;
  color: rgb(255 255 255 / 78%);
  font-size: 15px;
  line-height: 1.9;
}
.hero-meta {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  font-size: 10px;
  color: rgb(255 255 255 / 62%);
}
.hero a {
  color: #b9eadc;
}
.hero-value {
  padding: 24px;
  border-left: 1px solid rgb(255 255 255 / 18%);
  position: relative;
  z-index: 1;
}
.hero-value small,
.hero-value span {
  display: block;
  color: rgb(255 255 255 / 65%);
  font-size: 11px;
}
.hero-value strong {
  display: block;
  margin: 5px 0 2px;
  font:
    700 clamp(48px, 6vw, 76px)/1 Georgia,
    serif;
}
.hero-value p {
  margin: 20px 0 0;
  color: #b9eadc;
  font-size: 12px;
}
.snapshot-status {
  margin: -10px 0 18px auto;
}
.section-nav {
  margin: 18px 0 30px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  display: inline-flex;
  gap: 3px;
}
.section-nav button,
.filter-row button {
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 11px;
  padding: 9px 14px;
}
.section-nav button.active,
.filter-row button.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
}
.section-stack {
  display: grid;
  gap: 22px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.metric-grid article {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.metric-grid small,
.metric-grid span {
  display: block;
  color: var(--muted);
  font-size: 10px;
}
.metric-grid strong {
  display: block;
  margin: 10px 0 6px;
  color: var(--accent);
  font:
    700 28px Georgia,
    serif;
}
.metric-grid .negative strong {
  color: #b55a5d;
}
.analysis-callout {
  padding: 22px 26px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 18px;
  align-items: start;
}
.analysis-callout span {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.analysis-callout p {
  margin: 0;
  line-height: 1.9;
}
.panel {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  min-width: 0;
}
.panel-heading {
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
}
.panel-heading h2,
.section-intro h2 {
  margin: 5px 0 0;
  font-size: 19px;
}
.panel-heading > span,
.panel-heading > a {
  color: var(--muted);
  font-size: 10px;
}
.allocation-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px 34px;
}
.allocation-label,
.allocation-meta {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.allocation-label {
  font-size: 12px;
}
.allocation-label span {
  font-weight: 800;
}
.bar {
  height: 7px;
  margin: 9px 0;
  border-radius: 9px;
  background: var(--surface-soft);
  overflow: hidden;
}
.bar i {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), #65ad95);
  display: block;
}
.allocation-meta {
  color: var(--muted);
  font-size: 9px;
}
.two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.insight-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 13px;
}
.insight-list li {
  padding-bottom: 13px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.insight-list b {
  color: var(--ink);
}
.governance-flow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.governance-flow > span {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  background: var(--surface-soft);
  font-size: 11px;
  font-weight: 700;
}
.governance-flow small {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 8px;
  font-weight: 400;
}
.governance-flow i {
  color: var(--accent);
  font-style: normal;
}
.note {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.7;
}
.section-intro {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: end;
}
.section-intro p {
  max-width: 560px;
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.timeline {
  display: grid;
  gap: 10px;
}
.timeline article {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 24px;
}
.timeline article.turning {
  border-left: 3px solid var(--accent);
}
.year strong {
  display: block;
  font:
    700 25px Georgia,
    serif;
}
.year span {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 7px;
  border-radius: 4px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 8px;
}
.event-title {
  display: flex;
  gap: 10px;
  align-items: center;
}
.event-title h3 {
  margin: 0;
  font-size: 15px;
}
.event-title b {
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 8px;
}
.timeline p {
  margin: 8px 0;
  color: var(--muted);
  font-size: 11px;
}
.impact {
  margin: 12px 0;
  font-size: 11px;
  line-height: 1.7;
}
.impact small {
  margin-right: 10px;
  color: var(--accent);
  font-weight: 700;
}
.timeline a,
.panel a,
.sources-panel a {
  color: var(--accent);
  font-size: 9px;
}
.mini-bars {
  display: grid;
  gap: 9px;
}
.mini-bars > div {
  display: grid;
  grid-template-columns: 110px 1fr 42px;
  gap: 10px;
  align-items: center;
  font-size: 10px;
}
.mini-bars i {
  height: 5px;
  border-radius: 4px;
  background: var(--surface-soft);
  overflow: hidden;
}
.mini-bars b {
  height: 100%;
  display: block;
  background: var(--accent);
}
.mini-bars strong {
  text-align: right;
}
.region-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.region-grid article {
  padding: 18px;
  border-radius: 9px;
  background: var(--surface-soft);
}
.region-grid strong,
.region-grid span {
  display: block;
}
.region-grid strong {
  font:
    700 25px Georgia,
    serif;
}
.region-grid span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
th {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  text-align: left;
  font-weight: 500;
  white-space: nowrap;
}
td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--border);
}
.number {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.breakdown-rows {
  display: grid;
}
.breakdown-rows > div {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1fr 60px 120px;
  gap: 10px;
  font-size: 10px;
}
.breakdown-rows small {
  color: var(--muted);
  text-align: right;
}
.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.method-grid article {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  display: flex;
  gap: 18px;
}
.method-grid article > b {
  color: var(--accent);
  font:
    700 24px Georgia,
    serif;
}
.method-grid h3 {
  margin: 2px 0 8px;
  font-size: 13px;
}
.method-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.8;
}
.sources-panel {
  padding: 24px;
  border-radius: 12px;
  background: var(--surface-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
  align-items: center;
}
.sources-panel h2 {
  width: 100%;
  margin: 0 0 4px;
  font-size: 15px;
}
@media (max-width: 1000px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-value {
    border-left: 0;
    border-top: 1px solid rgb(255 255 255 / 18%);
  }
  .allocation-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .norway-fund-page {
    padding: 16px 13px 50px;
  }
  .hero {
    padding: 28px 22px;
  }
  .section-nav {
    width: 100%;
    overflow-x: auto;
  }
  .section-nav button {
    flex: 0 0 auto;
  }
  .metric-grid,
  .two-columns,
  .method-grid {
    grid-template-columns: 1fr;
  }
  .section-intro {
    display: block;
  }
  .section-intro p {
    margin-top: 10px;
  }
  .analysis-callout {
    grid-template-columns: 1fr;
  }
  .timeline article {
    grid-template-columns: 64px 1fr;
    gap: 12px;
  }
  .event-title {
    align-items: flex-start;
    flex-direction: column;
  }
  .governance-flow {
    align-items: stretch;
    flex-direction: column;
  }
  .governance-flow i {
    transform: rotate(90deg);
    align-self: center;
  }
  .mini-bars > div {
    grid-template-columns: 92px 1fr 38px;
  }
}
</style>
