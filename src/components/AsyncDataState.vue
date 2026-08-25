<script setup lang="ts">
defineProps<{
  loading: boolean
  error: boolean
  loadingLabel: string
  errorMessage: string
  retryLabel: string
}>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="loading" class="async-state" role="status">
    <i aria-hidden="true"></i><span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="error" class="async-state error" role="alert">
    <span>{{ errorMessage }}</span>
    <button type="button" @click="$emit('retry')">{{ retryLabel }}</button>
  </div>
</template>

<style scoped>
.async-state {
  margin: 0 0 var(--space-section);
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  font-size: 12px;
}
.async-state i {
  width: 8px;
  height: 8px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}
.async-state.error {
  border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
  color: var(--danger);
}
button {
  padding: 0 14px;
  border: 1px solid currentColor;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .async-state i { animation: none; } }
</style>
