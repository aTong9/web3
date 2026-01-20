<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <div class="app">
    <div v-if="isLoading" class="pixel-loader">
      <div class="loader-content">
        <div class="pixel-text pixel-blink">LOADING</div>
        <div class="pixel-bar">
          <div class="pixel-fill"></div>
        </div>
      </div>
    </div>
    <template v-else>
      <Header />
      <main>
        <RouterView />
      </main>
    </template>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0a0a0a;
  font-family: 'VT323', 'Courier New', monospace;
}

main {
  flex: 1;
  background-color: transparent;
}

/* 像素风格加载器 */
.pixel-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  image-rendering: pixelated;
}

.loader-content {
  text-align: center;
}

.pixel-text {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 16px;
  color: #4c6ef5;
  text-shadow: 2px 2px 0 #3a5bd9;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.pixel-bar {
  width: 200px;
  height: 20px;
  background: #1a1a1a;
  border: 2px solid #4c6ef5;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
}

.pixel-fill {
  height: 100%;
  background: #4c6ef5;
  width: 0;
  animation: pixelLoad 1.5s ease-out forwards;
  box-shadow: inset -4px 0 0 #3a5bd9;
}

@keyframes pixelLoad {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>
