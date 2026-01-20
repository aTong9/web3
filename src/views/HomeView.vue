<template>
  <div class="cyberpunk-bg">
    <!-- 深空背景层 -->
    <div class="deep-space">
      <div class="nebula-effect"></div>
      <div class="cosmic-dust"></div>
    </div>

    <!-- 霓虹矩阵雨 -->
    <div class="neon-matrix">
      <div v-for="i in 25" :key="i" class="neon-rain" :style="getNeonRainStyle(i)"></div>
    </div>

    <!-- 二进制瀑布 -->
    <div class="binary-waterfall">
      <div v-for="i in 20" :key="i" class="binary-stream" :style="getBinaryStyle(i)"></div>
    </div>

    <!-- 全息投影层 -->
    <div class="holographic-layer">
      <div class="hologram-lines"></div>
      <div class="hologram-flare"></div>
    </div>

    <!-- 能量网格 -->
    <div class="energy-grid">
      <div class="grid-lines-h"></div>
      <div class="grid-lines-v"></div>
      <div class="grid-pulse"></div>
      <div class="energy-rings"></div>
    </div>

    <!-- 霓虹粒子系统 -->
    <div class="neon-particles">
      <div v-for="i in 40" :key="i" class="neon-particle" :style="getParticleStyle()"></div>
    </div>

    <!-- 量子光束 -->
    <div class="quantum-beams">
      <div class="beam beam-1"></div>
      <div class="beam beam-2"></div>
      <div class="beam beam-3"></div>
    </div>

    <!-- 数据流管道 -->
    <div class="data-streams">
      <div v-for="i in 8" :key="i" class="data-pipe" :style="getPipeStyle(i)"></div>
    </div>

    <!-- 闪电效果 -->
    <div class="lightning-layer">
      <div class="lightning-bolt" ref="lightning"></div>
      <div class="plasma-burst" ref="plasma"></div>
    </div>

    <!-- 故障艺术层 -->
    <div class="glitch-art">
      <div class="glitch-red"></div>
      <div class="glitch-green"></div>
      <div class="glitch-blue"></div>
      <div class="static-noise"></div>
      <div class="digital-glitch"></div>
    </div>

    <!-- CRT显示器效果 -->
    <div class="crt-effect">
      <div class="crt-curve"></div>
      <div class="scanlines"></div>
      <div class="screen-flicker"></div>
      <div class="phosphor-glow"></div>
    </div>

    <!-- 像素星光 -->
    <div class="pixel-stars">
      <div v-for="i in 60" :key="i" class="pixel-star" :style="getStarStyle()"></div>
    </div>

    <!-- 浮动几何形状 -->
    <div class="floating-geometry">
      <div v-for="i in 12" :key="i" class="geo-shape" :style="getGeoStyle()"></div>
    </div>

    <!-- 音频可视化条 -->
    <div class="audio-visualizer">
      <div v-for="i in 32" :key="i" class="audio-bar" :style="getAudioBarStyle(i)"></div>
    </div>

    <!-- 电路板纹理层 -->
    <div class="circuit-board">
      <div v-for="i in 30" :key="i" class="circuit-line" :style="getCircuitLineStyle(i)"></div>
      <div v-for="i in 20" :key="i" class="circuit-node" :style="getCircuitNodeStyle()"></div>
    </div>

    <!-- 全息扫描层 -->
    <div class="hologram-scan">
      <div class="scan-line"></div>
      <div class="scan-line-2"></div>
    </div>

    <!-- 数据块浮动层 -->
    <div class="data-blocks">
      <div v-for="i in 25" :key="i" class="data-block" :style="getDataBlockStyle(i)"></div>
    </div>

    <!-- 脉冲网络层 -->
    <div class="pulse-network">
      <div v-for="i in 15" :key="i" class="pulse-node" :style="getPulseNodeStyle()"></div>
    </div>

    <!-- 内容容器 -->
    <div class="cyber-container">
      <div class="neon-frame">
        <Navigation />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Navigation from '../components/Navigation.vue'

const lightning = ref<HTMLElement | null>(null)
const plasma = ref<HTMLElement | null>(null)

