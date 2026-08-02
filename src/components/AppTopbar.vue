<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineEmits<{ openMenu: [] }>()
const route = useRoute()
const title = computed(() => String(route.meta.pageTitle ?? '市场研究台'))
const description = computed(() => String(route.meta.pageDescription ?? '数据驱动的个人投资工作台'))
</script>

<template>
  <header class="app-topbar">
    <button class="menu-button" aria-label="打开菜单" @click="$emit('openMenu')">☰</button>
    <div>
      <strong>{{ title }}</strong>
      <small>{{ description }}</small>
    </div>
    <span class="system-state"><i></i>数据任务运行中</span>
    <ThemeToggle />
  </header>
</template>

<style scoped>
.app-topbar {
  height: 64px;
  padding: 0 clamp(18px, 3vw, 34px);
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 28;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 18px;
}
.app-topbar strong,
.app-topbar small {
  display: block;
}
.app-topbar strong {
  font-size: 13px;
}
.app-topbar small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
}
.menu-button {
  display: none;
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-size: 18px;
}
.system-state {
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 9px;
}
.system-state i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
@media (max-width: 900px) {
  .app-topbar {
    height: 56px;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    gap: 10px;
  }
  .menu-button {
    display: block;
  }
  .system-state {
    display: none;
  }
}
</style>
