<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '@/composables/use-i18n'
import { getDataScheduleState, type DataScheduleId } from '@/utils/data-schedule'

const props = defineProps<{
  updatedAt: string
  schedule: DataScheduleId
  label?: string
}>()

const { locale, t } = useI18n()
const now = ref(new Date())
let timer: number | undefined
const state = computed(() => getDataScheduleState(props.updatedAt, props.schedule, now.value))
onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 60_000)
})
onUnmounted(() => window.clearInterval(timer))
const formatDate = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(value)
    : '—'
</script>

<template>
  <div class="data-status" :class="{ pending: state.pending }">
    <i></i>
    <div>
      <strong>{{ label ?? (state.pending ? t('dataStatus.pending') : t('dataStatus.updated')) }}</strong>
      <small v-if="state.pending">
        {{ t('dataStatus.lastUpdated') }} {{ formatDate(state.updated) }} ·
        {{ t('dataStatus.nextUpdate') }} {{ formatDate(state.next) }}
      </small>
      <small v-else>
        {{ formatDate(state.updated) }} · {{ t('dataStatus.nextUpdate') }}
        {{ formatDate(state.next) }}
      </small>
    </div>
  </div>
</template>

<style scoped>
.data-status {
  min-width: 210px;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 10px;
}
.data-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.data-status.pending i {
  background: var(--warning);
  box-shadow: 0 0 0 4px var(--warning-soft);
}
.data-status strong,
.data-status small {
  display: block;
}
.data-status strong {
  font-size: 11px;
}
.data-status small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 620px) {
  .data-status {
    width: 100%;
    min-width: 0;
  }
}
</style>
