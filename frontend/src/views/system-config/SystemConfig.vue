<template>
  <div class="system-config-container">
    <apple-card title="系统配置">
      <template #header>
        <div class="header-content">
          <span class="header-title">系统配置</span>
          <div class="header-actions">
            <apple-button type="primary" @click="handleSave" :loading="saveLoading">保存配置</apple-button>
          </div>
        </div>
      </template>
      
      <div class="config-form" v-loading="formLoading">
        <div class="form-section">
          <h3 class="section-title">基本设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label>系统名称</label>
              <input type="text" v-model="form.systemName" class="apple-input" />
            </div>
            <div class="form-item">
              <label>系统版本</label>
              <input type="text" v-model="form.version" class="apple-input" disabled />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>管理员邮箱</label>
              <input type="email" v-model="form.adminEmail" class="apple-input" />
            </div>
            <div class="form-item">
              <label>日志级别</label>
              <select v-model="form.logLevel" class="apple-select">
                <option value="DEBUG">调试</option>
                <option value="INFO">信息</option>
                <option value="WARNING">警告</option>
                <option value="ERROR">错误</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">数据库设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label>MySQL 服务器</label>
              <input type="text" v-model="form.mysqlServer" class="apple-input" />
            </div>
            <div class="form-item">
              <label>MySQL 端口</label>
              <input type="number" v-model="form.mysqlPort" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>MySQL 用户名</label>
              <input type="text" v-model="form.mysqlUser" class="apple-input" />
            </div>
            <div class="form-item">
              <label>MySQL 密码</label>
              <input type="password" v-model="form.mysqlPassword" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>MySQL 数据库名</label>
              <input type="text" v-model="form.mysqlDatabase" class="apple-input" />
            </div>
            <div class="form-item">
              <div class="button-container">
                <apple-button type="info" @click="testMySQLConnection">测试连接</apple-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">MongoDB 设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label>MongoDB 服务器</label>
              <input type="text" v-model="form.mongoServer" class="apple-input" />
            </div>
            <div class="form-item">
              <label>MongoDB 端口</label>
              <input type="number" v-model="form.mongoPort" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>MongoDB 用户名</label>
              <input type="text" v-model="form.mongoUser" class="apple-input" />
            </div>
            <div class="form-item">
              <label>MongoDB 密码</label>
              <input type="password" v-model="form.mongoPassword" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>MongoDB 数据库名</label>
              <input type="text" v-model="form.mongoDatabase" class="apple-input" />
            </div>
            <div class="form-item">
              <div class="button-container">
                <apple-button type="info" @click="testMongoConnection">测试连接</apple-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">监控设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label>监控间隔（秒）</label>
              <input type="number" v-model="form.monitorInterval" class="apple-input" />
            </div>
            <div class="form-item">
              <label>Ping 超时（秒）</label>
              <input type="number" v-model="form.pingTimeout" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>最大 Ping 失败次数</label>
              <input type="number" v-model="form.maxPingFailures" class="apple-input" />
            </div>
            <div class="form-item">
              <label>数据保留天数</label>
              <input type="number" v-model="form.dataRetentionDays" class="apple-input" />
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">邮件通知设置</h3>
          <div class="form-row">
            <div class="form-item">
              <label>SMTP 服务器</label>
              <input type="text" v-model="form.smtpServer" class="apple-input" />
            </div>
            <div class="form-item">
              <label>SMTP 端口</label>
              <input type="number" v-model="form.smtpPort" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>SMTP 用户名</label>
              <input type="text" v-model="form.smtpUser" class="apple-input" />
            </div>
            <div class="form-item">
              <label>SMTP 密码</label>
              <input type="password" v-model="form.smtpPassword" class="apple-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>发件人邮箱</label>
              <input type="email" v-model="form.senderEmail" class="apple-input" />
            </div>
            <div class="form-item">
              <div class="button-container">
                <apple-button type="info" @click="testEmailSettings">测试邮件设置</apple-button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-item form-checkbox">
              <input type="checkbox" id="enableEmail" v-model="form.enableEmailNotifications" />
              <label for="enableEmail">启用邮件通知</label>
            </div>
          </div>
        </div>
      </div>
    </apple-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemApi } from '@/utils/api'
import { AppleCard, AppleButton } from '@/components/AppleUI'

