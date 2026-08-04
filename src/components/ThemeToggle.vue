<script setup lang="ts">
import { useTheme } from '@/utils/use-theme'
import { useI18n } from '@/composables/use-i18n'

const { theme, toggleTheme } = useTheme()
const { t } = useI18n()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'light' ? t('ui.theme.darkMode') : t('ui.theme.lightMode')"
    :title="theme === 'light' ? t('ui.theme.darkLabel') : t('ui.theme.lightLabel')"
    @click="toggleTheme"
  >
    <svg v-if="theme === 'light'" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 15.1A8.5 8.5 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" />
    </svg>
    <svg v-else aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <small>{{ theme === 'light' ? t('ui.theme.darkLabel') : t('ui.theme.lightLabel') }}</small>
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
.theme-toggle svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
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
