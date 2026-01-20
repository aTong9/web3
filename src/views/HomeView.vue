<template>
  <div class="modern-glass-bg">
    <!-- 动态渐变背景 -->
    <div class="gradient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- 玻璃态网格 -->
    <div class="glass-grid">
      <div class="grid-lines-horizontal"></div>
      <div class="grid-lines-vertical"></div>
    </div>

    <!-- 浮动光点 -->
    <div class="floating-lights">
      <div v-for="i in 12" :key="i" class="light-particle" :style="getLightStyle(i)"></div>
    </div>

    <!-- 内容容器 -->
    <div class="content-container">
      <div class="glass-panel">
        <Navigation />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'

// 生成光点样式
const getLightStyle = (index: number) => {
  const size = Math.random() * 3 + 1
  const colors = ['#667eea', '#764ba2', '#f093fb', '#fecfef', '#a8edea', '#fed6e3']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${15 + Math.random() * 20}s`,
  }
}
</script>

<style scoped>
.modern-glass-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 动态渐变背景 */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #f093fb 0%,
    #f5576c 25%,
    #4facfe 50%,
    #43e97b 75%,
    #fa709a 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  opacity: 0.7;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.8;
  animation: floatOrb 15s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  bottom: -125px;
  right: -125px;
  animation-delay: 5s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #4facfe 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes floatOrb {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(100px, -50px) scale(1.1);
  }
  50% {
    transform: translate(-50px, 100px) scale(0.9);
  }
  75% {
    transform: translate(-100px, -50px) scale(1.05);
  }
}

/* 玻璃态网格 */
.glass-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.grid-lines-horizontal,
.grid-lines-vertical {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.grid-lines-horizontal::before,
.grid-lines-vertical::before {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: gridPulse 8s ease-in-out infinite;
}

.grid-lines-horizontal::before {
  width: 100%;
  height: 1px;
  top: 50%;
}

.grid-lines-vertical::before {
  width: 1px;
  height: 100%;
  left: 50%;
}

@keyframes gridPulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* 浮动光点 */
.floating-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.light-particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  animation: floatLight ease-in-out infinite;
  box-shadow: 0 0 10px currentColor;
}

@keyframes floatLight {
  0% {
    transform: translateY(100vh) rotate(0deg) scale(0);
    opacity: 0;
  }
  10% {
    transform: translateY(80vh) rotate(36deg) scale(1);
    opacity: 1;
  }
  90% {
    transform: translateY(20vh) rotate(324deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(0vh) rotate(360deg) scale(0);
    opacity: 0;
  }
}

/* 内容容器 */
.content-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .gradient-orb {
    filter: blur(60px);
  }

  .orb-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    left: -100px;
  }

  .orb-2 {
    width: 180px;
    height: 180px;
    bottom: -90px;
    right: -90px;
  }

  .orb-3 {
    width: 150px;
    height: 150px;
  }

  .glass-grid {
    background-size: 30px 30px;
  }

  .glass-panel {
    padding: 20px;
    border-radius: 15px;
  }
}

@media (max-width: 480px) {
  .gradient-orb {
    filter: blur(40px);
    opacity: 0.6;
  }

  .orb-1 {
    width: 150px;
    height: 150px;
    top: -75px;
    left: -75px;
  }

  .orb-2 {
    width: 130px;
    height: 130px;
    bottom: -65px;
    right: -65px;
  }

  .orb-3 {
    width: 100px;
    height: 100px;
  }

  .glass-grid {
    background-size: 20px 20px;
    opacity: 0.5;
  }

  .glass-panel {
    padding: 15px;
    border-radius: 10px;
  }
}
</style>
