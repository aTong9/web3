<template>
  <div class="cyber-background">
    <!-- 像素星空层 -->
    <div class="pixel-stars"></div>

    <!-- 赛博网格层 -->
    <div class="cyber-grid"></div>

    <!-- 动态光效层 -->
    <div class="laser-effects">
      <div class="laser-beam beam-1"></div>
      <div class="laser-beam beam-2"></div>
      <div class="laser-beam beam-3"></div>
    </div>

    <!-- 浮动像素粒子 -->
    <div class="pixel-particles">
      <div v-for="i in 20" :key="i" class="pixel-particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 内容层 -->
    <div class="content-layer">
      <div class="home">
        <Navigation />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Navigation from '../components/Navigation.vue'
import CyberBackground from '@/utils/cyber-bg'

let cyberBg: CyberBackground | null = null

// 生成随机粒子样式
const getParticleStyle = (index: number) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`,
  }
}

onMounted(() => {
  // 初始化赛博朋克背景
  cyberBg = new CyberBackground('.cyber-background')
})

onUnmounted(() => {
  // 清理资源
  if (cyberBg) {
    cyberBg.cleanup()
  }
})
</script>

<style scoped>
.cyber-background {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
  image-rendering: pixelated;
}

/* 像素星空背景 */
.pixel-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    /* 大星星 */
    radial-gradient(2px 2px at 20% 30%, #4c6ef5, transparent),
    radial-gradient(2px 2px at 60% 70%, #74c0fc, transparent),
    radial-gradient(1px 1px at 50% 50%, #fff, transparent),
    radial-gradient(1px 1px at 80% 20%, #4c6ef5, transparent),
    radial-gradient(2px 2px at 90% 60%, #74c0fc, transparent),
    /* 小星星 */ radial-gradient(1px 1px at 10% 10%, #fff, transparent),
    radial-gradient(1px 1px at 30% 80%, #fff, transparent),
    radial-gradient(1px 1px at 70% 40%, #4c6ef5, transparent),
    radial-gradient(1px 1px at 40% 20%, #74c0fc, transparent),
    radial-gradient(1px 1px at 85% 85%, #fff, transparent);
  background-size:
    200px 200px,
    180px 180px,
    150px 150px,
    170px 170px,
    190px 190px,
    80px 80px,
    90px 90px,
    100px 100px,
    110px 110px,
    120px 120px;
  background-position:
    0% 0%,
    20% 20%,
    40% 40%,
    60% 60%,
    80% 80%,
    10% 10%,
    30% 30%,
    50% 50%,
    70% 70%,
    90% 90%;
  animation: starMove 200s linear infinite;
  opacity: 0.8;
}

@keyframes starMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-200px, -200px);
  }
}

/* 赛博朋克网格 */
.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(76, 110, 245, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(76, 110, 245, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  z-index: 1;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* 激光束效果 */
.laser-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
}

.laser-beam {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4c6ef5, transparent);
  opacity: 0;
}

.beam-1 {
  top: 20%;
  left: -100%;
  width: 100%;
  animation: laserSweep1 8s linear infinite;
}

.beam-2 {
  top: 50%;
  left: -100%;
  width: 80%;
  animation: laserSweep2 12s linear infinite;
}

.beam-3 {
  top: 80%;
  left: -100%;
  width: 60%;
  animation: laserSweep3 10s linear infinite;
}

@keyframes laserSweep1 {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes laserSweep2 {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes laserSweep3 {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

/* 浮动像素粒子 */
.pixel-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.pixel-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #4c6ef5;
  image-rendering: pixelated;
  animation: floatParticle linear infinite;
  box-shadow: 0 0 6px #4c6ef5;
}

@keyframes floatParticle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}

.home {
  min-height: 100%;
  padding: 20px;
  position: relative;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 18px;
}

/* 像素装饰边角 */
.home::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 20px;
  height: 20px;
  border-top: 2px solid #4c6ef5;
  border-left: 2px solid #4c6ef5;
  image-rendering: pixelated;
}

.home::after {
  content: '';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-top: 2px solid #4c6ef5;
  border-right: 2px solid #4c6ef5;
  image-rendering: pixelated;
}

/* 扫描线效果 */
.content-layer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(76, 110, 245, 0.6), transparent);
  animation: scanline 4s linear infinite;
  z-index: 15;
  pointer-events: none;
}

@keyframes scanline {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100vh);
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
    font-size: 16px;
  }

  .cyber-grid {
    background-size: 30px 30px;
  }

  .pixel-particle {
    width: 3px;
    height: 3px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 12px;
    font-size: 14px;
  }

  .cyber-grid {
    background-size: 20px 20px;
    opacity: 0.5;
  }
}
</style>
