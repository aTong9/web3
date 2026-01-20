<template>
  <div class="navigation-container">
    <div v-for="taxonomy in navigationData" :key="taxonomy.taxonomy" class="taxonomy-section">
      <h2 class="taxonomy-title">
        <i :class="taxonomy.icon"></i>
        {{ taxonomy.taxonomy }}
      </h2>

      <div v-for="term in taxonomy.list" :key="term.term" class="term-section">
        <h3 class="term-title">{{ term.term }}</h3>

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
                <h4 class="link-title">{{ link.title }}</h4>
                <p v-if="link.description" class="link-description">{{ link.description }}</p>
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
</script>

<style scoped>
.navigation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.taxonomy-section {
  margin-bottom: 40px;
}

.taxonomy-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.term-section {
  margin-bottom: 30px;
}

.term-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #555;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.link-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.link-content {
  display: flex;
  align-items: center;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  height: 100%;
  min-height: 80px;
}

.link-logo {
  width: 40px;
  height: 40px;
  margin-right: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .navigation-container {
    padding: 15px;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .link-content {
    padding: 15px;
  }

  .taxonomy-title {
    font-size: 20px;
  }

  .term-title {
    font-size: 16px;
  }

  .link-title {
    font-size: 15px;
  }

  .link-description {
    font-size: 13px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .taxonomy-title {
    color: #f8f9fa;
  }

  .term-title {
    color: #e9ecef;
  }

  .link-card {
    background: #2d3748;
    border-color: #4a5568;
  }

  .link-content {
    color: #f8f9fa;
  }

  .link-title {
    color: #f8f9fa;
  }

  .link-description {
    color: #cbd5e0;
  }
}
</style>
