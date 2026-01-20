<script setup lang="ts">
import { onMounted } from 'vue'
import Navigation from '../components/Navigation.vue'

onMounted(() => {
  setBingBackground()
})

async function setBingBackground() {
  try {
    const response = await fetch('https://bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const imageUrl = 'https://www.bing.com' + data.images[0].url

    const mainbg = document.getElementById('main_bg')

    if (mainbg) {
      mainbg.classList.remove('grid-bg-default')
      mainbg.style.backgroundImage = `url(${imageUrl})`
      mainbg.style.backgroundSize = 'cover'
      mainbg.style.backgroundPosition = 'center'
    }
  } catch (error) {
    console.error('Direct fetch failed:', error)

    try {
      const proxyResponse = await fetch(
        'https://api.allorigins.win/get?url=' +
          encodeURIComponent('https://bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'),
      )

      if (!proxyResponse.ok) {
        throw new Error(`Proxy HTTP error! status: ${proxyResponse.status}`)
      }

      const proxyData = await proxyResponse.json()
      const parsedData = JSON.parse(proxyData.contents)
      const imageUrl = 'https://www.bing.com' + parsedData.images[0].url

      const mainbg = document.getElementById('main_bg')

      if (mainbg) {
        mainbg.classList.remove('grid-bg-default')
        mainbg.style.backgroundImage = `url(${imageUrl})`
      }
    } catch (proxyError) {
      console.error('Proxy fetch failed:', proxyError)

      const mainbg = document.getElementById('main_bg')
      if (mainbg) {
        mainbg.style.backgroundImage = 'linear-gradient(135deg, #000, #000)'
      }
    }
  }
}
</script>

<template>
  <div class="main-content flex-fill grid-bg grid-bg-default" id="main_bg">
    <div class="home">
      <Navigation />
    </div>
  </div>
</template>

<style scoped>
.main-content {
  min-height: 100vh;
  position: relative;
  image-rendering: pixelated;
}

.grid-bg {
  transition: none;
}

.grid-bg-default {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
}

.grid-bg-default::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(76, 110, 245, 0.2) 0px,
      transparent 1px,
      transparent 8px,
      rgba(76, 110, 245, 0.2) 9px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(76, 110, 245, 0.2) 0px,
      transparent 1px,
      transparent 8px,
      rgba(76, 110, 245, 0.2) 9px
    );
  pointer-events: none;
  z-index: 0;
}

.home {
  min-height: 100%;
  padding: 20px;
  position: relative;
  z-index: 1;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 18px;
}

/* 像素风格装饰元素 */
.home::before {
  content: '◆ ◆ ◆';
  position: absolute;
  top: 20px;
  left: 20px;
  color: #4c6ef5;
  font-size: 16px;
  letter-spacing: 8px;
  text-shadow: 2px 2px 0 #3a5bd9;
  z-index: 0;
}

.home::after {
  content: '◆ ◆ ◆';
  position: absolute;
  top: 20px;
  right: 20px;
  color: #4c6ef5;
  font-size: 16px;
  letter-spacing: 8px;
  text-shadow: 2px 2px 0 #3a5bd9;
  z-index: 0;
}

/* 添加扫描线效果 */
.main-content::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4c6ef5, transparent);
  animation: scanline 8s linear infinite;
  z-index: 9999;
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

.home::after {
  content: '◆ ◆ ◆';
  position: absolute;
  top: 20px;
  right: 20px;
  color: #4c6ef5;
  font-size: 16px;
  letter-spacing: 8px;
  text-shadow: 2px 2px 0 #3a5bd9;
  z-index: 0;
}

/* 添加扫描线效果 */
.home::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4c6ef5, transparent);
  animation: scanline 8s linear infinite;
  z-index: 9999;
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
</style>
