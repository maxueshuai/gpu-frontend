import request from '@/utils/request'

// 获取GPU列表
export function getGpuList(params) {
  return request({
    url: '/api/v1/gpu/list',
    method: 'get',
    params
  })
}

// 获取GPU详情
export function getGpuDetail(fixed_id) {
  return request({
    url: `/api/v1/gpu/${fixed_id}`,
    method: 'get'
  })
}

// 获取GPU详情（别名，与前端组件兼容）
export function getGpuInfo(fixed_id) {
  return getGpuDetail(fixed_id)
}

// 获取GPU指标数据
export function getGpuMetrics(fixed_id, period = 'hour') {
  return request({
    url: `/api/v1/gpu/metrics/${fixed_id}`,
    method: 'get',
    params: { period }
  })
}

// 更新GPU告警配置
export function updateGpuAlertConfig(fixed_id, config) {
  return request({
    url: `/api/v1/gpu/${fixed_id}/alert-config`,
    method: 'post',
    data: config
  })
}

// 更新GPU配置
export function updateGpuConfig(fixed_id, config) {
  return request({
    url: `/api/v1/gpu/${fixed_id}/config`,
    method: 'post',
    data: config
  })
}

export function getGpusByServer(serverId) {
  return request({
    url: `/api/v1/gpu/by-server/${serverId}`,
    method: 'get'
  })
}