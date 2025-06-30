<template>
  <div class="gpu-list">
    <div class="header">
      <h2>全量GPU列表-index</h2>
    </div>
    <el-table :data="gpuList" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="temperature" label="温度" width="100">
        <template #default="{ row }">
          {{ row.temperature }}°C
        </template>
      </el-table-column>
      <el-table-column label="使用率" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.utilization || 0" :format="() => `${row.utilization || 0}%`" />
        </template>
      </el-table-column>
      <el-table-column label="显存使用率" width="220">
        <template #default="{ row }">
          <el-progress :percentage="calculateMemoryPercent(row.memory_used, row.memory_total)" :format="() => `${calculateMemoryPercent(row.memory_used, row.memory_total)}%`" />
          <span>{{ formatMemory(row.memory_used) }} / {{ formatMemory(row.memory_total) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功耗" width="100">
        <template #default="{ row }">
          {{ row.power_usage && row.power_usage > 0 ? row.power_usage + 'W' : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'normal' ? 'success' : 'warning'">
            {{ row.status === 'normal' ? '正常' : '警告' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleConfig(row)">配置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
      <div v-if="dialogType === 'view'">
        <el-tabs v-model="currentGpu.id" @tab-change="async (id) => { currentGpu.value = currentGpus.find(g => g.id === id); if(currentGpu.value){ const metrics = await getGpuMetrics(currentGpu.value.id); metricsData.value = metrics.data; await nextTick(); initChart(); } }">
          <el-tab-pane v-for="gpu in currentGpus" :key="gpu.id" :label="'GPU ' + gpu.id" :name="gpu.id">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ gpu.id }}</el-descriptions-item>
              <el-descriptions-item label="名称">{{ gpu.name }}</el-descriptions-item>
              <el-descriptions-item label="型号">{{ gpu.model }}</el-descriptions-item>
              <el-descriptions-item label="显存">{{ formatMemory(gpu.memory) }}</el-descriptions-item>
              <el-descriptions-item label="温度">{{ gpu.temperature }}°C</el-descriptions-item>
              <el-descriptions-item label="功耗">{{ gpu.power_usage }}W</el-descriptions-item>
            </el-descriptions>
            <div class="metrics-chart" v-if="metricsData.length > 0">
              <h3>使用率趋势</h3>
              <div ref="chartRef" style="height: 300px"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-else-if="dialogType === 'config'">
        <el-form :model="configForm" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="最大功耗" prop="maxPower">
            <el-input-number v-model="configForm.maxPower" :min="0" :max="500" />
          </el-form-item>
          <el-form-item label="温度阈值" prop="maxTemp">
            <el-input-number v-model="configForm.maxTemp" :min="0" :max="100" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="dialogType === 'config'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { getGpuList, getGpusByServer, updateGpuConfig, getGpuMetrics } from '@/api/gpu'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

export default {
  name: 'GpuList',
  setup() {
    const gpuList = ref([])
    const total = ref(0)
    const loading = ref(false)
    const dialogVisible = ref(false)
    const dialogType = ref('')
    const dialogTitle = ref('')
    const currentGpu = ref(null)
    const metricsData = ref([])
    const configForm = ref({
      maxPower: 0,
      maxTemp: 0
    })
    const rules = ref({
      maxPower: [{ required: true, message: '请输入最大功耗', trigger: 'blur' }],
      maxTemp: [{ required: true, message: '请输入温度阈值', trigger: 'blur' }]
    })
    const chart = ref(null)
    const formRef = ref(null)
    const chartRef = ref(null)
    const currentGpus = ref([])

    const formatMemory = (value) => {
      if (value === undefined || value === null || isNaN(value)) return '0.00 GB';
      // 数据库单位为MB，转为GB
      return (value / 1024).toFixed(2) + ' GB';
    }

    const calculateMemoryPercent = (used, total) => {
      if (!used || !total || isNaN(used) || isNaN(total) || total === 0) return 0;
      return ((used / total) * 100).toFixed(0);
    }

    const fetchGpuList = async () => {
      loading.value = true
      try {
        const res = await getGpuList()
        gpuList.value = (res.items || []).map(item => ({
          id: item.id,
          name: item.name || '',
          model: item.model || item.name || '',
          memory: (item.memory_used !== undefined && item.memory_total !== undefined)
            ? `${item.memory_used} / ${item.memory_total} MB`
            : '',
          temperature: item.temperature ?? '--',
          utilization: item.utilization ?? 0,
          power_usage: item.power_usage ?? 0,
          status: item.status || 'normal',
        }))
        total.value = res.total || 0
      } catch (e) {
        gpuList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    const handleView = async (row) => {
      dialogType.value = 'view'
      dialogTitle.value = 'GPU详情'
      dialogVisible.value = true
      try {
        // 通过server_id获取该服务器下的GPU列表
        const gpus = await getGpusByServer(row.server_id)
        currentGpus.value = Array.isArray(gpus) ? gpus : [gpus]
        // 默认选中第一个GPU
        if (currentGpus.value.length > 0) {
          currentGpu.value = currentGpus.value[0]
          const metrics = await getGpuMetrics(currentGpu.value.id)
          metricsData.value = metrics.data
          await nextTick()
          initChart()
        } else {
          currentGpu.value = null
          ElMessage.error('未找到该服务器的GPU信息')
        }
      } catch (error) {
        ElMessage.error('获取GPU详情失败')
      }
    }

    const handleConfig = async (row) => {
      dialogType.value = 'config'
      dialogTitle.value = 'GPU配置'
      try {
        const info = await getGpuInfo(row.id)
        currentGpu.value = info.data
        configForm.value.maxPower = currentGpu.value.maxPower
        configForm.value.maxTemp = currentGpu.value.maxTemp
        dialogVisible.value = true
      } catch (error) {
        ElMessage.error('获取GPU配置失败')
      }
    }

    const handleSubmit = () => {
      formRef.value?.validate(async valid => {
        if (valid) {
          try {
            await updateGpuConfig(currentGpu.value.id, configForm.value)
            ElMessage.success('配置更新成功')
            dialogVisible.value = false
            fetchGpuList()
          } catch (error) {
            ElMessage.error('更新GPU配置失败')
          }
        }
      })
    }

    const initChart = () => {
      if (!chart.value) {
        chart.value = echarts.init(chartRef.value)
      }
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'time',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          name: '使用率(%)',
          nameLocation: 'middle',
          nameGap: 30
        },
        series: [{
          name: 'GPU使用率',
          type: 'line',
          data: metricsData.value.map(item => [item.timestamp, item.usage]),
          smooth: true,
          areaStyle: {}
        }]
      }
      chart.value.setOption(option)
    }

    onMounted(() => {
      fetchGpuList()
    })

    return {
      gpuList,
      total,
      loading,
      dialogVisible,
      dialogType,
      dialogTitle,
      currentGpu,
      metricsData,
      configForm,
      rules,
      chart,
      formRef,
      chartRef,
      currentGpus,
      handleView,
      handleConfig,
      handleSubmit,
      initChart,
      formatMemory,
      calculateMemoryPercent
    }
  }
}
</script>

<style scoped>
.gpu-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.metrics-chart {
  margin-top: 20px;
}
</style>