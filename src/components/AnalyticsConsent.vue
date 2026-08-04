<script setup lang="ts">
import { useAnalytics } from '@/composables/use-analytics'
const { consentNeeded, grant, decline } = useAnalytics()
</script>
<template>
  <aside v-if="consentNeeded" class="consent" aria-live="polite">
    <div>
      <b>匿名使用分析</b>
      <p>用于改进页面体验，不采集表单、口令或投资输入。</p>
    </div>
    <button @click="decline">拒绝</button><button class="primary" @click="grant">同意</button>
  </aside>
</template>
<style scoped>
.consent {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  max-width: 460px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--paper);
  box-shadow: 0 15px 45px #0003;
  display: flex;
  align-items: center;
  gap: 10px;
}
.consent p {
  margin: 4px 0;
  color: var(--muted);
  font-size: 10px;
}
.consent button {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
  background: var(--surface-soft);
  color: var(--ink);
}
.consent .primary {
  background: var(--accent);
  color: white;
}
</style>
