<template>
  <div class="gpu-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>GPU详情</span>
        </div>
      </template>
      <div class="gpu-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="GPU ID">{{ gpuInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ gpuInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ gpuInfo.status }}</el-descriptions-item>
          <el-descriptions-item label="使用率">{{ gpuInfo.usage }}%</el-descriptions-item>
          <el-descriptions-item label="显存使用">{{ gpuInfo.memoryUsed }}/{{ gpuInfo.memoryTotal }}MB</el-descriptions-item>
          <el-descriptions-item label="温度">{{ gpuInfo.temperature }}°C</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getGpuInfo } from '@/api/gpu'

export default {
  name: 'GpuDetail',
  setup() {
    const route = useRoute()
    const gpuInfo = ref({})

    const fetchGpuInfo = async () => {
      try {
        const response = await getGpuInfo(route.params.id)
        gpuInfo.value = response.data
      } catch (error) {
        console.error('获取GPU信息失败:', error)
      }
    }

    onMounted(() => {
      fetchGpuInfo()
    })

    return {
      gpuInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.gpu-detail {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .gpu-info {
    margin-top: 20px;
  }
}
</style> 