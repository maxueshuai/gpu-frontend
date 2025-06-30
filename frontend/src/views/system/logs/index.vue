<template>
  <div class="system-logs-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
          <div>
            <el-button type="primary" @click="fetchLogs">刷新</el-button>
            <el-button type="danger" @click="handleClearLogs">清空日志</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <el-tag
              :type="getLogLevelType(scope.row.level)"
              effect="dark"
            >
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="150" />
        <el-table-column prop="message" label="消息" show-overflow-tooltip />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSystemLogs, clearSystemLogs } from '@/api/system'

// 日志数据
const logs = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 根据日志级别获取标签类型
const getLogLevelType = (level) => {
  const levelMap = {
    'ERROR': 'danger',
    'WARNING': 'warning',
    'INFO': 'info',
    'DEBUG': 'success'
  }
  return levelMap[level] || 'info'
}

// 获取系统日志
const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await getSystemLogs({
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (res) {
      // 兼容不同的响应格式
      if (res.data) {
        logs.value = res.data.logs || []
        total.value = res.data.total || 0
      } else {
        logs.value = res.logs || []
        total.value = res.total || 0
      }
    } else {
      logs.value = []
      total.value = 0
      console.warn('系统日志数据为空')
    }
  } catch (error) {
    console.error('获取系统日志失败:', error)
    ElMessage.error('获取系统日志失败')
  } finally {
    loading.value = false
  }
}

// 清空系统日志
const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有系统日志吗？此操作不可恢复!',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    await clearSystemLogs()
    ElMessage.success('日志已清空')
    fetchLogs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogs()
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.system-logs-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>