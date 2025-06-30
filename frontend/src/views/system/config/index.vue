<template>
  <div class="system-config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" @click="handleSave" :loading="loading">保存配置</el-button>
        </div>
      </template>
      <el-form :model="configForm" label-width="120px" v-loading="loading">
        <el-form-item label="系统名称">
          <el-input v-model="configForm.system_name" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="GPU监控间隔">
          <el-input-number v-model="configForm.monitor_interval" :min="1" :max="60" placeholder="请输入监控间隔（分钟）" />
        </el-form-item>
        <el-form-item label="告警阈值">
          <el-input-number v-model="configForm.alert_threshold" :min="0" :max="100" placeholder="请输入GPU使用率告警阈值" />
        </el-form-item>
        <el-form-item label="日志保留天数">
          <el-input-number v-model="configForm.log_retention_days" :min="1" :max="365" placeholder="请输入日志保留天数" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig } from '@/api/system'

const loading = ref(false)
const configForm = ref({
  system_name: '',
  monitor_interval: 5,
  alert_threshold: 80,
  log_retention_days: 30
})

// 获取配置
const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await getSystemConfig()
    if (res && (res.data || res)) {
      const data = res.data || res
      configForm.value = data
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
    ElMessage.error('获取系统配置失败')
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  loading.value = true
  try {
    await updateSystemConfig(configForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存系统配置失败:', error)
    ElMessage.error('保存系统配置失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.system-config-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>