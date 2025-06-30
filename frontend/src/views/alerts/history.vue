<template>
  <div class="alert-history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="left">
            <h3>告警历史</h3>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              @change="handleDateChange"
            />
          </div>
          <div class="right">
            <el-input
              v-model="searchQuery"
              placeholder="搜索告警名称"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="historyList"
        style="width: 100%"
      >
        <el-table-column prop="name" label="告警名称" min-width="150" />
        <el-table-column prop="type" label="告警类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.type)">
              {{ getAlertTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="监控目标" min-width="150" />
        <el-table-column prop="condition" label="告警条件" min-width="150" />
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertLevelTag(row.level)">
              {{ getAlertLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="触发时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="resolved_at" label="恢复时间" width="180">
          <template #default="{ row }">
            {{ row.resolved_at ? formatDateTime(row.resolved_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="告警详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="告警名称">
          {{ currentDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="告警类型">
          <el-tag :type="getAlertTypeTag(currentDetail.type)">
            {{ getAlertTypeLabel(currentDetail.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="监控目标">
          {{ currentDetail.target }}
        </el-descriptions-item>
        <el-descriptions-item label="告警条件">
          {{ currentDetail.condition }}
        </el-descriptions-item>
        <el-descriptions-item label="告警级别">
          <el-tag :type="getAlertLevelTag(currentDetail.level)">
            {{ getAlertLevelLabel(currentDetail.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentDetail.status)">
            {{ getStatusLabel(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="触发时间">
          {{ formatDateTime(currentDetail.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="恢复时间">
          {{ currentDetail.resolved_at ? formatDateTime(currentDetail.resolved_at) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通知方式" :span="2">
          {{ currentDetail.notification_methods?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通知接收人" :span="2">
          {{ currentDetail.notification_receivers?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="告警描述" :span="2">
          {{ currentDetail.description || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getAlertHistory,
  deleteAlert
} from '@/api/alerts'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const historyList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const dateRange = ref([])
const detailDialogVisible = ref(false)
const currentDetail = ref({})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 获取告警类型标签
const getAlertTypeTag = (type) => {
  const types = {
    gpu: 'success',
    cpu: 'warning',
    memory: 'info'
  }
  return types[type] || 'info'
}

// 获取告警类型标签文本
const getAlertTypeLabel = (type) => {
  const types = {
    gpu: 'GPU',
    cpu: 'CPU',
    memory: '内存'
  }
  return types[type] || type
}

// 获取告警级别标签
const getAlertLevelTag = (level) => {
  const levels = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return levels[level] || 'info'
}

// 获取告警级别标签文本
const getAlertLevelLabel = (level) => {
  const levels = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return levels[level] || level
}

// 获取状态标签
const getStatusTag = (status) => {
  const statuses = {
    active: 'danger',
    resolved: 'success',
    suppressed: 'info'
  }
  return statuses[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statuses = {
    active: '告警中',
    resolved: '已恢复',
    suppressed: '已抑制'
  }
  return statuses[status] || status
}

// 获取历史记录
const fetchHistory = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value
    }
    
    if (dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const res = await getAlertHistory(params)
    historyList.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    console.error('获取告警历史失败:', error)
    ElMessage.error('获取告警历史失败')
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = () => {
  currentPage.value = 1
  fetchHistory()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchHistory()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchHistory()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchHistory()
}

// 查看详情
const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除告警
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该告警记录吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAlert(row.id)
      ElMessage.success('删除成功')
      fetchHistory()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  })
}

onMounted(() => {
  fetchHistory()
})
</script>

<style lang="scss" scoped>
.alert-history-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .left {
      display: flex;
      align-items: center;
      gap: 20px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
    
    .right {
      width: 300px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 