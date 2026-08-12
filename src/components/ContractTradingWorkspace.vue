<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core'
import { computed, onMounted, ref, watch } from 'vue'
import DisclosureCard from '@/components/DisclosureCard.vue'
import EChart from '@/components/EChart.vue'
import { useBinanceContractMarket } from '@/composables/use-binance-contract-market'
import { useI18n } from '@/composables/use-i18n'
import type { ContractChartInterval, ContractTradeAction } from '@/types'
import { buildContractTradeDecision } from '@/utils/contract-trade-decision'
import { simpleMovingAverage } from '@/utils/technical-analysis'
import { useTheme } from '@/utils/use-theme'

const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
const intervals: ContractChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h']
const selectedSymbol = ref('BTCUSDT')
const selectedInterval = ref<ContractChartInterval>('5m')
const { locale, t } = useI18n()
const { theme } = useTheme()
const { snapshot, connect, reconnect } = useBinanceContractMarket()
const decision = computed(() => buildContractTradeDecision(snapshot.value))

const formatNumber = (value: number | null, maximumFractionDigits = 2) =>
  value === null
    ? '—'
    : value.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits,
      })
const formatPrice = (value: number | null) =>
  value === null
    ? '—'
    : formatNumber(value, value < 1 ? 6 : value < 100 ? 4 : 2)
const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(value))
    : '—'
const actionClass = (action: ContractTradeAction) =>
  action === 'long' ? 'long' : action === 'short' ? 'short' : 'neutral'
const cssColor = (name: string) => {
  void theme.value
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const chartOption = computed<EChartsCoreOption>(() => {
  const points = snapshot.value.points
  const closes = points.map((point) => point.close)
  const ma20 = simpleMovingAverage(closes, 20)
  const ma60 = simpleMovingAverage(closes, 60)
  const ink = cssColor('--ink')
  const muted = cssColor('--muted')
  const border = cssColor('--border')
  const surface = cssColor('--surface')
  const positive = cssColor('--positive')
  const negative = cssColor('--negative')
  const danger = cssColor('--danger')
  const accent = cssColor('--accent')
  const warning = cssColor('--warning')
  const markLines = [
    decision.value.entryLow !== null && decision.value.entryHigh !== null
      ? {
          name: t('assetTechnical.contract.entry'),
          yAxis: (decision.value.entryLow + decision.value.entryHigh) / 2,
          lineStyle: { color: accent, type: 'dashed' },
        }
      : null,
    decision.value.stopLoss !== null
      ? {
          name: t('assetTechnical.contract.stopLoss'),
          yAxis: decision.value.stopLoss,
          lineStyle: { color: danger, type: 'dashed' },
        }
      : null,
    decision.value.takeProfit !== null
      ? {
          name: t('assetTechnical.contract.takeProfit'),
          yAxis: decision.value.takeProfit,
          lineStyle: { color: positive, type: 'dashed' },
        }
      : null,
  ].filter(Boolean)

  return {
    animation: false,
    backgroundColor: 'transparent',
    textStyle: { color: ink, fontSize: 9 },
    legend: {
      top: 0,
      left: 0,
      textStyle: { color: muted, fontSize: 9 },
      data: [selectedSymbol.value, 'MA20', 'MA60'],
    },
    tooltip: { trigger: 'axis', backgroundColor: surface, borderColor: border, textStyle: { color: ink } },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [
      { left: 56, right: 18, top: 42, height: '61%' },
      { left: 56, right: 18, top: '78%', height: '12%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: points.map((point) => point.date),
        boundaryGap: true,
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: muted, hideOverlap: true, formatter: (value: string) => value.slice(11, 16) },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: points.map((point) => point.date),
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: border } },
      },
    ],
    yAxis: [
      { scale: true, splitLine: { lineStyle: { color: border } }, axisLabel: { color: muted } },
      { gridIndex: 1, scale: true, splitNumber: 2, splitLine: { show: false }, axisLabel: { color: muted } },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 45, end: 100 },
      { type: 'slider', xAxisIndex: [0, 1], start: 45, end: 100, bottom: 2, height: 16, borderColor: border },
    ],
    series: [
      {
        name: selectedSymbol.value,
        type: 'candlestick',
        data: points.map((point) => [point.open, point.close, point.low, point.high]),
        itemStyle: { color: positive, color0: negative, borderColor: positive, borderColor0: negative },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          label: { color: muted, fontSize: 8 },
          data: markLines,
        },
      },
      { name: 'MA20', type: 'line', data: ma20, showSymbol: false, smooth: false, lineStyle: { color: accent, width: 1.2 } },
      { name: 'MA60', type: 'line', data: ma60, showSymbol: false, smooth: false, lineStyle: { color: warning, width: 1.2 } },
      {
        name: t('assetTechnical.contract.volume'),
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: points.map((point, index) => ({
          value: point.volume,
          itemStyle: { color: index && point.close < points[index - 1]!.close ? negative : positive },
        })),
      },
    ],
  }
})

