import request from '@/utils/request'
import requestOuter from '@/utils/requestOuter'

const baseUrl = process.env.VUE_APP_API

export function queryXhsApi(url) {
  return requestOuter({
    url: url,
    method: 'get'
  })
}

export function getOrderList(query) {
  return request({
    url: baseUrl + '/orders/list',
    method: 'get',
    params: query
  })
}

export function getOrderManagerList(query) {
  return request({
    url: baseUrl + '/orders/manager/list',
    method: 'get',
    params: query
  })
}

export function getOrderExternalList(query) {
  return request({
    url: baseUrl + '/orders/external/list',
    method: 'get',
    params: query
  })
}

export function getCurrentShopGroupList() {
  return request({
    url: baseUrl + '/orders/currentShopGroup',
    method: 'get'
  })
}

export function getOrderSummaryList(query) {
  return request({
    url: baseUrl + '/orders/summary',
    method: 'get',
    params: query
  })
}

export function createOrder(data) {
  return request({
    url: baseUrl + '/orders/save',
    method: 'post',
    data
  })
}

export function getOrderDetailList(orderId) {
  return request({
    url: baseUrl + `/orders/${orderId}/detail`,
    method: 'get'
  })
}

// 退单
export function refundOrder(orderId) {
  return request({
    url: baseUrl + `/orders/${orderId}/refund`,
    method: 'post'
  })
}

// 管理员强制退单
export function refundOrderForce(orderId) {
  return request({
    url: baseUrl + `/orders/${orderId}/refund/force`,
    method: 'post'
  })
}

// 订单当前的真实状态
export function getOrderReal(orderId) {
  return request({
    url: baseUrl + `/orders/${orderId}/real`,
    method: 'get'
  })
}

// 订单补款
export function reinForceOrder(orderId, data) {
  return request({
    url: baseUrl + `/orders/${orderId}/bk`,
    method: 'post',
    data
  })
}

export function getTokenManagerList(orderId, query) {
  return request({
    url: baseUrl + `/orders/manager/${orderId}/tokens`,
    method: 'get',
    params: query
  })
}

export function getTokenList(orderId, query) {
  return request({
    url: baseUrl + `/orders/${orderId}/tokens`,
    method: 'get',
    params: query
  })
}
