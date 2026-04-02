import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/index/index.vue')
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('@/pages/learn/learn.vue')
  },
  {
    path: '/word/:id',
    name: 'Word',
    component: () => import('@/pages/word/word.vue')
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('@/pages/library/library.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/pages/community/community.vue')
  },
  {
    path: '/post/:id',
    name: 'Post',
    component: () => import('@/pages/post/post.vue')
  },
  {
    path: '/challenge',
    name: 'Challenge',
    component: () => import('@/pages/challenge/challenge.vue')
  },
  {
    path: '/root/:root',
    name: 'Root',
    component: () => import('@/pages/root/root.vue')
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/pages/mine/mine.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings/settings.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/pages/stats/stats.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
