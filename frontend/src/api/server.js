import request from '@/utils/request'

/**
 * 获取所有服务器列表
 * @returns {Promise}
 */
export function getServers() {
  return request({
    url: '/api/v1/servers',
    method: 'get'
  })
}

/**
 * 获取服务器详情
 * @param {Number} id 服务器ID
 * @returns {Promise}
 */
export function getServerDetail(id) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'get'
  })
}

/**
 * 添加新服务器
 * @param {Object} data 服务器信息
 * @returns {Promise}
 */
export function createServer(data) {
  return request({
    url: '/api/v1/servers',
    method: 'post',
    data
  })
}

/**
 * 更新服务器信息
 * @param {Number} id 服务器ID
 * @param {Object} data 服务器信息
 * @returns {Promise}
 */
export function updateServer(id, data) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除服务器
 * @param {Number} id 服务器ID
 * @returns {Promise}
 */
export function deleteServer(id) {
  return request({
    url: `/api/v1/servers/${id}`,
    method: 'delete'
  })
}

/**
 * 建立SSH信任关系
 * @param {Object} data 服务器连接信息
 * @returns {Promise}
 */
export function setupSSHTrust(data) {
  return request({
    url: '/api/v1/servers/setup-ssh-trust',
    method: 'post',
    data
  })
}

/**
 * 添加GPU服务器（包括建立SSH信任关系）
 * @param {Object} serverData 服务器信息
 * @returns {Promise}
 */
export function addGpuServer(serverData) {
  // 步骤1：先建立SSH信任关系
  return setupSSHTrust({
    hostname: serverData.ip_address || serverData.hostname,  // 支持新旧接口
    username: serverData.username,
    port: serverData.port,
    password: serverData.password
  }).then(() => {
    // 步骤2：添加服务器到数据库
    return createServer({
      name: serverData.name || serverData.hostname,  // 支持新旧接口
      ip_address: serverData.ip_address || serverData.hostname,  // 支持新旧接口
      username: serverData.username,
      port: serverData.port,
      password: serverData.password,
      description: serverData.description
    })
  })
}

/**
 * 获取服务器GPU信息
 * @param {Number} id 服务器ID
 * @returns {Promise}
 */
export function getServerGpuInfo(id) {
  return request({
    url: `/api/v1/servers/${id}/gpu`,
    method: 'get'
  })
}

/**
 * 获取服务器系统信息
 * @param {Number} id 服务器ID
 * @returns {Promise}
 */
export function getServerSystemInfo(id) {
  return request({
    url: `/api/v1/servers/${id}/system`,
    method: 'get'
  })
}

// 获取服务器状态
export function getServerStatus(id) {
  return request({
    url: `/api/v1/servers/${id}/status`,
    method: 'get'
  })
}

// 获取服务器GPU列表
export function getServerGpus(id) {
  return request({
    url: `/api/v1/servers/${id}/gpus`,
    method: 'get'
  })
}

// 获取服务器业务列表
export function getServerBusinesses(id) {
  return request({
    url: `/api/v1/servers/${id}/businesses`,
    method: 'get'
  })
}

// 测试服务器连接
export function testServerConnection(id) {
  return request({
    url: `/api/v1/servers/${id}/test-connection`,
    method: 'get'
  })
}

// 同步服务器GPU信息
export function syncServerGpus(id) {
  return request({
    url: `/api/v1/servers/${id}/sync-gpus`,
    method: 'post'
  })
}

/**
 * 主动触发 agent 采集（被动刷新）
 * @param {string} agentUrl agent 容器/主机的 http 地址（如 http://1.2.3.4:5002）
 * @returns {Promise}
 */
export function refreshAgent(agentUrl) {
  // 直接 POST 到 agent 的 /refresh 接口
  return request({
    url: agentUrl.replace(/\/$/, '') + '/refresh',
    method: 'post',
    // agent 端无需 token，通常为内网/容器互通
    headers: { 'Content-Type': 'application/json' },
    data: {}
  })
}

// 获取服务器列表
export function getServerList(params = {}) {
  return request({
    url: '/api/v1/servers',
    method: 'get',
    params
  })
} 