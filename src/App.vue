<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import TransmissionAlert from '@/components/TransmissionAlert.vue'

const mobileMenuOpen = ref(false)
const alertOpen = ref(true)
</script>

<template>
  <div class="app-shell">
    <AppSidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div class="workspace">
      <header class="mobile-header">
        <button @click="mobileMenuOpen = true">☰</button><strong>市场研究台</strong><span></span>
      </header>
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
.mobile-header {
  display: none;
}
@media (max-width: 900px) {
  .workspace {
    margin-left: 0;
  }
  .mobile-header {
    height: 54px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(247, 247, 244, 0.95);
    position: sticky;
    top: 0;
    z-index: 30;
    display: grid;
    grid-template-columns: 30px 1fr 30px;
    align-items: center;
    text-align: center;
  }
  .mobile-header button {
    border: 0;
    background: none;
    color: var(--ink);
    font-size: 18px;
  }
  .mobile-header strong {
    font-size: 13px;
  }
}
</style>
