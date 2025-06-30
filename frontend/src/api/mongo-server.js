import request from '@/utils/request'

// 获取MongoDB服务器列表
export function getMongoServerList() {
  return request({
    url: '/api/v1/mongo-servers',
    method: 'get'
  })
}

// 获取MongoDB服务器详情
export function getMongoServerDetail(id) {
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
export function testMongoConnection(data) {
  return request({
    url: '/api/v1/mongo-servers/test-connection',
    method: 'post',
    data
  })
}

// 触发MongoDB同步
export function triggerMongoSync(id) {
  return request({
    url: `/api/v1/mongo-servers/${id}/sync`,
    method: 'post'
  })
} 