// 霓虹矩阵雨样式
const getNeonRainStyle = (index: number) => {
  const neonChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()+=[]{}|\\;:"<>,.?/~'
  const length = 20 + Math.floor(Math.random() * 30)
  let text = ''
  for (let i = 0; i < length; i++) {
    text += neonChars[Math.floor(Math.random() * neonChars.length)]
  }

  return {
    left: `${(index - 1) * (100 / 25)}%`,
    animationDelay: `${Math.random() * 12}s`,
    animationDuration: `${8 + Math.random() * 20}s`,
    '--neon-text': `"${text}"`,
    '--neon-length': length,
    '--neon-color': getNeonColor(),
  }
}

// 二进制瀑布样式
const getBinaryStyle = (index: number) => {
  const binaryChars = '01'
  const length = 25 + Math.floor(Math.random() * 40)
  let text = ''
  for (let i = 0; i < length; i++) {
    text += binaryChars[Math.floor(Math.random() * binaryChars.length)]
  }

  return {
    left: `${(index - 1) * (100 / 20)}%`,
    animationDelay: `${Math.random() * 15}s`,
    animationDuration: `${10 + Math.random() * 25}s`,
    '--binary-text': `"${text}"`,
    '--binary-length': length,
  }
}

// 粒子样式
const getParticleStyle = () => {
  const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff00aa', '#00ff00', '#ff6600']
  const color = neonColors[Math.floor(Math.random() * neonColors.length)]
  const size = Math.random() * 4 + 1

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    boxShadow: `0 0 ${size * 2}px ${color}`,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${5 + Math.random() * 15}s`,
  }
}

// 星星样式
const getStarStyle = () => {
  const starColors = ['#ffffff', '#ffaa00', '#00aaff', '#ff00aa', '#00ffaa']
  const color = starColors[Math.floor(Math.random() * starColors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${1 + Math.random() * 2}px`,
    height: `${1 + Math.random() * 2}px`,
    backgroundColor: color,
    boxShadow: `0 0 ${Math.random() * 6}px ${color}`,
    animationDelay: `${Math.random() * 20}s`,
    animationDuration: `${2 + Math.random() * 8}s`,
    opacity: Math.random() * 0.9 + 0.1,
  }
}

// 获取霓虹颜色
const getNeonColor = () => {
  const neonColors = [
    '#ff00ff',
    '#00ffff',
    '#ffff00',
    '#ff00aa',
    '#00ff00',
    '#ff6600',
    '#00ff88',
    '#ff3366',
    '#9966ff',
  ]
  return neonColors[Math.floor(Math.random() * neonColors.length)]
}

// 数据管道样式
const getPipeStyle = (index: number) => {
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0088']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${20 + Math.random() * 40}px`,
    height: '2px',
    backgroundColor: color,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${3 + Math.random() * 7}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
  }
}

// 几何形状样式
const getGeoStyle = () => {
  const shapes = ['triangle', 'square', 'hexagon']
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#9933ff']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${10 + Math.random() * 20}px`,
    height: `${10 + Math.random() * 20}px`,
    backgroundColor: 'transparent',
    border: `2px solid ${color}`,
    clipPath:
      shape === 'triangle'
        ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
        : shape === 'hexagon'
          ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
          : 'none',
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${15 + Math.random() * 25}s`,
    opacity: Math.random() * 0.6 + 0.2,
  }
}

// 音频可视化条样式
const getAudioBarStyle = (index: number) => {
  const height = Math.random() * 60 + 10
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${(index - 1) * (100 / 32)}%`,
    bottom: '0',
    width: '2px',
    height: `${height}px`,
    backgroundColor: color,
    boxShadow: `0 0 ${height / 2}px ${color}`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${0.5 + Math.random() * 1.5}s`,
  }
}

// 电路板线条样式
const getCircuitLineStyle = (index: number) => {
  const colors = ['#00ff00', '#ff00ff', '#00ffff']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${10 + Math.random() * 50}px`,
    height: '1px',
    backgroundColor: color,
    opacity: Math.random() * 0.6 + 0.2,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 7}s`,
  }
}

// 电路板节点样式
const getCircuitNodeStyle = () => {
  const colors = ['#00ff00', '#ff00ff', '#00ffff', '#ffff00']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: '4px',
    height: '4px',
    backgroundColor: color,
    borderRadius: '50%',
    boxShadow: `0 0 8px ${color}`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${2 + Math.random() * 4}s`,
  }
}

// 数据块样式
const getDataBlockStyle = (index: number) => {
  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00', '#ff6600']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${20 + Math.random() * 30}px`,
    height: `${20 + Math.random() * 30}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: `1px solid ${color}`,
    boxShadow: `0 0 10px ${color}`,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${15 + Math.random() * 25}s`,
  }
}

