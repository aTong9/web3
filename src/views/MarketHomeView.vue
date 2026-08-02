<script setup lang="ts">
import { computed } from 'vue'
import marketHomeData from '@/data/market-home.json'
import type { MarketHomeDataset } from '@/types'
import DisclosureCard from '@/components/DisclosureCard.vue'

const dataset = marketHomeData as MarketHomeDataset
const markets = computed(() => dataset.marketBrief.markets)
const leadMarket = computed(() => markets.value[0])

const formatMove = (value: number | null) =>
  value === null ? '—' : (value > 0 ? '+' : '') + value.toFixed(2) + '%'
const directionName = (direction: 'bullish' | 'bearish') =>
  direction === 'bullish' ? '偏涨' : '偏跌'
const validationText = (
  horizon: MarketHomeDataset['marketBrief']['markets'][number]['horizonOutlooks'][number],
) => {
  if (horizon.validated)
    return (
      '留出验证通过 · ' +
      horizon.validation.samples +
      '样本 · 命中' +
      (horizon.validation.accuracyPct?.toFixed(1) ?? '—') +
      '%'
    )
  const lift =
    horizon.validation.liftPct === null
      ? '—'
      : (horizon.validation.liftPct > 0 ? '+' : '') +
        horizon.validation.liftPct.toFixed(1) +
        '%'
  return '观察信号 · 留出' + horizon.validation.samples + '样本 · 相对基线' + lift
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
        <p>MARKET NOW & NEXT</p>
        <h1>市场今日结论</h1>
        <span>仅使用跨资产市场驾驶舱已经生成的因子，不混入新闻、KOL或主观判断。</span>
        <small>数据更新 {{ formatUpdatedAt(dataset.updatedAt) }}</small>
      </div>
      <section v-if="leadMarket" class="market-pulse" aria-label="市场方向脉冲">
        <div class="pulse-heading">
          <span>基准市场脉冲</span>
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
        eyebrow="宏观与流动性"
        :title="dataset.marketBrief.regime.title"
        description="点击查看当前宏观与流动性因子"
        default-open
      >
        <p>{{ dataset.marketBrief.regime.summary }}</p>
      </DisclosureCard>
      <DisclosureCard
        eyebrow="长端利率来源"
        :title="dataset.marketBrief.rateRegime.title"
        description="期限溢价与政策路径分解"
      >
        <p>{{ dataset.marketBrief.rateRegime.summary }}</p>
      </DisclosureCard>
      <DisclosureCard
        eyebrow="市场参与度"
        :title="dataset.marketBrief.breadth.title"
        description="全球股指与风险资产参与率"
      >
        <p>{{ dataset.marketBrief.breadth.summary }}</p>
      </DisclosureCard>
    </section>

    <section class="market-grid">
      <DisclosureCard
        v-for="market in markets"
        :key="market.id"
        class="market-card"
        :eyebrow="market.date ?? '日期未知'"
        :title="market.name"
        description="展开查看涨跌因子与四周期方向"
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
          <b>当前涨跌的跨资产因素</b>
          <ul v-if="market.drivers.length">
            <li v-for="driver in market.drivers" :key="driver.chain">
              <span :class="driver.effect">{{ driver.effect === 'tailwind' ? '顺风' : '逆风' }}</span>
              {{ driver.text }}
            </li>
          </ul>
          <p v-else>驾驶舱当前没有足够强且稳定的共振因子，不补充其他解释。</p>
        </div>

        <div class="horizons">
          <section v-for="horizon in market.horizonOutlooks" :key="horizon.id">
            <header>
              <span>{{ horizon.label }}</span>
              <strong :class="horizon.direction">{{ directionName(horizon.direction) }}</strong>
            </header>
            <div class="probability">
              上涨条件频率 {{ horizon.upProbabilityPct.toFixed(1) }}% · 得分
              {{ horizon.score > 0 ? '+' : '' }}{{ horizon.score.toFixed(2) }}
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
      “偏涨/偏跌”是规则模型方向，不是确定结果；标记为“观察信号”时，方向尚未通过留出样本增量门槛。
    </footer>
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
