import request from '@/utils/request'

// 获取MongoDB服务器列表
export function getMongoServers() {
  return request({
    url: '/api/v1/mongo-servers',
    method: 'get'
  })
}

// 获取MongoDB服务器详情
export function getMongoServer(id) {
  return request({
    url: `/api/v1/mongo-servers/${id}`,
    method: 'get'
  })
}

// 创建MongoDB服务器
export function createMongoServer(data) {
  return request({
    url: '/api/v1/mongo-servers',
    method: 'post',
    data
  })
}

// 更新MongoDB服务器
export function updateMongoServer(id, data) {
  return request({
    url: `/api/v1/mongo-servers/${id}`,
    method: 'put',
    data
  })
}

// 删除MongoDB服务器
export function deleteMongoServer(id) {
  return request({
    url: `/api/v1/mongo-servers/${id}`,
    method: 'delete'
  })
}

// 测试MongoDB连接
export function testMongoConnection(id) {
  return request({
    url: `/api/v1/mongo-servers/${id}/test-connection`,
    method: 'post'
  })
}

// 测试MongoDB连接参数（不需要已存在的服务器ID）
export function testMongoConnectionParams(data) {
  return request({
    url: '/api/v1/mongo-servers/test-connection',
    method: 'post',
    data
  })
}

// 同步MongoDB服务器数据
export function syncMongoServer(id) {
  return request({
    url: `/api/v1/mongo-servers/${id}/sync`,
    method: 'post'
  })
} 