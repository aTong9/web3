<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from '@/composables/use-i18n'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'

const { t } = useI18n()
const route = useRoute()
const isKolRoute = computed(() => route.path === '/intelligence/kols')
const isSourcesRoute = computed(() => route.path === '/intelligence/sources')
const title = computed(() =>
  t(
    isKolRoute.value
      ? 'intelligence.tabs.kols'
      : isSourcesRoute.value
        ? 'intelligence.tabs.sources'
        : 'intelligence.tabs.news',
  ),
)
const description = computed(() =>
  t(
    isKolRoute.value
      ? 'intelligence.kolIntro'
      : isSourcesRoute.value
        ? 'blogger.desc'
        : 'marketNews.intro',
  ),
)
</script>

<template>
  <main class="intelligence-page" :class="{ 'kol-intelligence': isKolRoute }">
    <ResearchPageHeader
      :eyebrow="t('intelligence.badge')"
      :title="title"
      :description="description"
      :density="isKolRoute ? 'workbench' : 'compact'"
    >
      <template v-if="!isKolRoute" #status>
        <nav class="intelligence-nav" :aria-label="t('intelligence.navigation')">
          <RouterLink :to="isSourcesRoute ? '/intelligence/news' : '/intelligence/sources'">
            {{ t(isSourcesRoute ? 'intelligence.backToNews' : 'intelligence.openSources') }} ↗
          </RouterLink>
        </nav>
      </template>
    </ResearchPageHeader>

    <RouterView />
  </main>
</template>

<style scoped>
.intelligence-page {
  width: min(100%, var(--content-standard));
  margin: 0 auto;
  padding: 32px var(--page-gutter) 80px;
}
.intelligence-page.kol-intelligence {
  padding-top: 12px;
}
.intelligence-nav {
  display: flex;
  gap: 4px;
}
.intelligence-nav a {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.intelligence-nav a:hover {
  background: var(--surface-soft);
  color: var(--ink);
}
.intelligence-nav a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@media (max-width: 760px) {
  .intelligence-page {
    padding: 24px 14px 60px;
  }
}
</style>
