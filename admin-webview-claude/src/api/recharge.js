import request from '@/utils/request'

const baseUrl = process.env.VUE_APP_API

export function getRechargeList(query) {
  return request({
    url: baseUrl + '/accounts/recharge/list',
    method: 'get',
    params: query
  })
}
