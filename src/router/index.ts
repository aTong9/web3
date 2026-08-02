import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/MarketHomeView.vue'),
      meta: { pageTitle: '市场首页', pageDescription: '今日因子与多周期方向' },
    },
    {
      path: '/cross-asset',
      name: 'cross-asset',
      component: () => import('../views/CrossAssetView.vue'),
      meta: { pageTitle: '跨资产驾驶舱', pageDescription: '传导链、相关性与市场状态' },
    },
    {
      path: '/resources',
      name: 'resources',
      component: HomeView,
      meta: { pageTitle: '资源导航', pageDescription: '投资与财务工具入口' },
    },
    {
      path: '/market-news',
      name: 'market-news',
      component: () => import('../views/MarketNewsView.vue'),
      meta: { pageTitle: '全球市场快讯', pageDescription: '双语原文与市场影响' },
    },
    {
      path: '/blogger',
      name: 'news',
      component: () => import('../views/BloggerView.vue'),
      meta: { pageTitle: '资讯台', pageDescription: '研究内容聚合' },
    },
    {
      path: '/funds',
      name: 'funds',
      component: () => import('../views/FundView.vue'),
      meta: { pageTitle: '美股市场', pageDescription: '热门股票与境内基金成本' },
    },
    {
      path: '/a-share',
      name: 'a-share',
      component: () => import('../views/AShareView.vue'),
      meta: { pageTitle: 'A股市场', pageDescription: '热门股票与行业基金轮动' },
    },
    {
      path: '/kols',
      name: 'kols',
      component: () => import('../views/KolView.vue'),
      meta: { pageTitle: 'KOL监控', pageDescription: '跨平台与RSS订阅情报' },
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportSettingsView.vue'),
      meta: { pageTitle: '日报与发布', pageDescription: '市场报告导出与发布配置' },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { pageTitle: '系统说明', pageDescription: '口径、来源与风险提示' },
    },
  ],
})

export default router
