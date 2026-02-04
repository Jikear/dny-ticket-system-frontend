import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/Activities.vue')
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('../views/Announcements.vue')
  },
  {
    path: '/announcements/:id',
    name: 'AnnouncementDetail',
    component: () => import('../views/Announcements.vue')
  },
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('../views/Booking.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  // User routes (requires auth)
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/user/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: () => import('../views/user/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/password',
    name: 'UserPassword',
    component: () => import('../views/user/Password.vue'),
    meta: { requiresAuth: true }
  },
  // Admin routes (requires admin role)
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { requiresAdminOnly: true }
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('../views/admin/Tickets.vue')
      },
      {
        path: 'slots',
        name: 'AdminSlots',
        component: () => import('../views/admin/Slots.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/Orders.vue')
      },
      {
        path: 'park',
        name: 'AdminPark',
        component: () => import('../views/admin/Park.vue')
      },
      {
        path: 'activities',
        name: 'AdminActivities',
        component: () => import('../views/admin/Activities.vue')
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('../views/admin/Announcements.vue')
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../views/admin/Logs.vue'),
        meta: { requiresAdminOnly: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAdmin && !['ADMIN', 'STAFF'].includes(role || '')) {
    next({ name: 'Home' })
  } else if (to.meta.requiresAdminOnly && role !== 'ADMIN') {
    next({ name: 'AdminDashboard' })
  } else {
    next()
  }
})

export default router