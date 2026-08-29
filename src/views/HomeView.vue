<script setup lang="ts">
import Navigation from '@/components/Navigation.vue'
</script>

<template>
  <div class="home-view">
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
