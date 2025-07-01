import { requireAuth } from './auth.js'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Lookup from './components/Lookup.vue'
import Tracker from './components/Tracker.vue'

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
]

export default createRouter({
 history: createWebHistory(),
 routes
})
