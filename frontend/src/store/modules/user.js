import { login, logout, getInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

const state = {
  token: localStorage.getItem('token'),
  userInfo: null
}

const mutations = {
  SET_TOKEN: (state, token) => {
    console.log('设置token:', token)
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  SET_USER_INFO: (state, userInfo) => {
    console.log('设置用户信息:', userInfo)
    state.userInfo = userInfo
  }
}

const actions = {
  // 用户登录
  async login({ commit }, userInfo) {
    try {
      console.log('开始登录请求...')
      const { username, password } = userInfo
      const response = await login({ username: username.trim(), password })
      console.log('登录响应:', response)
      
      const { access_token, user } = response
      if (!access_token) {
        throw new Error('登录失败：未获取到访问令牌')
      }
      
      commit('SET_TOKEN', access_token)
      commit('SET_USER_INFO', user)
      console.log('登录状态更新完成')
      return Promise.resolve()
    } catch (error) {
      console.error('登录错误:', error)
      ElMessage.error(error.response?.data?.detail || error.message || '登录失败')
      return Promise.reject(error)
    }
  },

  // 获取用户信息
  async getInfo({ commit, state }) {
    try {
      console.log('开始获取用户信息...')
      if (!state.token) {
        throw new Error('获取用户信息失败：未找到访问令牌')
      }
      
      const data = await getInfo()
      console.log('获取到的用户信息:', data)
      commit('SET_USER_INFO', data)
      return Promise.resolve(data)
    } catch (error) {
      console.error('获取用户信息错误:', error)
      ElMessage.error(error.response?.data?.detail || error.message || '获取用户信息失败')
      return Promise.reject(error)
    }
  },

  // 用户登出
  async logout({ commit }) {
    try {
      await logout()
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', null)
      return Promise.resolve()
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || error.message || '登出失败')
      return Promise.reject(error)
    }
  },

  // 重置token
  resetToken({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_USER_INFO', null)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}