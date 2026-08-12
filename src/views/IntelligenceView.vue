<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()

const tabs = [
  { to: '/intelligence/news', label: 'intelligence.tabs.news' },
  { to: '/intelligence/kols', label: 'intelligence.tabs.kols' },
  { to: '/intelligence/sources', label: 'intelligence.tabs.sources' },
]
</script>

<template>
  <main class="intelligence-page">
    <header class="intelligence-hero">
      <div>
        <p>{{ t('intelligence.badge') }}</p>
        <h1>{{ t('intelligence.heading') }}</h1>
        <span>{{ t('intelligence.intro') }}</span>
      </div>
      <nav :aria-label="t('intelligence.navigation')">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to">
          {{ t(tab.label) }}
        </RouterLink>
      </nav>
    </header>

    <RouterView />
  </main>
</template>

<style scoped>
.intelligence-page {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 40px clamp(20px, 3.5vw, 52px) 80px;
}
.intelligence-hero {
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 32px;
}
.intelligence-hero p {
  margin: 0 0 12px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.intelligence-hero h1 {
  margin: 0 0 10px;
  font: 500 clamp(36px, 4.5vw, 54px) Georgia, 'Songti SC', serif;
  letter-spacing: -0.04em;
  text-wrap: balance;
}
.intelligence-hero span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}
.intelligence-hero nav {
  display: flex;
  gap: 4px;
}
.intelligence-hero a {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.intelligence-hero a:hover {
  background: var(--surface-soft);
  color: var(--ink);
}
.intelligence-hero a.router-link-active {
  border-color: var(--border);
  background: var(--surface);
  color: var(--ink);
  font-weight: 700;
}
.intelligence-hero a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@media (max-width: 760px) {
  .intelligence-page {
    padding: 24px 14px 60px;
  }
  .intelligence-hero {
    margin-bottom: 24px;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .intelligence-hero nav {
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
