import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// Token相关常量
const TOKEN_KEY = 'token'
const TOKEN_EXPIRE_KEY = 'token_expire'
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000 // 10分钟阈值

// 获取token
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置token和过期时间
function setToken(token, expireIn = 24 * 60 * 60) { // 默认24小时
  localStorage.setItem(TOKEN_KEY, token)
  const expireTime = Date.now() + expireIn * 1000
  localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime)
}

// 检查token是否即将过期
function isTokenExpiringSoon() {
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY)
  if (!expireTime) return true
  
  return Date.now() > (parseInt(expireTime) - TOKEN_REFRESH_THRESHOLD)
}

// 清除token
function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRE_KEY)
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 120000, // 增加到120秒
  // 添加重试配置
  retry: 2, // 减少重试次数
  retryDelay: 3000, // 增加重试间隔到3秒
  shouldRetry: (error) => {
    // 智能判断是否需要重试
    // 1. 不重试超时请求
    if (error.code === 'ECONNABORTED') {
      return false
    }
    // 2. 不重试401/403等权限错误
    if (error.response && [401, 403].includes(error.response.status)) {
      return false
    }
    // 3. 只重试服务器错误和网络错误
    return !error.response || (error.response.status >= 500 && error.response.status <= 599)
  }
})

// 刷新Token方法
async function refreshToken() {
  try {
    // 如果已经在刷新中，返回等待状态
    if (refreshToken.isRefreshing) {
      return new Promise((resolve) => {
        refreshToken.callbacks.push(token => {
          resolve(token)
        })
      })
    }
    
    refreshToken.isRefreshing = true
    refreshToken.callbacks = []
    
    // 调用刷新token的接口 - 确保使用完整URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const response = await axios.post(
      `${apiBaseUrl}/api/v1/auth/refresh-token`, 
      {}, 
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    )
    
    const { access_token, expire_in } = response.data
    setToken(access_token, expire_in)
    
    // 执行所有等待的回调
    refreshToken.callbacks.forEach(callback => callback(access_token))
    
    return access_token
  } catch (error) {
    console.error('刷新Token失败:', error)
    removeToken()
    router.push('/login')
    return null
  } finally {
    refreshToken.isRefreshing = false
  }
}

// 初始化刷新状态
refreshToken.isRefreshing = false
refreshToken.callbacks = []

// 请求拦截器
service.interceptors.request.use(
  async config => {
    // 排除登录请求
    if (config.url.includes('/auth/login')) {
      return config
    }
    
    const token = getToken()
    if (token) {
      // 检查token是否即将过期，如果是则刷新
      if (isTokenExpiringSoon() && !config.url.includes('/auth/refresh-token')) {
        const newToken = await refreshToken()
        if (newToken) {
          config.headers['Authorization'] = `Bearer ${newToken}`
        }
      } else {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    // 对于可能耗时较长的请求增加超时时间
    if (config.url.includes('/servers/') && (config.url.includes('/status') || config.url.includes('/gpus'))) {
      config.timeout = 180000 // 3分钟超时
    }
    
    // 对任务列表请求设置合理的超时时间
    if (config.url.includes('/tasks') && config.method === 'get') {
      config.timeout = 60000 // 1分钟超时
      console.log('任务列表请求配置:', {
        url: config.url, 
        method: config.method,
        params: config.params,
        timeout: config.timeout
      })
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 调试信息：打印请求和响应信息
    if (response.config.url.includes('/tasks')) {
      console.log('任务API响应:', {
        url: response.config.url,
        method: response.config.method,
        params: response.config.params,
        status: response.status,
        data: response.data
      })
    }
    
    // 处理登录响应
    if (response.config.url.includes('/auth/login')) {
      // 保存token到localStorage
      if (res.access_token) {
        setToken(res.access_token, res.expire_in || 24 * 60 * 60)
      }
      return res
    }
    
    // 如果响应成功但没有数据，返回空数组和0总数
    if (res === null || res === undefined) {
      return {
        items: [],
        total: 0
      }
    }
    
    // 如果响应是数组，包装成标准格式
    if (Array.isArray(res)) {
      return {
        items: res,
        total: res.length
      }
    }
    
    // 如果响应已经是标准格式，直接返回
    if (res.items !== undefined) {
      return res
    }
    
    // 如果响应数据在data字段中
    if (res.data) {
      // 如果data是数组
      if (Array.isArray(res.data)) {
        return {
          items: res.data,
          total: res.data.length
        }
      }
      // 如果data包含items
      if (res.data.items) {
        return res.data
      }
    }
    
    // 其他情况，直接返回响应数据
    return res
  },
  async error => {
    // 处理401未授权错误（Token无效或过期）
    if (error.response && error.response.status === 401) {
      // 清除已过期的Token
      removeToken()
      
      // 如果不是登录页面，则跳转到登录页
      if (router.currentRoute.value.path !== '/login') {
        ElMessage.error('登录已过期，请重新登录')
        router.push(`/login?redirect=${router.currentRoute.value.path}`)
      }
      
      return Promise.reject(error)
    }
    
    // 处理重试逻辑
    const config = error.config
    
    // 如果配置不存在或重试次数耗尽，则不再重试
    if (!config || !config.retry || config.retryCount >= config.retry || !config.shouldRetry(error)) {
      console.error('响应错误:', error)
      let message = ''
      
      if (error.code === 'ECONNABORTED') {
        message = '请求超时，服务器可能正忙，请稍后重试'
      } else if (!error.response) {
        message = '无法连接到服务器，请检查网络连接'
      } else {
        message = error.response?.data?.detail || 
                 error.response?.data?.message || 
                 error.message || 
                 '未知错误'
      }
      
      // 401错误在上面已处理，这里不再处理
      if (error.response?.status !== 401) {
        ElMessage({
          message,
          type: 'error',
          duration: 5000,
          showClose: true
        })
      }
      
      return Promise.reject(error)
    }
    
    // 设置重试计数
    config.retryCount = config.retryCount || 0
    config.retryCount++
    
    // 使用指数退避策略计算延迟时间
    const delay = new Promise(resolve => {
      const backoffDelay = config.retryDelay * Math.pow(2, config.retryCount - 1)
      setTimeout(() => {
        console.log(`重试请求: ${config.url} (第 ${config.retryCount} 次), 延迟: ${backoffDelay}ms`)
        resolve()
      }, backoffDelay)
    })
    
    await delay
    
    // 重新发起请求
    return service(config)
  }
)

export default service