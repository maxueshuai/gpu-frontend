import request from '@/utils/request'

// 用户相关API
export const userApi = {
  // 用户登录
  login(data) {
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('password', data.password)
    
    return request({
      url: '/api/v1/auth/login',
      method: 'post',
      data: formData
    })
  },
  
  // 用户注册
  register(data) {
    return request({
      url: '/api/v1/auth/register',
      method: 'post',
      data
    })
  },
  
  // 获取用户信息
  getInfo() {
    return request({
      url: '/api/v1/auth/profile', 
      method: 'get'
    })
  },
  
  // 获取用户列表
  getUserList(params) {
    return request({
      url: '/api/v1/users',
      method: 'get',
      params
    })
  },
  
  // 更新用户信息
  updateProfile(data) {
    return request({
      url: '/api/v1/auth/profile',
      method: 'put',
      data
    })
  }
}

// 服务器相关API
export const serverApi = {
  // 获取服务器列表
  getServerList() {
    return request({
      url: '/api/v1/servers',
      method: 'get'
    })
  },
  
  // 获取服务器详情
  getServer(id) {
    return request({
      url: `/api/v1/servers/${id}`,
      method: 'get'
    })
  },
  
  // 创建服务器
  createServer(data) {
    return request({
      url: '/api/v1/servers',
      method: 'post',
      data
    })
  },
  
  // 更新服务器
  updateServer(id, data) {
    return request({
      url: `/api/v1/servers/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除服务器
  deleteServer(id) {
    return request({
      url: `/api/v1/servers/${id}`,
      method: 'delete'
    })
  },
  
  // 获取服务器状态
  getServerStatus(id) {
    return request({
      url: `/api/v1/servers/${id}/status`,
      method: 'get'
    })
  },
  
  // 获取服务器上的GPU列表
  getServerGpus(id) {
    return request({
      url: `/api/v1/servers/${id}/gpus`,
      method: 'get'
    })
  },
  
  // 获取服务器上的业务列表
  getServerBusinesses(id) {
    return request({
      url: `/api/v1/servers/${id}/businesses`,
      method: 'get'
    })
  },
  
  // 测试服务器连接
  testConnection(data) {
    return request({
      url: '/api/v1/servers/test-connection',
      method: 'post',
      data
    })
  },
  
  // 同步服务器GPU信息
  syncServerGpus(id) {
    return request({
      url: `/api/v1/servers/${id}/sync-gpus`,
      method: 'post'
    })
  }
}

// GPU相关API
export const gpuApi = {
  // 获取GPU列表
  getGpuList(params) {
    return request({
      url: '/api/v1/gpu/list',
      method: 'get',
      params
    })
  }
}

// 业务相关API
export const businessApi = {
  // 获取业务列表
  getBusinessList(params) {
    return request({
      url: '/api/v1/business/list',
      method: 'get',
      params
    })
  }
}

// 告警相关API
export const alertApi = {
  // 获取告警列表
  getAlertList(params) {
    return request({
      url: '/api/v1/alerts',
      method: 'get',
      params
    })
  },
  
  // 获取最近告警
  getRecentAlerts() {
    return request({
      url: '/api/v1/alerts/recent',
      method: 'get'
    })
  }
}

// 系统相关API
export const systemApi = {
  // 获取系统概览
  getSystemOverview() {
    return request({
      url: '/api/v1/system/overview',
      method: 'get'
    })
  },
  
  // 获取MongoDB状态
  getMongoDBStatus() {
    return request({
      url: '/api/v1/system/mongodb-status',
      method: 'get'
    })
  },
  
  // 获取系统配置
  getSystemConfig() {
    return request({
      url: '/api/v1/system/config',
      method: 'get'
    })
  },
  
  // 更新系统配置
  updateSystemConfig(data) {
    return request({
      url: '/api/v1/system/config',
      method: 'put',
      data
    })
  }
}

// MongoDB服务器相关API
export const mongoApi = {
  // 获取MongoDB服务器列表
  getMongoServers() {
    return request({
      url: '/api/v1/mongo-servers',
      method: 'get'
    })
  },
  
  // 添加MongoDB服务器
  addMongoServer(data) {
    return request({
      url: '/api/v1/mongo-servers',
      method: 'post',
      data
    })
  },
  
  // 更新MongoDB服务器
  updateMongoServer(id, data) {
    return request({
      url: `/api/v1/mongo-servers/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除MongoDB服务器
  deleteMongoServer(id) {
    return request({
      url: `/api/v1/mongo-servers/${id}`,
      method: 'delete'
    })
  },
  
  // 同步MongoDB服务器
  syncMongoServer(id) {
    return request({
      url: `/api/v1/mongo-servers/${id}/sync`,
      method: 'post'
    })
  }
}

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTaskList(params) {
    return request({
      url: '/api/v1/tasks',
      method: 'get',
      params
    })
  },
  
  // 创建任务
  createTask(data) {
    return request({
      url: '/api/v1/tasks',
      method: 'post',
      data
    })
  },
  
  // 获取任务详情
  getTask(id) {
    return request({
      url: `/api/v1/tasks/${id}`,
      method: 'get'
    })
  },
  
  // 更新任务
  updateTask(id, data) {
    return request({
      url: `/api/v1/tasks/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除任务
  deleteTask(id) {
    return request({
      url: `/api/v1/tasks/${id}`,
      method: 'delete'
    })
  },
  
  // 启动任务
  startTask(id) {
    return request({
      url: `/api/v1/tasks/${id}/start`,
      method: 'post'
    })
  },
  
  // 停止任务
  stopTask(id) {
    return request({
      url: `/api/v1/tasks/${id}/stop`,
      method: 'post'
    })
  },
  
  // 获取任务统计
  getTaskStats() {
    return request({
      url: '/api/v1/tasks/stats',
      method: 'get'
    })
  },
  
  // 获取已删除任务列表
  getDeletedTasks() {
    return request({
      url: '/api/v1/tasks/deleted',
      method: 'get'
    })
  },
  
  // 恢复已删除任务
  restoreTask(id) {
    return request({
      url: `/api/v1/tasks/${id}/restore`,
      method: 'post'
    })
  }
}

// 任务日志相关API
export const taskLogApi = {
  // 获取任务日志列表
  getTaskLogs(params) {
    return request({
      url: '/api/v1/task-logs',
      method: 'get',
      params
    })
  },
  
  // 获取任务日志详情
  getTaskLog(id) {
    return request({
      url: `/api/v1/task-logs/${id}`,
      method: 'get'
    })
  },
  
  // 删除任务日志
  deleteTaskLog(id) {
    return request({
      url: `/api/v1/task-logs/${id}`,
      method: 'delete'
    })
  }
} 