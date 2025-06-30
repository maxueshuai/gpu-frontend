import request from '@/utils/request'

// 获取告警配置列表
export function getAlertConfigs() {
  return request({
    url: '/api/v1/alerts/config',
    method: 'get'
  })
}

// 获取单个告警配置详情
export function getAlertDetail(id) {
  return request({
    url: `/api/v1/alerts/config/${id}`,
    method: 'get'
  })
}

// 创建告警配置
export function createAlertConfig(data) {
  return request({
    url: '/api/v1/alerts/config',
    method: 'post',
    data
  })
}

// 更新告警配置
export function updateAlertConfig(id, data) {
  return request({
    url: `/api/v1/alerts/config/${id}`,
    method: 'put',
    data
  })
}

// 删除告警配置
export function deleteAlertConfig(id) {
  return request({
    url: `/api/v1/alerts/config/${id}`,
    method: 'delete'
  })
}

// 获取告警统计信息
export function getAlertStats() {
  return request({
    url: '/api/v1/alerts/stats',
    method: 'get'
  })
}

// 获取最近告警
export function getRecentAlerts(limit = 10) {
  return request({
    url: '/api/v1/alerts/recent',
    method: 'get',
    params: { limit }
  })
}