// 脉冲节点样式
const getPulseNodeStyle = () => {
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: '8px',
    height: '8px',
    backgroundColor: color,
    borderRadius: '50%',
    boxShadow: `0 0 15px ${color}`,
    animationDelay: `${Math.random() * 12}s`,
    animationDuration: `${4 + Math.random() * 8}s`,
  }
}

// 故障效果和闪电效果
let glitchInterval: number | null = null
let lightningInterval: number | null = null
let plasmaInterval: number | null = null

onMounted(() => {
  // 故障效果
  const glitchElements = document.querySelectorAll('.glitch-red, .glitch-green, .glitch-blue')
  glitchInterval = setInterval(
    () => {
      glitchElements.forEach((el) => {
        el.classList.add('active')
        setTimeout(
          () => {
            el.classList.remove('active')
          },
          100 + Math.random() * 200,
        )
      })
    },
    2000 + Math.random() * 3000,
  ) as any

  // 闪电效果
  lightningInterval = setInterval(
    () => {
      if (lightning.value) {
        lightning.value.style.left = `${Math.random() * 100}%`
        lightning.value.style.opacity = '1'
        setTimeout(
          () => {
            if (lightning.value) {
              lightning.value.style.opacity = '0'
            }
          },
          100 + Math.random() * 200,
        )
      }
    },
    4000 + Math.random() * 6000,
  ) as any

  // 等离子爆发效果
  plasmaInterval = setInterval(
    () => {
      if (plasma.value) {
        plasma.value.style.left = `${Math.random() * 100}%`
        plasma.value.style.top = `${Math.random() * 100}%`
        plasma.value.style.transform = 'scale(1)'
        setTimeout(
          () => {
            if (plasma.value) {
              plasma.value.style.transform = 'scale(0)'
            }
          },
          300 + Math.random() * 400,
        )
      }
    },
    5000 + Math.random() * 7000,
  ) as any
})

onUnmounted(() => {
  if (glitchInterval) clearInterval(glitchInterval)
  if (lightningInterval) clearInterval(lightningInterval)
  if (plasmaInterval) clearInterval(plasmaInterval)
})
</script>

<style scoped>
.cyberpunk-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
  image-rendering: pixelated;
  font-family: 'VT323', 'Courier New', monospace;
}

/* 深空背景层 */
.deep-space {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(0, 255, 128, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, #000 0%, #0a0a0a 50%, #000 100%);
  animation: deepSpacePulse 20s ease-in-out infinite;
}

/* 星云效果 */
.nebula-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(255, 0, 255, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(0, 255, 255, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 30%, rgba(255, 255, 0, 0.03) 0%, transparent 60%);
  animation: nebulaShift 30s ease-in-out infinite;
}

/* 宇宙尘埃 */
.cosmic-dust {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(1px 1px at 20% 30%, #8a2bff, transparent),
    radial-gradient(1px 1px at 60% 70%, #1e90ff, transparent),
    radial-gradient(1px 1px at 50% 50%, #fff, transparent),
    radial-gradient(1px 1px at 80% 20%, #8a2bff, transparent),
    radial-gradient(2px 2px at 90% 60%, #1e90ff, transparent);
  background-size:
    200px 200px,
    180px 180px,
    150px 150px,
    170px 170px,
    190px 190px;
  animation: cosmicDrift 60s linear infinite;
  opacity: 0.8;
}

@keyframes deepSpacePulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

@keyframes nebulaShift {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: rotate(90deg) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(1);
    opacity: 0.5;
  }
  75% {
    transform: rotate(270deg) scale(0.9);
    opacity: 0.7;
  }
}

@keyframes cosmicDrift {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100px, -100px);
  }
}

/* 霓虹矩阵雨 */
.neon-matrix {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.neon-rain {
  position: absolute;
  top: -200px;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 14px;
  color: var(--neon-color, #00ff00);
  text-shadow: 0 0 5px var(--neon-color, #00ff00);
  writing-mode: vertical-rl;
  text-orientation: upright;
  white-space: nowrap;
  overflow: hidden;
  animation: neonMatrixFall var(--neon-duration, 12s) linear infinite;
  animation-delay: var(--neon-delay, 0s);
}

@keyframes neonMatrixFall {
  0% {
    transform: translateY(-200px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(120vh);
    opacity: 0;
  }
}

/* 二进制瀑布 */
.binary-waterfall {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 6;
}

.binary-stream {
  position: absolute;
  top: -300px;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 12px;
  color: #00ff88;
  text-shadow: 0 0 3px #00ff88;
  writing-mode: vertical-rl;
  text-orientation: upright;
  white-space: nowrap;
  overflow: hidden;
  animation: binaryFall var(--binary-duration, 15s) linear infinite;
  animation-delay: var(--binary-delay, 0s);
}

@keyframes binaryFall {
  0% {
    transform: translateY(-300px) translateX(0);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) translateX(20px);
    opacity: 0;
  }
}

/* 全息投影层 */
.holographic-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.hologram-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    rgba(0, 255, 255, 0.03) 1px,
    transparent 2px,
    transparent 40px
  );
  animation: hologramScan 8s linear infinite;
}

.hologram-flare {
  position: absolute;
  top: 20%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  animation: hologramFlare 6s ease-in-out infinite;
}

@keyframes hologramScan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(40px);
  }
}

@keyframes hologramFlare {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.3);
  }
}

