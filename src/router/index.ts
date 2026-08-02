import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/CrossAssetView.vue'),
    },
    {
      path: '/cross-asset',
      redirect: '/',
    },
    {
      path: '/resources',
      name: 'resources',
      component: HomeView,
    },
    {
      path: '/market-news',
      name: 'market-news',
      component: () => import('../views/MarketNewsView.vue'),
    },
    {
      path: '/blogger',
      name: 'news',
      component: () => import('../views/BloggerView.vue'),
    },
    {
      path: '/funds',
      name: 'funds',
      component: () => import('../views/FundView.vue'),
    },
    {
      path: '/a-share',
      name: 'a-share',
      component: () => import('../views/AShareView.vue'),
    },
    {
      path: '/kols',
      name: 'kols',
      component: () => import('../views/KolView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
