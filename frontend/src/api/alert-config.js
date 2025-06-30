import request from '@/utils/request'

// 获取告警配置列表
export function getAlertConfigs(params) {
  return request({
    url: '/api/v1/alerts/config',
    method: 'get',
    params
  })
}

// 获取单个告警配置
export function getAlertConfig(id) {
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
export function updateAlertConfig(data) {
  return request({
    url: `/api/v1/alerts/config`,
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

// 初始化默认配置
export function initAlertConfigs() {
  return request({
    url: '/api/v1/alerts/config/init',
    method: 'post'
  })
} 