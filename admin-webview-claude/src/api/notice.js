import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getAllNoticeList() {
  return request({
    url: baseUrl + '/notice/list',
    method: 'get'
  })
}

export function deleteNotice(noticeId) {
  return request({
    url: baseUrl + `/notice/${noticeId}/delete`,
    method: 'post'
  })
}

export function saveNotice(data) {
  return request({
    url: baseUrl + '/notice/save',
    method: 'post',
    data
  })
}

export function updateNotice(data) {
  return request({
    url: baseUrl + '/notice/update',
    method: 'post',
    data
  })
}
