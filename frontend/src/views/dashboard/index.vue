<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 系统概览卡片 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>系统概览</span>
              <el-button type="primary" @click="refreshData">刷新数据</el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-title">服务器总数</div>
                <div class="stat-value">{{ stats.serverCount || 0 }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-title">GPU总数</div>
                <div class="stat-value">{{ stats.gpuCount || 0 }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-title">运行中任务</div>
                <div class="stat-value">{{ stats.runningTaskCount || 0 }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-title">告警数量</div>
                <div class="stat-value warning">{{ stats.alertCount || 0 }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 服务器状态列表 -->
      <el-col :span="24" class="mt-4">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>服务器状态</span>
              <el-button type="success" @click="toServerConfig">添加服务器</el-button>
            </div>
          </template>
          <el-table :data="servers" v-loading="serverLoading" border>
            <el-table-column prop="name" label="服务器名称" min-width="120" />
            <el-table-column prop="ip_address" label="IP地址" min-width="120" />
            <el-table-column prop="gpu_count" label="GPU数量" width="100">
              <template #default="{ row }">
                {{ row.serverStatus ? row.serverStatus.gpu_count : 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getServerStatusColor(row.serverStatus ? row.serverStatus.status : 'offline')">
                  {{ getServerStatusText(row.serverStatus ? row.serverStatus.status : 'offline') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="CPU使用率" min-width="180">
              <template #default="{ row }">
                <div v-if="row.serverStatus && row.serverStatus.status === 'waiting'">
                  <el-progress :percentage="50" :status="''" :indeterminate="true" :duration="2" />
                  <span class="waiting-text">正在获取数据...</span>
                </div>
                <el-progress v-else :percentage="row.serverStatus ? row.serverStatus.cpu_usage : 0" :status="(row.serverStatus && row.serverStatus.cpu_usage > 80) ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column label="内存使用率" min-width="180">
              <template #default="{ row }">
                <div v-if="row.serverStatus && row.serverStatus.status === 'waiting'">
                  <el-progress :percentage="50" :status="''" :indeterminate="true" :duration="2" />
                  <span class="waiting-text">正在获取数据...</span>
                </div>
                <el-progress v-else :percentage="row.serverStatus ? row.serverStatus.memory_usage : 0" :status="(row.serverStatus && row.serverStatus.memory_usage > 80) ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column label="GPU使用率" min-width="180">
              <template #default="{ row }">
                <div v-if="row.serverStatus && row.serverStatus.status === 'waiting'">
                  <el-progress :percentage="50" :status="''" :indeterminate="true" :duration="2" />
                  <span class="waiting-text">正在获取数据...</span>
                </div>
                <el-progress v-else :percentage="row.serverStatus ? row.serverStatus.load : 0" :status="(row.serverStatus && row.serverStatus.load > 80) ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" link @click="toServerDetail(row.id)">详情</el-button>
                  <el-button type="success" link @click="toTaskList(row.id)">任务</el-button>
                  <el-button type="warning" link @click="toAlertConfig(row.id)">告警</el-button>
                  <el-button type="danger" link @click="handleDeleteServer(row)">删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- MongoDB状态 -->
      <el-col :span="12" class="mt-4">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>MongoDB状态</span>
              <el-button type="primary" @click="toMongoConfig">配置</el-button>
            </div>
          </template>
          <el-descriptions border>
            <el-descriptions-item label="连接状态">
              <el-tag :type="mongoStatus?.connected ? 'success' : 'danger'">
                {{ mongoStatus?.connected ? '已连接' : '未连接' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="数据库">
              {{ mongoStatus?.database || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="集合数">
              {{ mongoStatus?.collections || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 最近告警 -->
      <el-col :span="12" class="mt-4">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近告警</span>
              <el-button type="primary" @click="toAlertList">查看全部</el-button>
            </div>
          </template>
          <el-timeline v-if="recentAlerts.length > 0">
            <el-timeline-item
              v-for="alert in recentAlerts"
              :key="alert.id"
              :type="getAlertLevelTag(alert.level)"
              :timestamp="formatTime(alert.time || alert.created_at)"
            >
              {{ alert.message }}
            </el-timeline-item>
          </el-timeline>
          <div v-else class="empty-data">暂无告警数据</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getServers,
  deleteServer,
  getServerGpus,
  getServerStatus
} from '@/api/server'
import {
  getSystemOverview,
  getMongoDBStatus
} from '@/api/system'

// 使用变量引用函数，这样可以在运行时动态赋值
let getRecentAlertsFunc = null

const router = useRouter()
const loading = ref(false)

// 统计数据
const stats = ref({
  serverCount: 0,
  gpuCount: 0,
  taskCount: 0,
  runningTaskCount: 0,
  alertCount: 0,
  unresolvedAlertCount: 0
})

// 服务器列表
const servers = ref([])
const serverLoading = ref(false)

// MongoDB状态
const mongoStatus = ref({
  connected: false,
  database: '',
  collections: 0
})

// 最近告警
const recentAlerts = ref([])

// 获取系统概览数据
const fetchOverview = async () => {
  try {
    const res = await getSystemOverview()
    stats.value.serverCount = res.server_count
    stats.value.gpuCount = res.gpu_count
    stats.value.taskCount = res.task_count
    stats.value.runningTaskCount = res.running_task_count
    stats.value.alertCount = res.alert_count
    stats.value.unresolvedAlertCount = res.unresolved_alert_count
  } catch (error) {
    console.error('获取系统概览数据失败:', error)
  }
}

// 获取服务器列表
const fetchServers = async () => {
  serverLoading.value = true
  try {
    const res = await getServers()
    servers.value = res.items
    
    // 获取每个服务器的详细状态信息
    const serversWithStatus = []
    for (const server of servers.value) {
      try {
        // 获取服务器的GPU信息
        const gpuList = await getServerGpus(server.id)
        // 获取服务器状态信息
        const status = await getServerStatus(server.id)
        
        // 计算平均GPU使用率
        let avgGpuUsage = 0
        if (gpuList && gpuList.length > 0) {
          const totalUsage = gpuList.reduce((sum, gpu) => sum + (gpu.usage || 0), 0)
          avgGpuUsage = Math.round(totalUsage / gpuList.length)
        }
        
        serversWithStatus.push({
          ...server,
          serverStatus: status,
          load: avgGpuUsage
        })
      } catch (err) {
        console.error(`获取服务器 ${server.id} 的状态信息失败:`, err)
        serversWithStatus.push({
          ...server,
          serverStatus: {
            status: 'offline',
            cpu_usage: 0,
            memory_usage: 0,
            gpu_count: 0
          },
          load: 0
        })
      }
    }
    servers.value = serversWithStatus
  } catch (error) {
    console.error('获取服务器列表失败:', error)
    // 错误时显示友好提示
    ElMessage.error('获取服务器列表失败，请稍后再试')
  } finally {
    serverLoading.value = false
  }
}

// 获取MongoDB状态
const fetchMongoDBStatus = async () => {
  try {
    const res = await getMongoDBStatus()
    mongoStatus.value = res
  } catch (error) {
    console.error('获取MongoDB状态失败:', error)
  }
}

// 获取最近告警
const fetchRecentAlerts = async () => {
  try {
    // 如果函数尚未加载，尝试加载函数
    if (!getRecentAlertsFunc) {
      try {
        // 先尝试从alert.js导入
        const alertModule = await import('@/api/alert')
        getRecentAlertsFunc = alertModule.getRecentAlerts
      } catch (importError) {
        console.warn('从alert.js导入失败，尝试本地实现', importError)
        
        // 如果导入失败，提供一个本地实现
        getRecentAlertsFunc = (limit = 10) => {
          return ElMessage({
            message: '无法加载告警数据，请检查网络连接',
            type: 'warning'
          })
        }
      }
    }
    
    // 使用加载的函数
    const res = await getRecentAlertsFunc(5)
    // 如果res是数组，直接使用，否则尝试获取items属性
    recentAlerts.value = Array.isArray(res) ? res : (res?.items || [])
  } catch (error) {
    console.error('获取最近告警失败:', error)
    recentAlerts.value = []
  }
}

// 获取所有数据
const fetchData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchOverview(),
      fetchServers(),
      fetchMongoDBStatus(),
      fetchRecentAlerts()
    ])
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchData()
}

// 删除服务器
const handleDeleteServer = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除服务器 ${row.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteServer(row.id)
    ElMessage.success('删除成功')
    fetchServers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除服务器失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 页面跳转方法
const toServerConfig = () => {
  router.push('/servers/config')
}

const toServerDetail = (id) => {
  router.push(`/servers/${id}`)
}

const toTaskList = (serverId) => {
  router.push(`/servers/${serverId}/tasks`)
}

const toAlertConfig = (serverId) => {
  router.push(`/servers/${serverId}/alerts`)
}

const toMongoConfig = () => {
  router.push('/settings/mongo-servers')
}

const toAlertList = () => {
  router.push('/alerts')
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '未知'
  try {
    // 简单格式化时间，不使用date-fns
    const date = new Date(time)
    return date.toLocaleString('zh-CN', { 
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return time
  }
}

// 获取告警级别样式
const getAlertLevelTag = (level) => {
  const levels = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return levels[level] || 'info'
}

// 获取服务器状态样式
const getServerStatusColor = (status) => {
  const colorMap = {
    'online': 'success',
    'offline': 'danger',
    'maintenance': 'warning',
    'waiting': 'info'
  }
  return colorMap[status] || 'info'
}

const getServerStatusText = (status) => {
  const textMap = {
    'online': '在线',
    'offline': '离线',
    'maintenance': '维护中',
    'waiting': '获取中'
  }
  return textMap[status] || status
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .stat-item {
    text-align: center;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    .stat-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 10px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      
      &.warning {
        color: #e6a23c;
      }
    }
  }
  
  .empty-data {
    text-align: center;
    color: #909399;
    padding: 20px 0;
    font-size: 14px;
  }
  
  .mt-4 {
    margin-top: 20px;
  }
}

.waiting-text {
  font-size: 12px;
  color: #909399;
  display: block;
  text-align: center;
  margin-top: 5px;
}
</style> 