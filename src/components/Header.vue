<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand" :aria-label="t('ui.app.title')">
      <span class="brand-mark">F.</span>
      <span>
        <strong>{{ t('ui.header.brand') }}</strong>
        <small>Personal Finance Desk</small>
      </span>
    </RouterLink>

    <nav aria-label="{{ t('ui.app.navigation') }}">
      <RouterLink to="/">{{ t('ui.header.home') }}</RouterLink>
      <RouterLink to="/a-share">{{ t('ui.header.aShare') }}</RouterLink>
      <RouterLink to="/funds">{{ t('ui.header.usFund') }}</RouterLink>
      <RouterLink to="/kols">{{ t('ui.header.kol') }}</RouterLink>
      <RouterLink to="/cross-asset">{{ t('ui.header.crossAsset') }}</RouterLink>
      <RouterLink to="/market-news">{{ t('ui.header.news') }}</RouterLink>
      <RouterLink to="/blogger">{{ t('ui.header.briefing') }}</RouterLink>
      <RouterLink to="/about">{{ t('ui.header.about') }}</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  height: 72px;
  padding: 0 clamp(20px, 4vw, 64px);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ink);
  color: white;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  font-size: 18px;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 15px;
  letter-spacing: 0.04em;
}

.brand small {
  margin-top: 2px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

nav a {
  padding: 8px 13px;
  border-radius: 8px;
  color: var(--muted);
  font-size: 14px;
  text-decoration: none;
}

nav a:hover,
nav a.router-link-active {
  background: var(--surface);
  color: var(--ink);
}

@media (max-width: 640px) {
  .app-header {
    height: auto;
    padding: 14px 18px;
    align-items: flex-start;
    gap: 12px;
  }

  nav {
    max-width: 68%;
  }

  .brand small {
    display: none;
  }

  nav a {
    padding: 7px 8px;
    font-size: 13px;
  }
}
</style>
