import request from '@/utils/request'

// 获取系统设置
export function getSystemSettings() {
  return request({
    url: '/api/settings',
    method: 'get'
  })
}

// 更新系统设置
export function updateSystemSettings(data) {
  return request({
    url: '/api/settings',
    method: 'put',
    data
  })
}

// 测试邮件配置
export function testEmailConfig(data) {
  return request({
    url: '/api/settings/test-email',
    method: 'post',
    data
  })
}

// 测试短信配置
export function testSmsConfig(data) {
  return request({
    url: '/api/settings/test-sms',
    method: 'post',
    data
  })
}

// 测试Webhook配置
export function testWebhookConfig(data) {
  return request({
    url: '/api/settings/test-webhook',
    method: 'post',
    data
  })
} 