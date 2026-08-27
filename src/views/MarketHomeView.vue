<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import DataUpdateStatus from '@/components/DataUpdateStatus.vue'
import MarketQuoteStatus from '@/components/MarketQuoteStatus.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import marketHomeData from '@/data/market-home.json'
import crossAssetData from '@/data/cross-asset.json'
import type { CrossAssetDataset, MarketHomeDataset } from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'
import { useI18n } from '@/composables/use-i18n'
import { marketAssetQuoteSymbols, useMarketQuotes } from '@/composables/use-market-quotes'

const dataset = marketHomeData as MarketHomeDataset
const crossAssetDataset = crossAssetData as CrossAssetDataset
const posterOpen = ref(false)
type MarketScope = 'all' | 'equity' | 'commodity' | 'crypto'
const marketScope = ref<MarketScope>('all')
const DailyMarketPoster = defineAsyncComponent(() => import('@/components/DailyMarketPoster.vue'))
const markets = computed(() => dataset.marketBrief.markets)
const leadMarket = computed(() => markets.value[0])
const { t } = useI18n()
const marketScopes: Array<{ id: MarketScope; label: string }> = [
  { id: 'all', label: 'marketHome.scope.all' },
  { id: 'equity', label: 'marketHome.scope.equity' },
  { id: 'commodity', label: 'marketHome.scope.commodity' },
  { id: 'crypto', label: 'marketHome.scope.crypto' },
]
const marketScopeById: Record<string, Exclude<MarketScope, 'all'>> = {
  sp500: 'equity',
  nasdaq: 'equity',
  shanghai: 'equity',
  hangseng: 'equity',
  euro50: 'equity',
  nikkei: 'equity',
  wti: 'commodity',
  gold: 'commodity',
  btc: 'crypto',
  eth: 'crypto',
}
const quoteSymbols = computed(() =>
  markets.value
    .map((market) => marketAssetQuoteSymbols[market.id])
    .filter((symbol): symbol is string => Boolean(symbol)),
)
const { quoteFor, loading: quoteLoading, error: quoteError } = useMarketQuotes(quoteSymbols)
const marketQuote = (id: string) => {
  const symbol = marketAssetQuoteSymbols[id]
  return symbol ? quoteFor(symbol) : null
}

const formatMove = (value: number | null) =>
  value === null ? '—' : (value > 0 ? '+' : '') + value.toFixed(2) + '%'
const formatMarketValue = (id: string) => {
  const asset = crossAssetDataset.assets.find((item) => item.id === id)
  const quote = marketQuote(id)
  const currentValue = quote?.price ?? asset?.value ?? null
  if (!asset || currentValue === null) return '—'
  const value = currentValue.toLocaleString('zh-CN', { maximumFractionDigits: 4 })
  return asset.unit === '美元' || quote?.currency === 'USD' ? `$${value}` : `${value} ${asset.unit}`
}
const marketMove = (market: MarketHomeDataset['marketBrief']['markets'][number]) =>
  marketQuote(market.id)?.changePct ?? market.dailyMove
const filteredMarkets = computed(() =>
  marketScope.value === 'all'
    ? markets.value
    : markets.value.filter((market) => marketScopeById[market.id] === marketScope.value),
)
const risingMarkets = computed(
  () => markets.value.filter((market) => (marketMove(market) ?? 0) >= 0).length,
)
const fallingMarkets = computed(() => markets.value.length - risingMarkets.value)
const directionName = (direction: 'bullish' | 'bearish') =>
  direction === 'bullish' ? t('direction.bullish') : t('direction.bearish')
const formatSignedPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const historicalRangeText = (
  horizon: MarketHomeDataset['marketBrief']['markets'][number]['horizonOutlooks'][number],
) => {
  const { low, high, samples } = horizon.historicalReturnRangePct
  if (low === null || high === null) return t('marketHome.period.rangeUnavailable')
  return t('marketHome.period.returnRange', {
    low: formatSignedPct(low),
    high: formatSignedPct(high),
    samples,
  })
}
const validationText = (
  horizon: MarketHomeDataset['marketBrief']['markets'][number]['horizonOutlooks'][number],
) => {
  if (horizon.validated)
    return t('marketHome.validation.pass', {
      samples: horizon.validation.samples,
      accuracy: horizon.validation.accuracyPct?.toFixed(1) ?? '—',
    })
  const lift =
    horizon.validation.liftPct === null
      ? '—'
      : (horizon.validation.liftPct > 0 ? '+' : '') + horizon.validation.liftPct.toFixed(1) + '%'
  return t('marketHome.validation.watch', {
    samples: horizon.validation.samples,
    lift,
  })
}
</script>

