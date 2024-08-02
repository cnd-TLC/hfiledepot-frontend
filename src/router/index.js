import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/auth/Signin.vue'),
      meta: {
        auth: false,
      }
    },
    {
      path: '/login',
      name: 'login',
      redirect: '/signin'
    },
    {
      path: "/:catchAll(.*)",
      name: "404",
      component: () => import("@/views/404.vue"),
    },
    {
      path: '/',
      component: () => import('@/layouts/Main.vue'),
      meta: {
        auth: true
      },
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          meta: {
            title: 'Dashboard'
          },
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/purchase_request',
          name: 'purchase_request',
          meta: {
            title: 'Purchase Requests'
          },
          component: () => import('@/views/procurement/purchase_request/ListOfPr.vue')
        },
        {
          path: '/request_items/:id/:department/:requested_by/:status',
          name: 'request_items',
          meta: {
            title: 'Requested Items'
          },
          component: () => import('@/views/procurement/purchase_request/ListOfRequestedItems.vue')
        },
        {
          path: '/manage_purchase_request',
          name: 'manage_purchase_request',
          meta: {
            title: 'Manage Purchase Requests'
          },
          component: () => import('@/views/procurement/purchase_request/ListOfPrApprovals.vue')
        },
        {
          path: '/manage_ppmp',
          name: 'manage_ppmp',
          meta: {
            title: 'Project Procurement Management Plans'
          },
          component: () => import('@/views/procurement/ppmp/ListOfPpmp.vue')
        },
        {
          path: '/manage_ppmp_items/:id/:year/:title/:pmo_end_user_dept/:source_of_funds',
          name: 'manage_ppmp_items',
          meta: {
            title: 'Requested Items'
          },
          component: () => import('@/views/procurement/ppmp/ListOfPpmpItems.vue')
        },
        {
          path: '/manage_ppmp_approval',
          name: 'manage_ppmp_approval',
          meta: {
            title: 'Project Procurement Management Plans'
          },
          component: () => import('@/views/procurement/ppmp/ListOfPpmpApprovals.vue')
        },
        {
          path: '/ppmp_items_catalog',
          name: 'ppmp_items_catalog',
          meta: {
            title: 'PPMP Items Catalog'
          },
          component: () => import('@/views/procurement/ppmp/ListOfPpmpItemsCatalog.vue')
        },
        {
          path: '/roles_and_permissions',
          name: 'roles_and_permissions',
          meta: {
            title: 'Roles and Permissions'
          },
          component: () => import('@/views/accounts/roles_and_permissions/ListOfRolesAndPermissions.vue')
        },
        {
          path: '/system_users',
          name: 'system_users',
          meta: {
            title: 'System Users'
          },
          component: () => import('@/views/accounts/system_users/ListOfSystemUsers.vue')
        },
      ]
    }
  ]
})

export default router
