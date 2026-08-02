<script setup lang="ts">
import { computed } from 'vue'
import marketHomeData from '@/data/market-home.json'
import type { MarketHomeDataset } from '@/types'

const dataset = marketHomeData as MarketHomeDataset
const markets = computed(() => dataset.marketBrief.markets)

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
      <div>
        <p>MARKET NOW & NEXT</p>
        <h1>市场今日结论</h1>
        <span>仅使用跨资产市场驾驶舱已经生成的因子，不混入新闻、KOL或主观判断。</span>
      </div>
      <small>{{ formatUpdatedAt(dataset.updatedAt) }}</small>
    </header>

    <section class="global-factors">
      <article>
        <span>宏观与流动性</span>
        <h2>{{ dataset.marketBrief.regime.title }}</h2>
        <p>{{ dataset.marketBrief.regime.summary }}</p>
      </article>
      <article>
        <span>长端利率来源</span>
        <h2>{{ dataset.marketBrief.rateRegime.title }}</h2>
        <p>{{ dataset.marketBrief.rateRegime.summary }}</p>
      </article>
      <article>
        <span>市场参与度</span>
        <h2>{{ dataset.marketBrief.breadth.title }}</h2>
        <p>{{ dataset.marketBrief.breadth.summary }}</p>
      </article>
    </section>

    <section class="market-grid">
      <article v-for="market in markets" :key="market.id" class="market-card">
        <header>
          <div>
            <span>{{ market.date }}</span>
            <h2>{{ market.name }}</h2>
          </div>
          <strong :class="{ up: (market.dailyMove ?? 0) >= 0, down: (market.dailyMove ?? 0) < 0 }">
            {{ formatMove(market.dailyMove) }}
          </strong>
        </header>

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
      </article>
    </section>

    <footer>
      “偏涨/偏跌”是规则模型方向，不是确定结果；标记为“观察信号”时，方向尚未通过留出样本增量门槛。
    </footer>
  </main>
</template>

<style scoped>
.market-home {
  max-width: 1460px;
  margin: 0 auto;
  padding: 52px clamp(20px, 4vw, 60px) 80px;
}
.home-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
}
.home-heading p,
.global-factors span,
.market-card > header span {
  margin: 0 0 9px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.home-heading h1 {
  margin: 0;
  font: 400 clamp(44px, 6vw, 72px) Georgia, 'Songti SC', serif;
  letter-spacing: -0.04em;
}
.home-heading > div > span,
.home-heading > small {
  color: var(--muted);
  font-size: 11px;
}
.global-factors {
  margin: 34px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface);
}
.global-factors article {
  padding: 20px;
  border-right: 1px solid var(--border);
}
.global-factors article:last-child {
  border-right: 0;
}
.global-factors h2 {
  margin: 0 0 9px;
  font-size: 16px;
}
.global-factors p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.7;
}
.market-grid {
  display: grid;
  gap: 18px;
}
.market-card {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
.market-card > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.market-card h2 {
  margin: 0;
  font: 400 27px Georgia, 'Songti SC', serif;
}
.market-card > header > strong {
  font-size: 24px;
}
.up,
.bullish,
.tailwind {
  color: #b45043;
}
.down,
.bearish,
.headwind {
  color: #28765d;
}
.cause {
  margin: 18px 0;
  padding: 14px 16px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
}
.cause b {
  font-size: 11px;
}
.cause ul,
.cause p {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 10px;
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
  font-size: 10px;
  font-weight: 700;
}
.horizons header strong {
  font-size: 17px;
}
.probability {
  margin-top: 7px;
  color: var(--muted);
  font-size: 9px;
}
.horizons ul {
  min-height: 68px;
  margin: 10px 0;
  padding-left: 15px;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.55;
}
.horizons small {
  display: block;
  padding-top: 9px;
  border-top: 1px solid var(--border);
  color: #9a7346;
  font-size: 8px;
  line-height: 1.5;
}
.horizons small.validated {
  color: #28765d;
}
.market-home > footer {
  margin-top: 20px;
  color: var(--muted);
  font-size: 9px;
}
@media (max-width: 1050px) {
  .horizons {
    grid-template-columns: repeat(2, 1fr);
  }
  .global-factors {
    grid-template-columns: 1fr;
  }
  .global-factors article {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
}
@media (max-width: 620px) {
  .home-heading {
    align-items: start;
    flex-direction: column;
  }
  .horizons {
    grid-template-columns: 1fr;
  }
}
</style>