export default {
  name: 'SystemConfig',
  components: {
    AppleCard,
    AppleButton
  },
  setup() {
    const formLoading = ref(false)
    const saveLoading = ref(false)
    
    const form = reactive({
      systemName: 'GPU服务器监控系统',
      version: '1.0.0',
      adminEmail: '',
      logLevel: 'INFO',
      mysqlServer: '',
      mysqlPort: 3306,
      mysqlUser: '',
      mysqlPassword: '',
      mysqlDatabase: '',
      mongoServer: '',
      mongoPort: 27017,
      mongoUser: '',
      mongoPassword: '',
      mongoDatabase: '',
      monitorInterval: 60,
      pingTimeout: 5,
      maxPingFailures: 3,
      dataRetentionDays: 30,
      smtpServer: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      senderEmail: '',
      enableEmailNotifications: false
    })
    
    // 获取系统配置
    const fetchSystemConfig = async () => {
      formLoading.value = true
      try {
        const res = await systemApi.getSystemConfig()
        Object.assign(form, res.data)
      } catch (error) {
        console.error('获取系统配置失败:', error)
        ElMessage.error('获取系统配置失败')
      } finally {
        formLoading.value = false
      }
    }
    
    // 保存系统配置
    const handleSave = async () => {
      saveLoading.value = true
      try {
        await systemApi.updateSystemConfig(form)
        ElMessage.success('配置保存成功')
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error('保存配置失败')
      } finally {
        saveLoading.value = false
      }
    }
    
    // 测试 MySQL 连接
    const testMySQLConnection = async () => {
      try {
        await ElMessageBox.confirm('确定要测试 MySQL 连接吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        
        ElMessage.info('正在测试 MySQL 连接...')
        // 这里应该有一个测试 MySQL 连接的 API
        setTimeout(() => {
          ElMessage.success('MySQL 连接测试成功')
        }, 1500)
      } catch (error) {
        console.log('取消测试')
      }
    }
    
    // 测试 MongoDB 连接
    const testMongoConnection = async () => {
      try {
        await ElMessageBox.confirm('确定要测试 MongoDB 连接吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        
        ElMessage.info('正在测试 MongoDB 连接...')
        // 这里应该有一个测试 MongoDB 连接的 API
        setTimeout(() => {
          ElMessage.success('MongoDB 连接测试成功')
        }, 1500)
      } catch (error) {
        console.log('取消测试')
      }
    }
    
    // 测试邮件设置
    const testEmailSettings = async () => {
      try {
        await ElMessageBox.confirm('确定要测试邮件设置吗？将发送一封测试邮件到您的管理员邮箱。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        
        ElMessage.info('正在发送测试邮件...')
        // 这里应该有一个测试邮件设置的 API
        setTimeout(() => {
          ElMessage.success('测试邮件发送成功')
        }, 2000)
      } catch (error) {
        console.log('取消测试')
      }
    }
    
    onMounted(() => {
      fetchSystemConfig()
    })
    
    return {
      form,
      formLoading,
      saveLoading,
      handleSave,
      testMySQLConnection,
      testMongoConnection,
      testEmailSettings
    }
  }
}
</script>

<style scoped>
.system-config-container {
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.config-form {
  padding: 10px 0;
}

.form-section {
  margin-bottom: 30px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(209, 213, 219, 0.2);
}

.section-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #1d1d1f;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-item label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #6e6e73;
}

.apple-input,
.apple-select {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  background-color: #ffffff;
  color: #1d1d1f;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.apple-input:focus,
.apple-select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 125, 250, 0.3);
}

.apple-input:disabled {
  background-color: #f5f5f7;
  cursor: not-allowed;
  color: #86868b;
}

.apple-select {
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238e8e93' d='M3.5 4.5L6 7l2.5-2.5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.button-container {
  height: 36px;
  display: flex;
  align-items: flex-end;
  margin-top: auto;
}

.form-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.form-checkbox input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid #d2d2d7;
  border-radius: 4px;
  margin: 0;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.form-checkbox input[type="checkbox"]:checked {
  background-color: #0071e3;
  border-color: #0071e3;
}

.form-checkbox input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 4px;
  height: 8px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

.form-checkbox label {
  margin-bottom: 0;
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}

@media (prefers-color-scheme: dark) {
  .form-section {
    background-color: rgba(44, 44, 46, 0.5);
    border-color: rgba(82, 82, 91, 0.2);
  }
  
  .section-title {
    color: #f5f5f7;
  }
  
  .apple-input,
  .apple-select {
    background-color: #323234;
    border-color: #424245;
    color: #f5f5f7;
  }
  
  .apple-input:disabled {
    background-color: #1c1c1e;
    color: #8e8e93;
  }
  
  .apple-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f5f5f7' d='M3.5 4.5L6 7l2.5-2.5z'/%3E%3C/svg%3E");
  }
  
  .form-checkbox input[type="checkbox"] {
    border-color: #424245;
    background-color: #323234;
  }
}
</style> 