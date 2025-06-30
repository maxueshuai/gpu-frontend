<template>
  <div class="server-detail-container">
    <el-card v-loading="loading" element-loading-text="加载中..." shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="server-title">
              <el-icon><Monitor /></el-icon>
              {{ serverInfo.name || '服务器详情' }}
            </h2>
            <el-tag :type="getStatusType(serverInfo.status)" class="status-tag">
              {{ getStatusText(serverInfo.status) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-tooltip content="自动刷新状态" placement="top">
              <el-tag size="small" :type="autoRefresh ? 'success' : 'info'" class="refresh-status">
                {{ autoRefresh ? '自动刷新已开启' : '自动刷新已关闭' }}
              </el-tag>
            </el-tooltip>
            <el-button-group>
              <el-button type="primary" @click="toggleAutoRefresh" :loading="loading" link>
                <el-icon><Timer /></el-icon>
                {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
              </el-button>
              <el-button type="primary" @click="refreshData" :loading="loading" link>
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="success" @click="handleAgentRefresh" :loading="agentRefreshing" link>
                <el-icon><Refresh /></el-icon>
                手动被动采集
              </el-button>
              <el-button type="warning" @click="handleEdit" link>
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="loadError" class="error-container">
        <el-result icon="error" title="获取服务器数据失败" :sub-title="loadErrorMessage">
          <template #extra>
            <el-button type="primary" @click="fetchData">重试</el-button>
          </template>
        </el-result>
      </div>
      <div v-else>
        <!-- 服务器基本信息 -->
        <div class="server-basic-info">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20" class="status-cards">
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">连接状态</div>
                <div class="status-value">
                  <el-tag :type="getStatusType(serverInfo.status)">
                    {{ getStatusText(serverInfo.status) }}
                  </el-tag>
                </div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">主机名</div>
                <div class="status-value">{{ serverInfo.hostname || '未知' }}</div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">IP地址</div>
                <div class="status-value">
                  <template v-if="serverInfo.server_key">
                    {{ serverInfo.server_key }}
                  </template>
                  <template v-else-if="serverStatus && serverStatus.ip_addresses && serverStatus.ip_addresses.length > 0">
                    <div v-for="(ip, index) in serverStatus.ip_addresses" :key="index" class="ip-address">
                      {{ ip }}
                    </div>
                  </template>
                  <template v-else>
                    {{ serverInfo.ip_address || '无' }}
                  </template>
                </div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">操作系统</div>
                <div class="status-value">{{ serverStatus.os_version || '未知' }}</div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">运行时间</div>
                <div class="status-value">{{ formatUptime(serverInfo.uptime) || 'N/A' }}</div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">最后更新</div>
                <div class="status-value">{{ formatTime(serverInfo.last_updated) }}</div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">CPU 型号</div>
                <div class="status-value">{{ serverInfo.cpu_model || 'N/A' }}</div>
              </div>
            </el-col>
            <el-col :span="6" :xs="12" :sm="8" :md="6">
              <div class="status-card">
                <div class="status-label">CPU 核心数</div>
                <div class="status-value">{{ serverInfo.cpu_cores || 'N/A' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <el-row :gutter="20" class="info-section">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>服务器总数</span>
                </div>
              </template>
              <div class="card-value">
                <span class="number">{{ serverCount }}</span>
                <span class="unit">台</span>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>GPU总数</span>
                </div>
              </template>
              <div class="card-value">
                <span class="number">{{ serverStatus.gpu_count || 0 }}</span>
                <span class="unit">个</span>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>运行任务</span>
                </div>
              </template>
              <div class="card-value">
                <span class="number">{{ runningTasks }}</span>
                <span class="unit">个</span>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>告警数量</span>
                </div>
              </template>
              <div class="card-value warning">
                <span class="number">{{ alertCount }}</span>
                <span class="unit">个</span>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 系统资源使用情况 -->
        <div class="system-resources">
          <div class="section-title">系统资源</div>
          <el-row :gutter="20">
            <el-col :span="8" :xs="24" :sm="12" :md="8">
              <el-card shadow="hover" class="resource-card">
                <div class="resource-title">CPU 使用率</div>
                <el-progress
                  :percentage="Number(serverInfo.cpu_usage) || 0"
                  :status="serverInfo.cpu_usage > 80 ? 'exception' : null"
                  :stroke-width="18"
                />
                <div class="resource-details">
                  <span>{{ (serverInfo.cpu_usage || 0).toFixed(2) }}%</span>
                  <span v-if="serverInfo.cpu_model">{{ serverInfo.cpu_model }}</span>
                  <span v-if="serverInfo.cpu_cores">{{ serverInfo.cpu_cores }} 核</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8" :xs="24" :sm="12" :md="8">
              <el-card shadow="hover" class="resource-card">
                <div class="resource-title">内存使用率</div>
                <el-progress
                  :percentage="Number(serverInfo.memory_usage) || 0"
                  :status="serverInfo.memory_usage > 80 ? 'exception' : null"
                  :stroke-width="18"
                />
                <div class="resource-details">
                  <span>{{ (serverInfo.memory_usage || 0).toFixed(2) }}%</span>
                  <span>已用: {{ formatMemory(serverInfo.memory_used) }}</span>
                  <span>总计: {{ formatMemory(serverInfo.memory_total) }}</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8" :xs="24" :sm="12" :md="8">
              <el-card shadow="hover" class="resource-card">
                <div class="resource-title">磁盘使用率</div>
                <el-progress
                  :percentage="Number(serverInfo.disk_usage) || 0"
                  :status="serverInfo.disk_usage > 90 ? 'exception' : null"
                  :stroke-width="18"
                />
                <div class="resource-details">
                  <span>{{ serverInfo.disk_usage }}%</span>
                  <span>已用: {{ formatDiskSpace(serverInfo.disk_used) }}</span>
                  <span>总计: {{ formatDiskSpace(serverInfo.disk_total) }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- GPU信息 -->
        <div class="gpu-section">
          <div class="section-header">
            <h3 class="section-title">GPU信息</h3>
            <div class="section-actions">
              <el-tooltip v-if="gpuError" content="GPU信息获取异常，请检查服务器上的NVIDIA驱动" placement="top">
                <el-tag type="warning" effect="dark" style="margin-right: 10px;">GPU数据异常</el-tag>
              </el-tooltip>
              <el-button type="primary" size="small" @click="syncGPUInfo" :loading="syncingGPU">
                <el-icon><Refresh /></el-icon>
                同步GPU信息
              </el-button>
            </div>
          </div>
          
          <el-alert v-if="gpuError" 
            title="无法获取GPU信息" 
            type="warning" 
            description="请确保服务器已安装NVIDIA驱动，并且有权限执行nvidia-smi命令。" 
            show-icon 
            :closable="false"
            style="margin-bottom: 15px;"
          />
          
          <el-empty v-if="!gpuList || gpuList.length === 0" description="未检测到GPU设备">
            <el-button type="primary" @click="syncGPUInfo">重新检测</el-button>
          </el-empty>
          
          <div v-else-if="gpuList[0] && gpuList[0].model === '未安装GPU'" class="no-gpu-warning">
            <el-alert
              title="未安装GPU或NVIDIA驱动"
              type="warning"
              description="该服务器未安装GPU设备或未安装NVIDIA驱动，无法获取GPU信息。"
              show-icon
              :closable="false"
            />
          </div>
          
          <div v-else class="gpu-memory-cards">
            <el-row :gutter="16">
              <el-col :span="24" v-for="(gpu, idx) in gpuList" :key="gpu.index" style="margin-bottom: 12px;">
                <el-card shadow="hover" class="gpu-memory-card">
                  <div class="gpu-memory-header">
                    <span class="gpu-index">GPU{{ gpu.index }}</span>
                    <span class="gpu-model">{{ gpu.model }}</span>
                  </div>
                  <div class="gpu-memory-progress">
                    <el-progress
                      :percentage="calculateMemoryPercentage(gpu.memory_used, gpu.memory_total)"
                      :color="getProgressColor(calculateMemoryPercentage(gpu.memory_used, gpu.memory_total))"
                      :format="format"
                      :stroke-width="18"
                    />
                  </div>
                  <div class="gpu-memory-detail">
                    <span>显存: {{ formatMemory(gpu.memory_used) }} / {{ formatMemory(gpu.memory_total) }}</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <el-table v-else :data="gpuList" border style="width: 100%" :stripe="true">
            <el-table-column prop="index" label="序号" width="80" align="center" />
            <el-table-column prop="model" label="型号" min-width="200" show-overflow-tooltip />
            <el-table-column label="温度" width="120" align="center">
              <template #default="{ row }">
                <el-tooltip :content="getTemperatureStatus(row.temperature)" placement="top">
                  <span :class="getTemperatureClass(row.temperature)">
                    {{ row.temperature }}°C
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="使用率" width="180" align="center">
              <template #default="{ row }">
                <el-progress 
                  :percentage="Number(row.usage) || 0" 
                  :color="getProgressColor(row.usage)"
                  :format="format"
                />
              </template>
            </el-table-column>
            <el-table-column label="显存使用率" width="220" align="center">
              <template #default="{ row }">
                <div class="memory-usage">
                  <el-progress 
                    :percentage="calculateMemoryPercentage(row.memory_used, row.memory_total)"
                    :color="getProgressColor(calculateMemoryPercentage(row.memory_used, row.memory_total))"
                    :format="format"
                  />
                  <span class="memory-detail">
                    {{ formatMemory(row.memory_used) }} / {{ formatMemory(row.memory_total) }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="功耗" width="120" align="center">
              <template #default="{ row }">
                <el-tooltip :content="getPowerStatus(row.power_usage)" placement="top">
                  <span :class="getPowerClass(row.power_usage)">
                    {{ row.power_usage && row.power_usage > 0 ? row.power_usage + 'W' : '--' }}
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="(row.status || 'normal') === 'normal' ? 'success' : 'warning'">
                  {{ (row.status || 'normal') === 'normal' ? '正常' : '警告' }}
                 </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.server-detail-container {
  padding: 16px;
  background-color: #f5f7fa;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  
  .main-card {
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .el-card__header {
      padding: 12px 16px;
      background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }
    
    .el-card__body {
      padding: 16px;
    }
  }
  
  .info-section {
    margin: 16px 0;
    
    .info-card {
      margin: 0;
      height: 100%;
    }
  }
  
  .system-resources {
    margin: 16px 0;
    
    .resource-card {
      margin: 0;
      height: 100%;
    }
  }
  
  .gpu-section {
    margin: 16px 0 0 0;
    
    .el-table {
      margin: 0;
    }
  }
  
  :deep(.el-menu-item) {
    text-decoration: none;
    
    &.is-active {
      text-decoration: none;
      font-weight: 500;
    }
  }
  
  :deep(.el-sub-menu__title) {
    text-decoration: none;
  }
  
  :deep(a) {
    text-decoration: none;
    color: inherit;
    
    &:hover {
      text-decoration: none;
    }
  }
  
  .server-status-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 10px;
  }
  
  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .status-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  
  .status-value {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
  
  .status-cards {
    .status-card {
      padding: 20px;
      height: 100%;
      background: #fff;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
      
      .status-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .status-value {
        font-size: 14px;
        color: #303133;
        
        .el-tag {
          font-size: 13px;
        }
      }
    }
  }
}

.server-container {
  padding: 20px;
}

.server-basic-info, .system-resources {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
}

.status-cards {
  margin-bottom: 20px;
}

.status-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  height: 100%;
}

.status-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.status-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.resource-card {
  height: 100%;
  margin-bottom: 16px;
  text-align: center;
}

.resource-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #303133;
}

.resource-details {
  margin-top: 16px;
  text-align: center;
}

.resource-details span {
  display: block;
  margin-bottom: 6px;
  color: #606266;
}

.loading-container {
  padding: 40px;
  margin: 20px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.error-container {
  margin: 40px 0;
}

.ip-address {
  margin-bottom: 4px;
}
.ip-address:last-child {
  margin-bottom: 0;
}

.gpu-memory-cards {
  margin-bottom: 16px;
}

.gpu-memory-card {
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  height: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .gpu-memory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .gpu-index {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .gpu-model {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }

  .gpu-memory-progress {
    margin-bottom: 8px;
  }

  .gpu-memory-detail {
    text-align: right;
    font-size: 14px;
    color: #606266;
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Monitor, 
  Refresh, 
  Edit, 
  Timer, 
  InfoFilled 
} from '@element-plus/icons-vue'
import { 
  getServerDetail, 
  getServerStatus, 
  getServerGpus,
  syncServerGpus,
  refreshAgent
} from '@/api/server'

const route = useRoute()
const router = useRouter()
const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})

// 加载状态
const loading = ref(false)
const loadError = ref(false)
const loadErrorMessage = ref('')
const syncingGPU = ref(false)

// 自动刷新设置
const autoRefresh = ref(true)
const refreshInterval = ref(null)
const refreshRate = ref(30) // 30秒刷新一次

// 服务器数据
const serverDetail = ref({})
const serverInfo = ref({})
const gpuList = ref([])

// 统计数据
const serverCount = ref(0)
const gpuCount = ref(0)
const runningTasks = ref(0)
const alertCount = ref(0)

const dataError = ref(false)
const gpuError = ref(false)

// 手动被动采集
const agentRefreshing = ref(false)

// 获取服务器详情和状态
const fetchData = async () => {
  loading.value = true
  loadError.value = false
  
  try {
    // 获取服务器基本信息
    const detail = await getServerDetail(Number(props.id) || props.id)
    serverDetail.value = detail
    
    // 获取服务器状态
    const status = await getServerStatus(Number(props.id) || props.id)
    
    // 规范化状态数据
    const normalizedStatus = {
      ...status,
      // 处理IP地址，移除私有地址
      ip_address: detail.ip ? detail.ip.replace(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.).*$/, '') : detail.ip,
      // 规范化CPU使用率，保留2位小数，处理空值
      cpu_usage: typeof status?.cpu_usage === 'number' ? Number(status.cpu_usage.toFixed(2)) : 0,
      // 规范化内存数据
      memory_total: typeof status?.memory_total === 'number' ? status.memory_total : parseInt(status?.memory_total) || 0,
      memory_used: typeof status?.memory_used === 'number' ? status.memory_used : parseInt(status?.memory_used) || 0,
      memory_usage: typeof status?.memory_usage === 'number' ? Number(status.memory_usage.toFixed(2)) : 0,
      // 规范化磁盘数据
      disk_total: status?.disk_total || '0',
      disk_used: status?.disk_used || '0',
      disk_usage: typeof status?.disk_usage === 'number' ? Number(status.disk_usage.toFixed(2)) : 0
    }
    
    serverInfo.value = normalizedStatus
    
    // 如果状态正常，获取GPU列表
    if (status && status.status !== 'waiting') {
      try {
        const gpus = await getServerGpus(Number(props.id) || props.id)
        
        // 确保gpuList是数组
        if (Array.isArray(gpus)) {
          gpuList.value = gpus
        } else if (gpus && Array.isArray(gpus.items)) {
          gpuList.value = gpus.items
        } else if (gpus && typeof gpus === 'object') {
          // 如果返回的是对象且有items属性，将items设为gpuList
          if (gpus.items && Array.isArray(gpus.items)) {
            gpuList.value = gpus.items
          } else {
            // 否则将对象转为空数组
            console.error('GPU列表数据格式不正确:', gpus)
            gpuList.value = []
          }
        } else {
          gpuList.value = []
        }
      } catch (gpuError) {
        console.error('获取GPU列表失败:', gpuError)
        gpuList.value = []
        gpuError.value = true
      }
    } else if (status && status.status === 'waiting') {
      // 初始化重试计数
      window.retryCount = 0;
      
      // 如果状态是waiting，延迟后重试，但不更新UI避免闪动
      console.log('服务器状态正在获取中，延迟3秒后重试')
      setTimeout(() => {
        // 只刷新状态数据，不改变loading状态
        refreshStatusOnly()
      }, 3000)
      
      // 设置临时状态以避免闪烁
      if (!serverInfo.value.status) {
        serverInfo.value = {
          ...serverInfo.value,
          status: 'waiting',
          ip_address: detail.ip
        }
      }
      // 不结束loading状态，直接返回
      return
    }
  } catch (error) {
    console.error('获取服务器信息失败:', error)
    loadError.value = true
    loadErrorMessage.value = error.message || '无法连接到服务器，请检查网络连接'
    ElMessage.error('获取服务器信息失败: ' + (error.message || '未知错误'))
  } finally {
    // 只有在非waiting状态才结束加载
    if (!serverInfo.value.status || serverInfo.value.status !== 'waiting') {
      loading.value = false
    }
  }
}

// 只刷新状态而不改变加载状态
const refreshStatusOnly = async () => {
  try {
    // 记录重试次数，防止无限循环
    if (!window.retryCount) window.retryCount = 0;
    
    // 如果重试次数过多，放弃并显示错误
    if (window.retryCount > 10) {
      console.error('服务器状态获取重试次数过多，可能存在问题');
      ElMessage.warning('服务器状态获取超时，请稍后再试');
      loading.value = false;
      window.retryCount = 0;
      return;
    }
    
    const status = await getServerStatus(Number(props.id) || props.id)
    
    // 检查状态是否还是waiting
    if (status && status.status === 'waiting') {
      // 递增重试计数
      window.retryCount++;
      
      // 如果仍然是waiting，继续延迟重试
      console.log(`服务器状态仍在获取中，将再次延迟重试 (${window.retryCount}/10)`);
      setTimeout(() => {
        refreshStatusOnly()
      }, 3000) // 增加延迟时间，减少请求频率
      return;
    }
    
    // 状态已经不是waiting，重置重试计数
    window.retryCount = 0;
    
    // 如果不是waiting，更新状态并完成加载
    serverInfo.value = {
      ...serverInfo.value,
      ...status,
      ip_address: serverDetail.value.ip
    }
    
    // 获取GPU列表
    try {
      const gpus = await getServerGpus(Number(props.id) || props.id)
      
      // 确保gpuList是数组
      if (Array.isArray(gpus)) {
        gpuList.value = gpus
      } else if (gpus && Array.isArray(gpus.items)) {
        gpuList.value = gpus.items
      } else if (gpus && typeof gpus === 'object') {
        // 如果返回的是对象且有items属性，将items设为gpuList
        if (gpus.items && Array.isArray(gpus.items)) {
          gpuList.value = gpus.items
        } else {
          // 否则将对象转为空数组
          console.error('GPU列表数据格式不正确:', gpus)
          gpuList.value = []
        }
      } else {
        gpuList.value = []
      }
    } catch (gpuError) {
      console.error('获取GPU列表失败:', gpuError)
      gpuList.value = []
      gpuError.value = true
    }
    
    // 完成加载
    loading.value = false
  } catch (error) {
    console.error('刷新状态失败:', error)
    // 如果失败，也完成加载状态
    loading.value = false
    window.retryCount = 0; // 重置重试计数
  }
}

// 刷新服务器状态
const refreshData = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const status = await getServerStatus(Number(props.id) || props.id)
    
    if (status && status.status === 'waiting') {
      // 初始化重试计数
      window.retryCount = 0;
      
      // 状态是waiting，延迟处理
      console.log('服务器状态为waiting，将延迟处理');
      setTimeout(() => {
        refreshStatusOnly()
      }, 3000)
      return
    }
    
    // 状态不是waiting，重置计数
    window.retryCount = 0;
    
    serverInfo.value = {
      ...serverInfo.value,
      ...status,
      ip_address: serverDetail.value.ip
    }
    
    const gpus = await getServerGpus(Number(props.id) || props.id)
    
    // 确保gpuList是数组
    if (Array.isArray(gpus)) {
      gpuList.value = gpus
    } else if (gpus && Array.isArray(gpus.items)) {
      gpuList.value = gpus.items
    } else if (gpus && typeof gpus === 'object') {
      // 如果返回的是对象且有items属性，将items设为gpuList
      if (gpus.items && Array.isArray(gpus.items)) {
        gpuList.value = gpus.items
      } else {
        // 否则将对象转为空数组
        console.error('GPU列表数据格式不正确:', gpus)
        gpuList.value = []
      }
    } else {
      gpuList.value = []
    }
    
    ElMessage({
      message: '数据已刷新',
      type: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('刷新服务器状态失败:', error)
    ElMessage.error('刷新失败: ' + (error.message || '未知错误'))
    window.retryCount = 0; // 出错时重置计数
  } finally {
    loading.value = false
  }
}

// 同步GPU信息
const syncGPUInfo = async () => {
  if (syncingGPU.value) return
  
  syncingGPU.value = true
  try {
    await syncServerGpus(Number(props.id) || props.id)
    await fetchData()
    ElMessage.success('GPU信息同步成功')
  } catch (error) {
    console.error('同步GPU信息失败:', error)
    ElMessage.error('同步GPU信息失败: ' + (error.message || '未知错误'))
  } finally {
    syncingGPU.value = false
  }
}

// 自动刷新控制
const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshInterval.value = setInterval(() => {
    if (autoRefresh.value && !loading.value) {
      refreshData()
    }
  }, refreshRate.value * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    ElMessage.success('已开启自动刷新')
    startAutoRefresh()
  } else {
    ElMessage.info('已关闭自动刷新')
    stopAutoRefresh()
  }
}

// 编辑服务器
const handleEdit = () => {
  router.push(`/servers/${props.id}/edit`)
}

// 计算内存使用百分比
const calculateMemoryPercentage = (used, total) => {
  if (!used || !total || isNaN(used) || isNaN(total) || total === 0) return 0
  const percentage = (used / total) * 100
  return isNaN(percentage) ? 0 : Number(percentage.toFixed(1))
}

// 格式化函数
const format = (percentage) => {
  if (!percentage || isNaN(percentage)) return '0%'
  return `${Math.round(percentage)}%`
}

// 获取进度条颜色
const getProgressColor = (value) => {
  if (!value || isNaN(value)) return '#67C23A'
  if (value >= 90) return '#F56C6C'
  if (value >= 75) return '#E6A23C'
  return '#67C23A'
}

// 温度状态
const getTemperatureStatus = (temp) => {
  if (temp >= 85) return '温度过高'
  if (temp >= 75) return '温度偏高'
  return '温度正常'
}

const getTemperatureClass = (temp) => {
  if (temp >= 85) return 'temperature danger'
  if (temp >= 75) return 'temperature warning'
  return 'temperature normal'
}

// 功耗状态
const getPowerStatus = (power) => {
  if (power >= 300) return '功耗过高'
  if (power >= 250) return '功耗偏高'
  return '功耗正常'
}

const getPowerClass = (power) => {
  if (power >= 300) return 'power critical'
  if (power >= 250) return 'power high'
  return 'power normal'
}

// 格式化内存（修正后）
const formatMemory = (value) => {
  if (typeof value === 'string') {
    // 如果已经是带G/GB的字符串，直接返回
    if (value.endsWith('G') || value.endsWith('GB')) return value;
    if (!isNaN(Number(value))) value = Number(value);
    else return '0 GB';
  }
  if (value === undefined || value === null || isNaN(value)) return '0 GB';
  // 这里假设 value 单位为字节，转为GB
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

// 格式化磁盘空间
const formatDiskSpace = formatMemory;

// 格式化运行时间
const formatUptime = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  let result = ''
  if (days > 0) result += `${days}天`
  if (hours > 0 || days > 0) result += `${hours}小时`
  result += `${minutes}分钟`
  
  return result || '刚刚启动'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return new Date().toLocaleString()
  
  try {
    const date = new Date(time)
    return date.toLocaleString()
  } catch (e) {
    return new Date().toLocaleString()
  }
}

const getStatusType = (status) => {
  const statusMap = {
    'online': 'success',
    'offline': 'danger',
    'maintenance': 'warning',
    'waiting': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'online': '在线',
    'offline': '离线',
    'maintenance': '维护中',
    'waiting': '数据获取中'
  }
  return textMap[status] || status
}

// 手动被动采集
const handleAgentRefresh = async () => {
  if (agentRefreshing.value) return
  // 优先用数据库的 IP 字段
  let ip = serverDetail.value.ip_address || serverDetail.value.ip || serverInfo.value.ip_address || serverInfo.value.ip
  if (!ip) {
    ElMessage.error('无法获取服务器IP，无法触发agent采集')
    return
  }
  // 兼容IPv6和端口拼接
  let agentUrl = /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? `http://${ip}:5002` : `http://[${ip}]:5002`
  agentRefreshing.value = true
  try {
    await refreshAgent(agentUrl)
    ElMessage.success('已触发agent采集，正在刷新...')
    await fetchData()
  } catch (e) {
    ElMessage.error('触发agent采集失败: ' + (e.message || '未知错误'))
  } finally {
    agentRefreshing.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script> 