import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getShopList(query) {
  return request({
    url: baseUrl + '/shops/list',
    method: 'get',
    params: query
  })
}

// 当前登录用户的商品列表
export function getCurrentShopList() {
  return request({
    url: baseUrl + '/shops/currentList',
    method: 'get'
  })
}

export function getCurrentShopCategoryList() {
  return request({
    url: baseUrl + '/shops/shopCategory/currentList',
    method: 'get'
  })
}

// 商品类目列表
export function getShopCategoryList(query) {
  return request({
    url: baseUrl + '/shops/shopCategoryList',
    method: 'get',
    params: query
  })
}

// 类目列表
export function getCategoryList(shopId) {
  return request({
    url: baseUrl + `/shops/${shopId}/categories`,
    method: 'get'
  })
}

// 商品附加属性列表
export function getShopExtParamList(shopId) {
  return request({
    url: baseUrl + `/shops/${shopId}/shopExtParam`,
    method: 'get'
  })
}

export function updateShop(shopId, data) {
  return request({
    url: baseUrl + `/shops/${shopId}/update`,
    method: 'post',
    data
  })
}

export function saveShop(data) {
  return request({
    url: baseUrl + `/shops/save`,
    method: 'post',
    data
  })
}

export function deleteShop(shopId, data) {
  return request({
    url: baseUrl + `/shops/${shopId}/delete`,
    method: 'post',
    data
  })
}

export function getTenantShopList(query) {
  return request({
    url: baseUrl + '/shops/tenantShopList',
    method: 'get',
    params: query
  })
}

export function getTenantShopListByTenantId(tenantId) {
  return request({
    url: baseUrl + `/tenants/${tenantId}/shopList`,
    method: 'get'
  })
}

// 上架
export function activeShopCategoryId(shopCategoryId) {
  return request({
    url: baseUrl + `/shops/categories/${shopCategoryId}/active`,
    method: 'post'
  })
}
// 下架
export function expireShopCategoryId(shopCategoryId) {
  return request({
    url: baseUrl + `/shops/categories/${shopCategoryId}/expire`,
    method: 'post'
  })
}
// 类目编辑
export function updateShopCategory(shopCategoryId, data) {
  return request({
    url: baseUrl + `/shops/categories/${shopCategoryId}/update`,
    method: 'post',
    data
  })
}

// 类目新增
export function addShopCategory(shopId, data) {
  return request({
    url: baseUrl + `/shops/${shopId}/categories/add`,
    method: 'post',
    data
  })
}
// 调整上下限
export function updateLimit(tenantShopId, data) {
  return request({
    url: baseUrl + `/shops/tenant/${tenantShopId}/updateLimit`,
    method: 'post',
    data
  })
}

// 人工商品列表
export function getShopManualList() {
  return request({
    url: baseUrl + '/shops/manual/list',
    method: 'get'
  })
}
// 保存或修改人工商品
export function saveShopManual(data) {
  return request({
    url: baseUrl + `/shops/manual/save`,
    method: 'post',
    data
  })
}
// 删除人工商品
export function deleteShopManual(data) {
  return request({
    url: baseUrl + `/shops/manual/delete`,
    method: 'post',
    data
  })
}

export function expireShopManual(data) {
  return request({
    url: baseUrl + `/shops/manual/expire`,
    method: 'post',
    data
  })
}

export function activeShopManual(data) {
  return request({
    url: baseUrl + `/shops/manual/active`,
    method: 'post',
    data
  })
}
