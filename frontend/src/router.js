import { requireAuth } from './auth.js'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './Login.vue'
import Dashboard from './Dashboard.vue'
import Lookup from './Lookup.vue'
import Tracker from './Tracker.vue'
import Reader from './Reader.vue'

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
    path: '/tracker',
    component: Tracker,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/reader',
    component: Reader,
    beforeEnter: (to, from, next) => {
      if (requireAuth()) {
        next();
      } else {
        next('/login');
      }
    }
  },
]

export default createRouter({
 history: createWebHistory(),
 routes
})
