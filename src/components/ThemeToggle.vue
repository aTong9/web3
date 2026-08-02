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
    <span aria-hidden="true">{{ theme === 'light' ? '☾' : '☀' }}</span>
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
