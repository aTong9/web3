<script setup lang="ts">
import Navigation from '@/components/Navigation.vue'
import { useI18n } from '@/composables/use-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="home-view">
    <section class="intro">
      <div>
        <p class="eyebrow">{{ t('home.eyebrow') }}</p>
        <h1>{{ t('home.heading') }}</h1>
      </div>
      <p class="intro-copy">{{ t('home.intro') }}</p>
    </section>
    <Navigation />
  </div>
</template>

<style scoped>
.intro {
  max-width: 1440px;
  margin: 0 auto;
  padding: 64px clamp(20px, 4vw, 64px) 54px;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.7fr);
  align-items: end;
  gap: 60px;
}

.eyebrow {
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  max-width: 760px;
  margin: 0;
  font-family: Georgia, "Songti SC", serif;
  font-size: clamp(36px, 5vw, 68px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.intro-copy {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
}

@media (max-width: 760px) {
  .intro {
    padding-top: 44px;
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
