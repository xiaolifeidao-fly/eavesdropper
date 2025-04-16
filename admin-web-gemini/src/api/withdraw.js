import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getChannelList(query) {
  return request({
    url: baseUrl + '/point/channel',
    method: 'get',
    params: query
  })
}

export function getWithdrawSummary(query) {
  return request({
    url: baseUrl + '/point/withdrawSummary',
    method: 'get',
    params: query
  })
}

export function exportWithdrawSummary(query) {
  return request({
    url: baseUrl + '/point/withdrawSummary/export',
    method: 'get',
    params: query
  })
}

export function accountWithdraw(data) {
  return request({
    url: baseUrl + '/point/withdrawSummary/account',
    method: 'post',
    data
  })
}

export function finishWithdraw(data) {
  return request({
    url: baseUrl + '/point/withdrawSummary/finish',
    method: 'post',
    data
  })
}
