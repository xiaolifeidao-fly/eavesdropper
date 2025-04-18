import request from '@/utils/request'

const baseUrl = import.meta.env.VITE_APP_API

export function getTodayOrderRecordSummary() {
  return request({
    url: baseUrl + '/dashboard/today/orderRecordSummary',
    method: 'get'
  })
}

export function getTodayConsumeSummary() {
  return request({
    url: baseUrl + '/dashboard/today/consumeSummary',
    method: 'get'
  })
}

export function getTodayRechargeSummary() {
  return request({
    url: baseUrl + '/dashboard/today/rechargeSummary',
    method: 'get'
  })
}

export function getTodayUserAccountSummary() {
  return request({
    url: baseUrl + '/dashboard/today/userAccountSummary',
    method: 'get'
  })
}

export function getTodayActualTaskSummaryByBusinessCode(query) {
  return request({
    url: baseUrl + '/dashboard/today/actualTaskSummaryByBusinessCode',
    method: 'get',
    params: query
  })
}

export function getTodayRemainTaskSummaryByBusinessCode(query) {
  return request({
    url: baseUrl + '/dashboard/today/remainTaskSummaryByBusinessCode',
    method: 'get',
    params: query
  })
}

export function getTodayRemainTotalTaskSummary() {
  return request({
    url: baseUrl + '/dashboard/today/remainTotalTaskSummary',
    method: 'get'
  })
}

export function getTodayRemainTotalNumTaskSummaryByBusinessCode(query) {
  return request({
    url: baseUrl + '/dashboard/today/orderRecordNumSummaryByBusinessCode',
    method: 'get',
    params: query
  })
}

export function getTodayOrderRecordCountSummaryByBusinessType(query) {
  return request({
    url: baseUrl + '/dashboard/today/orderRecordCountSummaryByBusinessType',
    method: 'get',
    params: query
  })
}

export function getTodayOrderRecordNumSummaryByBusinessType(query) {
  return request({
    url: baseUrl + '/dashboard/today/orderRecordNumSummaryByBusinessType',
    method: 'get',
    params: query
  })
}

export function getTodayOrderRecordCountSummaryByBusinessCode(query) {
  return request({
    url: baseUrl + '/dashboard/today/orderRecordCountSummaryByBusinessCode',
    method: 'get',
    params: query
  })
}

export function getTodayUserTaskSummaryByBusinessType(query) {
  return request({
    url: baseUrl + '/dashboard/today/userTaskSummaryByBusinessType',
    method: 'get',
    params: query
  })
}

export function getTodayActualTaskSummaryByBusinessType(query) {
  return request({
    url: baseUrl + '/dashboard/today/actualTaskSummaryByBusinessType',
    method: 'get',
    params: query
  })
}

export function getTodayRemainTaskSummaryByBusinessType(query) {
  return request({
    url: baseUrl + '/dashboard/today/remainTaskSummaryByBusinessType',
    method: 'get',
    params: query
  })
}

export function getTodayUserTaskSummaryByBusinessCode(query) {
  return request({
    url: baseUrl + '/dashboard/today/userTaskSummaryByBusinessCode',
    method: 'get',
    params: query
  })
}

export function getTodayUserTaskSummary() {
  return request({
    url: baseUrl + '/dashboard/today/userTaskSummary',
    method: 'get'
  })
}

export function getHistoryOrderRecordSummary(query) {
  return request({
    url: baseUrl + '/dashboard/history/orderRecordSummary',
    method: 'get',
    params: query
  })
}

export function getHistoryConsumeSummary(query) {
  return request({
    url: baseUrl + '/dashboard/history/consumeSummary',
    method: 'get',
    params: query
  })
}

export function getHistoryActualTaskSummary(query) {
  return request({
    url: baseUrl + '/dashboard/history/actualTaskSummary',
    method: 'get',
    params: query
  })
}

export function getHistoryUserTaskSummary(query) {
  return request({
    url: baseUrl + '/dashboard/history/userTaskSummary',
    method: 'get',
    params: query
  })
}

export function getDashBoardConfig() {
  return request({
    url: baseUrl + '/dashboard/config',
    method: 'get'
  })
}
