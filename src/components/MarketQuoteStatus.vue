<script setup lang="ts">
import { computed } from 'vue'
import type { MarketQuote } from '@/types'
import { useI18n } from '@/composables/use-i18n'

const props = defineProps<{
  quote?: MarketQuote | null
  loading?: boolean
  error?: string | null
  showTime?: boolean
}>()
const { locale, t } = useI18n()
const state = computed(() => props.quote?.status ?? 'unavailable')
const label = computed(() => {
  if (props.loading && !props.quote) return t('marketQuote.loading')
  if (!props.quote) return t('marketQuote.fallback')
  return t(`marketQuote.${props.quote.status}`)
})
const time = computed(() => {
  if (!props.quote?.marketTime) return null
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(props.quote.marketTime))
})
</script>

<template>
  <small class="quote-status" :class="state" :title="error || t('marketQuote.disclaimer')">
    <i aria-hidden="true"></i>
    {{ label }}
    <span v-if="showTime && time">· {{ t('marketQuote.updated', { time }) }}</span>
  </small>
</template>

<style scoped>
.quote-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  font-size: 9px;
  font-style: normal;
  white-space: nowrap;
}
.quote-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.quote-status.nearRealTime {
  color: var(--positive, #16845b);
}
.quote-status.delayed {
  color: var(--warning, #a56a00);
}
.quote-status.stale,
.quote-status.unavailable {
  color: var(--negative, #bd3d48);
}
</style>
