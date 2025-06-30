import request from '@/utils/request'

/**
 * 测试MongoDB连接
 * @returns {Promise<Object>} 连接测试结果
 */
export function testMongoConnection() {
  return request({
    url: '/api/v1/mongo-test/check-connection',
    method: 'get'
  })
}

/**
 * 获取MongoDB任务示例数据
 * @returns {Promise<Object>} 包含示例任务数据的对象
 */
export function getMongoSampleTasks() {
  return request({
    url: '/api/v1/mongo-test/sample-tasks',
    method: 'get'
  })
} 