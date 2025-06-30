import request from '@/utils/request'

// 获取业务日志列表
export function getBusinessLogs(params) {
  return request({
    url: '/api/business-logs',
    method: 'get',
    params
  })
}

// 获取系统日志列表
export function getSystemLogs(params) {
  return request({
    url: '/api/system-logs',
    method: 'get',
    params
  })
}