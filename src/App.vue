<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import TransmissionAlert from '@/components/TransmissionAlert.vue'
import { useTheme } from '@/utils/use-theme'

const mobileMenuOpen = ref(false)
const alertOpen = ref(true)
useTheme()
</script>

<template>
  <div class="app-shell">
    <AppSidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div class="workspace">
      <AppTopbar @open-menu="mobileMenuOpen = true" />
      <RouterView />
    </div>
    <TransmissionAlert v-if="alertOpen" @close="alertOpen = false" />
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