<template>
  <main class="market-home">
    <ResearchPageHeader
      :eyebrow="t('marketHome.badge')"
      :title="t('marketHome.heading')"
      :description="t('marketHome.hint')"
      status-width="wide"
    >
      <template #meta>
        <DataUpdateStatus
          :updated-at="dataset.updatedAt"
          schedule="crossAsset"
          source-label="跨资产自动快照"
          quality="complete"
        />
      </template>
      <template #status
        ><section
          v-if="leadMarket"
          class="market-pulse"
          :aria-label="t('marketHome.pulse.baseline')"
        >
          <div class="pulse-heading">
            <span>{{ t('marketHome.pulse.baseline') }}</span>
            <strong>{{ leadMarket.name }}</strong>
            <b
              :class="{
                up: (marketMove(leadMarket) ?? 0) >= 0,
                down: (marketMove(leadMarket) ?? 0) < 0,
              }"
            >
              {{ formatMove(marketMove(leadMarket)) }}
            </b>
            <small class="latest-price">
              {{ t('crossAsset.latestValue') }} {{ formatMarketValue(leadMarket.id) }}
            </small>
            <MarketQuoteStatus
              :quote="marketQuote(leadMarket.id)"
              :loading="quoteLoading"
              :error="quoteError"
              show-time
            />
          </div>
          <div class="pulse-track" aria-hidden="true">
            <i
              v-for="horizon in leadMarket.horizonOutlooks"
              :key="horizon.id"
              :class="horizon.direction"
            ></i>
          </div>
          <div class="pulse-horizons">
            <span v-for="horizon in leadMarket.horizonOutlooks" :key="horizon.id">
              <small>{{ horizon.label.replace('未来', '') }}</small>
              <strong :class="horizon.direction">{{ directionName(horizon.direction) }}</strong>
              <em>{{ historicalRangeText(horizon) }}</em>
            </span>
          </div>
        </section></template
      >
    </ResearchPageHeader>

    <section class="global-factors">
      <DisclosureCard
        class="primary-factor"
        :eyebrow="t('marketHome.coreFactors.macro')"
        :title="dataset.marketBrief.regime.title"
        :description="t('marketHome.coreFactors.more')"
        default-open
      >
        <p>{{ dataset.marketBrief.regime.summary }}</p>
      </DisclosureCard>
      <DisclosureCard
        :eyebrow="t('marketHome.coreFactors.termRate')"
        :title="dataset.marketBrief.rateRegime.title"
        :description="t('marketHome.coreFactors.details')"
      >
        <p>{{ dataset.marketBrief.rateRegime.summary }}</p>
      </DisclosureCard>
      <DisclosureCard
        :eyebrow="t('marketHome.coreFactors.liquidity')"
        :title="dataset.marketBrief.breadth.title"
        :description="t('marketHome.coreFactors.marketParticipation')"
      >
        <p>{{ dataset.marketBrief.breadth.summary }}</p>
      </DisclosureCard>
    </section>

    <section class="market-section" aria-labelledby="market-section-title">
      <header class="market-section-heading">
        <div>
          <p>{{ t('marketHome.marketList.eyebrow') }}</p>
          <h2 id="market-section-title">{{ t('marketHome.marketList.title') }}</h2>
          <span>{{ t('marketHome.marketList.description') }}</span>
        </div>
        <dl class="market-summary" :aria-label="t('marketHome.marketList.summary')">
          <div>
            <dt>{{ t('marketHome.marketList.covered') }}</dt>
            <dd>{{ markets.length }}</dd>
          </div>
          <div>
            <dt>{{ t('marketHome.marketList.rising') }}</dt>
            <dd class="up">{{ risingMarkets }}</dd>
          </div>
          <div>
            <dt>{{ t('marketHome.marketList.falling') }}</dt>
            <dd class="down">{{ fallingMarkets }}</dd>
          </div>
        </dl>
      </header>
      <div class="market-toolbar">
        <div class="scope-switch" role="group" :aria-label="t('marketHome.scope.label')">
          <button
            v-for="scope in marketScopes"
            :key="scope.id"
            type="button"
            :class="{ active: marketScope === scope.id }"
            :aria-pressed="marketScope === scope.id"
            @click="marketScope = scope.id"
          >
            {{ t(scope.label) }}
          </button>
        </div>
        <span>{{ t('marketHome.marketList.showing', { count: filteredMarkets.length }) }}</span>
      </div>
      <div class="market-grid">
      <DisclosureCard
        v-for="market in filteredMarkets"
        :key="market.id"
        class="market-card"
        :eyebrow="market.date ?? t('marketHome.unknownDate')"
        :title="market.name"
        :description="t('marketHome.card.futureDirection')"
        :default-open="false"
      >
        <template #metric>
          <span class="market-metric">
            <small>{{ formatMarketValue(market.id) }}</small>
            <strong
              :class="{ up: (marketMove(market) ?? 0) >= 0, down: (marketMove(market) ?? 0) < 0 }"
            >
              {{ formatMove(marketMove(market)) }}
            </strong>
            <MarketQuoteStatus
              :quote="marketQuote(market.id)"
              :loading="quoteLoading"
              :error="quoteError"
            />
          </span>
        </template>

        <div class="cause">
          <b>{{ t('marketHome.factor.current') }}</b>
          <ul v-if="market.drivers.length">
            <li v-for="driver in market.drivers" :key="driver.chain">
              <span :class="driver.effect">
                {{
                  driver.effect === 'tailwind'
                    ? t('marketHome.driverEffect.tailwind')
                    : t('marketHome.driverEffect.headwind')
                }}
              </span>
              {{ driver.text }}
            </li>
          </ul>
          <p v-else>{{ t('marketHome.factor.noEnough') }}</p>
        </div>

        <div class="horizons">
          <section v-for="horizon in market.horizonOutlooks" :key="horizon.id">
            <header>
              <span>{{ horizon.label }}</span>
              <strong :class="horizon.direction">{{ directionName(horizon.direction) }}</strong>
            </header>
            <div class="probability">
              {{
                t('marketHome.period.upChance', {
                  value: horizon.upProbabilityPct.toFixed(1),
                  score: `${horizon.score > 0 ? '+' : ''}${horizon.score.toFixed(2)}`,
                })
              }}
            </div>
            <div class="return-range">{{ historicalRangeText(horizon) }}</div>
            <ul>
              <li v-for="factor in horizon.factors" :key="factor.name">{{ factor.text }}</li>
            </ul>
            <small :class="{ validated: horizon.validated }">{{ validationText(horizon) }}</small>
          </section>
        </div>
      </DisclosureCard>
      </div>
    </section>

    <footer>
      {{ t('marketHome.noteDescription') }}
    </footer>

    <section class="poster-launcher" aria-labelledby="poster-launcher-title">
      <div>
        <small>{{ t('poster.badge') }}</small>
        <h2 id="poster-launcher-title">{{ t('poster.title') }}</h2>
        <p>{{ t('poster.loadHint') }}</p>
      </div>
      <button
        type="button"
        :aria-expanded="posterOpen"
        aria-controls="daily-market-poster"
        @click="posterOpen = !posterOpen"
      >
        {{ posterOpen ? t('poster.closeBuilder') : t('poster.openBuilder') }}
      </button>
    </section>
    <div v-if="posterOpen" id="daily-market-poster">
      <Suspense>
        <DailyMarketPoster :home="dataset" :cross-asset="crossAssetDataset" />
        <template #fallback>
          <p class="data-load-state" role="status">{{ t('poster.loadingBuilder') }}</p>
        </template>
      </Suspense>
    </div>
  </main>
