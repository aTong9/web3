<script setup lang="ts">
import { useTheme } from '@/utils/use-theme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
    :title="theme === 'light' ? '深色模式' : '浅色模式'"
    @click="toggleTheme"
  >
    <span aria-hidden="true">{{ theme === 'light' ? '☾' : '☀' }}</span>
    <small>{{ theme === 'light' ? 'Dark' : 'Light' }}</small>
  </button>
</template>

<style scoped>
.theme-toggle {
  min-height: 34px;
  padding: 7px 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.theme-toggle span {
  font-size: 15px;
  line-height: 1;
}
.theme-toggle small {
  font-size: 8px;
  letter-spacing: 0.06em;
}
@media (max-width: 900px) {
  .theme-toggle {
    min-height: 30px;
    padding: 5px 7px;
  }
  .theme-toggle small {
    display: none;
  }
}
</style>
