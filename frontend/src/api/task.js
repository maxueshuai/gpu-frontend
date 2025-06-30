import request from '@/utils/request'

// 获取任务列表
export function getTasks(params) {
  // 确保传递的is_deleted参数被正确使用，而不是被覆盖
  const queryParams = { ...params }
  
  // 只有当params中没有明确指定is_deleted时，才设置默认值
  if (queryParams.is_deleted === undefined) {
    queryParams.is_deleted = 0 // 默认获取未删除的任务
  }
  
  console.log('API请求参数:', queryParams)
  
  // 根据is_deleted参数使用正确的API端点
  if (parseInt(queryParams.is_deleted) === 1) {
    console.log('使用已删除任务专用接口')
    // 使用专门的getDeletedTasks函数而不是直接调用API
    return getDeletedTasks(queryParams)
  }
  
  // 正常任务使用标准接口
  return request({
    url: '/api/v1/tasks',  // 添加尾部斜杠以匹配后端路由
    method: 'get',
    params: queryParams
  })
}

// 获取任务详情
export function getTaskDetail(id) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'get'
  })
}

// 创建任务
export function createTask(data) {
  return request({
    url: '/api/v1/tasks',
    method: 'post',
    data
  })
}

// 更新任务
export function updateTask(id, data) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'put',
    data
  })
}

// 删除任务
export function deleteTask(id, params) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'delete',
    params
  })
}

// 停止任务
export function stopTask(id, params) {
  return request({
    url: `/api/v1/tasks/${id}/stop`,
    method: 'post',
    params
  })
}

// 直接通过MongoDB任务ID停止任务（不需要MySQL ID）
export function directStopTask(mongoTaskId, serverIp = null) {
  const params = serverIp ? { server_ip: serverIp } : {}
  return request({
    url: `/api/v1/tasks/direct/${mongoTaskId}/stop`,
    method: 'post',
    params
  })
}

// 重试任务
export function retryTask(id, params) {
  return request({
    url: `/api/v1/tasks/${id}/start`,
    method: 'post',
    params
  })
}

// 获取任务日志
export function getTaskLogs(id, params) {
  return request({
    url: `/api/v1/tasks/${id}/log`, // 修正为log，不是logs
    method: 'get',
    params
  })
}

// 获取服务器列表（用于任务创建时选择）
export function getServerList(params) {
  return request({
    url: '/api/v1/servers',
    method: 'get',
    params
  })
}

// 获取任务统计信息
export function getTaskStats() {
  return request({
    url: '/api/v1/tasks/stats',
    method: 'get'
  })
}

// 获取已删除任务列表
export function getDeletedTasks(params) {
  return request({
    url: '/api/v1/tasks/tasks/deleted',  // 修改为匹配后端路由定义
    method: 'get',
    params
  })
}

// 恢复已删除任务
export function restoreTask(id) {
  return request({
    url: `/api/v1/tasks/${id}/restore`,
    method: 'post'
  })
} 