import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getRechargeList(query) {
  return request({
    url: baseUrl + '/accounts/recharge/list',
    method: 'get',
    params: query
  })
}
