<script setup lang="ts">
import { computed, ref } from 'vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { gameIncomeGames, gameIncomeUpdatedAt } from '@/data/game-income'
import type { GameIncomePayout, GameIncomeStartCost } from '@/types'

type PayoutFilter = 'all' | GameIncomePayout
type CostFilter = 'all' | GameIncomeStartCost

const payoutFilter = ref<PayoutFilter>('all')
const costFilter = ref<CostFilter>('all')
const query = ref('')

const payoutOptions: Array<{ value: PayoutFilter; label: string }> = [
  { value: 'all', label: '全部兑现方式' },
  { value: 'fiat', label: '法币提现' },
  { value: 'crypto', label: '加密资产' },
  { value: 'mixed', label: '混合路径' },
]

const costOptions: Array<{ value: CostFilter; label: string }> = [
  { value: 'all', label: '全部启动成本' },
  { value: 'free', label: '可免费开始' },
  { value: 'low', label: '低成本' },
  { value: 'capital', label: '需要本金' },
]

const payoutLabels: Record<GameIncomePayout, string> = {
  fiat: '官方法币提现',
  crypto: '链上资产兑现',
  mixed: '法币 / 加密混合',
}

const costLabels: Record<GameIncomeStartCost, string> = {
  free: '可免费开始',
  low: '低成本起步',
  capital: '需要本金',
}

const visibleGames = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return gameIncomeGames.filter((game) => {
    const matchesPayout = payoutFilter.value === 'all' || game.payout === payoutFilter.value
    const matchesCost = costFilter.value === 'all' || game.startCost === costFilter.value
    const haystack = [
      game.name,
      game.model,
      game.platforms,
      game.availability,
      game.summary,
      ...game.earningRoutes,
    ]
      .join(' ')
      .toLocaleLowerCase()
    return matchesPayout && matchesCost && (!needle || haystack.includes(needle))
  })
})

const resetFilters = () => {
  payoutFilter.value = 'all'
  costFilter.value = 'all'
  query.value = ''
}
</script>

<template>
  <main class="game-income-view">
    <ResearchPageHeader
      eyebrow="GAME INCOME · VERIFIED PATHS"
      title="游戏搬砖"
      description="筛选有官方或明确许可兑现路径的全球游戏。这里展示的是操作路径，不是收益承诺；先验证地区、身份与提现规则，再投入时间或本金。"
      :updated-at="gameIncomeUpdatedAt"
      density="comfortable"
      variant="plain"
    />

    <section class="guardrail" aria-labelledby="guardrail-title">
      <div>
        <span>先过四道门</span>
        <h2 id="guardrail-title">能产出，不等于能安全赚钱</h2>
      </div>
      <ol>
        <li><b>规则</b><span>只走官方市场或明确许可渠道</span></li>
        <li><b>地区</b><span>确认所在国家可注册、交易与提现</span></li>
        <li><b>成本</b><span>先算手续费、价差、税费和时间成本</span></li>
        <li><b>小额</b><span>先完成一次最小闭环，再考虑扩大</span></li>
      </ol>
    </section>

    <section class="filters" aria-label="筛选游戏">
      <label>
        <span>搜索</span>
        <input v-model="query" type="search" placeholder="游戏、平台、产出方式或地区…" />
      </label>
      <label>
        <span>兑现方式</span>
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
      <strong>{{ visibleGames.length }} 个已筛选项目</strong>
      <span>资料会随官方条款变化，开始前请重新打开来源核对。</span>
    </div>

    <section v-if="visibleGames.length" class="game-grid" aria-label="可兑现游戏列表">
      <article v-for="game in visibleGames" :key="game.id" class="game-card">
        <header>
          <div>
            <p>{{ game.model }}</p>
            <h2>{{ game.name }}</h2>
          </div>
          <span class="payout-badge" :class="game.payout">{{ payoutLabels[game.payout] }}</span>
        </header>

        <p class="summary">{{ game.summary }}</p>

        <dl>
          <div><dt>启动</dt><dd>{{ costLabels[game.startCost] }}</dd></div>
          <div><dt>平台</dt><dd>{{ game.platforms }}</dd></div>
          <div><dt>范围</dt><dd>{{ game.availability }}</dd></div>
        </dl>

        <div class="earning-routes">
          <span v-for="route in game.earningRoutes" :key="route">{{ route }}</span>
        </div>

        <details>
          <summary><span>查看完整操作与风险</span><b>展开</b></summary>
          <div class="detail-grid">
            <section>
              <h3>操作闭环</h3>
              <ol><li v-for="step in game.steps" :key="step">{{ step }}</li></ol>
            </section>
            <section>
              <h3>准入条件</h3>
              <ul><li v-for="item in game.requirements" :key="item">{{ item }}</li></ul>
              <h3>主要风险</h3>
              <ul class="risks"><li v-for="risk in game.risks" :key="risk">{{ risk }}</li></ul>
            </section>
          </div>
          <footer>
            <span>官方核验</span>
            <a
              v-for="source in game.sources"
              :key="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ source.label }} ↗</a>
          </footer>
        </details>
      </article>
    </section>

    <section v-else class="empty-state">
      <strong>没有符合当前条件的项目</strong>
      <p>尝试放宽兑现方式或启动成本。</p>
      <button type="button" @click="resetFilters">清除筛选</button>
    </section>
  </main>
