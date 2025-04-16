import request from '@/utils/request'

const baseUrl = process.env.VUE_APP_API

export function getUserWithdrawRecord(query) {
  return request({
    url: baseUrl + '/point/user/withdrawRecord',
    method: 'get',
    params: query
  })
}

export function accountUserWithdraw(data) {
  return request({
    url: baseUrl + '/point/user/withdraw/account',
    method: 'post',
    data
  })
}

export function finishUserWithdraw(data) {
  return request({
    url: baseUrl + '/point/user/withdraw/finish',
    method: 'post',
    data
  })
}

export function cancelUserWithdraw(data) {
  return request({
    url: baseUrl + '/point/user/withdraw/cancel',
    method: 'post',
    data
  })
}
