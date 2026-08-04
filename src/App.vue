<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import TransmissionAlert from '@/components/TransmissionAlert.vue'
import AnalyticsConsent from '@/components/AnalyticsConsent.vue'
import { useTheme } from '@/utils/use-theme'
import { useAuth } from '@/composables/use-auth'
import { useAnalytics } from '@/composables/use-analytics'

const mobileMenuOpen = ref(false)
const alertOpen = ref(true)
useTheme()
const { restore } = useAuth()
const { start } = useAnalytics()
onMounted(async () => {
  await restore()
  await start()
})
</script>

<template>
  <div class="app-shell">
    <AppSidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div class="workspace">
      <AppTopbar @open-menu="mobileMenuOpen = true" />
      <RouterView />
    </div>
    <TransmissionAlert v-if="alertOpen" @close="alertOpen = false" />
    <AnalyticsConsent />
  </div>
</template>

<style scoped>
.workspace {
  min-height: 100vh;
  margin-left: 248px;
}
@media (max-width: 900px) {
  .workspace {
    margin-left: 0;
  }
}
</style>
