<script setup lang="ts">
import Navigation from '@/components/Navigation.vue'
import ResearchPageHeader from '@/components/research/ResearchPageHeader.vue'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="home-view">
    <ResearchPageHeader
      :eyebrow="t('home.eyebrow')"
      :title="t('home.heading')"
      :description="t('home.intro')"
      variant="plain"
      density="comfortable"
    />
    <Navigation />
  </div>
</template>

<style scoped>
.home-view {
  max-width: var(--content-workbench);
  margin: 0 auto;
  padding: var(--space-section) var(--page-gutter) 80px;
}

@media (max-width: 760px) {
  .home-view {
    padding-bottom: 60px;
  }
}
</style>
