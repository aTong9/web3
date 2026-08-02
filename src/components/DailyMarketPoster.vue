<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import html2canvas from 'html2canvas'
import type { CrossAssetDataset, MarketHomeDataset } from '@/types'

const props = defineProps<{
  home: MarketHomeDataset
  crossAsset: CrossAssetDataset
}>()

const poster = ref<HTMLElement | null>(null)
const exporting = ref(false)
const exportMessage = ref('')
const markets = computed(() => props.home.marketBrief.markets)
const chains = computed(() =>
  props.crossAsset.transmissionChains
    .filter((chain) => chain.status === 'confirming' || chain.status === 'diverging')
    .sort((left, right) => {
      const statusScore = { confirming: 0, diverging: 1, context: 2, dormant: 3, unavailable: 4 }
      return (
        statusScore[left.status] - statusScore[right.status] ||
        Math.abs(right.signal ?? 0) - Math.abs(left.signal ?? 0)
      )
    })
    .slice(0, 5),
)

const formatMove = (value: number | null) =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
const formatSignal = (value: number | null) =>
  value === null ? 'ρ —' : `ρ ${value > 0 ? '' : '−'}${Math.abs(value).toFixed(2)}`
const directionName = (direction: 'bullish' | 'bearish') =>
  direction === 'bullish' ? '偏涨' : '偏跌'
