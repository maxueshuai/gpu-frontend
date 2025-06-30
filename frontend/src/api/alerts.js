import request from '@/utils/request'

// 获取告警列表
export function getAlertList(params) {
  return request({
    url: '/api/v1/alerts',
    method: 'get',
    params
  })
}

// 获取告警详情
export function getAlertDetail(id) {
  return request({
    url: `/api/v1/alerts/${id}`,
    method: 'get'
  })
}

// 创建告警
export function createAlert(data) {
  return request({
    url: '/api/v1/alerts',
    method: 'post',
    data
  })
}

// 更新告警
export function updateAlert(id, data) {
  return request({
    url: `/api/v1/alerts/${id}`,
    method: 'put',
    data
  })
}

// 删除告警
export function deleteAlert(id) {
  return request({
    url: `/api/v1/alerts/${id}`,
    method: 'delete'
  })
}

// 获取告警配置
export function getAlertConfig() {
  return request({
    url: '/api/v1/alerts/config',
    method: 'get'
  })
}

// 更新告警配置
export function updateAlertConfig(data) {
  return request({
    url: '/api/v1/alerts/config',
    method: 'put',
    data
  })
}

// 获取告警历史
export function getAlertHistory(params) {
  return request({
    url: '/api/v1/alerts/history',
    method: 'get',
    params
  })
}

// 获取告警统计
export function getAlertStats() {
  return request({
    url: '/api/v1/alerts/stats',
    method: 'get'
  })
}

// 测试告警通知
export function testAlertNotification(data) {
  return request({
    url: '/api/v1/alerts/test',
    method: 'post',
    data
  })
} 