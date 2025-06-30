<template>
  <div class="server-detail">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>服务器详情</span>
        <div>
          <v-btn color="primary" class="mr-2" @click="refreshData">
            <v-icon left>mdi-refresh</v-icon>刷新
          </v-btn>
          <v-btn text color="grey" @click="$router.push('/dashboard/servers')">
            <v-icon left>mdi-arrow-left</v-icon>返回
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>基本信息</v-card-title>
              <v-card-text>
                <v-skeleton-loader v-if="loading" type="list-item-three-line" />
                <v-list v-else dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">主机名/IP</v-list-item-subtitle>
                      <v-list-item-title>{{ server.hostname }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">用户名</v-list-item-subtitle>
                      <v-list-item-title>{{ server.username }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">SSH端口</v-list-item-subtitle>
                      <v-list-item-title>{{ server.port }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">状态</v-list-item-subtitle>
                      <v-list-item-title>
                        <v-chip :color="getStatusColor(systemInfo.status)" small>
                          {{ getStatusText(systemInfo.status) }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">添加时间</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(server.created_at) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">描述</v-list-item-subtitle>
                      <v-list-item-title>{{ server.description || '无' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>系统信息</v-card-title>
              <v-card-text>
                <v-skeleton-loader v-if="loadingSystem" type="list-item-three-line" />
                <v-alert v-else-if="systemError" type="error" text>{{ systemError }}</v-alert>
                <v-list v-else dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">操作系统</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.os || 'N/A' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">内核版本</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.kernel || 'N/A' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">CPU</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.cpu || 'N/A' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">内存</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.memory || 'N/A' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption">磁盘空间</v-list-item-subtitle>
                      <v-list-item-title>
                        <template v-if="Array.isArray(systemInfo.disks)">
                          <div v-for="disk in systemInfo.disks" :key="disk.mountpoint">
                            <span>{{ disk.mountpoint }}：</span>
                            <span>{{ (disk.used / 1024 / 1024 / 1024).toFixed(2) }}GB / {{ (disk.total / 1024 / 1024 / 1024).toFixed(2) }}GB</span>
                            <span>（{{ disk.percent }}%）</span>
                          </div>
                        </template>
                        <template v-else>
                          {{ systemInfo.disk || 'N/A' }}
                        </template>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card outlined class="mt-4">
          <v-card-title>GPU信息</v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingGpu" type="table" />
            <v-alert v-else-if="gpuError" type="error" text>{{ gpuError }}</v-alert>
            <div v-else-if="!gpuInfo.length" class="text-center pa-4">
              未检测到GPU设备
            </div>
            <v-data-table
              v-else
              :headers="gpuHeaders"
              :items="gpuInfo"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.memory="{ item }">
                <v-progress-linear
                  :value="item.memory_usage_percent"
                  :color="getMemoryColor(item.memory_usage_percent)"
                  height="20"
                >
                  <span>{{ item.memory_used }} / {{ item.memory_total }}</span>
                </v-progress-linear>
              </template>
              <template v-slot:item.utilization="{ item }">
                <v-progress-linear
                  :value="item.utilization"
                  :color="getUtilizationColor(item.utilization)"
                  height="20"
                >
                  <span>{{ item.utilization }}%</span>
                </v-progress-linear>
              </template>
              <template v-slot:item.temperature="{ item }">
                <v-chip
                  :color="getTemperatureColor(item.temperature)"
                  small
                >
                  {{ item.temperature }}°C
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getServerDetail, getServerGpuInfo, getServerSystemInfo } from '@/api/server'

export default {
  name: 'ServerDetail',
  setup() {
    const route = useRoute()
    const serverId = computed(() => route.params.id)
    
    const server = ref({})
    const systemInfo = ref({})
    const gpuInfo = ref([])
    
    const loading = ref(true)
    const loadingSystem = ref(true)
    const loadingGpu = ref(true)
    
    const systemError = ref('')
    const gpuError = ref('')
    
    const gpuHeaders = [
      { text: 'GPU ID', value: 'index' },
      { text: '名称', value: 'name' },
      { text: '内存使用', value: 'memory' },
      { text: '使用率', value: 'utilization' },
      { text: '温度', value: 'temperature' },
      { text: '功耗', value: 'power' },
    ]
    
    // 加载服务器基本信息
    const loadServerInfo = async () => {
      loading.value = true
      try {
        const res = await getServerDetail(serverId.value)
        server.value = res.data
      } catch (error) {
        console.error('加载服务器信息失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 加载服务器系统信息
    const loadSystemInfo = async () => {
      loadingSystem.value = true
      systemError.value = ''
      try {
        const res = await getServerSystemInfo(serverId.value)
        systemInfo.value = res.data
        // 兼容磁盘数组
        if (res.data.disk_info) {
          // 只保留/和/workspace，且/workspace与/不同盘才显示
          let disks = []
          const rootDisk = res.data.disk_info.find(d => d.mountpoint === '/')
          const workspaceDisk = res.data.disk_info.find(d => d.mountpoint === '/workspace')
          if (rootDisk) disks.push(rootDisk)
          if (workspaceDisk && (!rootDisk || workspaceDisk.device !== rootDisk.device)) disks.push(workspaceDisk)
          systemInfo.value.disks = disks
        }
      } catch (error) {
        console.error('加载系统信息失败:', error)
        systemError.value = '无法获取系统信息，请检查服务器连接状态'
      } finally {
        loadingSystem.value = false
      }
    }
    
    // 加载GPU信息
    const loadGpuInfo = async () => {
      loadingGpu.value = true
      gpuError.value = ''
      try {
        const res = await getServerGpuInfo(serverId.value)
        gpuInfo.value = res.data
      } catch (error) {
        console.error('加载GPU信息失败:', error)
        gpuError.value = '无法获取GPU信息，请检查服务器连接状态'
      } finally {
        loadingGpu.value = false
      }
    }
    
    // 刷新所有数据
    const refreshData = () => {
      loadServerInfo()
      loadSystemInfo()
      loadGpuInfo()
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString()
    }
    
    // 获取状态颜色
    const getStatusColor = (status) => {
      const statusMap = {
        'online': 'success',
        'offline': 'error',
        'unknown': 'grey'
      }
      return statusMap[status] || 'grey'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'unknown': '未知'
      }
      return statusMap[status] || '未知'
    }
    
    // 获取内存使用颜色
    const getMemoryColor = (percent) => {
      if (percent < 50) return 'success'
      if (percent < 80) return 'warning'
      return 'error'
    }
    
    // 获取使用率颜色
    const getUtilizationColor = (percent) => {
      if (percent < 50) return 'success'
      if (percent < 80) return 'warning'
      return 'error'
    }
    
    // 获取温度颜色
    const getTemperatureColor = (temp) => {
      if (temp < 60) return 'success'
      if (temp < 80) return 'warning'
      return 'error'
    }
    
    onMounted(() => {
      refreshData()
    })
    
    return {
      server,
      systemInfo,
      gpuInfo,
      loading,
      loadingSystem,
      loadingGpu,
      systemError,
      gpuError,
      gpuHeaders,
      refreshData,
      formatDate,
      getStatusColor,
      getStatusText,
      getMemoryColor,
      getUtilizationColor,
      getTemperatureColor
    }
  }
}
</script>

<style scoped>
.server-detail {
  padding: 16px;
}
</style> 