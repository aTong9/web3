<template>
  <div class="navigation-container">
    <div v-for="taxonomy in navigationData" :key="taxonomy.taxonomy" class="taxonomy-section">
      <h2 class="taxonomy-title" :class="getChineseClass(taxonomy.taxonomy)">
        <span class="pixel-icon">{{ getPixelIcon(taxonomy.icon) }}</span>
        {{ taxonomy.taxonomy }}
      </h2>

      <div v-for="term in taxonomy.list" :key="term.term" class="term-section">
        <h3 class="term-title" :class="getChineseClass(term.term)">{{ term.term }}</h3>

        <div class="links-grid">
          <div v-for="link in term.links" :key="link.title" class="link-card">
            <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-content">
              <div class="link-logo">
                <img
                  :src="`/assets/images/logos/${link.logo}`"
                  :alt="link.title"
                  @error="handleImageError"
                />
              </div>
              <div class="link-info">
                <h4 class="link-title" :class="getChineseClass(link.title)">{{ link.title }}</h4>
                <p
                  v-if="link.description"
                  class="link-description"
                  :class="getChineseClass(link.description)"
                >
                  {{ link.description }}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigationData } from '@/utils/data'

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/assets/images/logos/default.webp'
}

const getPixelIcon = (iconClass: string): string => {
  const iconMap: { [key: string]: string } = {
    'bi-globe': '🌐',
    'bi-code-slash': '⌨️',
    'bi-palette': '🎨',
    'bi-graph-up': '📈',
    'bi-book': '📚',
    'bi-tools': '🔧',
    'bi-music-note': '🎵',
    'bi-camera': '📷',
    'bi-controller': '🎮',
    'bi-heart': '❤️',
    'bi-star': '⭐',
    'bi-lightning': '⚡',
    'bi-cloud': '☁️',
    'bi-shield': '🛡️',
    'bi-rocket': '🚀',
  }

  const iconClassLower = iconClass.toLowerCase()
  for (const [key, value] of Object.entries(iconMap)) {
    if (
      iconClassLower.includes(key.toLowerCase()) ||
      iconClassLower.includes(key.replace('bi-', ''))
    ) {
      return value
    }
  }
  return '⭐' // 默认图标
}

// 中文字体检测
const hasChinese = (text: string): boolean => {
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/
  return chineseRegex.test(text)
}

// 根据内容返回合适的字体类
const getChineseClass = (text: string): string => {
  if (hasChinese(text)) {
    const hasEnglish = /[a-zA-Z]/.test(text)
    if (hasEnglish) {
      return 'mixed-pixel chinese-pixel'
    } else {
      return 'chinese-pixel mixed-pixel'
    }
  }
  return ''
}
</script>

<style scoped>
.navigation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 18px;
}

.taxonomy-section {
  margin-bottom: 40px;
}

.taxonomy-title {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 14px;
  font-weight: normal;
  margin-bottom: 20px;
  color: #e9ecef;
  background: #4c6ef5;
  padding: 12px 16px;
  display: inline-block;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 1px;
  image-rendering: pixelated;
  font-display: swap;
}

.taxonomy-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 8px;
  height: 100%;
  background: #3a5bd9;
}

.taxonomy-title::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 8px;
  height: 100%;
  background: #3a5bd9;
}

.term-section {
  margin-bottom: 30px;
}

.term-title {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 12px;
  font-weight: normal;
  margin-bottom: 15px;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-left: 4px solid #4c6ef5;
  padding-left: 12px;
  font-display: swap;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.link-card {
  background: #1a1a1a;
  border: 2px solid #343a40;
  overflow: hidden;
  transition: none;
  position: relative;
  image-rendering: pixelated;
}

.link-card:hover {
  transform: translate(-6px, -6px);
  border-color: #4c6ef5;
  box-shadow:
    6px 6px 0 #3a5bd9,
    12px 12px 0 rgba(58, 91, 217, 0.3);
}

/* hover时logo边框的变化 */
.link-card:hover .link-logo {
  background: #1a1a2e;
  border-color: #74c0fc;
  box-shadow:
    inset 0 0 0 1px #4c6ef5,
    0 0 12px rgba(76, 110, 245, 0.4);
}

.link-card:hover .link-logo::before {
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(116, 192, 252, 0.2) 0px,
      transparent 1px,
      transparent 4px,
      rgba(116, 192, 252, 0.2) 5px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(116, 192, 252, 0.2) 0px,
      transparent 1px,
      transparent 4px,
      rgba(116, 192, 252, 0.2) 5px
    );
}

.link-content {
  display: flex;
  align-items: center;
  padding: 16px;
  text-decoration: none;
  color: #e9ecef;
  height: 100%;
  min-height: 80px;
  position: relative;
}

.link-logo {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border: 2px solid #4c6ef5;
  position: relative;
  image-rendering: pixelated;
  overflow: hidden;
}

/* 像素风格的网格背景 */
.link-logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(76, 110, 245, 0.1) 0px,
      transparent 1px,
      transparent 4px,
      rgba(76, 110, 245, 0.1) 5px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(76, 110, 245, 0.1) 0px,
      transparent 1px,
      transparent 4px,
      rgba(76, 110, 245, 0.1) 5px
    );
  z-index: 0;
}

.link-logo img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: brightness(1.2) saturate(1.1);
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.link-card:hover .link-logo img {
  transform: scale(1.05);
  filter: brightness(1.3) saturate(1.3) drop-shadow(0 0 6px #74c0fc);
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 20px;
  font-weight: normal;
  margin: 0 0 4px 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.link-description {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 16px;
  color: #adb5bd;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pixel-icon {
  margin-right: 12px;
  font-size: 18px;
  display: inline-block;
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 0 #3a5bd9);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .navigation-container {
    padding: 16px;
    font-size: 16px;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .link-content {
    padding: 12px;
  }

  .taxonomy-title {
    font-size: 12px;
    padding: 10px 12px;
  }

  .term-title {
    font-size: 11px;
  }

  .link-title {
    font-size: 18px;
  }

  .link-description {
    font-size: 14px;
  }
}
</style>
