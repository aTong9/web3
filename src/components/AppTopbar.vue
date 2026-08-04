<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useI18n } from '@/composables/use-i18n'

defineEmits<{ openMenu: [] }>()
const route = useRoute()
const { locale, t, setLocale } = useI18n()
const title = computed(() =>
  t(String(route.meta.titleKey ?? 'ui.app.title')),
)
const description = computed(() =>
  t(String(route.meta.descriptionKey ?? 'marketHome.heading')),
)
</script>

<template>
  <header class="app-topbar">
    <button class="menu-button" :aria-label="t('ui.app.openMenu')" @click="$emit('openMenu')">☰</button>
    <div>
      <strong>{{ title }}</strong>
      <small>{{ description }}</small>
    </div>
    <span class="system-state"><i></i>{{ t('ui.app.systemRunning') }}</span>
    <div class="locale-switch" role="group" :aria-label="t('ui.app.language')">
      <button :class="{ active: locale === 'zh' }" @click="setLocale('zh')">
        {{ t('ui.app.chinese') }}
      </button>
      <button :class="{ active: locale === 'en' }" @click="setLocale('en')">
        {{ t('ui.app.english') }}
      </button>
    </div>
    <ThemeToggle />
  </header>
</template>

<style scoped>
.app-topbar {
  height: 64px;
  padding: 0 clamp(18px, 3vw, 34px);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 28;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 18px;
}
.app-topbar strong,
.app-topbar small {
  display: block;
}
.app-topbar strong {
  font-size: 13px;
}
.app-topbar small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
}
.menu-button {
  display: none;
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-size: 18px;
}
.system-state {
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
}
.system-state i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.locale-switch {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.locale-switch button {
  border: 0;
  padding: 6px 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 9px;
}
.locale-switch button.active {
  background: var(--surface-soft);
  color: var(--ink);
  font-weight: 700;
}
@media (max-width: 900px) {
  .app-topbar {
    height: 56px;
    grid-template-columns: 28px minmax(0, 1fr) auto auto;
    gap: 10px;
  }
  .menu-button {
    display: block;
  }
  .system-state {
    display: none;
  }
}
</style>
