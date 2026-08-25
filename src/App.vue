<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import AnalyticsConsent from '@/components/AnalyticsConsent.vue'
import { useAnalytics } from '@/composables/use-analytics'
import { useAuth } from '@/composables/use-auth'
import { useI18n } from '@/composables/use-i18n'
import { useTheme } from '@/utils/use-theme'

const mobileMenuOpen = ref(false)
const routeFrame = ref<HTMLElement | null>(null)
const route = useRoute()
const { t } = useI18n()
useTheme()
const { restore } = useAuth()
const { start } = useAnalytics()
onMounted(async () => {
  await restore()
  await start()
})
watch(
  () => route.fullPath,
  async () => {
    mobileMenuOpen.value = false
    await nextTick()
    routeFrame.value?.focus()
  },
)
watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
const closeMenuOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') mobileMenuOpen.value = false
}
onMounted(() => window.addEventListener('keydown', closeMenuOnEscape))
onUnmounted(() => {
  window.removeEventListener('keydown', closeMenuOnEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <AppSidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div class="workspace">
      <AppTopbar @open-menu="mobileMenuOpen = true" />
      <RouterView v-slot="{ Component }">
        <Suspense :timeout="0">
          <div id="main-content" ref="routeFrame" class="route-frame" tabindex="-1">
            <component :is="Component" />
          </div>
          <template #fallback>
            <main class="route-loading" aria-live="polite" role="status">
              <section>
                <span class="loading-mark" aria-hidden="true"></span>
                <p>{{ t('ui.app.loadingWorkspace') }}</p>
                <strong>{{ t('ui.app.loadingWorkspaceHint') }}</strong>
                <div class="loading-lines" aria-hidden="true">
                  <i></i><i></i><i></i>
                </div>
              </section>
            </main>
          </template>
        </Suspense>
      </RouterView>
    </div>
    <AnalyticsConsent />
  </div>
</template>

<style scoped>
.workspace {
  min-height: 100vh;
  margin-left: 248px;
}
.route-frame {
  min-width: 0;
  min-height: calc(100vh - 58px);
}
.route-loading {
  min-height: calc(100vh - 70px);
  padding: 64px clamp(20px, 5vw, 72px);
  display: grid;
  place-items: start stretch;
}
.route-loading > section {
  max-width: 780px;
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}
.loading-mark {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 6px var(--accent-soft);
  display: block;
}
.route-loading p {
  margin: 24px 0 6px;
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 700;
}
.route-loading strong {
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
}
.loading-lines {
  margin-top: 28px;
  display: grid;
  gap: 8px;
}
.loading-lines i {
  height: 8px;
  border-radius: 4px;
  background: var(--surface-soft);
  animation: loading-pulse 1.2s ease-in-out infinite alternate;
}
.loading-lines i:nth-child(2) {
  width: 78%;
  animation-delay: 0.12s;
}
.loading-lines i:nth-child(3) {
  width: 52%;
  animation-delay: 0.24s;
}
@keyframes loading-pulse {
  to {
    background: var(--accent-soft);
  }
}
@media (prefers-reduced-motion: reduce) {
  .loading-lines i {
    animation: none;
  }
}
@media (max-width: 900px) {
  .workspace {
    margin-left: 0;
  }
  .route-loading {
    min-height: calc(100vh - 58px);
    padding: 24px 14px;
  }
}
</style>
