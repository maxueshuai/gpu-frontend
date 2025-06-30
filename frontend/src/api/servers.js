import request from '@/utils/request'

// 获取服务器列表
export function getServers(params) {
  return request({
    url: '/api/v1/servers',
    method: 'get',
    params
  })
}

// 获取服务器详情
export function getServer(id) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'get'
  })
}

// 创建服务器
export function createServer(data) {
  return request({
    url: '/api/v1/servers',
    method: 'post',
    data
  })
}

// 更新服务器
export function updateServer(id, data) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'put',
    data
  })
}

// 删除服务器
export function deleteServer(id) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'delete'
  })
}

// 获取服务器状态（动态快照）
export function getServerStatus(id) {
  return request({
    url: `/api/v1/servers/${id}/status`,
    method: 'get'
  })
}

// 获取服务器 GPU 信息
export function getServerGpus(id) {
  return request({
    url: `/api/v1/servers/${id}/gpus`,
    method: 'get'
  })
}

// 获取服务器列表（兼容 alert-configs/index.vue 调用）
export function getServerList(params = {}) {
  return request({
    url: '/api/v1/servers',
    method: 'get',
    params
  })
} 