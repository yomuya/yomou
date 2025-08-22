import { requireAuth } from './auth.js'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './Login.vue'
import Dashboard from './Dashboard.vue'
import Lookup from './Lookup.vue'
import Reader from './Reader.vue'
import NovelInfo from './NovelInfo.vue'
import Settings from './Settings.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/lookup',
    component: Lookup,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/reader/:ncode?',
    component: Reader,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/novel/:ncode',
    component: NovelInfo,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/settings',
    component: Settings,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  }
]

export default createRouter({
 history: createWebHistory(import.meta.env.VITE_STATIC === 'true' ? '/yomou/' : '/'),
 routes
})
