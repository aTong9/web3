<script setup lang="ts">
import marketHomeData from '@/data/market-home.json'
import type { MarketHomeDataset } from '@/types'

defineEmits<{ close: [] }>()
const dataset = marketHomeData as MarketHomeDataset
</script>

<template>
  <div class="alert-layer" role="dialog" aria-modal="true" aria-labelledby="alert-title">
    <section>
      <header>
        <span>MARKET TRANSMISSION ALERT</span
        ><button aria-label="关闭提醒" @click="$emit('close')">×</button>
      </header>
      <div class="alert-copy">
        <p>每次进入系统提醒</p>
        <h2 id="alert-title">{{ dataset.marketBrief.regime.title }}</h2>
        <span>{{ dataset.marketBrief.regime.summary }}</span>
      </div>
      <div class="signals">
        <article v-for="chain in dataset.transmissionChains.slice(0, 3)" :key="chain.title">
          <div>
            <strong>{{ chain.title }}</strong
            ><small>{{ chain.interpretation }}</small>
          </div>
          <b>{{ chain.signal === null ? '—' : `ρ ${chain.signal.toFixed(2)}` }}</b>
        </article>
      </div>
      <footer>
        <small>数据更新 {{ new Date(dataset.updatedAt).toLocaleString('zh-CN') }}</small
        ><button @click="$emit('close')">查看首页结论</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.alert-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  padding: 20px;
  background: rgba(12, 16, 20, 0.65);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
}
.alert-layer > section {
  width: min(620px, 100%);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}
.alert-layer header {
  padding: 13px 18px;
  background: var(--inverse);
  color: var(--inverse-text);
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  letter-spacing: 0.13em;
}
.alert-layer header button {
  border: 0;
  background: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
.alert-copy {
  padding: 27px 28px 20px;
}
.alert-copy p {
  margin: 0 0 8px;
  color: var(--danger);
  font-size: 10px;
  font-weight: 700;
}
.alert-copy h2 {
  margin: 0 0 8px;
  font:
    400 28px Georgia,
    'Songti SC',
    serif;
}
.alert-copy span {
  color: var(--muted);
  font-size: 11px;
}
.signals {
  margin: 0 28px;
  border-top: 1px solid var(--border);
}
.signals article {
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 18px;
}
.signals strong,
.signals small {
  display: block;
}
.signals strong {
  font-size: 12px;
}
.signals small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
}
.signals b {
  color: var(--accent);
  white-space: nowrap;
}
.alert-layer footer {
  padding: 18px 28px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.alert-layer footer small {
  color: var(--muted);
  font-size: 9px;
}
.alert-layer footer button {
  padding: 9px 15px;
  border: 0;
  border-radius: 6px;
  background: var(--ink);
  color: white;
  cursor: pointer;
}
</style>
