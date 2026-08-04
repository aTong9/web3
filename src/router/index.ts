import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/MarketHomeView.vue'),
      meta: {
        titleKey: 'ui.routes.home.title',
        descriptionKey: 'ui.routes.home.description',
      },
    },
    {
      path: '/cross-asset',
      name: 'cross-asset',
      component: () => import('../views/CrossAssetView.vue'),
      meta: {
        titleKey: 'ui.routes.crossAsset.title',
        descriptionKey: 'ui.routes.crossAsset.description',
      },
    },
    {
      path: '/resources',
      name: 'resources',
      component: HomeView,
      meta: {
        titleKey: 'ui.routes.resources.title',
        descriptionKey: 'ui.routes.resources.description',
      },
    },
    {
      path: '/market-news',
      name: 'market-news',
      component: () => import('../views/MarketNewsView.vue'),
      meta: {
        titleKey: 'ui.routes.marketNews.title',
        descriptionKey: 'ui.routes.marketNews.description',
      },
    },
    {
      path: '/blogger',
      name: 'news',
      component: () => import('../views/BloggerView.vue'),
      meta: {
        titleKey: 'ui.routes.blogger.title',
        descriptionKey: 'ui.routes.blogger.description',
      },
    },
    {
      path: '/funds',
      name: 'funds',
      component: () => import('../views/FundView.vue'),
      meta: {
        titleKey: 'ui.routes.funds.title',
        descriptionKey: 'ui.routes.funds.description',
      },
    },
    {
      path: '/a-share',
      name: 'a-share',
      component: () => import('../views/AShareView.vue'),
      meta: {
        titleKey: 'ui.routes.aShare.title',
        descriptionKey: 'ui.routes.aShare.description',
      },
    },
    {
      path: '/kols',
      name: 'kols',
      component: () => import('../views/KolView.vue'),
      meta: {
        titleKey: 'ui.routes.kol.title',
        descriptionKey: 'ui.routes.kol.description',
      },
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportSettingsView.vue'),
      meta: {
        titleKey: 'ui.routes.report.title',
        descriptionKey: 'ui.routes.report.description',
      },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        titleKey: 'ui.routes.about.title',
        descriptionKey: 'ui.routes.about.description',
      },
    },
  ],
})

export default router