/* 能量网格 */
.energy-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.grid-lines-h {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 49px,
    rgba(0, 255, 255, 0.1) 50px,
    transparent 51px,
    transparent 99px
  );
  animation: gridMoveH 20s linear infinite;
}

.grid-lines-v {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 49px,
    rgba(255, 0, 255, 0.1) 50px,
    transparent 51px,
    transparent 99px
  );
  animation: gridMoveV 25s linear infinite;
}

.grid-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 0, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 75% 75%, rgba(255, 0, 255, 0.05) 0%, transparent 30%);
  animation: gridPulse 4s ease-in-out infinite;
}

.energy-rings {
  position: absolute;
  width: 100%;
  height: 100%;
}

.energy-rings::before,
.energy-rings::after {
  content: '';
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  opacity: 0.3;
}

.energy-rings::before {
  width: 200px;
  height: 200px;
  border-color: rgba(0, 255, 255, 0.4);
  top: 20%;
  left: 30%;
  animation: ringExpand1 6s ease-in-out infinite;
}

.energy-rings::after {
  width: 150px;
  height: 150px;
  border-color: rgba(255, 0, 255, 0.4);
  bottom: 30%;
  right: 20%;
  animation: ringExpand2 8s ease-in-out infinite;
}

@keyframes gridMoveH {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100px);
  }
}

@keyframes gridMoveV {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100px);
  }
}

@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes ringExpand1 {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

@keyframes ringExpand2 {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.6;
  }
}

/* 霓虹粒子系统 */
.neon-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 7;
}

.neon-particle {
  position: absolute;
  border-radius: 50%;
  animation: particleFloat var(--particle-duration, 10s) ease-in-out infinite;
  animation-delay: var(--particle-delay, 0s);
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px) scale(1);
    opacity: 0;
  }
}

/* 量子光束 */
.quantum-beams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 8;
  pointer-events: none;
}

.beam {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff00ff, transparent);
  opacity: 0;
}

.beam-1 {
  top: 25%;
  width: 100%;
  animation: beamSweep1 12s ease-in-out infinite;
}

.beam-2 {
  top: 50%;
  width: 80%;
  animation: beamSweep2 16s ease-in-out infinite;
}

.beam-3 {
  top: 75%;
  width: 60%;
  animation: beamSweep3 10s ease-in-out infinite;
}

@keyframes beamSweep1 {
  0%,
  100% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  50% {
    left: 100%;
  }
}

@keyframes beamSweep2 {
  0%,
  100% {
    left: -80%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  50% {
    left: 100%;
  }
}

@keyframes beamSweep3 {
  0%,
  100% {
    left: -60%;
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  90% {
    opacity: 0.9;
  }
  50% {
    left: 100%;
  }
}

/* 数据流管道 */
.data-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
}

.data-pipe {
  position: absolute;
  border-radius: 1px;
  animation: dataFlow var(--pipe-duration, 5s) ease-in-out infinite;
  animation-delay: var(--pipe-delay, 0s);
  box-shadow: 0 0 10px currentColor;
}

@keyframes dataFlow {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1) rotate(var(--pipe-rotation, 0deg));
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(calc(var(--pipe-rotation, 0deg) + 180deg));
  }
}

