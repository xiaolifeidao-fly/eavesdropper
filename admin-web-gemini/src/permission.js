import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout/index.vue' // Ensure correct path and .vue extension

// Removed require-based dynamic import
// const _import = require('./router/_import_' + process.env.NODE_ENV)

// Helper function for Vite dynamic imports
const loadView = (view) => {
  // Use import.meta.glob for dynamic imports in Vite
  // This assumes your views are directly under src/views/
  // Adjust the path pattern '../views/**/*.vue' if your structure is different
  const modules = import.meta.glob('../views/**/*.vue')
  // Need to adjust the key format based on actual glob result. Example: '../views/Dashboard/index.vue'
  const componentPath = `../views/${view}.vue` 
  if (modules[componentPath]) {
    return modules[componentPath] // Return the async component function
  } else {
    console.error(`View component not found: ${componentPath}`)
    // Return a placeholder or error component if needed
    return Promise.resolve({ template: `<div>View not found: ${view}</div>` })
  }
}

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect', '/picList'] // no redirect whitelist

let routesAdded = false // Flag to prevent duplicate route additions

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta?.title) // Use optional chaining

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasMenuList = store.getters.menuList && store.getters.menuList.length > 0
      console.log('判断当前是否有菜单信息:' + hasMenuList)

      // Only add routes if they haven't been added and menuList exists
      if (hasMenuList && !routesAdded) { 
        try {
          const menuListData = store.getters.menuList // Use the existing menu list from store
          const accessRoutes = generaMenu(menuListData) // Generate routes from menu data
          console.log('Generated accessRoutes:', accessRoutes)
          
          // Add routes using addRoute
          accessRoutes.forEach(route => {
            router.addRoute(route) 
          });
          routesAdded = true // Set flag after adding routes
          
          await store.dispatch('permission/initRoutesFromWeb', accessRoutes) // Update permission store if needed
          console.log('Routes added.')
          
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })

        } catch (error) {
          console.error('Error adding routes:', error)
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          ElMessage.error(error.message || error || 'Error generating routes')
          routesAdded = false // Reset flag on error
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else if (!hasMenuList) {
         // If no menu list, try fetching user info (which might populate menuList)
         try {
            const { roles } = await store.dispatch('user/getInfo') // Fetch user info and roles
            // Check if menuList got populated by getInfo
            const menuListData = store.getters.menuList
            if (menuListData && menuListData.length > 0 && !routesAdded) {
              const accessRoutes = generaMenu(menuListData) // Generate routes from menu data
              accessRoutes.forEach(route => {
                  router.addRoute(route);
              });
              routesAdded = true; // Set flag
              await store.dispatch('permission/initRoutesFromWeb', accessRoutes)
              next({ ...to, replace: true }); // Redirect after adding routes
            } else if (!menuListData || menuListData.length === 0) {
               throw new Error('getInfo did not return menuList or menuList is empty.')
            } else {
               // Routes already added, menuList exists
               next() 
            }
         } catch (error) {
            console.error('Error fetching user info or adding routes:', error)
            await store.dispatch('user/resetToken');
            ElMessage.error(error.message || 'Failed to get user info or routes.');
            routesAdded = false; // Reset flag
            next(`/login?redirect=${to.path}`);
            NProgress.done();
         }
      } else {
        // Routes already added and menuList exists
        next()
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

// Rewritten generaMenu function to return route configuration array
function generaMenu(data) {
  const routes = []
  data.forEach(item => {
    console.log('Processing server menu item:', JSON.stringify(item))
    const menu = {
      path: item.path,
      // redirect: item.redirect,
      name: item.name, // Keep name if provided
      component: null, // Initialize component
      children: [],
      meta: { ...item.meta }, // Clone meta object
      // Retain other properties like alwaysShow, hidden directly if they exist
      ...(item.alwaysShow !== undefined && { alwaysShow: item.alwaysShow }),
      ...(item.hidden !== undefined && { hidden: item.hidden }),
    }

    if (item.redirect && item.redirect !== 'noRedirect') {
      menu.redirect = item.redirect
    }

    // Handle component loading
    if (item.component) {
      if (item.component === 'Layout') {
        menu.component = Layout
      } else {
        // Use the dynamic import helper
        menu.component = loadView(item.component)
      }
    } else {
       console.warn(`Component missing for route: ${item.path || item.name}`)
       // Assign a placeholder or default component if needed
       // menu.component = () => import('@/views/ErrorPage/404.vue') 
    }

    console.log('Assembled single menu:', JSON.stringify(menu))
    // Recursively process children
    if (item.children && item.children.length > 0) {
      menu.children = generaMenu(item.children)
    }
    
    // Only add route if it has a component or is a redirect/layout with children
    if (menu.component || (menu.children && menu.children.length > 0) || menu.redirect) {
       routes.push(menu)
    } else {
       console.warn(`Route skipped (no component/children/redirect): ${menu.path || menu.name}`)
    }
    
  })
  return routes
}
