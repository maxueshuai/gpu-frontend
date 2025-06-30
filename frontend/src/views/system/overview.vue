<template>
  <div class="system-overview-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统概览</span>
        </div>
      </template>
      <div class="card-content">
        <el-descriptions title="系统信息" :column="2" border>
          <el-descriptions-item label="系统名称">GPU监控系统</el-descriptions-item>
          <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="运行状态">
            <el-tag type="success">正常</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="运行时间">{{ uptime }}</el-descriptions-item>
          <el-descriptions-item label="服务器数量">{{ stats.serverCount }}</el-descriptions-item>
          <el-descriptions-item label="GPU总数">{{ stats.gpuCount }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h3>系统资源使用情况</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="resource-item">
              <div class="resource-title">CPU使用率</div>
              <el-progress type="dashboard" :percentage="stats.cpuUsage" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="resource-item">
              <div class="resource-title">内存使用率</div>
              <el-progress type="dashboard" :percentage="stats.memoryUsage" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="resource-item">
              <div class="resource-title">磁盘使用率</div>
              <el-progress type="dashboard" :percentage="stats.diskUsage" />
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSystemStatus } from '@/api/system'

const uptime = ref('0天0小时0分钟')
const stats = ref({
  serverCount: 0,
  gpuCount: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0
})

// 格式化运行时间
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天${hours}小时${minutes}分钟`
}

// 获取系统状态
const fetchSystemStatus = async () => {
  try {
    const res = await getSystemStatus()
    stats.value = {
      serverCount: res.server_count || 0,
      gpuCount: res.gpu_count || 0,
      cpuUsage: res.cpu_usage || 0,
      memoryUsage: res.memory_usage || 0,
      diskUsage: res.disk_usage || 0
    }
    uptime.value = formatUptime(res.uptime || 0)
  } catch (error) {
    console.error('获取系统状态失败:', error)
  }
}

onMounted(() => {
  fetchSystemStatus()
})
</script>

<style scoped>
.system-overview-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  margin-top: 20px;
}

.resource-item {
  text-align: center;
  padding: 20px;
}

.resource-title {
  margin-bottom: 15px;
  font-weight: 500;
}
</style> 