/* 闪电效果层 */
.lightning-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 12;
  pointer-events: none;
}

.lightning-bolt {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    #ffffff 10%,
    #00ffff 30%,
    #ff00ff 50%,
    #00ffff 70%,
    #ffffff 90%,
    transparent 100%
  );
  opacity: 0;
  filter: blur(2px);
  box-shadow: 0 0 20px #00ffff;
}

.plasma-burst {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(
    circle,
    rgba(255, 0, 255, 0.8) 0%,
    rgba(0, 255, 255, 0.4) 40%,
    transparent 70%
  );
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.3s ease-out;
  filter: blur(10px);
}

/* 故障艺术层 */
.glitch-art {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 11;
  pointer-events: none;
}

.glitch-red,
.glitch-green,
.glitch-blue {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  mix-blend-mode: screen;
}

.glitch-red {
  background: rgba(255, 0, 0, 0.1);
}

.glitch-green {
  background: rgba(0, 255, 0, 0.1);
}

.glitch-blue {
  background: rgba(0, 0, 255, 0.1);
}

.glitch-red.active,
.glitch-green.active,
.glitch-blue.active {
  animation: glitchFlash 0.3s ease-out;
}

.static-noise {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  animation: staticNoise 0.1s linear infinite;
  opacity: 0.15;
}

.digital-glitch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 3px,
    rgba(255, 0, 255, 0.05) 3px,
    transparent 6px
  );
  animation: digitalGlitch 2s linear infinite;
  opacity: 0.3;
}

@keyframes glitchFlash {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  20% {
    opacity: 0.8;
    transform: translateX(-2px);
  }
  40% {
    opacity: 0.6;
    transform: translateX(2px);
  }
  60% {
    opacity: 0.9;
    transform: translateX(-1px);
  }
  80% {
    opacity: 0.7;
    transform: translateX(1px);
  }
  100% {
    opacity: 0;
    transform: translateX(0);
  }
}

@keyframes staticNoise {
  0% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-5%, -5%);
  }
  20% {
    transform: translate(-10%, 5%);
  }
  30% {
    transform: translate(5%, -10%);
  }
  40% {
    transform: translate(-5%, 15%);
  }
  50% {
    transform: translate(-10%, 5%);
  }
  60% {
    transform: translate(15%, 0);
  }
  70% {
    transform: translate(0, 10%);
  }
  80% {
    transform: translate(-15%, 0);
  }
  90% {
    transform: translate(10%, 5%);
  }
  100% {
    transform: translate(5%, 0);
  }
}

@keyframes digitalGlitch {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(20px);
  }
}

/* CRT显示器效果 */
.crt-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 15;
  pointer-events: none;
}

.crt-curve {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  box-shadow:
    inset 0 0 120px rgba(0, 0, 0, 0.9),
    inset 0 0 40px rgba(0, 0, 0, 0.5);
}

.scanlines {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 3px
  );
  pointer-events: none;
  animation: scanlines 8s linear infinite;
}

.screen-flicker {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 255, 0, 0.02);
  animation: flicker 0.15s infinite;
  pointer-events: none;
}

.phosphor-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0, 255, 0, 0.02) 0%, transparent 70%);
  animation: phosphorGlow 4s ease-in-out infinite;
}

/* 像素星光 */
.pixel-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.pixel-star {
  position: absolute;
  animation: twinkle var(--star-duration, 4s) ease-in-out infinite;
  animation-delay: var(--star-delay, 0s);
}

/* 浮动几何形状 */
.floating-geometry {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.geo-shape {
  position: absolute;
  animation: geoFloat var(--geo-duration, 20s) ease-in-out infinite;
  animation-delay: var(--geo-delay, 0s);
}

/* 音频可视化条 */
.audio-visualizer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 13;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 10px;
}

.audio-bar {
  animation: audioPulse var(--audio-duration, 1s) ease-in-out infinite;
  animation-delay: var(--audio-delay, 0s);
  border-radius: 2px;
}

/* 电路板纹理层 */
.circuit-board {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.3;
}

.circuit-line {
  position: absolute;
  background: currentColor;
  animation: circuitPulse var(--circuit-duration, 4s) ease-in-out infinite;
  animation-delay: var(--circuit-delay, 0s);
}

.circuit-node {
  position: absolute;
  animation: nodeGlow var(--node-duration, 2s) ease-in-out infinite;
  animation-delay: var(--node-delay, 0s);
}

