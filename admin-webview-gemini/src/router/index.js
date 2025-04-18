import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

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
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/picList',
    component: () => import('@/views/user-task/picList'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '看板', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/user',
    component: Layout,
    redirect: '/user/userList',
    alwaysShow: true,
    name: 'User',
    meta: {
      title: '用户',
      icon: 'peoples'
    },
    children: [
      {
        path: 'userList',
        component: () => import('@/views/user/userList'),
        name: 'UserList',
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'roleList',
        component: () => import('@/views/user/roleList'),
        name: 'RoleList',
        meta: {
          title: '角色管理'
        }
      },
      {
        path: 'tenantList',
        component: () => import('@/views/user/tenantList'),
        name: 'TenantList',
        meta: {
          title: '租户管理'
        }
      },
      {
        path: 'noticeList',
        component: () => import('@/views/user/noticeList'),
        name: 'NoticeList',
        meta: {
          title: '通告管理'
        }
      }
    ]
  },
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/tenantShop',
    alwaysShow: true,
    name: 'Shop',
    meta: {
      title: '商品',
      icon: 'list'
    },
    children: [
      {
        path: 'shopList',
        component: () => import('@/views/shop/shopList'),
        name: 'ShopList',
        meta: {
          title: '商品管理'
        }
      },
      {
        path: 'shopCategoryList',
        component: () => import('@/views/shop/shopCategoryList'),
        name: 'ShopCategoryList',
        meta: {
          title: '商品类目'
        }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/orderList',
    alwaysShow: true,
    name: 'Order',
    meta: {
      title: '订单',
      icon: 'shopping'
    },
    children: [
      {
        path: 'orderList',
        component: () => import('@/views/order/orderList'),
        name: 'OrderList',
        meta: {
          title: '订单列表'
        }
      },
      {
        path: 'orderQuery',
        component: () => import('@/views/order/orderQuery'),
        name: 'OrderQuery',
        meta: {
          title: '订单查询'
        }
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    redirect: '/account/accountDetail',
    alwaysShow: true,
    name: 'Account',
    meta: {
      title: '账户',
      icon: 'money'
    },
    children: [
      {
        path: 'accountDetail',
        component: () => import('@/views/account/accountDetail'),
        name: 'AccountDetail',
        meta: {
          title: '账户明细'
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
