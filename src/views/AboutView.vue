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
        <h2>中文字体展示</h2>
        <p class="chinese-pixel-large">像素风格中文字体演示</p>
        <p class="chinese-pixel">这是一个像素风格的中文网站</p>
        <p class="chinese-pixel-small">小号中文字体效果</p>
        <p class="mixed-pixel">Mixed English and Chinese 混合显示</p>
        <button class="chinese-pixel-btn">中文像素按钮</button>
        <button class="pixel-btn-zh">像素按钮中文</button>
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
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 18px;
  image-rendering: pixelated;
}

.about-content {
  background: #1a1a1a;
  border: 4px solid #4c6ef5;
  padding: 40px;
  position: relative;
  image-rendering: pixelated;
}

.about-content::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  width: 16px;
  height: 16px;
  background: #4c6ef5;
  box-shadow:
    0 0 0 2px #1a1a1a,
    2px 2px 0 #3a5bd9;
}

.about-content::after {
  content: '';
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #4c6ef5;
  box-shadow:
    0 0 0 2px #1a1a1a,
    -2px 2px 0 #3a5bd9;
}

h1 {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 14px;
  font-weight: normal;
  color: #4dabf7;
  margin-bottom: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 3px 3px 0 #3a5bd9;
  position: relative;
  font-display: swap;
}

h1::before,
h1::after {
  content: '◆';
  color: #4c6ef5;
  margin: 0 16px;
  font-size: 12px;
}

h2 {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 12px;
  font-weight: normal;
  color: #e9ecef;
  margin: 30px 0 15px 0;
  background: #4c6ef5;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
}

h3 {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 10px;
  font-weight: normal;
  color: #adb5bd;
  margin: 20px 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-left: 4px solid #4c6ef5;
  padding-left: 12px;
}

.section {
  margin-bottom: 30px;
  padding-left: 16px;
}

p {
  line-height: 1.4;
  color: #adb5bd;
  margin-bottom: 16px;
}

ul {
  margin: 16px 0;
  padding-left: 32px;
  list-style: none;
}

li {
  margin-bottom: 12px;
  color: #adb5bd;
  position: relative;
}

li::before {
  content: '▶';
  position: absolute;
  left: -20px;
  color: #4c6ef5;
  font-size: 12px;
}

a {
  color: #4dabf7;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: none;
  position: relative;
}

a:hover {
  color: #74c0fc;
  border-bottom-color: #74c0fc;
  background: rgba(77, 171, 247, 0.1);
  padding: 0 4px;
  margin: 0 -4px;
}

@media (max-width: 768px) {
  .about {
    padding: 20px 16px;
    font-size: 16px;
  }

  .about-content {
    padding: 20px;
  }

  h1 {
    font-size: 12px;
  }

  h2 {
    font-size: 11px;
  }

  h3 {
    font-size: 9px;
  }

  .section {
    padding-left: 8px;
  }
}
</style>
