import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect', '/picList'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasMenuList = store.getters.menuList && store.getters.menuList.length > 0
      console.log('判断当前是否有菜单信息:' + hasMenuList)
      if (hasMenuList) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')
          console.log('请求获取角色信息如下:')
          console.log(roles)
          // generate accessible routes map based on roles
          // 将服务端菜单信息组装
          var menuList = []
          console.log('组装前的 store.getters.menuList:' + JSON.stringify(store.getters.menuList))
          generaMenu(menuList, store.getters.menuList)
          console.log('组装后的menuList111:' + JSON.stringify(menuList))
          await store.dispatch('permission/initRoutesFromWeb', menuList)
          router.addRoutes(menuList)
          console.log('组装后的menuList:' + JSON.stringify(menuList))
          // 原来的方式通过权限本地拼接路由
          // const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // router.addRoutes(accessRoutes)
          // console.log('原来的menuList:' + JSON.stringify(accessRoutes))
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

// module.exports = file => require('@/views' + file + '.vue').default // vue-loader at least v13.0.0+

function generaMenu(routes, data) {
  data.forEach(item => {
    // alert('当前服务端菜单JSONObject:' + JSON.stringify(item))
    console.log('当前服务端菜单JSONObject:' + JSON.stringify(item))
    const menu = {
      path: item.path,
      // component: item.component === 'Layout' ? Layout : _import(item.component),
      // redirect: item.redirect,
      alwaysShow: item.alwaysShow,
      hidden: item.hidden,
      name: item.name,
      children: [],
      meta: item.meta
    }
    console.log('111 menu' + JSON.stringify(menu))
    if (item.redirect !== 'noRedirect') {
      menu.redirect = item.redirect
    }
    console.log('111 menu2')
    // Load component: Use standard dynamic import for production, require for development
    if (item.component) { // Check if component path exists
      if (item.component === 'Layout') {
        menu.component = Layout
      } else {
        // Use standard import() for production for Webpack analysis
        if (process.env.NODE_ENV === 'production') {
          // Construct the full path string directly for import()
          menu.component = () => import(`@/views${item.component}.vue`) // <-- Key change!
        } else {
          // Keep using require for development (faster HMR)
          // Note: Ensure .default as require brings in the module object
          menu.component = require('@/views' + item.component + '.vue').default
        }
      }
    } else {
      console.warn(`Menu item ${item.path} is missing the 'component' property.`)
      // Optionally handle cases where component is missing, e.g., assign a default component or skip
    }
    console.log('111 menu5')
    // alert('组装后的单个menu:' + JSON.stringify(menu))
    console.log('组装后的单个menu:' + JSON.stringify(menu))
    if (item.children) {
      generaMenu(menu.children, item.children)
    }
    // alert('组装后的单个menu:' + JSON.stringify(menu))
    console.log('组装后的单个menu:' + JSON.stringify(menu))
    routes.push(menu)
  })
}
