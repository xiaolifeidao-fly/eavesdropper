import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getAccountDetail(query) {
  return request({
    url: baseUrl + '/accounts/currentAccount/list',
    method: 'get',
    params: query
  })
}

export function getAccountDetailByAccountId(accountId, query) {
  return request({
    url: baseUrl + `/accounts/${accountId}/list`,
    method: 'get',
    params: query
  })
}

export function getAccountlList(query) {
  return request({
    url: baseUrl + '/mock/accountModelList',
    method: 'get',
    params: query
  })
}

// 冻结账户
export function blockAccount(accountId) {
  return request({
    url: baseUrl + `/accounts/${accountId}/blockAccount`,
    method: 'post'
  })
}

// 充值
export function recharge(accountId, data) {
  return request({
    url: baseUrl + `/accounts/${accountId}/payAmount`,
    method: 'post',
    data
  })
}

