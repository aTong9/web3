<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BloggerData } from '@/types'
import { getBloggerData, getStockStatistics, bloggers } from '@/data/bloggers'

// 博主数据
const bloggerData = ref<BloggerData[]>(getBloggerData())

// 股票统计
const stockStats = computed(() => getStockStatistics())

// 选中的博主
const selectedBloggerId = ref<string>('all')

// 过滤后的博主数据
const filteredBloggers = computed(() => {
  if (selectedBloggerId.value === 'all') {
    return bloggerData.value
  }
  return bloggerData.value.filter(b => b.blogger.id === selectedBloggerId.value)
})

// 获取平台图标
const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    youtube: 'bi bi-youtube text-danger',
    xiaohongshu: 'bi bi-book text-danger',
    wechat: 'bi bi-wechat text-success'
  }
  return icons[platform] || 'bi bi-person-circle'
}

// 获取平台名称
const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    youtube: 'YouTube',
    xiaohongshu: '小红书',
    wechat: '微信公众号'
  }
  return names[platform] || platform
}

// 获取内容类型图标
const getContentTypeIcon = (type: string) => {
  return type === 'video' ? 'bi bi-camera-video' : 'bi bi-file-text'
}

// 获取股票市场标签颜色
const getMarketBadgeClass = (market: string) => {
  const classes: Record<string, string> = {
    'A 股': 'badge bg-primary',
    '港股': 'badge bg-warning text-dark',
    '美股': 'badge bg-success'
  }
  return classes[market] || 'badge bg-secondary'
}

// 获取股票信息辅助函数
const getStockInfo = (key: string) => {
  const [market, code] = key.split('-')
  const allStocks = bloggers.flatMap(b => b.contents).flatMap(c => c.stocks)
  const stock = allStocks.find(s => `${s.market}-${s.stockCode}` === key)
  return stock || { stockName: 'Unknown', stockCode: code, market: market || 'Unknown' }
}

</script>

<template>
  <div class="blogger-container">
    <div class="container-fluid py-4">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="h3 mb-3">
            <i class="bi bi-bar-chart-line"></i> 博主监控看板
          </h1>
          <p class="text-muted">
            实时监控博主发布的文章和视频，自动识别其中提及的股票
          </p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded">
                  <i class="bi bi-people fs-3 text-primary"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-0">监控博主</h6>
                  <h3 class="mb-0">{{ bloggerData.length }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 bg-info bg-opacity-10 p-3 rounded">
                  <i class="bi bi-file-text fs-3 text-info"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-0">内容总数</h6>
                  <h3 class="mb-0">{{ bloggerData.reduce((acc, b) => acc + b.contents.length, 0) }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 bg-warning bg-opacity-10 p-3 rounded">
                  <i class="bi bi-graph-up fs-3 text-warning"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-0">提及股票</h6>
                  <h3 class="mb-0">{{ Object.keys(stockStats).length }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 bg-success bg-opacity-10 p-3 rounded">
                  <i class="bi bi-trophy fs-3 text-success"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="mb-0">热门股票</h6>
                  <h3 class="mb-0">
                    {{ 
                      Object.entries(stockStats)
                        .sort((a, b) => b[1] - a[1])[0]?.[1] || 0 
                    }}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 博主筛选 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn btn-outline-primary"
              :class="{ active: selectedBloggerId === 'all' }"
              @click="selectedBloggerId = 'all'"
            >
              全部博主
            </button>
            <button 
              v-for="blogger in bloggerData" 
              :key="blogger.blogger.id"
              type="button" 
              class="btn btn-outline-primary"
              :class="{ active: selectedBloggerId === blogger.blogger.id }"
              @click="selectedBloggerId = blogger.blogger.id"
            >
              <i :class="getPlatformIcon(blogger.blogger.platform)"></i>
              {{ blogger.blogger.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 博主内容列表 -->
      <div class="row">
        <div class="col-12" v-for="bloggerData in filteredBloggers" :key="bloggerData.blogger.id">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex align-items-center">
                <i :class="getPlatformIcon(bloggerData.blogger.platform)" class="fs-4 me-2"></i>
                <h5 class="mb-0">{{ bloggerData.blogger.name }}</h5>
                <span class="badge bg-secondary ms-2">{{ getPlatformName(bloggerData.blogger.platform) }}</span>
                <a :href="bloggerData.blogger.url" target="_blank" class="ms-auto btn btn-sm btn-outline-primary">
                  <i class="bi bi-box-arrow-up-right"></i> 访问主页
                </a>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div 
                  v-for="content in bloggerData.contents" 
                  :key="content.id"
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex w-100 justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-1">
                        <i :class="getContentTypeIcon(content.type)" class="me-2 text-muted"></i>
                        {{ content.title }}
                      </h6>
                      <small class="text-muted">
                        <i class="bi bi-calendar3"></i> {{ content.publishDate }}
                      </small>
                    </div>
                    <a :href="content.url" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-link-45deg"></i> 查看
                    </a>
                  </div>
                  <p class="text-muted mb-2 small">{{ content.content.substring(0, 200) }}...</p>
                  
                  <!-- 提及的股票 -->
                  <div v-if="content.stocks.length > 0" class="mt-2">
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge bg-light text-dark">
                        <i class="bi bi-tag"></i> 提及股票:
                      </span>
                      <span 
                        v-for="stock in content.stocks" 
                        :key="stock.stockCode"
                        class="badge cursor-pointer"
                        :class="getMarketBadgeClass(stock.market)"
                        :title="`置信度：${(stock.confidence * 100).toFixed(0)}%`"
                      >
                        <i class="bi bi-graph-up"></i>
                        {{ stock.stockName }} ({{ stock.stockCode }})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 股票统计表格 -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart"></i> 股票提及频次统计
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>排名</th>
                      <th>市场</th>
                      <th>股票名称</th>
                      <th>股票代码</th>
                      <th>提及次数</th>
                      <th>热度</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(stat, index) in Object.entries(stockStats).sort((a, b) => b[1] - a[1])" 
                      :key="stat[0]"
                    >
                      <td>
                        <span v-if="index === 0" class="badge bg-warning text-dark">🥇 1</span>
                        <span v-else-if="index === 1" class="badge bg-secondary">🥈 2</span>
                        <span v-else-if="index === 2" class="badge bg-danger">🥉 3</span>
                        <span v-else>{{ index + 1 }}</span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="getMarketBadgeClass(getStockInfo(stat[0]).market)"
                        >
                          {{ getStockInfo(stat[0]).market }}
                        </span>
                      </td>
                      <td>
                        {{ getStockInfo(stat[0]).stockName }}
                      </td>
                      <td>
                        <code>{{ getStockInfo(stat[0]).stockCode }}</code>
                      </td>
                      <td>
                        <strong>{{ stat[1] }}</strong>
                      </td>
                      <td>
                        <div class="progress" style="height: 20px; width: 150px;">
                          <div 
                            class="progress-bar bg-primary"
                            :style="{ width: `${(stat[1] / Math.max(...Object.values(stockStats))) * 100}%` }"
                          ></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blogger-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.list-group-item {
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.cursor-pointer {
  cursor: pointer;
}

.badge {
  font-weight: 500;
}

.progress {
  border-radius: 10px;
}
</style>
