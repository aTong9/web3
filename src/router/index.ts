import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/use-auth'
import { useAnalytics } from '@/composables/use-analytics'

const router = createRouter({
  scrollBehavior: (to, _from, savedPosition) =>
    savedPosition ?? (to.hash ? { el: to.hash, top: 88 } : { top: 0 }),
  history:
    import.meta.env.VITE_APP_TARGET === 'electron'
      ? createWebHashHistory()
      : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/reminders',
      name: 'reminders',
      component: () => import('../views/ReminderCenterView.vue'),
      meta: {
        titleKey: 'ui.routes.reminders.title',
        descriptionKey: 'ui.routes.reminders.description',
      },
    },
    {
      path: '/portfolio-review',
      name: 'portfolio-review',
      component: () => import('../views/PortfolioReviewView.vue'),
      meta: {
        titleKey: 'ui.routes.portfolioReview.title',
        descriptionKey: 'ui.routes.portfolioReview.description',
      },
    },
    {
      path: '/learning-paths',
      name: 'learning-paths',
      component: () => import('../views/LearningPathsView.vue'),
      meta: {
        titleKey: 'ui.routes.learningPaths.title',
        descriptionKey: 'ui.routes.learningPaths.description',
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        titleKey: 'ui.routes.admin.title',
        descriptionKey: 'ui.routes.admin.description',
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
      path: '/research-workspace',
      name: 'research-workspace',
      component: () => import('../views/ResearchWorkspaceView.vue'),
      meta: {
        titleKey: 'ui.routes.researchWorkspace.title',
        descriptionKey: 'ui.routes.researchWorkspace.description',
      },
    },
    {
      path: '/event-calendar',
      name: 'event-calendar',
      component: () => import('../views/EventCalendarView.vue'),
      meta: {
        titleKey: 'ui.routes.eventCalendar.title',
        descriptionKey: 'ui.routes.eventCalendar.description',
      },
    },
    {
      path: '/personal-finance',
      name: 'personal-finance',
      component: () => import('../views/PersonalFinanceView.vue'),
      meta: {
        titleKey: 'ui.routes.personalFinance.title',
        descriptionKey: 'ui.routes.personalFinance.description',
      },
    },
    {
      path: '/data-health',
      name: 'data-health',
      component: () => import('../views/DataHealthView.vue'),
      meta: {
        titleKey: 'ui.routes.dataHealth.title',
        descriptionKey: 'ui.routes.dataHealth.description',
      },
    },
    {
      path: '/income-ledger',
      name: 'income-ledger',
      component: () => import('../views/IncomeLedgerView.vue'),
      meta: {
        titleKey: 'ui.routes.incomeLedger.title',
        descriptionKey: 'ui.routes.incomeLedger.description',
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
      path: '/asset-technical',
      name: 'asset-technical',
      component: () => import('../views/AssetTechnicalView.vue'),
      meta: {
        titleKey: 'ui.routes.assetTechnical.title',
        descriptionKey: 'ui.routes.assetTechnical.description',
      },
    },
    {
      path: '/resources',
      name: 'resources',
      component: () => import('../views/HomeView.vue'),
      meta: {
        titleKey: 'ui.routes.resources.title',
        descriptionKey: 'ui.routes.resources.description',
      },
    },
    {
      path: '/income-opportunities',
      name: 'income-opportunities',
      component: () => import('../views/IncomeOpportunitiesView.vue'),
      meta: {
        titleKey: 'ui.routes.gameIncome.title',
        descriptionKey: 'ui.routes.gameIncome.description',
      },
    },
    { path: '/game-income', redirect: '/income-opportunities' },
    {
      path: '/china-game-income',
      name: 'china-game-income',
      component: () => import('../views/ChinaGameIncomeView.vue'),
      meta: {
        titleKey: 'ui.routes.chinaGameIncome.title',
        descriptionKey: 'ui.routes.chinaGameIncome.description',
      },
    },
    {
      path: '/country-travel-guide',
      name: 'country-travel-guide',
      component: () => import('../views/CountryTravelGuideView.vue'),
      meta: {
        titleKey: 'ui.routes.countryTravel.title',
        descriptionKey: 'ui.routes.countryTravel.description',
      },
    },
    {
      path: '/intelligence',
      component: () => import('../views/IntelligenceView.vue'),
      meta: {
        titleKey: 'ui.routes.intelligence.title',
        descriptionKey: 'ui.routes.intelligence.description',
      },
      children: [
        { path: '', redirect: '/intelligence/news' },
        {
          path: 'news',
          name: 'market-news',
          component: () => import('../views/MarketNewsView.vue'),
          props: { embedded: true },
        },
        {
          path: 'kols',
          name: 'kols',
          component: () => import('../views/KolView.vue'),
          props: { embedded: true },
        },
        {
          path: 'sources',
          name: 'sources',
          component: () => import('../views/BloggerView.vue'),
          props: { embedded: true },
        },
      ],
    },
    { path: '/market-news', redirect: '/intelligence/news' },
    { path: '/kols', redirect: '/intelligence/kols' },
    { path: '/blogger', redirect: '/intelligence/sources' },
    {
      path: '/reddit-monitor',
      name: 'reddit-monitor',
      component: () => import('../views/RedditMonitorView.vue'),
      meta: { titleKey: 'ui.routes.reddit.title', descriptionKey: 'ui.routes.reddit.description' },
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
      path: '/norway-sovereign-fund',
      name: 'norway-sovereign-fund',
      component: () => import('../views/NorwaySovereignFundView.vue'),
      meta: {
        titleKey: 'ui.routes.norwayFund.title',
        descriptionKey: 'ui.routes.norwayFund.description',
      },
    },
    {
      path: '/us-indexes',
      name: 'us-indexes',
      component: () => import('../views/UsIndexesView.vue'),
      meta: {
        titleKey: 'ui.routes.usIndexes.title',
        descriptionKey: 'ui.routes.usIndexes.description',
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
