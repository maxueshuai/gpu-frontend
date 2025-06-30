import request from '@/utils/request'
import qs from 'qs'

// 用户登录
export function login(data) {
  const formData = new FormData()
  formData.append('username', data.username)
  formData.append('password', data.password)
  
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data: formData
  })
}

// 用户退出登录
export function logout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'post'
  })
}

// 获取用户信息
export function getInfo() {
  return request({
    url: '/api/v1/auth/profile',
    method: 'get'
  })
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/v1/users',
    method: 'get',
    params
  })
}

// 创建用户
export function register(data) {
  return request({
    url: '/api/v1/auth/register',
    method: 'post',
    data
  })
}

// 创建用户（管理员）
export function createUser(data) {
  return request({
    url: '/api/v1/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'delete'
  })
}

// 重置用户密码
export function resetUserPassword(id, password) {
  return request({
    url: `/api/v1/users/${id}/reset-password`,
    method: 'post',
    data: { password }
  })
}

// 切换用户状态（启用/禁用）
export function toggleUserStatus(id, status) {
  return request({
    url: `/api/v1/users/${id}/toggle-status`,
    method: 'post',
    data: { status }
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/api/v1/auth/profile',
    method: 'get'
  })
}

// 获取用户个人资料
export function getUserProfile(id) {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'get'
  })
}

// 更新当前用户信息
export function updateCurrentUser(data) {
  return request({
    url: '/api/v1/auth/profile',
    method: 'put',
    data
  })
}

// 修改当前用户密码
export function changePassword(data) {
  return request({
    url: '/api/v1/auth/profile',
    method: 'put',
    data
  })
}

// 更新用户个人资料
export function updateProfile(data) {
  return request({
    url: '/api/v1/auth/profile',
    method: 'put',
    data
  })
}

// 更新用户通知设置
export function updateUserNotification(data) {
  return request({
    url: '/api/v1/users/notification-settings',
    method: 'put',
    data
  })
} 