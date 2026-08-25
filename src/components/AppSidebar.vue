<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/composables/use-i18n'
import { useAuth } from '@/composables/use-auth'

defineProps<{ mobileOpen: boolean }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()
const { can } = useAuth()

const groups = computed(() => [
  {
    title: 'ui.nav.marketSummary',
    icon: '◫',
    items: [
      { title: 'ui.nav.marketPage', to: '/' },
      { title: 'ui.nav.crossAsset', to: '/cross-asset' },
    ],
  },
  {
    title: 'ui.nav.monitor',
    icon: '⌁',
    items: [
      { title: 'ui.nav.assetTechnical', to: '/asset-technical' },
      { title: 'ui.nav.usIndexes', to: '/us-indexes' },
      { title: 'ui.nav.aShareMarket', to: '/a-share' },
      { title: 'ui.nav.usMarket', to: '/funds' },
      { title: 'ui.nav.norwayFund', to: '/norway-sovereign-fund' },
    ],
  },
  {
    title: 'ui.nav.quant',
    icon: '△',
    items: [{ title: 'ui.nav.quant', to: '/quant-signals' }],
  },
  {
    title: 'ui.nav.intelligence',
    icon: '◎',
    items: [{ title: 'ui.nav.intelligenceCenter', to: '/intelligence' }],
  },
  {
    title: 'ui.nav.tools',
    icon: '◇',
    items: [
      { title: 'ui.nav.resource', to: '/resources' },
      { title: 'ui.nav.report', to: '/report' },
      { title: 'ui.nav.about', to: '/about' },
    ],
  },
  ...(can('admin.view')
    ? [{ title: 'ui.nav.management', icon: '⚙', items: [{ title: 'ui.nav.admin', to: '/admin' }] }]
    : []),
])
const collapsed = ref<string[]>([])
const toggleGroup = (title: string) => {
  collapsed.value = collapsed.value.includes(title)
    ? collapsed.value.filter((item) => item !== title)
    : [...collapsed.value, title]
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{ open: mobileOpen }"
    :role="mobileOpen ? 'dialog' : undefined"
    :aria-modal="mobileOpen ? 'true' : undefined"
    :aria-label="mobileOpen ? t('ui.app.navigation') : undefined"
  >
    <div class="brand">
      <RouterLink to="/" @click="$emit('close')"
        ><b>F.</b
        ><span
          ><strong>{{ t('ui.app.title') }}</strong
          ><small>{{ t('ui.app.description') }}</small></span
        ></RouterLink
      >
      <div class="brand-actions">
        <button class="close-menu" :aria-label="t('ui.app.closeMenu')" @click="$emit('close')">
          ×
        </button>
      </div>
    </div>
    <nav :aria-label="t('ui.app.navigation') ?? '系统主菜单'">
      <section v-for="(group, index) in groups" :key="group.title">
        <button
          class="group-title"
          :aria-expanded="!collapsed.includes(group.title)"
          :aria-controls="`sidebar-group-${index}`"
          @click="toggleGroup(group.title)"
        >
          <span
            ><i>{{ group.icon }}</i
            >{{ t(group.title) }}</span
          >
          <b :class="{ collapsed: collapsed.includes(group.title) }">⌄</b>
        </button>
        <div
          v-show="!collapsed.includes(group.title)"
          :id="`sidebar-group-${index}`"
          class="children"
        >
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            @click="$emit('close')"
            >{{ t(item.title) }}</RouterLink
          >
        </div>
      </section>
    </nav>
    <footer>
      <span></span>
      <div>
        <strong>{{ t('ui.app.systemRunning') }}</strong>
        <small>{{ t('ui.app.sourceTraceable') }}</small>
      </div>
    </footer>
  </aside>
  <button
    v-if="mobileOpen"
    class="backdrop"
    :aria-label="t('ui.app.closeBackdrop')"
    @click="$emit('close')"
  ></button>
</template>

<style scoped>
.sidebar {
  width: 248px;
  height: 100vh;
  padding: 0 14px 18px;
  border-right: 1px solid var(--sidebar-border);
  background: var(--sidebar-bg);
  color: var(--inverse-text);
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
}
.brand {
  height: 76px;
  padding: 0 8px;
  border-bottom: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand a {
  color: white;
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
}
.brand a > b {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  font:
    700 17px Georgia,
    serif;
}
.brand strong,
.brand small {
  display: block;
}
.brand strong {
  font-size: 14px;
}
.brand small {
  margin-top: 3px;
  color: var(--sidebar-muted);
  font-size: 8px;
  letter-spacing: 0.15em;
}
.brand-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.brand .close-menu {
  display: none;
  border: 0;
  background: none;
  color: white;
  font-size: 24px;
}
nav {
  padding-top: 18px;
  flex: 1;
  overflow-y: auto;
}
nav section {
  margin-bottom: 12px;
}
.group-title {
  width: 100%;
  padding: 8px 9px;
  border: 0;
  background: none;
  color: var(--sidebar-muted);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  font-size: 11px;
}
.group-title span {
  display: flex;
  gap: 9px;
  align-items: center;
}
.group-title i {
  width: 17px;
  color: var(--sidebar-text);
  font-style: normal;
}
.group-title b {
  font-weight: 400;
  transition: transform 0.2s;
}
.group-title b.collapsed {
  transform: rotate(-90deg);
}
.children {
  display: grid;
  gap: 3px;
}
.children a {
  padding: 9px 12px 9px 35px;
  border-radius: 6px;
  color: var(--sidebar-text);
  font-size: 12px;
  text-decoration: none;
}
.children a:hover {
  background: var(--sidebar-hover);
  color: white;
}
.children a.router-link-active {
  background: var(--sidebar-active);
  color: var(--sidebar-active-text);
}
footer {
  padding: 13px 10px;
  border: 1px solid var(--sidebar-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
footer > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #62c99e;
  box-shadow: 0 0 0 4px #20372e;
}
footer strong,
footer small {
  display: block;
}
footer strong {
  font-size: 10px;
}
footer small {
  margin-top: 3px;
  color: var(--sidebar-muted);
  font-size: 8px;
}
.backdrop {
  display: none;
}
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.22s;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .brand .close-menu {
    display: block;
  }
  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    border: 0;
    background: rgba(10, 14, 18, 0.55);
  }
}
</style>