const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const downloadPoster = async () => {
  if (!poster.value || exporting.value) return
  exporting.value = true
  exportMessage.value = '正在生成高清图片…'

  try {
    await nextTick()
    if (document.fonts?.ready) await document.fonts.ready
    const canvas = await html2canvas(poster.value, {
      backgroundColor: '#061321',
      scale: 2,
      useCORS: true,
      logging: false,
      width: poster.value.scrollWidth,
      height: poster.value.scrollHeight,
      windowWidth: poster.value.scrollWidth,
      windowHeight: poster.value.scrollHeight,
    })
    const link = document.createElement('a')
    link.download = `全球市场每日报告-${props.home.marketBrief.asOfDate ?? 'latest'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    exportMessage.value = `已生成 ${canvas.width} × ${canvas.height} PNG`
  } catch (error) {
    console.error('Daily market poster export failed:', error)
    exportMessage.value = '图片生成失败，请稍后重试'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="poster-export" aria-labelledby="poster-title">
    <header class="export-heading">
      <div>
        <p>SHAREABLE MARKET BRIEF</p>
        <h2 id="poster-title">每日市场长图</h2>
        <span>将首页全部市场、四周期方向、驱动因素和传导链绘制为高清 PNG。</span>
      </div>
      <div class="export-actions">
        <small aria-live="polite">{{ exportMessage || '图片数据随首页同步更新' }}</small>
        <button type="button" :disabled="exporting" @click="downloadPoster">
          {{ exporting ? '生成中…' : '下载高清 PNG' }}
        </button>
      </div>
    </header>

    <div class="poster-viewport" tabindex="0" aria-label="每日市场报告图片预览，可横向滚动">
      <article ref="poster" class="market-poster">
        <header class="poster-heading">
          <div>
            <h3>全球市场每日报告</h3>
            <b>{{ home.marketBrief.asOfDate ?? '日期待更新' }}</b>
          </div>
          <span>系统更新：{{ formatUpdatedAt(home.updatedAt) }}</span>
        </header>

        <div class="poster-columns">
          <div class="poster-main">
            <section class="poster-card regime-card">
              <div class="card-title">
                <span>01</span>
                <h4>今日市场状态</h4>
                <b>{{ home.marketBrief.regime.title }}</b>
              </div>
              <p>{{ home.marketBrief.regime.summary }}</p>
              <div class="factor-grid">
                <section>
                  <small>利率环境</small>
                  <strong>{{ home.marketBrief.rateRegime.title }}</strong>
                  <p>{{ home.marketBrief.rateRegime.summary }}</p>
                </section>
                <section>
                  <small>市场广度</small>
                  <strong>{{ home.marketBrief.breadth.title }}</strong>
                  <p>{{ home.marketBrief.breadth.summary }}</p>
                </section>
                <section>
                  <small>加密结构</small>
                  <strong>{{ crossAsset.marketBrief.cryptoRegime.title }}</strong>
                  <p>{{ crossAsset.marketBrief.cryptoRegime.summary }}</p>
                </section>
              </div>
            </section>

            <section class="poster-card market-table-card">
              <div class="card-title">
                <span>02</span>
                <h4>主要市场与未来方向</h4>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>市场</th>
                    <th>最新涨跌</th>
                    <th v-for="label in ['1日', '1周', '1月', '1季度']" :key="label">
                      {{ label }}
                    </th>
                    <th>方向</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="market in markets" :key="market.id">
                    <th>{{ market.name }}</th>
                    <td :class="{ gain: (market.dailyMove ?? 0) >= 0, loss: (market.dailyMove ?? 0) < 0 }">
                      {{ formatMove(market.dailyMove) }}
                    </td>
                    <td v-for="horizon in market.horizonOutlooks" :key="horizon.id">
                      {{ horizon.upProbabilityPct.toFixed(1) }}
                    </td>
                    <td :class="market.horizonOutlooks[0]?.direction">
                      {{ directionName(market.horizonOutlooks[0]?.direction ?? 'bearish') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="poster-card drivers-card">
              <div class="card-title">
                <span>03</span>
                <h4>全部市场驱动因素</h4>
              </div>
              <section v-for="market in markets" :key="market.id" class="driver-row">
                <strong>{{ market.name }}</strong>
                <p v-if="market.drivers.length">
                  {{ market.drivers.map((driver) => driver.text).join('；') }}
                </p>
                <p v-else>当前没有足够强且稳定的跨资产共振因子。</p>
              </section>
            </section>
          </div>

          <aside class="poster-side">
            <section class="poster-card chain-card">
              <div class="card-title">
                <span>04</span>
                <h4>当前最强市场传导链</h4>
                <b>共 {{ chains.length }} 条</b>
              </div>
              <section v-for="chain in chains" :key="`${chain.left}-${chain.right}-${chain.title}`" class="chain-row">
                <header>
                  <span :class="chain.status">{{ chain.status === 'confirming' ? '确认' : chain.status === 'diverging' ? '背离' : chain.status === 'context' ? '情景' : chain.status === 'dormant' ? '休眠' : '不足' }}</span>
                  <strong>{{ chain.title }}</strong>
                  <b>{{ formatSignal(chain.signal) }}</b>
                </header>
                <p>{{ chain.steps.join(' → ') }}</p>
                <small>{{ chain.interpretation }}</small>
              </section>
            </section>
          </aside>
        </div>

        <footer class="poster-footer">
          <span>数据日期：{{ home.marketBrief.asOfDate ?? '—' }}</span>
          <p>{{ crossAsset.marketBrief.disclaimer }} 相关性不代表因果，偏涨/偏跌不是确定预测。</p>
        </footer>
      </article>
    </div>
  </section>
</template>

<style scoped>
.poster-export {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}
.export-heading {
  margin-bottom: 16px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.export-heading p {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.export-heading h2 {
  margin: 0;
  font: 500 28px Georgia, 'Songti SC', serif;
}
.export-heading span,
.export-actions small {
  color: var(--muted);
  font-size: 11px;
}
.export-actions {
  display: grid;
  justify-items: end;
  gap: 8px;
}
.export-actions button {
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--accent);
  border-radius: 7px;
  color: var(--paper);
  background: var(--accent);
  font-weight: 700;
  cursor: pointer;
}
.export-actions button:disabled {
  opacity: 0.55;
  cursor: wait;
}
.export-actions button:focus-visible,
.poster-viewport:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.poster-viewport {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-soft);
}
.market-poster {
  box-sizing: border-box;
  width: 1200px;
  min-height: 1500px;
  padding: 34px;
  color: #e9f6ff;
  background:
    radial-gradient(circle at 94% 2%, rgba(23, 132, 200, 0.28), transparent 19%),
    linear-gradient(rgba(34, 143, 202, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 143, 202, 0.04) 1px, transparent 1px), #061321;
  background-size: auto, 36px 36px, 36px 36px, auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  font-variant-numeric: tabular-nums;
}
.poster-heading {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.poster-heading > div {
  display: flex;
  align-items: baseline;
  gap: 20px;
}
.poster-heading h3 {
  margin: 0;
  font-size: 46px;
  letter-spacing: -0.04em;
}
.poster-heading b {
  color: #7ed8ff;
  font-size: 22px;
}
.poster-heading span {
  color: #b6cad8;
  font-size: 13px;
}
.poster-columns {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  align-items: start;
  gap: 14px;
}
.poster-main,
.poster-side {
  display: grid;
  gap: 14px;
}
.poster-card {
  overflow: hidden;
  border: 1px solid #176b9f;
  border-radius: 10px;
  background: rgba(4, 24, 40, 0.92);
}
.card-title {
  min-height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(56, 157, 211, 0.4);
  background: rgba(6, 74, 116, 0.36);
}
.card-title span {
  color: #62cfff;
  font-size: 10px;
  letter-spacing: 0.12em;
}
.card-title h4 {
  margin: 0;
  font-size: 18px;
}
.card-title b {
  margin-left: auto;
  color: #ffc94f;
  font-size: 13px;
}
.regime-card > p {
  margin: 0;
  padding: 16px;
  color: #c5d9e6;
  font-size: 13px;
  line-height: 1.7;
}
.factor-grid {
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.factor-grid section {
  padding: 12px;
  border: 1px solid rgba(56, 157, 211, 0.3);
  border-radius: 8px;
  background: rgba(15, 56, 82, 0.45);
}
.factor-grid small {
  display: block;
  color: #62cfff;
  font-size: 10px;
}
.factor-grid strong {
  display: block;
  margin: 5px 0;
  font-size: 13px;
}
.factor-grid p {
  margin: 0;
  color: #9fb7c7;
  font-size: 10px;
  line-height: 1.55;
}
.market-table-card table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.market-table-card th,
.market-table-card td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(56, 157, 211, 0.24);
  text-align: right;
}
.market-table-card th:first-child {
  text-align: left;
}
.market-table-card thead {
  color: #9fcce4;
  background: rgba(6, 74, 116, 0.22);
}
.gain,
.bullish {
  color: #ff7c6c;
  font-weight: 700;
}
.loss,
.bearish {
  color: #43dc9a;
  font-weight: 700;
}
.drivers-card {
  padding-bottom: 6px;
}
.driver-row {
  padding: 10px 16px;
  display: grid;
  grid-template-columns: 105px 1fr;
  gap: 12px;
  border-bottom: 1px solid rgba(56, 157, 211, 0.2);
}
.driver-row strong {
  font-size: 12px;
}
.driver-row p {
  margin: 0;
  color: #a9bfcd;
  font-size: 10px;
  line-height: 1.55;
}
.chain-card {
  padding-bottom: 6px;
}
.chain-row {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(56, 157, 211, 0.24);
}
.chain-row header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
}
.chain-row header > span {
  padding: 3px 6px;
  border-radius: 999px;
  color: #9fb7c7;
  background: rgba(159, 183, 199, 0.15);
  font-size: 9px;
}
.chain-row header > span.confirming {
  color: #43dc9a;
  background: rgba(67, 220, 154, 0.12);
}
.chain-row header > span.diverging {
  color: #ff7c6c;
  background: rgba(255, 124, 108, 0.12);
}
.chain-row strong {
  font-size: 13px;
}
.chain-row header b {
  color: #7ed8ff;
  font-size: 12px;
}
.chain-row p {
  margin: 7px 0 4px;
  color: #d7e7f0;
  font-size: 10px;
  line-height: 1.5;
}
.chain-row small {
  color: #8fa9ba;
  font-size: 9px;
  line-height: 1.45;
}
.poster-footer {
  margin-top: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid #176b9f;
  border-radius: 9px;
  color: #9fb7c7;
  font-size: 10px;
}
.poster-footer span {
  flex: none;
  color: #62cfff;
}
.poster-footer p {
  margin: 0;
  line-height: 1.55;
}
@media (max-width: 620px) {
  .export-heading {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }
  .export-actions {
    justify-items: stretch;
  }
  .export-actions button {
    min-height: 44px;
  }
}
</style>
