import dayjs from 'dayjs'

// 格式化日期时间
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

// 格式化时间
export function formatTime(date, format = 'HH:mm:ss') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

// 格式化相对时间
export function formatRelativeTime(date) {
  if (!date) return '-'
  return dayjs(date).fromNow()
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化百分比
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '-'
  return (value * 100).toFixed(decimals) + '%'
} 