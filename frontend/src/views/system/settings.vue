<template>
  <div class="settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <el-form ref="formRef" :model="settings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        
        <el-form-item label="数据刷新间隔">
          <el-input-number v-model="settings.refreshInterval" :min="30" :max="600" :step="30" />
          <span class="unit">秒</span>
        </el-form-item>
        
        <el-form-item label="告警通知">
          <el-switch v-model="settings.enableNotification" />
        </el-form-item>
        
        <el-form-item label="通知方式" v-if="settings.enableNotification">
          <el-checkbox-group v-model="settings.notificationMethods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="webhook">Webhook</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="数据保留期限">
          <el-select v-model="settings.dataRetention">
            <el-option label="7天" value="7" />
            <el-option label="15天" value="15" />
            <el-option label="30天" value="30" />
            <el-option label="90天" value="90" />
            <el-option label="永久" value="-1" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemSettings, updateSystemSettings } from '@/api/system'

const formRef = ref(null)
const settings = ref({
  systemName: 'GPU监控系统',
  refreshInterval: 60,
  enableNotification: false,
  notificationMethods: [],
  dataRetention: '30'
})

// 获取系统设置
const fetchSettings = async () => {
  try {
    const res = await getSystemSettings()
    settings.value = {
      systemName: res.system_name || 'GPU监控系统',
      refreshInterval: res.refresh_interval || 60,
      enableNotification: res.enable_notification || false,
      notificationMethods: res.notification_methods || [],
      dataRetention: res.data_retention || '30'
    }
  } catch (error) {
    console.error('获取系统设置失败:', error)
    ElMessage.error('获取系统设置失败')
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    await updateSystemSettings({
      system_name: settings.value.systemName,
      refresh_interval: settings.value.refreshInterval,
      enable_notification: settings.value.enableNotification,
      notification_methods: settings.value.notificationMethods,
      data_retention: settings.value.dataRetention
    })
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

// 重置设置
const resetSettings = () => {
  fetchSettings()
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  margin-left: 10px;
  color: #606266;
}
</style> 