/* 全息扫描层 */
.hologram-scan {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 14;
  pointer-events: none;
}

.scan-line,
.scan-line-2 {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.6), transparent);
  animation: scanMove 6s linear infinite;
}

.scan-line-2 {
  animation-delay: 3s;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.4), transparent);
}

/* 数据块浮动层 */
.data-blocks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 8;
}

.data-block {
  position: absolute;
  animation: blockFloat var(--block-duration, 15s) ease-in-out infinite;
  animation-delay: var(--block-delay, 0s);
  font-family: 'VT323', monospace;
  font-size: 10px;
  color: #00ff88;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 脉冲网络层 */
.pulse-network {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
}

.pulse-node {
  position: absolute;
  animation: pulseExpand var(--pulse-duration, 6s) ease-in-out infinite;
  animation-delay: var(--pulse-delay, 0s);
}

@keyframes scanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

@keyframes flicker {
  0% {
    opacity: 0.27861;
  }
  5% {
    opacity: 0.34769;
  }
  10% {
    opacity: 0.23604;
  }
  15% {
    opacity: 0.90626;
  }
  20% {
    opacity: 0.18128;
  }
  25% {
    opacity: 0.83891;
  }
  30% {
    opacity: 0.65583;
  }
  35% {
    opacity: 0.67807;
  }
  40% {
    opacity: 0.26531;
  }
  45% {
    opacity: 0.84693;
  }
  50% {
    opacity: 0.96019;
  }
  55% {
    opacity: 0.08594;
  }
  60% {
    opacity: 0.20313;
  }
  65% {
    opacity: 0.71988;
  }
  70% {
    opacity: 0.53455;
  }
  75% {
    opacity: 0.37288;
  }
  80% {
    opacity: 0.71428;
  }
  85% {
    opacity: 0.70419;
  }
  90% {
    opacity: 0.7003;
  }
  95% {
    opacity: 0.36108;
  }
  100% {
    opacity: 0.24387;
  }
}

@keyframes phosphorGlow {
  0%,
  100% {
    opacity: 0.02;
  }
  50% {
    opacity: 0.05;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: var(--star-opacity, 0.5);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes geoFloat {
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

@keyframes audioPulse {
  0%,
  100% {
    height: var(--audio-height, 20px);
  }
  50% {
    height: calc(var(--audio-height, 20px) * 1.5);
  }
}

@keyframes circuitPulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes nodeGlow {
  0%,
  100% {
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    box-shadow: 0 0 20px currentColor;
  }
}

@keyframes scanMove {
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(100vh);
  }
}

@keyframes blockFloat {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(50px) rotate(180deg);
    opacity: 0;
  }
}

@keyframes pulseExpand {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
}

/* 内容容器 */
.cyber-container {
  position: relative;
  z-index: 20;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.neon-frame {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #00ff88;
  border-radius: 8px;
  padding: 30px;
  box-shadow:
    0 0 20px rgba(0, 255, 136, 0.3),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
  position: relative;
  overflow: hidden;
}

.neon-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  animation: frameScan 3s linear infinite;
}

.neon-frame::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff00ff, transparent);
  animation: frameScan2 4s linear infinite;
}

@keyframes frameScan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes frameScan2 {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .neon-rain {
    font-size: 12px;
  }

  .binary-stream {
    font-size: 10px;
  }

  .neon-particle {
    width: 3px;
    height: 3px;
  }

  .geo-shape {
    width: 8px;
    height: 8px;
  }

  .audio-visualizer {
    height: 60px;
  }

  .energy-grid {
    opacity: 0.5;
  }

  .neon-frame {
    padding: 20px;
    border-width: 1px;
  }

  .cyber-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .neon-rain {
    font-size: 10px;
  }

  .binary-stream {
    font-size: 8px;
  }

  .neon-particle {
    width: 2px;
    height: 2px;
  }

  .geo-shape {
    width: 6px;
    height: 6px;
  }

  .audio-visualizer {
    height: 40px;
  }

  .energy-grid {
    opacity: 0.3;
  }

  .holographic-layer {
    opacity: 0.5;
  }

  .glitch-art {
    opacity: 0.6;
  }

  .neon-frame {
    padding: 15px;
    border-width: 1px;
  }

  .cyber-container {
    padding: 10px;
  }
}
</style>
