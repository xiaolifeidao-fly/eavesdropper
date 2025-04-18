import request from '@/utils/request'

const baseUrl = process.env.VUE_APP_API

// 当前登录用户能看到的任务类目列表
export function getCurrentTaskCategoryList() {
  return request({
    url: baseUrl + '/check/currentTaskCategoryList',
    method: 'get'
  })
}

// 任务列表
export function getTaskList(query) {
  return request({
    url: baseUrl + '/check/taskList',
    method: 'get',
    params: query
  })
}

// 用户任务情况
export function getUserTaskList(query) {
  return request({
    url: baseUrl + '/check/userTaskList',
    method: 'get',
    params: query
  })
}

// 审核结果上传
export function saveCheckResult(data) {
  return request({
    url: baseUrl + `/check/result`,
    method: 'post',
    data
  })
}

// 用户任务情况
export function getUserTaskPicList(query) {
  return request({
    url: baseUrl + '/userTask/picList',
    method: 'get',
    params: query
  })
}

// 完结订单
export function finishTask(assignmentId) {
  return request({
    url: baseUrl + `/check/${assignmentId}/finish`,
    method: 'post'
  })
}
