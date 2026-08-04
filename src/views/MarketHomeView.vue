<script setup lang="ts">
import { computed } from 'vue'
import marketHomeData from '@/data/market-home.json'
import crossAssetData from '@/data/cross-asset.json'
import type { CrossAssetDataset, MarketHomeDataset } from '@/types'
import DailyMarketPoster from '@/components/DailyMarketPoster.vue'
import DisclosureCard from '@/components/DisclosureCard.vue'
import { useI18n } from '@/composables/use-i18n'

const dataset = marketHomeData as MarketHomeDataset
const crossAssetDataset = crossAssetData as CrossAssetDataset
const markets = computed(() => dataset.marketBrief.markets)
const leadMarket = computed(() => markets.value[0])
const { t } = useI18n()

const formatMove = (value: number | null) =>
  value === null ? '—' : (value > 0 ? '+' : '') + value.toFixed(2) + '%'
const directionName = (direction: 'bullish' | 'bearish') =>
  direction === 'bullish' ? t('direction.bullish') : t('direction.bearish')
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
      : (horizon.validation.liftPct > 0 ? '+' : '') +
        horizon.validation.liftPct.toFixed(1) +
        '%'
  return t('marketHome.validation.watch', {
    samples: horizon.validation.samples,
    lift,
  })
}
const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
</script>

<template>
  <main class="market-home">
    <header class="home-heading">
      <div class="heading-copy">
        <p>{{ t('marketHome.badge') }}</p>
        <h1>{{ t('marketHome.heading') }}</h1>
        <span>{{ t('marketHome.hint') }}</span>
        <small>{{ t('marketHome.updated') }} {{ formatUpdatedAt(dataset.updatedAt) }}</small>
      </div>
      <section v-if="leadMarket" class="market-pulse" :aria-label="t('marketHome.pulse.baseline')">
        <div class="pulse-heading">
          <span>{{ t('marketHome.pulse.baseline') }}</span>
          <strong>{{ leadMarket.name }}</strong>
          <b :class="{ up: (leadMarket.dailyMove ?? 0) >= 0, down: (leadMarket.dailyMove ?? 0) < 0 }">
            {{ formatMove(leadMarket.dailyMove) }}
          </b>
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
          </span>
        </div>
      </section>
    </header>

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

    <section class="market-grid">
      <DisclosureCard
        v-for="market in markets"
        :key="market.id"
        class="market-card"
        :eyebrow="market.date ?? t('marketHome.unknownDate')"
        :title="market.name"
        :description="t('marketHome.card.futureDirection')"
        :default-open="false"
      >
        <template #metric>
          <strong
            :class="{ up: (market.dailyMove ?? 0) >= 0, down: (market.dailyMove ?? 0) < 0 }"
          >
            {{ formatMove(market.dailyMove) }}
          </strong>
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
            <ul>
              <li v-for="factor in horizon.factors" :key="factor.name">{{ factor.text }}</li>
            </ul>
            <small :class="{ validated: horizon.validated }">{{ validationText(horizon) }}</small>
          </section>
        </div>
      </DisclosureCard>
    </section>

    <footer>
      {{ t('marketHome.noteDescription') }}
    </footer>

    <DailyMarketPoster :home="dataset" :cross-asset="crossAssetDataset" />
  </main>
</template>

<style scoped>
.market-home {
  max-width: 1380px;
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
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
  font: 500 clamp(34px, 4vw, 52px) Georgia, 'Songti SC', serif;
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
  font: 500 22px Georgia, 'Songti SC', serif;
}
.pulse-heading b {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.pulse-track {
  height: 4px;
  margin: 18px 0 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  grid-template-columns: repeat(4, 1fr);
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
  grid-template-columns: repeat(4, 1fr);
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
  .horizons {
    grid-template-columns: 1fr;
  }
}
</style>
