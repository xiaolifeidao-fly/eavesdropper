import { constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
/* Commented out - No longer used directly here
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
*/

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
/* Commented out - No longer used directly here
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}
*/

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  /* Removed generateRoutes action - Logic moved to permission.js hook
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   // alert('当前角色是admin')
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   alert('当前角色不是admin')
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      const accessedRoutes = asyncRoutes || [] // asyncRoutes is removed
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  */
  initRoutesFromWeb({ commit }, menuList) { // menuList here is actually the generated routes array
    return new Promise(resolve => {
      const accessedRoutes = menuList
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
