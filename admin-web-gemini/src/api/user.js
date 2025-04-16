import request from '@/utils/request'

// Use import.meta.env for Vite environment variables
const baseUrl = import.meta.env.VITE_APP_API

export function login(data) {
  return request({
    // url: '/vue-element-admin/user/login',
    url: baseUrl + '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    // url: '/vue-element-admin/currentResources',
    url: baseUrl + '/users/currentResources',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

export function getUserList(query) {
  return request({
    url: baseUrl + '/users/list',
    method: 'get',
    params: query
  })
}

export function getRoleList(query) {
  return request({
    url: baseUrl + '/roles/list',
    method: 'get',
    params: query
  })
}

// 所有租户
export function getTenantList(query) {
  return request({
    url: baseUrl + '/tenants/list',
    method: 'get',
    params: query
  })
}

// 当前登录用户的租户
export function getCurrentTenantList() {
  return request({
    url: baseUrl + '/tenants/currentList',
    method: 'get'
  })
}

export function updateTenant(tenantId, data) {
  return request({
    url: baseUrl + `/tenants/${tenantId}/update`,
    method: 'post',
    data
  })
}

export function updateTenantShop(tenantId, data) {
  return request({
    url: baseUrl + `/tenants/${tenantId}/shop/update`,
    method: 'post',
    data
  })
}

export function updateTenantShopCategory(tenantId, data) {
  return request({
    url: baseUrl + `/tenants/${tenantId}/shopCategory/update`,
    method: 'post',
    data
  })
}

export function saveTenant(data) {
  return request({
    url: baseUrl + '/tenants/save',
    method: 'post',
    data
  })
}

export function deleteTenant(tenantId, data) {
  return request({
    url: baseUrl + `/tenants/${tenantId}/delete`,
    method: 'post',
    data
  })
}

export function saveUserTenant(userId, data) {
  return request({
    url: baseUrl + `/users/${userId}/tenant/saveUserTenant`,
    method: 'post',
    data
  })
}

export function saveUserRole(userId, data) {
  return request({
    url: baseUrl + `/users/${userId}/role/save`,
    method: 'post',
    data
  })
}

export function createUser(data) {
  return request({
    url: baseUrl + '/users/save',
    method: 'post',
    data
  })
}

export function modifyRemark(userId, data) {
  return request({
    url: baseUrl + `/users/${userId}/modifyRemark`,
    method: 'post',
    data
  })
}

// 修改个人密码
export function modifyPass(data) {
  return request({
    url: baseUrl + '/users/currentUser/modifyPass',
    method: 'post',
    data
  })
}

