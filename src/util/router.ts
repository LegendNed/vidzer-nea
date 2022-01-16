import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import Login from '../views/authentication/login.vue'
import Register from '../views/authentication/register.vue'
import Main from '../views/main.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/',
    name: 'Home',
    meta: {
      requiresAuth: true
    },
    component: Main
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Allow user to use pages that require authentication
    if (await (window as any).keytar.get()) return next()
    next('/login') // Else redirect to login page
  } else if (['/login', '/register'].includes(to.path)) {
    // Disallow user to use authentication pages if they are already logged in
    if ((await (window as any).keytar.get())) return next({ name: 'Home' })
    next()
  } else next() // If no requirements met, just continue
})

export default router
