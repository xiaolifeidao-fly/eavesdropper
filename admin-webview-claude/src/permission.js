import router from './router'
import { useUserStore } from './store/user'
import { usePermissionStore } from './store/permission'
import { ElMessage as Message } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout/index.vue'

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
      // 创建store实例
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()
      
      // determine whether the user has obtained his permission roles through getInfo
      const hasMenuList = userStore.menuList && userStore.menuList.length > 0
      console.log('判断当前是否有菜单信息:' + hasMenuList)
      if (hasMenuList) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await userStore.getInfo()
          console.log('请求获取角色信息如下:')
          console.log(roles)
          // generate accessible routes map based on roles
          // 将服务端菜单信息组装
          var menuList = []
          console.log('组装前的菜单信息:' + JSON.stringify(userStore.menuList))
          generaMenu(menuList, userStore.menuList)
          console.log('组装后的menuList111:' + JSON.stringify(menuList))
          await permissionStore.initRoutesFromWeb(menuList)
          
          // 使用Vue Router 4的方式添加路由
          menuList.forEach(route => {
            router.addRoute(route)
          })
          
          console.log('组装后的menuList:' + JSON.stringify(menuList))
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await userStore.resetToken()
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

// 动态导入
const moduleImporter = file => {
  // 使用Vite的动态导入
  const modules = import.meta.glob('./views/**/*.vue')
  const path = `./views${file}.vue`
  return modules[path]
}

function generaMenu(routes, data) {
  data.forEach(item => {
    // alert('当前服务端菜单JSONObject:' + JSON.stringify(item))
    console.log('当前服务端菜单JSONObject:' + JSON.stringify(item))
    const menu = {
      path: item.path,
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
    if (item.component === 'Layout') {
      menu.component = Layout
    } else {
      console.log('111 menu3 开始导入组件')
      menu.component = moduleImporter(item.component) // 导入组件
      console.log('111 menu4 导入组件成功')
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