watch([selectedSymbol, selectedInterval], ([symbol, interval]) => {
  void connect(symbol, interval)
})

onMounted(() => void connect(selectedSymbol.value, selectedInterval.value))
</script>

<template>
  <section class="contract-workspace">
    <header class="contract-toolbar">
      <div>
        <span>{{ t('assetTechnical.contract.eyebrow') }}</span>
        <strong>{{ t('assetTechnical.contract.title') }}</strong>
        <small>{{ t('assetTechnical.contract.publicData') }}</small>
      </div>
      <div class="contract-controls">
        <label>
          <span>{{ t('assetTechnical.contract.symbol') }}</span>
          <select v-model="selectedSymbol">
            <option v-for="symbol in symbols" :key="symbol" :value="symbol">{{ symbol }}</option>
          </select>
        </label>
        <div class="interval-switch" role="group" :aria-label="t('assetTechnical.contract.interval')">
          <button
            v-for="interval in intervals"
            :key="interval"
            :class="{ active: selectedInterval === interval }"
            @click="selectedInterval = interval"
          >
            {{ interval }}
          </button>
        </div>
        <button class="reconnect-button" :disabled="snapshot.status === 'connecting'" @click="reconnect">
          {{ t('assetTechnical.contract.reconnect') }}
        </button>
      </div>
    </header>

    <div class="connection-strip" :class="snapshot.status">
      <span><i></i>{{ t(`assetTechnical.contract.status.${snapshot.status}`) }}</span>
      <small>{{ t('assetTechnical.contract.source') }}</small>
      <small>{{ t('assetTechnical.contract.updatedAt', { time: formatTime(snapshot.updatedAt) }) }}</small>
      <small>{{ t('assetTechnical.contract.latency', { value: snapshot.latencyMs ?? '—' }) }}</small>
      <b>{{ t('assetTechnical.contract.paperOnly') }}</b>
    </div>

    <section v-if="snapshot.status === 'restricted' || snapshot.status === 'error'" class="feed-error" role="alert">
      <span>{{ t('assetTechnical.contract.unavailableEyebrow') }}</span>
      <h2>{{ t(`assetTechnical.contract.error.${snapshot.errorCode ?? 'network'}.title`) }}</h2>
      <p>{{ t(`assetTechnical.contract.error.${snapshot.errorCode ?? 'network'}.body`) }}</p>
      <div>
        <button @click="reconnect">{{ t('assetTechnical.contract.retry') }}</button>
        <a
          href="https://developers.binance.com/en/docs/products/derivatives-trading-usds-futures/Introduction"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('assetTechnical.contract.officialDocs') }} ↗</a>
      </div>
    </section>

    <section v-else-if="!snapshot.points.length" class="feed-loading" aria-live="polite">
      <i></i>
      <div>
        <strong>{{ t('assetTechnical.contract.loading') }}</strong>
        <small>{{ t('assetTechnical.contract.loadingHint') }}</small>
      </div>
    </section>

    <div v-else class="contract-layout">
      <div class="contract-chart-column">
        <section class="contract-chart-card">
          <header>
            <div>
              <span>{{ selectedSymbol }} · {{ selectedInterval }}</span>
              <strong>{{ formatPrice(snapshot.markPrice) }} USDT</strong>
            </div>
            <div class="market-metrics">
              <span>{{ t('assetTechnical.contract.funding') }} <b>{{ formatNumber(snapshot.fundingRatePct, 4) }}%</b></span>
              <span>{{ t('assetTechnical.contract.openInterest') }} <b>{{ formatNumber(snapshot.openInterest, 0) }}</b></span>
              <span>{{ t('assetTechnical.contract.nextFunding') }} <b>{{ formatTime(snapshot.nextFundingTime) }}</b></span>
            </div>
          </header>
          <EChart
            class="contract-chart"
            :option="chartOption"
            :label="t('assetTechnical.contract.chartLabel', { symbol: selectedSymbol, interval: selectedInterval })"
          />
        </section>

        <DisclosureCard
          class="indicator-disclosure"
          :default-open="true"
          :eyebrow="t('assetTechnical.contract.indicatorEyebrow')"
          :title="t('assetTechnical.contract.indicatorTitle')"
          :description="t('assetTechnical.contract.indicatorDescription')"
        >
          <template #metric>
            <strong>{{ decision.indicators.filter((item) => item.signal === 'long' || item.signal === 'short').length }}/{{ decision.indicators.length }}</strong>
          </template>
          <div class="indicator-grid">
            <article v-for="indicator in decision.indicators" :key="indicator.id" :class="indicator.signal">
              <header>
                <span>{{ t(`assetTechnical.contract.indicator.${indicator.id}`) }}</span>
                <em>{{ t(`assetTechnical.contract.indicatorSignal.${indicator.signal}`) }}</em>
              </header>
              <strong>{{ indicator.value }}</strong>
              <small>{{ indicator.score > 0 ? '+' : '' }}{{ indicator.score }}</small>
            </article>
          </div>
        </DisclosureCard>
      </div>

      <aside class="decision-panel" :class="actionClass(decision.action)">
        <header>
          <span>{{ t('assetTechnical.contract.currentDecision') }}</span>
          <em>{{ t('assetTechnical.contract.modelBoundary') }}</em>
        </header>
        <div class="decision-headline">
          <strong>{{ t(`assetTechnical.contract.action.${decision.action}`) }}</strong>
          <b>{{ decision.score > 0 ? '+' : '' }}{{ decision.score }}</b>
        </div>
        <div class="confidence-line">
          <span>{{ t('assetTechnical.contract.confidence') }}</span>
          <b>{{ decision.confidence }}%</b>
          <i><em :style="{ width: `${decision.confidence}%` }"></em></i>
        </div>
        <dl class="trade-levels">
          <div><dt>{{ t('assetTechnical.contract.expectedMove') }}</dt><dd>{{ decision.expectedMovePct === null ? '—' : `±${decision.expectedMovePct}%` }}</dd></div>
          <div><dt>{{ t('assetTechnical.contract.entry') }}</dt><dd>{{ formatPrice(decision.entryLow) }} – {{ formatPrice(decision.entryHigh) }}</dd></div>
          <div><dt>{{ t('assetTechnical.contract.stopLoss') }}</dt><dd>{{ formatPrice(decision.stopLoss) }}</dd></div>
          <div><dt>{{ t('assetTechnical.contract.takeProfit') }}</dt><dd>{{ formatPrice(decision.takeProfit) }}</dd></div>
          <div><dt>{{ t('assetTechnical.contract.riskReward') }}</dt><dd>{{ decision.riskReward === null ? '—' : `1:${decision.riskReward}` }}</dd></div>
          <div><dt>{{ t('assetTechnical.contract.invalidation') }}</dt><dd>{{ formatPrice(decision.invalidation) }}</dd></div>
        </dl>
        <section class="decision-evidence">
          <h3>{{ t('assetTechnical.contract.supportingEvidence') }}</h3>
          <p v-if="!decision.reasons.length">{{ t('assetTechnical.contract.noEvidence') }}</p>
          <ul v-else>
            <li v-for="reason in decision.reasons.slice(0, 5)" :key="reason">{{ t(`assetTechnical.contract.reason.${reason}`) }}</li>
          </ul>
        </section>
        <section class="decision-evidence risks">
          <h3>{{ t('assetTechnical.contract.risks') }}</h3>
          <p v-if="!decision.risks.length">{{ t('assetTechnical.contract.noMajorRisk') }}</p>
          <ul v-else>
            <li v-for="risk in decision.risks" :key="risk">{{ t(`assetTechnical.contract.reason.${risk}`) }}</li>
          </ul>
        </section>
        <footer>{{ t('assetTechnical.contract.disclaimer') }}</footer>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.contract-workspace {
  display: grid;
  gap: 12px;
}
.contract-toolbar,
.connection-strip,
.contract-chart-card,
.decision-panel,
.feed-error,
.feed-loading {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.contract-toolbar {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}
.contract-toolbar > div:first-child {
  display: grid;
  gap: 4px;
}
.contract-toolbar > div:first-child span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.contract-toolbar > div:first-child strong {
  font-size: 15px;
}
.contract-toolbar small,
.connection-strip small {
  color: var(--muted);
  font-size: 8px;
}
.contract-controls {
  display: flex;
  gap: 8px;
  align-items: end;
  flex-wrap: wrap;
  justify-content: end;
}
.contract-controls label {
  display: grid;
  gap: 4px;
}
.contract-controls label span {
  color: var(--muted);
  font-size: 7px;
}
.contract-controls select,
.interval-switch button,
.reconnect-button {
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  font-size: 9px;
}
.contract-controls select {
  min-width: 124px;
  padding: 7px 10px;
}
.interval-switch {
  display: flex;
  gap: 4px;
}
.interval-switch button,
.reconnect-button {
  padding: 7px 10px;
  cursor: pointer;
}
.interval-switch button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.reconnect-button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.connection-strip {
  min-height: 42px;
  padding: 9px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.connection-strip span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
  font-weight: 700;
}
.connection-strip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warning);
}
.connection-strip.live i {
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.connection-strip.error i,
.connection-strip.restricted i {
  background: var(--danger);
}
.connection-strip b {
  margin-left: auto;
  padding: 4px 7px;
  border-radius: 99px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 7px;
}
.feed-error,
.feed-loading {
  min-height: 280px;
  padding: 36px;
  display: grid;
  align-content: center;
}
.feed-error span {
  color: var(--danger);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.feed-error h2 {
  margin: 10px 0;
  font: 500 28px Georgia, serif;
}
.feed-error p {
  max-width: 680px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.7;
}
.feed-error div {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.feed-error button,
.feed-error a {
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-soft);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 9px;
  cursor: pointer;
}
.feed-loading {
  grid-template-columns: 12px 1fr;
  gap: 14px;
  align-items: center;
}
.feed-loading i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: feed-pulse 1s ease-in-out infinite alternate;
}
.feed-loading div {
  display: grid;
  gap: 5px;
}
.feed-loading small {
  color: var(--muted);
}
.contract-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 12px;
  align-items: start;
}
.contract-chart-column {
  min-width: 0;
  display: grid;
  gap: 12px;
}
.contract-chart-card {
  min-width: 0;
  padding: 14px;
}
.contract-chart-card > header {
  min-height: 56px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.contract-chart-card > header > div:first-child span,
.contract-chart-card > header > div:first-child strong {
  display: block;
}
.contract-chart-card > header > div:first-child span {
  color: var(--muted);
  font-size: 8px;
}
.contract-chart-card > header > div:first-child strong {
  margin-top: 4px;
  font: 500 20px Georgia, serif;
}
.market-metrics {
  display: flex;
  gap: 16px;
  align-items: start;
  flex-wrap: wrap;
  justify-content: end;
}
.market-metrics span,
.market-metrics b {
  display: block;
}
.market-metrics span {
  color: var(--muted);
  font-size: 7px;
}
.market-metrics b {
  margin-top: 4px;
  color: var(--ink);
  font-size: 9px;
}
.contract-chart {
  height: 570px;
}
.indicator-grid {
  padding-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.indicator-grid article {
  padding: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 7px;
  background: var(--surface-soft);
}
.indicator-grid article.long {
  border-left-color: var(--positive);
}
.indicator-grid article.short {
  border-left-color: var(--negative);
}
.indicator-grid article.risk {
  border-left-color: var(--danger);
}
.indicator-grid header {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.indicator-grid span,
.indicator-grid em,
.indicator-grid strong,
.indicator-grid small {
  display: block;
}
.indicator-grid span,
.indicator-grid em,
.indicator-grid small {
  color: var(--muted);
  font-size: 7px;
}
.indicator-grid em {
  font-style: normal;
}
.indicator-grid strong {
  margin: 7px 0;
  font-size: 9px;
}
.decision-panel {
  padding: 16px;
  border-top: 3px solid var(--muted);
  position: sticky;
  top: 76px;
}
.decision-panel.long {
  border-top-color: var(--positive);
}
.decision-panel.short {
  border-top-color: var(--negative);
}
.decision-panel > header {
  display: grid;
  gap: 4px;
}
.decision-panel > header span {
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.decision-panel > header em {
  color: var(--muted);
  font-size: 7px;
  font-style: normal;
}
.decision-headline {
  margin: 18px 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}
.decision-headline strong {
  font: 500 25px Georgia, 'Songti SC', serif;
}
.decision-headline b {
  font: 500 25px Georgia, serif;
}
.decision-panel.long .decision-headline b {
  color: var(--positive);
}
.decision-panel.short .decision-headline b {
  color: var(--negative);
}
.confidence-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
}
.confidence-line span,
.confidence-line b {
  font-size: 8px;
}
.confidence-line span {
  color: var(--muted);
}
.confidence-line > i {
  grid-column: 1/-1;
  height: 5px;
  border-radius: 5px;
  background: var(--surface-soft);
  overflow: hidden;
}
.confidence-line > i > em {
  height: 100%;
  background: var(--accent);
  display: block;
}
.trade-levels {
  margin: 16px 0;
  border-top: 1px solid var(--border);
}
.trade-levels div {
  min-height: 38px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.trade-levels dt,
.trade-levels dd {
  margin: 0;
  font-size: 8px;
}
.trade-levels dt {
  color: var(--muted);
}
.trade-levels dd {
  font-weight: 700;
  text-align: right;
}
.decision-evidence {
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.decision-evidence h3 {
  margin: 0 0 8px;
  font-size: 9px;
}
.decision-evidence ul {
  margin: 0;
  padding-left: 16px;
}
.decision-evidence li,
.decision-evidence p,
.decision-panel footer {
  color: var(--muted);
  font-size: 8px;
  line-height: 1.55;
}
.decision-evidence li + li {
  margin-top: 5px;
}
.decision-evidence.risks li::marker {
  color: var(--danger);
}
.decision-panel footer {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
@keyframes feed-pulse {
  to { opacity: 0.35; transform: scale(0.72); }
}
@media (prefers-reduced-motion: reduce) {
  .feed-loading i { animation: none; }
}
@media (max-width: 1080px) {
  .contract-layout {
    grid-template-columns: 1fr;
  }
  .decision-panel {
    position: static;
  }
}
@media (max-width: 760px) {
  .contract-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .contract-controls {
    justify-content: stretch;
  }
  .contract-controls label,
  .contract-controls select,
  .reconnect-button {
    width: 100%;
  }
  .interval-switch {
    width: 100%;
    overflow-x: auto;
  }
  .interval-switch button {
    min-width: 44px;
    flex: 0 0 auto;
  }
  .connection-strip b {
    margin-left: 0;
  }
  .contract-chart-card > header {
    flex-direction: column;
  }
  .market-metrics {
    justify-content: start;
  }
  .contract-chart {
    height: 470px;
  }
  .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .feed-error,
  .feed-loading {
    min-height: 240px;
    padding: 22px;
  }
}
</style>
