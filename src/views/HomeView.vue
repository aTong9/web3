<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navigation from '@/components/Navigation.vue'
import { useI18n } from '@/composables/use-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="home-view">
    <RouterLink class="learning-link" to="/learning-paths"
      >{{ t('ui.nav.learningPaths') }} →</RouterLink
    >
    <Navigation />
  </div>
</template>

<style scoped>
.learning-link {
  display: block;
  width: fit-content;
  margin: 0 0 16px auto;
  color: var(--accent);
  font-size: 13px;
}
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
