/**
 * 任务管理API
 * 
 * 重要说明：
 * 1. 任务管理采用软删除机制，通过is_deleted字段标记删除状态
 * 2. getTaskList默认只返回未删除的任务
 * 3. 已删除的任务可通过getDeletedTasks获取
 * 4. 使用restoreTask可以恢复已删除的任务
 * 
 * 开发注意事项：
 * - 不要修改默认的API调用方式，特别是与软删除相关的功能
 * - 所有任务列表视图都应该使用getTaskList而非直接查询数据库
 * - 请勿在代码中执行真正的物理删除操作
 */
import request from '@/utils/request'

// 获取任务列表
export function getTasks(params) {
  // 确保默认只获取未删除的任务，并处理搜索参数
  const queryParams = { 
    ...params,
    is_deleted: params.is_deleted ?? 0,
    // 如果有搜索关键词，确保使用正确的参数名
    ...(params.keyword ? { name: params.keyword } : {})
  }
  
  // 移除undefined的参数
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined || queryParams[key] === '') {
      delete queryParams[key]
    }
  })

  console.log('API请求参数:', queryParams)

  return request({
    url: '/api/v1/tasks',
    method: 'get',
    params: queryParams
  })
}

// 获取任务列表（别名方法，与getTasks功能相同，为兼容旧代码）
export function getTaskList(params) {
  return getTasks(params);
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

/**
 * 删除任务 (软删除)
 * 
 * 此方法执行的是软删除操作，任务记录仍保留在数据库中，但标记为已删除
 * 已删除的任务可以通过getDeletedTasks获取，并可以使用restoreTask恢复
 * 
 * @param {number|string} id - 任务ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteTask(id) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'delete'
  })
}

// 启动任务
export function startTask(id, params) {
  return request({
    url: `/api/v1/tasks/${id}/start`,
    method: 'post',
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

// 通过MongoDB任务ID直接停止任务
export function directStopTask(mongoTaskId, serverIp, params) {
  const queryParams = {
    server_ip: serverIp,
    ...params
  };
  
  return request({
    url: `/api/v1/tasks/direct/${mongoTaskId}/stop`,
    method: 'post',
    params: queryParams
  })
}

// 获取任务日志
export function getTaskLog(id, params) {
  return request({
    url: `/api/v1/tasks/${id}/log`,
    method: 'get',
    params
  })
}

// 获取服务器上的任务列表，添加IP支持
export function getServerTasks(serverId, params) {
  // params可以包含server_ip参数进行IP过滤
  return request({
    url: `/api/v1/servers/${serverId}/tasks`,
    method: 'get',
    params
  })
}

// 在指定服务器上创建任务
export function createServerTask(serverId, data) {
  return request({
    url: `/api/v1/servers/${serverId}/tasks`,
    method: 'post',
    data
  })
}

// 获取任务统计信息
export function getTaskStats() {
  return request({
    url: '/api/v1/tasks/stats',
    method: 'get'
  })
}

/**
 * 获取已删除的任务列表
 * 
 * 此方法专门用于获取已软删除的任务，可用于回收站功能
 * 
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 按名称筛选
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise} - 返回已删除的任务列表
 */
export function getDeletedTasks(params) {
  return request({
    url: '/api/v1/tasks/deleted',  // 添加尾部斜杠
    method: 'get',
    params: {
      ...(params || {}),
      is_deleted: 1,  // 显式指定获取已删除任务
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    }
  })
}

/**
 * 同步MongoDB和MySQL中的任务状态
 * 
 * 此方法用于同步数据库中的任务状态，确保前后端任务状态一致
 * 
 * @param {boolean} syncAll - 是否同步所有任务
 * @returns {Promise} - 返回同步结果
 */
export function syncTaskStatus(syncAll = false) {
  return request({
    url: '/api/v1/tasks/sync-task-status',  // 移除尾部斜杠，修复405错误
    method: 'post',
    data: { sync_all: syncAll }  // 使用data而不是params，确保参数在请求体中而不是URL中
  })
}

/**
 * 恢复已删除的任务
 * 
 * 此方法用于将软删除的任务恢复为正常状态
 * 恢复后，任务将重新出现在常规任务列表中
 * 
 * @param {number|string} id - 任务ID
 * @returns {Promise} - 返回恢复结果
 */
export function restoreTask(id) {
  return request({
    url: `/api/v1/tasks/${id}/restore`,  // 添加尾部斜杠
    method: 'post'
  })
}

/**
 * 恢复MySQL中已删除的任务
 * 
 * 此方法用于将MySQL中软删除的任务恢复为正常状态
 * 
 * @param {number} id - MySQL任务ID
 * @returns {Promise} - 返回恢复结果
 */
export function restoreMySQLTask(id) {
  return request({
    url: `/api/v1/tasks/${id}/restore`,  // 添加尾部斜杠
    method: 'post'
  })
} 