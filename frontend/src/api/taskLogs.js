import request from '@/utils/request'

// 获取任务日志列表
export function getTaskLogs(params) {
  return request({
    url: '/api/task-logs',
    method: 'get',
    params
  })
}

// 获取任务日志详情
export function getTaskLog(id) {
  return request({
    url: `/api/task-logs/${id}`,
    method: 'get'
  })
}

// 创建任务日志
export function createTaskLog(data) {
  return request({
    url: '/api/task-logs',
    method: 'post',
    data
  })
}

// 更新任务日志
export function updateTaskLog(id, data) {
  return request({
    url: `/api/task-logs/${id}`,
    method: 'put',
    data
  })
}

// 删除任务日志
export function deleteTaskLog(id) {
  return request({
    url: `/api/task-logs/${id}`,
    method: 'delete'
  })
} 