</template>

<style scoped>
.game-income-view {
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
  grid-template-columns: minmax(180px, 0.7fr) minmax(0, 2fr);
  gap: 28px;
}
.guardrail > div > span {
  color: #92b7e9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
}
.guardrail h2 { margin: 7px 0 0; font: 700 23px/1.25 Georgia, serif; }
.guardrail ol { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.guardrail li { padding-left: 12px; border-left: 1px solid rgb(255 255 255 / 16%); }
.guardrail li b, .guardrail li span { display: block; }
.guardrail li b { color: #8bd4b7; font-size: 12px; }
.guardrail li span { margin-top: 5px; color: color-mix(in srgb, var(--inverse-text) 68%, transparent); font-size: 11px; line-height: 1.55; }
.filters { margin-bottom: 14px; display: grid; grid-template-columns: minmax(260px, 1fr) 190px 190px; gap: 10px; }
.filters label { min-width: 0; height: 58px; padding: 7px 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--surface); display: grid; }
.filters label > span { color: var(--muted); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; }
.filters input, .filters select { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 12px; }
.result-meta { margin-bottom: 18px; color: var(--muted); display: flex; justify-content: space-between; gap: 16px; font-size: 11px; }
.result-meta strong { color: var(--ink); }
.game-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.game-card { min-width: 0; padding: 22px; border: 1px solid var(--border); border-radius: var(--panel-radius); background: var(--surface); box-shadow: 0 1px 0 rgb(0 0 0 / 2%); }
.game-card > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.game-card header p { margin: 0 0 4px; color: var(--muted); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; }
.game-card h2 { margin: 0; font: 700 24px/1.2 Georgia, serif; }
.payout-badge { flex: none; padding: 5px 8px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); font-size: 10px; font-weight: 700; }
.payout-badge.crypto { background: var(--warning-soft); color: var(--warning); }
.payout-badge.mixed { background: color-mix(in srgb, var(--accent-soft) 70%, var(--warning-soft)); }
.summary { min-height: 50px; margin: 14px 0; color: var(--muted); font-size: 12px; line-height: 1.7; }
dl { margin: 0; padding: 12px 0; border-block: 1px solid var(--border); display: grid; grid-template-columns: 0.8fr 1fr 1.4fr; gap: 12px; }
dl div { min-width: 0; }
dt { color: var(--muted); font-size: 9px; }
dd { margin: 4px 0 0; color: var(--ink); font-size: 11px; line-height: 1.45; }
.earning-routes { min-height: 58px; padding: 12px 0; display: flex; align-content: flex-start; flex-wrap: wrap; gap: 6px; }
.earning-routes span { padding: 4px 7px; border-radius: 5px; background: var(--surface-soft); color: var(--muted); font-size: 10px; }
details { border-top: 1px solid var(--border); }
summary { min-height: 42px; color: var(--accent); display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; }
summary b { font-size: 9px; }
details[open] summary b { transform: rotate(180deg); }
.detail-grid { padding: 8px 0 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.detail-grid h3 { margin: 0 0 8px; font-size: 11px; }
.detail-grid h3:not(:first-child) { margin-top: 16px; }
.detail-grid ol, .detail-grid ul { margin: 0; padding-left: 18px; color: var(--muted); font-size: 11px; line-height: 1.65; }
.detail-grid li + li { margin-top: 5px; }
.risks li::marker { color: var(--danger); }
details footer { padding-top: 12px; border-top: 1px solid var(--border); display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
details footer span { margin-right: 4px; color: var(--muted); font-size: 9px; }
details footer a { color: var(--accent); font-size: 10px; text-decoration: none; }
details footer a:hover { text-decoration: underline; }
.empty-state { padding: 54px 20px; border: 1px dashed var(--border); border-radius: var(--panel-radius); background: var(--surface); text-align: center; }
.empty-state p { color: var(--muted); font-size: 12px; }
.empty-state button { padding: 0 14px; border: 0; border-radius: 7px; background: var(--accent); color: white; cursor: pointer; }
@media (max-width: 980px) {
  .guardrail { grid-template-columns: 1fr; }
  .guardrail ol { grid-template-columns: repeat(2, 1fr); }
  .game-grid { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .game-income-view { padding-bottom: 60px; }
  .filters { grid-template-columns: 1fr; }
  .result-meta { display: grid; }
  .guardrail ol, .detail-grid { grid-template-columns: 1fr; }
  dl { grid-template-columns: 1fr 1fr; }
  dl div:last-child { grid-column: 1 / -1; }
}
</style>
