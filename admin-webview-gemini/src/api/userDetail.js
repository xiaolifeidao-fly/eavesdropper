import request from '@/utils/request'

const baseUrl = process.env.VUE_APP_API

export function getUserDetail(query) {
  return request({
    url: baseUrl + '/userDetail/find',
    method: 'get',
    params: query
  })
}

export function updateUserDetail(data) {
  return request({
    url: baseUrl + `/userDetail/update`,
    method: 'post',
    data
  })
}

export function saveUserDetail(data) {
  return request({
    url: baseUrl + `/userDetail/save`,
    method: 'post',
    data
  })
}
