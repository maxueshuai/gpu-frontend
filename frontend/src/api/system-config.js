import request from '@/utils/request'

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/api/system/config',
    method: 'get'
  })
}

// 更新系统配置
export function updateSystemConfig(data) {
  return request({
    url: '/api/system/config',
    method: 'put',
    data
  })
}

// 测试SSH连接
export function testSSHConnection(data) {
  return request({
    url: '/api/system/test-ssh',
    method: 'post',
    data
  })
}

// 测试Grafana连接
export function testGrafanaConnection(data) {
  return request({
    url: '/api/system/test-grafana',
    method: 'post',
    data
  })
}

// 获取系统日志
export function getSystemLogs(params) {
  return request({
    url: '/api/system/logs',
    method: 'get',
    params
  })
}

// 清理系统日志
export function clearSystemLogs() {
  return request({
    url: '/api/system/logs',
    method: 'delete'
  })
} 