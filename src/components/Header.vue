<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand" aria-label="个人金融工作台首页">
      <span class="brand-mark">F.</span>
      <span>
        <strong>个人金融工作台</strong>
        <small>Personal Finance Desk</small>
      </span>
    </RouterLink>

    <nav aria-label="主导航">
      <RouterLink to="/">资源台</RouterLink>
      <RouterLink to="/a-share">A股行业</RouterLink>
      <RouterLink to="/funds">美股基金</RouterLink>
      <RouterLink to="/kols">KOL监控</RouterLink>
      <RouterLink to="/market-news">全球快讯</RouterLink>
      <RouterLink to="/blogger">资讯台</RouterLink>
      <RouterLink to="/about">说明</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  height: 72px;
  padding: 0 clamp(20px, 4vw, 64px);
  border-bottom: 1px solid var(--border);
  background: rgba(247, 247, 244, 0.92);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ink);
  color: white;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  font-size: 18px;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 15px;
  letter-spacing: 0.04em;
}

.brand small {
  margin-top: 2px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

nav a {
  padding: 8px 13px;
  border-radius: 8px;
  color: var(--muted);
  font-size: 14px;
  text-decoration: none;
}

nav a:hover,
nav a.router-link-active {
  background: var(--surface);
  color: var(--ink);
}

@media (max-width: 640px) {
  .app-header {
    height: auto;
    padding: 14px 18px;
    align-items: flex-start;
    gap: 12px;
  }

  nav {
    max-width: 68%;
  }

  .brand small {
    display: none;
  }

  nav a {
    padding: 7px 8px;
    font-size: 13px;
  }
}
</style>
