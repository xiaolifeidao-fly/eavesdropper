import request from '@/utils/request'

const baseUrl = process.env.VUE_APP_API

export function getChannelDetailList() {
  return request({
    url: baseUrl + '/channelDetail/list',
    method: 'get'
  })
}

export function updateChannelDetail(data) {
  return request({
    url: baseUrl + `/channelDetail/update`,
    method: 'post',
    data
  })
}

export function saveChannelDetail(data) {
  return request({
    url: baseUrl + `/channelDetail/save`,
    method: 'post',
    data
  })
}
