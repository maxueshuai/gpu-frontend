import request from '@/utils/request'

// 获取业务列表
export function getBusinessList(params) {
  return request({
    url: '/api/v1/business/list',
    method: 'get',
    params
  })
}

// 获取业务详情
export function getBusinessDetail(id) {
  return request({
    url: `/api/v1/business/${id}`,
    method: 'get'
  })
}

// 创建业务
export function createBusiness(data) {
  return request({
    url: '/api/v1/business',
    method: 'post',
    data
  })
}

// 更新业务
export function updateBusiness(id, data) {
  return request({
    url: `/api/v1/business/${id}`,
    method: 'put',
    data
  })
}

// 删除业务
export function deleteBusiness(id) {
  return request({
    url: `/api/v1/business/${id}`,
    method: 'delete'
  })
}

// 启动业务
export function startBusiness(id) {
  return request({
    url: `/api/v1/business/${id}/start`,
    method: 'post'
  })
}

// 停止业务
export function stopBusiness(id) {
  return request({
    url: `/api/v1/business/${id}/stop`,
    method: 'post'
  })
}

// 获取业务日志
export function getBusinessLogs(id, params) {
  return request({
    url: `/api/v1/business/${id}/logs`,
    method: 'get',
    params
  })
}

// 获取服务器列表（用于业务创建时选择）
export function getServerList(params) {
  return request({
    url: '/api/v1/servers',
    method: 'get',
    params
  })
}

// 获取MongoDB业务列表（现在推荐使用getTasks替代）
export function getMongoBusiness(params) {
  return request({
    url: '/api/v1/business/mongodb-tasks',
    method: 'get',
    params: {
      ...params,
      is_deleted: false // 确保只获取未删除的任务
    }
  })
}

// 获取业务统计信息
export function getBusinessStats() {
  return request({
    url: '/api/v1/business/stats',
    method: 'get'
  })
}

// 获取MongoDB任务列表（推荐使用的新函数名）
export function getTasks(params) {
  return request({
    url: '/api/v1/tasks',
    method: 'get',
    params: {
      ...params,
      is_deleted: false // 确保只获取未删除的任务
    }
  })
}

// 获取MongoDB任务详情（推荐使用的新函数名）
export function getTaskDetail(id) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'get'
  })
}

// 以下是为了向后兼容保留的API别名，请优先使用上面的getTasks和getTaskDetail
// 从MongoDB获取业务任务列表 (已弃用，请使用getTasks)
export function getMongoBusinessList(params) {
  console.warn('getMongoBusinessList已弃用，请使用getTasks')
  return getTasks(params)
}

// 从MongoDB获取业务任务详情 (已弃用，请使用getTaskDetail)
export function getMongoBusinessDetail(id) {
  console.warn('getMongoBusinessDetail已弃用，请使用getTaskDetail')
  return getTaskDetail(id)
}