// import Vue from 'vue' // Removed
// import Router from 'vue-router' // Removed

import { createRouter, createWebHistory } from 'vue-router' // Added createRouter, createWebHistory

// Vue.use(Router) // Removed

/* Layout */
import Layout from '@/layout/index.vue' // Updated path

/* Router Modules */
// Removed - these are handled dynamically now if they were used

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)', // Vue Router 4 uses different param syntax if needed, but .* should work
        component: () => import('@/views/redirect/index.vue') // Added .vue
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'), // Added .vue
    hidden: true
  },
  {
    path: '/picList',
    component: () => import('@/views/user-task/picList.vue'), // Added .vue
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect.vue'), // Added .vue
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'), // Added .vue
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'), // Added .vue
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'), // Added .vue
        name: 'Dashboard',
        meta: { title: '看板', icon: 'dashboard', affix: true }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  // Vue Router 4 uses a slightly different catch-all syntax
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 * Removed - These are now generated and added in permission.js
 */
// export const asyncRoutes = [ ... ]

// Renamed function for clarity, using Vue Router 4 API
const createVueRouter = () => createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Use createWebHistory and Vite env variable
  scrollBehavior: () => ({ top: 0 }), // Changed y to top
  routes: constantRoutes
})

const router = createVueRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
// Updated resetRouter for Vue 3 / Vue Router 4
export function resetRouter() {
  // Simple approach: reload the page. This clears Vuex state and removes added routes.
  location.reload(); 

  // Alternative: Remove dynamically added routes manually (requires tracking added routes)
  // const newRouter = createVueRouter()
  // router.matcher = newRouter.matcher // reset router - old method, not recommended
  // Get added routes (need logic in permission.js to store them)
  // const addedRoutes = store.getters.permission_routes; 
  // addedRoutes.forEach(route => {
  //   if (router.hasRoute(route.name)) { 
  //      router.removeRoute(route.name); 
  //   }
  // });
  // store.commit('permission/RESET_ROUTES'); // Reset vuex state
}

export default router