</template>

<style scoped>
.market-home {
  max-width: var(--content-wide);
  margin: 0 auto;
  padding: 32px var(--page-gutter) 80px;
}
.poster-launcher {
  margin-top: 48px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--panel-radius);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.poster-launcher small {
  color: var(--accent);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.poster-launcher h2 {
  margin: 6px 0;
  font:
    500 24px Georgia,
    'Songti SC',
    serif;
}
.poster-launcher p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}
.poster-launcher button {
  padding: 0 18px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--accent);
  color: white;
  cursor: pointer;
  white-space: nowrap;
}
.home-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  align-items: stretch;
  gap: 24px;
}
.home-heading p {
  margin: 0 0 9px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.home-heading h1 {
  margin: 0;
  font:
    500 clamp(34px, 4vw, 52px) Georgia,
    'Songti SC',
    serif;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.home-heading > div > span,
.heading-copy > small {
  display: block;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
  text-wrap: pretty;
}
.heading-copy > small {
  margin-top: 20px;
  font-size: 10px;
}
.market-pulse {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.pulse-heading {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 4px 16px;
}
.pulse-heading span {
  grid-column: 1 / -1;
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.pulse-heading strong {
  font:
    500 22px Georgia,
    'Songti SC',
    serif;
}
.pulse-heading b {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.latest-price {
  grid-column: 1 / -1;
  color: var(--muted);
  font-size: 9px;
}
.market-metric {
  display: grid;
  justify-items: end;
  gap: 4px;
}
.market-metric small {
  color: var(--muted);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}
.pulse-track {
  height: 4px;
  margin: 18px 0 14px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}
.pulse-track i {
  border-radius: 999px;
  background: var(--muted);
  opacity: 0.35;
}
.pulse-track i.bullish {
  background: var(--positive);
  opacity: 1;
}
.pulse-track i.bearish {
  background: var(--negative);
  opacity: 1;
}
.pulse-horizons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.pulse-horizons span {
  display: grid;
  gap: 4px;
}
.pulse-horizons small {
  color: var(--muted);
  font-size: 10px;
}
.pulse-horizons strong {
  font-size: 13px;
}
.pulse-horizons em {
  color: var(--muted);
  font-size: 8px;
  font-style: normal;
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
}
.global-factors {
  margin: 24px 0 32px;
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 12px;
}
.global-factors p {
  margin: 15px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}
.market-section {
  margin-top: 38px;
}
.market-section-heading {
  margin-bottom: 18px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.market-section-heading p {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
}
.market-section-heading h2 {
  margin: 0;
  font: 500 clamp(24px, 3vw, 34px) Georgia, 'Songti SC', serif;
}
.market-section-heading span {
  margin-top: 7px;
  color: var(--muted);
  display: block;
  font-size: 12px;
}
.market-summary {
  margin: 0;
  display: flex;
  gap: 8px;
}
.market-summary > div {
  min-width: 76px;
  padding: 10px 12px;
  border-left: 1px solid var(--border);
}
.market-summary dt {
  color: var(--muted);
  font-size: 9px;
}
.market-summary dd {
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.market-toolbar {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.market-toolbar > span {
  color: var(--muted);
  font-size: 11px;
  white-space: nowrap;
}
.scope-switch {
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-soft);
  display: inline-flex;
  gap: 2px;
}
.scope-switch button {
  min-height: 32px;
  padding: 0 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 11px;
}
.scope-switch button.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  font-weight: 700;
}
.market-grid {
  display: grid;
  gap: 10px;
}
.market-card {
  box-shadow: none;
}
.up,
.bullish,
.tailwind {
  color: var(--positive);
}
.down,
.bearish,
.headwind {
  color: var(--negative);
}
.cause {
  margin: 18px 0;
  padding: 14px 16px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
}
.cause b {
  font-size: 12px;
}
.cause ul,
.cause p {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.65;
}
.cause li + li {
  margin-top: 5px;
}
.cause li span {
  margin-right: 5px;
  font-weight: 700;
}
.horizons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.horizons > section {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
}
.horizons header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.horizons header span {
  font-size: 11px;
  font-weight: 700;
}
.horizons header strong {
  font-size: 17px;
}
.probability {
  margin-top: 7px;
  color: var(--muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.return-range {
  margin-top: 4px;
  color: var(--ink);
  font-size: 9px;
  line-height: 1.45;
  font-variant-numeric: tabular-nums;
}
.horizons ul {
  min-height: 68px;
  margin: 10px 0;
  padding-left: 15px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.55;
}
.horizons small {
  display: block;
  padding-top: 9px;
  border-top: 1px solid var(--border);
  color: var(--warning);
  font-size: 9px;
  line-height: 1.5;
}
.horizons small.validated {
  color: var(--negative);
}
.market-home > footer {
  margin-top: 20px;
  color: var(--muted);
  font-size: 10px;
}
@media (max-width: 1050px) {
  .home-heading {
    grid-template-columns: 1fr;
  }
  .horizons {
    grid-template-columns: repeat(2, 1fr);
  }
  .global-factors {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .market-home {
    padding: 24px 14px 60px;
  }
  .market-pulse {
    padding: 16px;
  }
  .pulse-heading strong,
  .pulse-heading b {
    font-size: 18px;
  }
  .pulse-horizons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 10px;
  }
  .pulse-horizons span {
    min-width: 0;
  }
  .pulse-horizons em {
    overflow-wrap: anywhere;
  }
  .horizons {
    grid-template-columns: 1fr;
  }
  .market-section {
    margin-top: 30px;
  }
  .market-section-heading {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }
  .market-summary {
    width: 100%;
  }
  .market-summary > div {
    min-width: 0;
    flex: 1;
  }
  .market-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }
  .scope-switch {
    width: 100%;
    overflow-x: auto;
  }
  .scope-switch button {
    flex: 1;
    white-space: nowrap;
  }
  .poster-launcher {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
