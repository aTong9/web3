import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '@/composables/use-auth'
import { useAnalytics } from '@/composables/use-analytics'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        titleKey: '管理中心',
        descriptionKey: '用户权限与开源埋点',
        permission: 'admin.view',
      },
    },
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
      path: '/quant-signals',
      name: 'quant-signals',
      component: () => import('../views/QuantSignalsView.vue'),
      meta: {
        titleKey: 'ui.routes.quant.title',
        descriptionKey: 'ui.routes.quant.description',
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

router.beforeEach(async (to) => {
  const auth = useAuth()
  await auth.restore()
  const permission = to.meta.permission
  if (typeof permission === 'string' && !auth.can(permission as import('@/types').AppPermission))
    return '/'
})

router.afterEach((to) =>
  useAnalytics().capture('$pageview', { path: to.path, route: String(to.name ?? '') }),
)

export default router
