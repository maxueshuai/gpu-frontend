<template>
  <div class="mongo-debug-container">
    <el-page-header content="MongoDB调试工具" @back="$router.go(-1)" />
    
    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>MongoDB连接测试</span>
          <el-button type="primary" @click="testConnection" :loading="connectionLoading">
            测试连接
          </el-button>
        </div>
      </template>
      
      <el-result
        v-if="connectionResult"
        :icon="connectionResult.success ? 'success' : 'error'"
        :title="connectionResult.success ? '连接成功' : '连接失败'"
        :sub-title="connectionResult.message"
      >
        <template #extra>
          <div class="connection-details" v-if="connectionResult.status">
            <el-descriptions title="连接详情" :column="1" border>
              <el-descriptions-item label="连接状态">
                <el-tag :type="connectionResult.status.connected ? 'success' : 'danger'">
                  {{ connectionResult.status.connected ? '已连接' : '未连接' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="数据库">{{ connectionResult.status.database }}</el-descriptions-item>
              <el-descriptions-item label="集合数量">{{ connectionResult.status.collections }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-result>
      
      <div v-if="!connectionResult" class="placeholder">
        <el-empty description="点击测试连接按钮开始测试" />
      </div>
    </el-card>
    
    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>MongoDB数据示例</span>
          <el-button type="primary" @click="getSampleData" :loading="sampleLoading">
            获取示例数据
          </el-button>
        </div>
      </template>
      
      <div v-if="sampleResult && sampleResult.success" class="sample-data">
        <div class="data-info">
          <el-alert
            title="数据获取成功"
            type="success"
            :description="`共获取到 ${sampleResult.count} 条任务数据`"
            show-icon
          />
        </div>
        
        <el-table
          v-if="sampleResult.data && sampleResult.data.length > 0"
          :data="sampleResult.data"
          style="width: 100%; margin-top: 20px;"
          border
        >
          <el-table-column label="ID" width="220" prop="id" show-overflow-tooltip />
          <el-table-column label="任务名称" prop="name" min-width="180" show-overflow-tooltip />
          <el-table-column label="事件类型" prop="eventTypeName" width="120" />
          <el-table-column label="设备IP" prop="deviceIp" width="140" />
          <el-table-column label="状态" prop="status" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据详情" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="showJsonDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-else description="没有获取到任何数据" />
      </div>
      
      <el-result
        v-else-if="sampleResult && !sampleResult.success"
        icon="error"
        title="获取数据失败"
        :sub-title="sampleResult.message"
      />
      
      <div v-else class="placeholder">
        <el-empty description="点击获取示例数据按钮查看MongoDB中的任务数据" />
      </div>
    </el-card>
    
    <!-- JSON详情对话框 -->
    <el-dialog
      v-model="jsonDialogVisible"
      title="数据详情"
      width="80%"
    >
      <pre class="json-content">{{ JSON.stringify(selectedJson, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { testMongoConnection, getMongoSampleTasks } from '@/api/mongo-test'

// 连接测试相关
const connectionLoading = ref(false)
const connectionResult = ref(null)

// 示例数据相关
const sampleLoading = ref(false)
const sampleResult = ref(null)

// JSON详情对话框相关
const jsonDialogVisible = ref(false)
const selectedJson = ref(null)

// 测试MongoDB连接
const testConnection = async () => {
  connectionLoading.value = true
  try {
    const res = await testMongoConnection()
    connectionResult.value = res
    if (res.success) {
      ElMessage.success('MongoDB连接测试成功')
    } else {
      ElMessage.error(`MongoDB连接测试失败: ${res.message}`)
    }
  } catch (error) {
    console.error('MongoDB连接测试出错:', error)
    ElMessage.error('测试过程发生错误，请查看控制台')
    connectionResult.value = {
      success: false,
      message: error.message || '未知错误'
    }
  } finally {
    connectionLoading.value = false
  }
}

// 获取示例数据
const getSampleData = async () => {
  sampleLoading.value = true
  try {
    const res = await getMongoSampleTasks()
    sampleResult.value = res
    if (res.success) {
      ElMessage.success(`成功获取 ${res.count} 条示例数据`)
    } else {
      ElMessage.error(`获取示例数据失败: ${res.message}`)
    }
  } catch (error) {
    console.error('获取示例数据出错:', error)
    ElMessage.error('获取过程发生错误，请查看控制台')
    sampleResult.value = {
      success: false,
      message: error.message || '未知错误',
      count: 0,
      data: []
    }
  } finally {
    sampleLoading.value = false
  }
}

// 显示JSON详情
const showJsonDetail = (data) => {
  selectedJson.value = data
  jsonDialogVisible.value = true
}

// 获取状态标签类型
const getStatusTag = (status) => {
  switch (status) {
    case 'running':
      return 'success'
    case 'stopped':
      return 'info'
    case 'completed':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'running':
      return '运行中'
    case 'stopped':
      return '已停止'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    default:
      return status
  }
}
</script>

<style scoped>
.mongo-debug-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.placeholder {
  padding: 40px 0;
}

.connection-details {
  margin-top: 20px;
  width: 100%;
}

.json-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 50vh;
  overflow: auto;
  font-family: monospace;
  white-space: pre-wrap;
}

.data-info {
  margin-bottom: 20px;
}
</style> 