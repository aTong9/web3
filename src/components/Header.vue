<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section">
        <img src="/assets/images/favicon6.png" alt="Logo" class="logo" />
        <h1 class="site-title mixed-pixel-nav">Financial Independence</h1>
      </div>

      <nav class="nav">
        <RouterLink to="/" class="nav-link mixed-pixel-nav">首页</RouterLink>
        <RouterLink to="/about" class="nav-link mixed-pixel-nav">关于</RouterLink>
        <!-- <a
          href="https://www.yuque.com/forms/share/1a1fee15-f7a9-4ee6-9dd4-b0ba9fef1871"
          target="_blank"
          class="nav-link mixed-pixel-nav"
        >
          网站提交
        </a> -->
      </nav>
    </div>
  </header>
</template>

<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
.header {
  background: #1a1a2e;
  color: #e9ecef;
  padding: 16px 0;
  border-bottom: 4px solid #4c6ef5;
  position: relative;
  image-rendering: pixelated;
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: repeating-linear-gradient(90deg, #4c6ef5 0px, #4c6ef5 8px, #3a5bd9 8px, #3a5bd9 16px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'VT323', 'Courier New', monospace;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 16px;
  image-rendering: pixelated;
}

.site-title {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 12px;
  font-weight: normal;
  margin: 0;
  color: #4dabf7;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0 #3a5bd9;
  font-display: swap;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  color: #e9ecef;
  text-decoration: none;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 10px;
  font-weight: normal;
  padding: 8px 12px;
  background: #2d3748;
  border: 2px solid #343a40;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: none;
  position: relative;
  image-rendering: pixelated;
  font-display: swap;
}

.nav-link:hover {
  background: #4c6ef5;
  border-color: #4dabf7;
  transform: translate(-2px, -2px);
  box-shadow:
    2px 2px 0 #3a5bd9,
    4px 4px 0 rgba(58, 91, 217, 0.3);
  color: #ffffff;
}

.nav-link.router-link-active {
  background: #4c6ef5;
  border-color: #4dabf7;
  color: #ffffff;
  box-shadow:
    2px 2px 0 #3a5bd9,
    4px 4px 0 rgba(58, 91, 217, 0.3);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .site-title {
    font-size: 10px;
  }

  .nav {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 9px;
  }

  .logo {
    width: 28px;
    height: 28px;
  }
}
</style>
