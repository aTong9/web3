<script setup lang="ts">
import { ref, computed } from 'vue'

// 财经网站配置
interface NewsSite {
  id: string
  name: string
  url: string
  icon: string
  description: string
}

const allNewsSites = ref<NewsSite[]>([
  {
    id: 'xueqiu',
    name: '雪球',
    url: 'https://xueqiu.com/hot/stock',
    icon: 'bi bi-graph-up-arrow',
    description: '投资者社区，实时行情和讨论',
  },
  {
    id: 'eastmoney',
    name: 'moomoo',
    url: 'https://www.moomoo.com/hans/quote/us/most-active-stocks?chain_id=SCGY_v2rcSeIHw.1ku422v&global_content=%7B%22promote_id%22%3A13764,%22sub_promote_id%22%3A1,%22f%22%3A%22mm%2Fus%2F%22,%22b%22%3A%22Tab_%E4%B8%89%E7%BA%A7_Features-Tools-Quotes%22%7D',
    icon: 'bi bi-currency-exchange',
    description: '综合热度榜单和市场数据',
  },
  {
    id: 'jinshi',
    name: '金十数据',
    url: 'https://www.jin10.com',
    icon: 'bi bi-lightning-charge',
    description: '全球财经快讯和数据',
  },
  {
    id: 'wallstreetcn',
    name: '美股财报',
    url: 'https://longbridge.com/zh-CN/calendar/report',
    icon: 'bi bi-newspaper',
    description: '财报日历',
  },
  {
    id: 'cls',
    name: '小红书',
    url: 'https://www.xiaohongshu.com/user/profile/61ba0abd0000000010008ffa?xsec_token=ABYP-ltqZbgdKeOY8Rn2QdgOgyYW_VwU0vEB6WxsyBQjw%3D&xsec_source=pc_search',
    icon: 'bi bi-briefcase',
    description: '所有的烦恼都源于你穷',
  },
])

// 左侧网站列表（排除金十数据）
const leftSites = computed(() => {
  return allNewsSites.value.filter((site) => site.id !== 'jinshi')
})

// 右侧网站（金十数据）
const rightSite = computed(() => {
  return allNewsSites.value.find((site) => site.id === 'jinshi')
})

// 刷新指定网站
const refreshSite = (siteId: string) => {
  const iframe = document.querySelector(`iframe[data-site="${siteId}"]`) as HTMLIFrameElement
  if (iframe) {
    iframe.src = iframe.src
  }
}
</script>

<template>
  <div class="news-container">
    <!-- 顶部导航栏 -->
    <div class="news-header">
      <div class="container-fluid">
        <div class="d-flex align-items-center py-3">
          <h2 class="mb-0"><i class="bi bi-newspaper text-primary"></i> 财经新闻聚合看板</h2>

          <!-- 全部刷新按钮 -->
          <button
            class="btn btn-outline-primary btn-sm ms-auto"
            @click="allNewsSites.forEach((site) => refreshSite(site.id))"
            title="刷新所有网站"
          >
            <i class="bi bi-arrow-clockwise"></i> 全部刷新
          </button>
        </div>
      </div>
    </div>

    <!-- 左右分栏布局 -->
    <div class="news-layout">
      <!-- 左侧区域（70%） -->
      <div class="left-panel">
        <div class="sites-grid">
          <div v-for="site in leftSites" :key="site.id" class="news-card">
            <!-- 卡片头部 -->
            <div class="news-card-header">
              <div class="d-flex align-items-center">
                <i :class="site.icon" class="me-2 fs-5"></i>
                <h5 class="mb-0">{{ site.name }}</h5>
                <small class="text-muted ms-2">{{ site.description }}</small>
              </div>
              <div class="header-actions">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="refreshSite(site.id)"
                  title="刷新"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
                <a
                  :href="site.url"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary"
                  title="新窗口打开"
                >
                  <i class="bi bi-box-arrow-up-right"></i>
                </a>
              </div>
            </div>

            <!-- iframe 内容 -->
            <div class="news-card-body">
              <iframe
                :data-site="site.id"
                :src="site.url"
                :title="site.name"
                frameborder="0"
                allowfullscreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域（30%）- 金十数据 -->
      <div class="right-panel" v-if="rightSite">
        <div class="news-card fixed-height">
          <!-- 卡片头部 -->
          <div class="news-card-header jinshi-header">
            <div class="d-flex align-items-center">
              <i :class="rightSite.icon" class="me-2 fs-5"></i>
              <h5 class="mb-0">{{ rightSite.name }}</h5>
            </div>
            <div class="header-actions">
              <button
                class="btn btn-sm btn-outline-light"
                @click="refreshSite(rightSite.id)"
                title="刷新"
              >
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <a
                :href="rightSite.url"
                target="_blank"
                class="btn btn-sm btn-outline-light"
                title="新窗口打开"
              >
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
            </div>
          </div>

          <!-- iframe 内容 -->
          <div class="news-card-body">
            <iframe
              :data-site="rightSite.id"
              :src="rightSite.url"
              :title="rightSite.name"
              frameborder="0"
              allowfullscreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="news-footer">
      <div class="container-fluid">
        <small class="text-muted">
          <i class="bi bi-info-circle"></i>
          提示：部分网站可能因安全策略限制无法在 iframe
          中显示。如遇此情况，请点击右上角的"新窗口打开"按钮。
        </small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background-color: #f8f9fa;
}

.news-header {
  background: white;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.news-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 0;
}

.left-panel {
  flex: 8;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
  height: calc(100vh - 140px);
}

.right-panel {
  flex: 2;
  overflow-y: auto;
  padding: 20px;
  background-color: #e9ecef;
  border-left: 2px solid #dee2e6;
  height: calc(100vh - 140px);
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  align-content: start;
}

.news-card {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 700px;
}

.news-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #4c6ef5;
}

.news-card.fixed-height {
  position: sticky;
  top: 20px;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.news-card-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #dee2e6;
}

.news-card-header.jinshi-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.news-card-header h5 {
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions .btn {
  padding: 4px 8px;
  border-width: 1px;
}

.news-card-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 650px;
}

.news-card-body iframe {
  width: 100%;
  height: 100%;
  min-height: 650px;
  border: none;
  display: block;
}

.news-footer {
  background: white;
  border-top: 2px solid #dee2e6;
  padding: 10px 0;
  flex-shrink: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .news-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    flex: none;
    width: 100%;
    border-left: none;
  }

  .right-panel {
    border-top: 2px solid #dee2e6;
  }

  .news-card.fixed-height {
    position: static;
    min-height: 450px;
  }

  .sites-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .news-header h2 {
    font-size: 1.25rem;
  }

  .left-panel,
  .right-panel {
    padding: 10px;
  }

  .sites-grid {
    gap: 10px;
  }

  .news-card {
    min-height: 400px;
  }

  .news-card-body iframe {
    min-height: 350px;
  }

  .news-card-header small {
    display: none;
  }
}

/* 滚动条样式 */
.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 8px;
}

.left-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.left-panel::-webkit-scrollbar-thumb:hover,
.right-panel::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
