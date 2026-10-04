<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, ref, watch } from 'vue'
import EChart from '@/components/EChart.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'
import anchorData from '@/data/china-demography.json'
import {
  DEFAULT_CHINA_HOUSING_ASSUMPTIONS,
  projectChinaDemography,
  type ChinaHousingAssumptions,
  type ChinaScenario,
} from '@/utils/china-demography'

const { locale, t } = useI18n()
const key = (name: string) => t(`chinaDemography.${name}`)
const scenarios: ChinaScenario[] = ['low', 'medium', 'high']
const scenario = ref<ChinaScenario>('medium')
const endYear = ref(2125)
const page = ref(1)
const pageSize = 20
const assumptions = ref<ChinaHousingAssumptions>({ ...DEFAULT_CHINA_HOUSING_ASSUMPTIONS })
const assumptionFields: Array<{
  key: keyof ChinaHousingAssumptions
  min: number
  max: number
  step: number
}> = [
  { key: 'householdSize2025', min: 1, max: 6, step: 0.01 },
  { key: 'householdSize2125', min: 1, max: 6, step: 0.01 },
  { key: 'familyHouseholdPopulationShare', min: 0.5, max: 1, step: 0.001 },
  {
    key: 'urbanizationCeilingPercent',
    min: anchorData.official2025.urbanizationPercent,
    max: 100,
    step: 0.1,
  },
  { key: 'initialUnitsPerHousehold', min: 0.5, max: 3, step: 0.01 },
  { key: 'targetUnitsPerHousehold', min: 0.5, max: 3, step: 0.01 },
  { key: 'annualRetirementRatePercent', min: 0, max: 5, step: 0.01 },
  { key: 'annualSupplyResponsePercent', min: 0, max: 100, step: 0.1 },
  { key: 'averageUnitAreaM2', min: 20, max: 300, step: 1 },
]
const resetAssumptions = () => {
  assumptions.value = { ...DEFAULT_CHINA_HOUSING_ASSUMPTIONS }
}
const updateAssumption = (field: (typeof assumptionFields)[number], event: Event) => {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)
  if (!Number.isFinite(value)) return
  assumptions.value = {
    ...assumptions.value,
    [field.key]: Math.min(field.max, Math.max(field.min, value)),
  }
}
const rows = computed(() => projectChinaDemography(scenario.value, assumptions.value))
const displayed = computed(() => rows.value.filter((row) => row.year <= endYear.value))
const selectedYear = computed(() => displayed.value[displayed.value.length - 1])
const pageCount = computed(() => Math.ceil(rows.value.length / pageSize))
const tableRows = computed(() =>
  rows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
watch(scenario, () => {
  page.value = 1
})
const populationBasisLabel = (basis: string) =>
  basis.startsWith('un-wpp-2024-')
    ? t('chinaDemography.wppBasis', {
        variant: key(`${basis.slice('un-wpp-2024-'.length)}Variant`),
      })
    : basis === 'custom-extension'
      ? key('extensionBasis')
      : key('customBasis')
const number = (value: number, digits = 0) =>
  value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const axisText = '#8a9894'
const commonChart = (unit: string) => ({
  animation: false,
  tooltip: { trigger: 'axis' },
  legend: { top: 0, textStyle: { color: axisText } },
  grid: { left: 64, right: 18, top: 54, bottom: 58 },
  xAxis: {
    type: 'category',
    data: displayed.value.map((row) => row.year),
    axisLabel: { color: axisText, hideOverlap: true },
  },
  yAxis: {
    type: 'value',
    name: unit,
    nameTextStyle: { color: axisText },
    axisLabel: { color: axisText },
  },
  dataZoom: [{ type: 'inside' }, { type: 'slider', height: 16, bottom: 12 }],
})
const series = (name: string, values: number[], color: string, markBoundary = false) => ({
  name,
  type: 'line',
  showSymbol: false,
  sampling: 'lttb',
  smooth: false,
  data: values,
  lineStyle: { width: 2 },
  itemStyle: { color },
  markLine:
    markBoundary && endYear.value > 2100
      ? {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', color: '#9d8b67' },
          label: { formatter: '2100', color: '#9d8b67' },
          data: [{ xAxis: 2100 }],
        }
      : undefined,
})
const totalOption = computed<EChartsCoreOption>(() => ({
  ...commonChart(key('populationAxis')),
  series: [
    series(
      key('population'),
      displayed.value.map((row) => row.populationWan),
      '#57b28f',
      true,
    ),
  ],
}))
const birthsOption = computed<EChartsCoreOption>(() => ({
  ...commonChart(key('populationAxis')),
  series: [
    series(
      key('births'),
      displayed.value.map((row) => row.birthsWan),
      '#48a9c4',
      true,
    ),
    series(
      key('deaths'),
      displayed.value.map((row) => row.deathsWan),
      '#d58662',
    ),
    series(
      key('naturalChange'),
      displayed.value.map((row) => row.birthsWan - row.deathsWan),
      '#a17ac5',
    ),
  ],
}))
const ageOption = computed<EChartsCoreOption>(() => ({
  ...commonChart(key('populationAxis')),
  series: [
    series(
      key('age0to15'),
      displayed.value.map((row) => row.age0to15Wan),
      '#61adcc',
      true,
    ),
    series(
      key('age16to59'),
      displayed.value.map((row) => row.age16to59Wan),
      '#57b28f',
    ),
    series(
      key('age60to64'),
      displayed.value.map((row) => row.age60to64Wan),
      '#cfb06c',
    ),
    series(
      key('age65Plus'),
      displayed.value.map((row) => row.age65PlusWan),
      '#d28478',
    ),
  ],
}))
const housingOption = computed<EChartsCoreOption>(() => ({
  ...commonChart(key('housingAxis')),
  series: [
    series(
      key('households'),
      displayed.value.map((row) => row.householdsWan),
      '#48a9c4',
      true,
    ),
    series(
      key('housingStock'),
      displayed.value.map((row) => row.residentialUnitsWan),
      '#d29b65',
    ),
  ],
}))
const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
const exportCsv = () => {
  const columns = [
    'year',
    'scenario',
    'populationWan',
    'birthsWan',
    'deathsWan',
    'netMigrationWan',
    'naturalChangeWan',
    'age0to15Wan',
    'age16to59Wan',
    'age60to64Wan',
    'age65PlusWan',
    'urbanPopulationWan',
    'urbanizationPercent',
    'householdSize',
    'householdsWan',
    'residentialUnitsWan',
    'unitsAddedWan',
    'unitsRetiredWan',
    'residentialFloorAreaBillionM2',
    'unitsMinusHouseholdsWan',
    'populationBasis',
    'ageBasis',
    'householdBasis',
    'urbanizationBasis',
    'housingBasis',
    'populationSource',
    'officialAnchorSource',
    'householdSampleSource',
    ...assumptionFields.map((field) => `assumption_${field.key}`),
  ]
  const lines = [
    columns.map(csvCell).join(','),
    ...rows.value.map((row) =>
      [
        row.year,
        row.scenario,
        row.populationWan,
        row.birthsWan,
        row.deathsWan,
        row.netMigrationWan,
        row.birthsWan - row.deathsWan,
        row.age0to15Wan,
        row.age16to59Wan,
        row.age60to64Wan,
        row.age65PlusWan,
        row.urbanPopulationWan,
        row.urbanizationPercent,
        row.householdSize,
        row.householdsWan,
        row.residentialUnitsWan,
        row.unitsAddedWan,
        row.unitsRetiredWan,
        row.residentialFloorAreaBillionM2,
        row.unitsMinusHouseholdsWan,
        row.populationBasis,
        'illustrative-wide-band-model',
        'assumption-model',
        'assumption-model',
        'assumption-model',
        anchorData.sources.unWpp2024Full,
        anchorData.sources.nbs2025,
        anchorData.sources.nbs2025Sample,
        ...assumptionFields.map((field) => assumptions.value[field.key]),
      ]
        .map(csvCell)
        .join(','),
    ),
  ]
  const file = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `china-demography-${scenario.value}-2026-2125.csv`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
</script>

<template>
  <main class="demography-page">
    <ResearchPageHeader
      density="workbench"
      :eyebrow="key('eyebrow')"
      :title="key('title')"
      :description="key('description')"
    >
      <template #meta>
        <div class="hero-meta">
          <span
            >{{ key('anchor') }} · {{ number(anchorData.official2025.populationWan) }}
            {{ key('peopleWan') }}</span
          >
          <a :href="anchorData.sources.nbs2025" target="_blank" rel="noopener noreferrer">NBS ↗</a>
        </div>
      </template>
      <template #status>
        <div class="hero-status">
          <small>{{ key('projection') }}</small>
          <strong>{{
            scenario === 'low' ? key('low') : scenario === 'high' ? key('high') : key('medium')
          }}</strong>
          <span>{{ key('longHorizon') }}</span>
        </div>
      </template>
    </ResearchPageHeader>

    <section class="panel controls" :aria-label="key('scenario')">
      <label
        >{{ key('scenario') }}
        <select v-model="scenario">
          <option v-for="value in scenarios" :key="value" :value="value">{{ key(value) }}</option>
        </select>
      </label>
      <label
        >{{ key('horizon') }}
        <select v-model.number="endYear">
          <option :value="2050">2050</option>
          <option :value="2100">2100</option>
          <option :value="2125">2125</option>
        </select>
      </label>
      <p>{{ key('scenarioNote') }}</p>
    </section>

    <div v-if="selectedYear" class="summary-grid">
      <article class="panel summary">
        <small>{{ endYear }} · {{ key('population') }} / {{ key('peopleWan') }}</small
        ><strong>{{ number(selectedYear.populationWan) }}</strong>
      </article>
      <article class="panel summary">
        <small
          >{{ endYear }} · {{ key('workingAge') }} ({{ key('ageAssumption') }}) /
          {{ key('peopleWan') }}</small
        ><strong>{{ number(selectedYear.age16to59Wan) }}</strong>
      </article>
      <article class="panel summary">
        <small
          >{{ endYear }} · {{ key('older') }} ({{ key('ageAssumption') }}) /
          {{ key('peopleWan') }}</small
        ><strong>{{ number(selectedYear.age65PlusWan) }}</strong>
      </article>
      <article class="panel summary">
        <small>{{ endYear }} · {{ key('households') }} / {{ key('householdsWan') }}</small
        ><strong>{{ number(selectedYear.householdsWan) }}</strong>
      </article>
    </div>

    <section class="chart-grid">
      <article class="panel chart-panel">
        <h2>{{ key('totalChart') }}</h2>
        <EChart :option="totalOption" :label="key('totalChart')" />
      </article>
      <article class="panel chart-panel">
        <h2>{{ key('populationChart') }}</h2>
        <EChart :option="birthsOption" :label="key('populationChart')" />
      </article>
      <article class="panel chart-panel">
        <h2>{{ key('ageChart') }}</h2>
        <EChart :option="ageOption" :label="key('ageChart')" />
        <p>{{ key('ageNote') }}</p>
      </article>
      <article class="panel chart-panel wide">
        <h2>{{ key('housingChart') }}</h2>
        <EChart :option="housingOption" :label="key('housingChart')" />
        <p>{{ key('balanceNote') }}</p>
      </article>
    </section>

    <section class="panel assumptions">
      <div class="section-heading">
        <div>
          <h2>{{ key('assumptions') }}</h2>
          <p>{{ key('assumptionNote') }}</p>
          <p>
            {{
              t('chinaDemography.sampleNote', {
                households: number(anchorData.sample2025.familyHouseholdsWan),
                size: anchorData.sample2025.averageFamilyHouseholdSize,
              })
            }}
          </p>
        </div>
        <button type="button" @click="resetAssumptions">{{ key('reset') }}</button>
      </div>
      <div class="assumption-grid">
        <label v-for="field in assumptionFields" :key="field.key">
          <span>{{ key(field.key) }}</span>
          <input
            type="number"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :value="assumptions[field.key]"
            @change="updateAssumption(field, $event)"
          />
        </label>
      </div>
    </section>

    <section class="panel data-section">
      <div class="section-heading">
        <div>
          <h2>{{ key('modelRows') }}</h2>
          <p>{{ key('projection') }} · {{ key('unitWan') }}</p>
        </div>
        <button type="button" @click="exportCsv">{{ key('export') }}</button>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ key('year') }}</th>
              <th>{{ key('basis') }}</th>
              <th>{{ key('population') }}</th>
              <th>{{ key('births') }}</th>
              <th>{{ key('deaths') }}</th>
              <th>{{ key('naturalChange') }}</th>
              <th>{{ key('age16to59') }}</th>
              <th>{{ key('age65Plus') }}</th>
              <th>{{ key('urbanization') }}</th>
              <th>{{ key('householdSize') }}</th>
              <th>{{ key('households') }}</th>
              <th>{{ key('housingStock') }}</th>
              <th>{{ key('unitsAdded') }}</th>
              <th>{{ key('unitsRetired') }}</th>
              <th>{{ key('balance') }}</th>
              <th>{{ key('area') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="row.year">
              <th>{{ row.year }}</th>
              <td>{{ populationBasisLabel(row.populationBasis) }}</td>
              <td>{{ number(row.populationWan) }}</td>
              <td>{{ number(row.birthsWan) }}</td>
              <td>{{ number(row.deathsWan) }}</td>
              <td>{{ number(row.birthsWan - row.deathsWan) }}</td>
              <td>{{ number(row.age16to59Wan) }}</td>
              <td>{{ number(row.age65PlusWan) }}</td>
              <td>{{ number(row.urbanizationPercent, 1) }}%</td>
              <td>{{ number(row.householdSize, 2) }}</td>
              <td>{{ number(row.householdsWan) }}</td>
              <td>{{ number(row.residentialUnitsWan) }}</td>
              <td>{{ number(row.unitsAddedWan) }}</td>
              <td>{{ number(row.unitsRetiredWan) }}</td>
              <td>{{ number(row.unitsMinusHouseholdsWan) }}</td>
              <td>{{ number(row.residentialFloorAreaBillionM2, 1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button type="button" :disabled="page === 1" @click="page--">{{ key('previous') }}</button>
        <span>{{ t('chinaDemography.page', { page, total: pageCount }) }}</span>
        <button type="button" :disabled="page === pageCount" @click="page++">
          {{ key('next') }}
        </button>
      </div>
    </section>
    <section class="panel sources">
      <h2>{{ key('source') }}</h2>
      <p>{{ key('sourceNote') }}</p>
      <p>{{ key('vintageNote') }}</p>
      <p>{{ key('longHorizon') }}</p>
      <div class="source-links">
        <a :href="anchorData.sources.nbs2025" target="_blank" rel="noopener noreferrer"
          >NBS · 2025 ↗</a
        >
        <a :href="anchorData.sources.nbs2025Sample" target="_blank" rel="noopener noreferrer"
          >NBS · 2025 sample ↗</a
        >
        <a :href="anchorData.sources.unWpp2024Full" target="_blank" rel="noopener noreferrer"
          >UN WPP 2024 ↗</a
        >
      </div>
    </section>
  </main>
</template>

<style scoped>
.demography-page {
  max-width: var(--content-workbench);
  margin: auto;
  padding: 0 var(--page-gutter) 48px;
  color: var(--ink);
}
.panel {
  min-width: 0;
  padding: var(--panel-padding);
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.hero-meta,
.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 14px;
  font-size: 12px;
}
.hero-meta a {
  color: var(--accent);
}
.source-links a {
  color: var(--accent);
}
.hero-status small,
.hero-status span {
  display: block;
  color: var(--muted);
}
.hero-status strong {
  display: block;
  margin: 8px 0;
  color: var(--accent);
  font-size: 26px;
}
.hero-status span {
  max-width: 220px;
  font-size: 11px;
  line-height: 1.5;
}
.controls {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.controls label,
.assumption-grid label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
select,
input,
button {
  min-height: var(--control-height);
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-elevated);
  color: var(--ink);
  font: inherit;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: default;
  opacity: 0.5;
}
.controls p {
  flex: 1 1 350px;
  margin: 0 0 5px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.summary-grid,
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}
.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.summary small {
  display: block;
  min-height: 32px;
  color: var(--muted);
  line-height: 1.4;
}
.summary strong {
  display: block;
  margin-top: 8px;
  font-size: clamp(22px, 2.3vw, 32px);
  font-variant-numeric: tabular-nums;
}
h2 {
  margin: 0 0 12px;
  font-size: 17px;
}
.chart-panel {
  min-height: 390px;
}
.chart-panel :deep(.chart) {
  height: 315px;
}
.chart-panel.wide {
  grid-column: 1/-1;
}
.chart-panel p,
.section-heading p,
.sources p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.assumptions,
.data-section,
.sources {
  margin-bottom: 18px;
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
  margin-bottom: 18px;
}
.section-heading h2 {
  margin-bottom: 0;
}
.assumption-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.assumption-grid input {
  width: 100%;
  font-variant-numeric: tabular-nums;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 1450px;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
th,
td {
  padding: 10px 9px;
  border-bottom: 1px solid var(--border);
  text-align: right;
  white-space: nowrap;
}
thead th {
  color: var(--muted);
  font-weight: 700;
}
tbody th {
  text-align: left;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  color: var(--muted);
  font-size: 12px;
}
@media (max-width: 900px) {
  .summary-grid,
  .assumption-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 650px) {
  .demography-page {
    padding-inline: var(--page-gutter);
  }
  .summary-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
  .chart-panel.wide {
    grid-column: auto;
  }
  .section-heading {
    flex-wrap: wrap;
  }
  .section-heading button {
    width: 100%;
  }
  .summary small {
    min-height: 0;
  }
}
</style>
