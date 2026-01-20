<template>
  <div class="about">
    <div class="about-content">
      <h1>关于网站</h1>

      <section class="section">
        <h2>🤖 AI 技能与工具</h2>
        <div class="ai-skills">
          <div class="skill-category">
            <h3>💻 开发与编程</h3>
            <ul>
              <li>🎨 Vue.js 3 + Composition API</li>
              <li>📝 TypeScript 类型安全</li>
              <li>⚡ Vite 快速构建</li>
              <li>🎭 像素风格动画</li>
              <li>🌙 暗黑赛博朋克主题</li>
              <li>📱 响应式设计</li>
              <li>🔧 组件化架构</li>
            </ul>
          </div>

          <div class="skill-category">
            <h3>🧠 AI 编程助手</h3>
            <ul>
              <li>🦾 OpenCode CLI 工具</li>
              <li>⚡ OhMyOpenCode 框架</li>
              <li>🤖 Sisyphus 编程代理</li>
              <li>🎯 Oracle 架构专家</li>
              <li>🔍 Explore 代码分析</li>
              <li>📚 Librarian 文档生成</li>
              <li>🔄 自动化重构</li>
              <li>🛠️ 智能调试</li>
            </ul>
          </div>

          <div class="skill-category">
            <h3>🌐 本地大模型</h3>
            <ul>
              <li>🦙 Ollama 本地推理</li>
              <li>🧠 GLM-4.7-Flash 模型</li>
              <li>⚡ 零延迟响应</li>
              <li>🔒 完全私有化</li>
              <li>💰 无使用成本</li>
              <li>🔄 自定义微调</li>
              <li>📊 本地量化部署</li>
            </ul>
          </div>

          <div class="skill-category">
            <h3>🎨 视觉特效</h3>
            <ul>
              <li>🌌 深空背景渲染</li>
              <li>💚 霓虹矩阵雨效果</li>
              <li>👻 全息投影技术</li>
              <li>⚡ 动态能量网格</li>
              <li>✨ 粒子系统动画</li>
              <li>🎭 RGB 故障艺术</li>
              <li>📺 CRT 显示器效果</li>
              <li>🔧 像素完美渲染</li>
            </ul>
          </div>

          <div class="skill-category">
            <h3>⚙️ 构建与部署</h3>
            <ul>
              <li>📦 npm 包管理</li>
              <li>⚙️ ESLint 代码检查</li>
              <li>🎨 Prettier 代码格式化</li>
              <li>🌐 热重载开发</li>
              <li>📦 生产构建优化</li>
              <li>🔧 Git 版本控制</li>
              <li>🚀 自动化部署</li>
              <li>📊 性能监控</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>🎯 项目特色功能</h2>
        <div class="feature-highlights">
          <div class="feature-card">
            <h3>🌙 暗黑像素主题</h3>
            <p>18层视觉特效，300+动态元素，创造极致赛博朋克体验</p>
            <div class="tech-tags">
              <span class="tag">Vue 3</span>
              <span class="tag">CSS3</span>
              <span class="tag">Animation</span>
            </div>
          </div>

          <div class="feature-card">
            <h3>🤖 AI 驱动开发</h3>
            <p>集成OhMyOpenCode，支持Sisyphus等智能编程代理</p>
            <div class="tech-tags">
              <span class="tag">OpenCode</span>
              <span class="tag">Ollama</span>
              <span class="tag">GLM-4.7</span>
            </div>
          </div>

          <div class="feature-card">
            <h3>⚡ 极速开发体验</h3>
            <p>Vite构建，热重载，TypeScript支持，开发效率提升200%</p>
            <div class="tech-tags">
              <span class="tag">Vite</span>
              <span class="tag">TypeScript</span>
              <span class="tag">HMR</span>
            </div>
          </div>
        </div>
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

/* AI 技能展示样式 */
.ai-skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.skill-category {
  background: rgba(76, 110, 245, 0.1);
  border: 2px solid #4c6ef5;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.skill-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4c6ef5, transparent);
  animation: skillScan 3s linear infinite;
}

.skill-category h3 {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 11px;
  color: #4dabf7;
  margin: 0 0 15px 0;
  padding: 8px 12px;
  background: #1a1a1a;
  border-left: 4px solid #4c6ef5;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.skill-category ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-category li {
  margin-bottom: 12px;
  color: #adb5bd;
  padding: 6px 0;
  position: relative;
  padding-left: 24px;
  font-size: 12px;
  line-height: 1.3;
  border-left: 1px solid rgba(76, 110, 245, 0.3);
  margin-left: 8px;
  transition: all 0.3s ease;
}

.skill-category li:hover {
  color: #4dabf7;
  border-left-color: #4c6ef5;
  background: rgba(76, 110, 245, 0.05);
  padding-left: 16px;
}

.skill-category li::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 8px;
  width: 6px;
  height: 6px;
  background: #4c6ef5;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(76, 110, 245, 0.4);
}

/* 功能特色展示 */
.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.feature-card {
  background: linear-gradient(135deg, rgba(76, 110, 245, 0.1), rgba(76, 110, 245, 0.05));
  border: 2px solid #4c6ef5;
  border-radius: 12px;
  padding: 25px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 25px rgba(76, 110, 245, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: #74c0fc;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4c6ef5, transparent);
  animation: featureScan 4s linear infinite;
}

.feature-card h3 {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 10px;
  color: #4dabf7;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.feature-card p {
  color: #adb5bd;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 20px;
  text-align: center;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 15px;
}

.tag {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 9px;
  background: rgba(76, 110, 245, 0.2);
  color: #4dabf7;
  padding: 4px 8px;
  border: 1px solid #4c6ef5;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(76, 110, 245, 0.3);
  color: #74c0fc;
  transform: scale(1.05);
}

/* 动画效果 */
@keyframes skillScan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes featureScan {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* 响应式优化 */
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

  .ai-skills {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .skill-category {
    padding: 15px;
  }

  .feature-highlights {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-card {
    padding: 20px;
  }

  .tech-tags {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .about {
    padding: 15px 12px;
    font-size: 14px;
  }

  .about-content {
    padding: 15px;
  }

  .ai-skills {
    gap: 15px;
  }

  .skill-category {
    padding: 12px;
  }

  .skill-category li {
    font-size: 11px;
    margin-bottom: 10px;
  }

  .feature-highlights {
    gap: 15px;
  }

  .feature-card {
    padding: 15px;
  }

  .feature-card h3 {
    font-size: 9px;
  }

  .feature-card p {
    font-size: 11px;
  }

  .tag {
    font-size: 8px;
    padding: 3px 6px;
  }
}
</style>
