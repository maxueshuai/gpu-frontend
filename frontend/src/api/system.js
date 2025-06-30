import request from '@/utils/request'

// 获取系统概览数据
export function getSystemOverview() {
  return request({
    url: '/api/v1/system/overview',
    method: 'get'
  })
}

// 获取MongoDB状态
export function getMongoDBStatus() {
  return request({
    url: '/api/v1/system/mongodb-status',
    method: 'get'
  })
}

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/api/v1/system/config',
    method: 'get'
  })
}

// 更新系统配置
export function updateSystemConfig(data) {
  return request({
    url: '/api/v1/system/config',
    method: 'put',
    data
  })
}

// 系统健康检查
export function healthCheck() {
  return request({
    url: '/api/v1/system/health',
    method: 'get'
  })
}

// 获取系统日志
export function getSystemLogs(params) {
  return request({
    url: '/api/v1/system/logs',
    method: 'get',
    params
  })
}

// 清除系统日志
export function clearSystemLogs() {
  return request({
    url: '/api/v1/system/logs',
    method: 'delete'
  })
}

// 获取系统状态
export function getSystemStatus() {
  return request({
    url: '/api/v1/system/status',
    method: 'get'
  })
}

// 获取系统设置
export function getSystemSettings() {
  return request({
    url: '/api/v1/system/settings',
    method: 'get'
  })
}

// 更新系统设置
export function updateSystemSettings(data) {
  return request({
    url: '/api/v1/system/settings',
    method: 'put',
    data
  })
}

// 获取MongoDB配置
export function getMongoDBConfig() {
  return request({
    url: '/api/v1/system/mongodb/config',
    method: 'get'
  })
}

// 更新MongoDB配置
export function updateMongoDBConfig(data) {
  return request({
    url: '/api/v1/system/mongodb/config',
    method: 'put',
    data
  })
}

// 测试MongoDB连接
export function testMongoDBConnection(data) {
  return request({
    url: '/api/v1/system/mongodb/test',
    method: 'post',
    data
  })
}

// 获取MongoDB集合列表
export function getMongoDBCollections() {
  return request({
    url: '/api/v1/system/mongodb/collections',
    method: 'get'
  })
}

// 删除MongoDB集合
export function dropMongoDBCollection(name) {
  return request({
    url: `/api/v1/system/mongodb/collections/${name}`,
    method: 'delete'
  })
} 