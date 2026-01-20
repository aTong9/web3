<template>
  <div class="about">
    <div class="about-content">
      <h1>关于网站</h1>

      <section class="section">
        <h2>这是 Vue 3 + Vite + TypeScript 版 WebStack 主题</h2>
        <p>
          本项目是基于原 Hugo 版 WebStack 主题重构的现代化导航网站， 使用 Vue 3 + Vite + TypeScript
          技术栈开发，提供更好的用户体验和开发体验。
        </p>

        <h3>技术特点</h3>
        <ul>
          <li>Vue 3 Composition API</li>
          <li>TypeScript 类型安全</li>
          <li>Vite 快速构建</li>
          <li>响应式设计</li>
          <li>组件化架构</li>
        </ul>
      </section>

      <section class="section">
        <h2>原项目信息</h2>
        <p>
          基于**纯静态**的网址导航网站
          <a href="https://github.com/WebStackPage/WebStackPage.github.io" target="_blank"
            >webstack.cc</a
          >， 其中部分代码参考了以下几个开源项目：
        </p>
        <ul>
          <li>
            <a href="https://github.com/liutongxu/liutongxu.github.io" target="_blank"
              >liutongxu/liutongxu.github.io</a
            >
          </li>
          <li>
            <a href="https://github.com/iplaycode/webstack-hugo" target="_blank"
              >iplaycode/webstack-hugo</a
            >
          </li>
        </ul>
      </section>

      <section class="section">
        <h2>开源地址</h2>
        <p>
          原主题：<a href="https://github.com/shenweiyan/webstack-hugo" target="_blank"
            >webstack-hugo</a
          >
        </p>
      </section>

      <section class="section">
        <h2>演示地址</h2>
        <ul>
          <li><a href="https://nav.bioitee.com" target="_blank">nav.bioitee.com</a></li>
          <li>
            <a href="https://shenweiyan.github.io/webstack-hugo" target="_blank"
              >shenweiyan.github.io/webstack-hugo</a
            >
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5rem;
}

h2 {
  color: #555;
  margin: 30px 0 15px 0;
  font-size: 1.5rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

h3 {
  color: #666;
  margin: 20px 0 10px 0;
  font-size: 1.2rem;
}

.section {
  margin-bottom: 30px;
}

p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 15px;
}

ul {
  margin: 15px 0;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
  color: #666;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about {
    padding: 20px 10px;
  }

  .about-content {
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.3rem;
  }
}
</style>
