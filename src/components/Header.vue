<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section">
        <img src="/assets/images/favicon6.png" alt="Logo" class="logo" />
        <h1 class="site-title">Financial Independence, Retire Early</h1>
      </div>

      <nav class="nav">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/about" class="nav-link">关于</RouterLink>
        <a
          href="https://www.yuque.com/forms/share/1a1fee15-f7a9-4ee6-9dd4-b0ba9fef1871"
          target="_blank"
          class="nav-link"
        >
          网站提交
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.site-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .site-title {
    font-size: 20px;
  }

  .nav {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
