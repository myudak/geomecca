import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../domain/home/home-page') },
  { path: '/login', component: () => import('../domain/auth/login-page') },
  { path: '/trace-view', component: () => import('../domain/trace-view/trace-view-page') },
  { path: '/station-view', component: () => import('../domain/station-view/station-view-page') },
  { path: '/eq-view', component: () => import('@src/domain/eq-view/eq-view-page') },
  { path: '/map-view', name: 'map-view', component: () => import('@src/domain/map-view/map-view-page') },
  {
    path: '/origin-locator-view/:tab',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page')
  },
  {
    path: '/origin-locator-view/:tab/:id',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page')
  },
  {
    path: '/origin-locator-view/:tab/:id/:originId',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page')
  },
  { path: '/config', component: () => import('@src/domain/config-view/user-view-page') },
  { path: '/config/user', name: 'config-user', component: () => import('@src/domain/config-view/user-view-page') },
  {
    path: '/config/station',
    name: 'config-station',
    component: () => import('@src/domain/config-view/station-view-page')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
