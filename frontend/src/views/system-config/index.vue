<template>
  <div class="system-config">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 服务器配置 -->
        <el-tab-pane label="服务器配置" name="server">
          <el-form ref="serverForm" :model="serverConfig" :rules="serverRules" label-width="120px">
            <el-form-item label="SSH默认端口" prop="ssh_port">
              <el-input-number v-model="serverConfig.ssh_port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="SSH超时时间(秒)" prop="ssh_timeout">
              <el-input-number v-model="serverConfig.ssh_timeout" :min="1" :max="60" />
            </el-form-item>
            <el-form-item label="监控间隔(秒)" prop="monitor_interval">
              <el-input-number v-model="serverConfig.monitor_interval" :min="5" :max="3600" />
            </el-form-item>
            <el-form-item label="数据保留天数" prop="data_retention_days">
              <el-input-number v-model="serverConfig.data_retention_days" :min="1" :max="365" />
            </el-form-item>
            <el-form-item label="默认用户名" prop="default_username">
              <el-input v-model="serverConfig.default_username" />
            </el-form-item>
            <el-form-item label="默认密码" prop="default_password">
              <el-input v-model="serverConfig.default_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="默认私钥" prop="default_private_key">
              <el-input type="textarea" v-model="serverConfig.default_private_key" :rows="4" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Grafana配置 -->
        <el-tab-pane label="Grafana配置" name="grafana">
          <el-form ref="grafanaForm" :model="grafanaConfig" :rules="grafanaRules" label-width="120px">
            <el-form-item label="Grafana地址" prop="url">
              <el-input v-model="grafanaConfig.url" placeholder="http://localhost:3000" />
            </el-form-item>
            <el-form-item label="Grafana端口" prop="port">
              <el-input-number v-model="grafanaConfig.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="Grafana用户名" prop="username">
              <el-input v-model="grafanaConfig.username" />
            </el-form-item>
            <el-form-item label="Grafana密码" prop="password">
              <el-input v-model="grafanaConfig.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="API密钥" prop="api_key">
              <el-input v-model="grafanaConfig.api_key" type="password" show-password />
            </el-form-item>
            <el-form-item label="默认仪表板" prop="default_dashboard">
              <el-input v-model="grafanaConfig.default_dashboard" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTestGrafana">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 告警配置 -->
        <el-tab-pane label="告警配置" name="alert">
          <el-form ref="alertForm" :model="alertConfig" :rules="alertRules" label-width="120px">
            <el-form-item label="邮件服务器" prop="smtp_server">
              <el-input v-model="alertConfig.smtp_server" />
            </el-form-item>
            <el-form-item label="邮件端口" prop="smtp_port">
              <el-input-number v-model="alertConfig.smtp_port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="邮件用户名" prop="smtp_username">
              <el-input v-model="alertConfig.smtp_username" />
            </el-form-item>
            <el-form-item label="邮件密码" prop="smtp_password">
              <el-input v-model="alertConfig.smtp_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="sender_email">
              <el-input v-model="alertConfig.sender_email" />
            </el-form-item>
            <el-form-item label="告警接收人" prop="alert_receivers">
              <el-select
                v-model="alertConfig.alert_receivers"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请输入邮箱地址"
              >
                <el-option
                  v-for="item in alertConfig.alert_receivers"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="告警级别" prop="alert_levels">
              <el-checkbox-group v-model="alertConfig.alert_levels">
                <el-checkbox label="critical">严重</el-checkbox>
                <el-checkbox label="warning">警告</el-checkbox>
                <el-checkbox label="info">信息</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="告警方式" prop="notification_methods">
              <el-checkbox-group v-model="alertConfig.notification_methods">
                <el-checkbox label="email">邮件</el-checkbox>
                <el-checkbox label="webhook">Webhook</el-checkbox>
                <el-checkbox label="dingtalk">钉钉</el-checkbox>
                <el-checkbox label="wechat">企业微信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 系统日志 -->
        <el-tab-pane label="系统日志" name="logs">
          <div class="log-header">
            <el-button type="danger" @click="clearLogs">清理日志</el-button>
            <el-button type="primary" @click="refreshLogs">刷新</el-button>
          </div>
          <el-table :data="logs" style="width: 100%" height="400">
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="scope">
                <el-tag :type="getLogLevelType(scope.row.level)">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="message" label="消息" />
          </el-table>
          <div class="pagination">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSystemConfig,
  updateSystemConfig,
  testGrafanaConnection,
  getSystemLogs,
  clearSystemLogs
} from '@/api/system-config'

// 当前激活的标签页
const activeTab = ref('server')

// 服务器配置
const serverConfig = reactive({
  ssh_port: 22,
  ssh_timeout: 10,
  monitor_interval: 60,
  data_retention_days: 30,
  default_username: '',
  default_password: '',
  default_private_key: ''
})

// Grafana配置
const grafanaConfig = reactive({
  url: '',
  port: 3000,
  username: '',
  password: '',
  api_key: '',
  default_dashboard: ''
})

// 告警配置
const alertConfig = reactive({
  smtp_server: '',
  smtp_port: 465,
  smtp_username: '',
  smtp_password: '',
  sender_email: '',
  alert_receivers: [],
  alert_levels: ['critical', 'warning'],
  notification_methods: ['email']
})

// 表单验证规则
const serverRules = {
  ssh_port: [{ required: true, message: '请输入SSH端口', trigger: 'blur' }],
  ssh_timeout: [{ required: true, message: '请输入SSH超时时间', trigger: 'blur' }],
  monitor_interval: [{ required: true, message: '请输入监控间隔', trigger: 'blur' }],
  data_retention_days: [{ required: true, message: '请输入数据保留天数', trigger: 'blur' }]
}

const grafanaRules = {
  url: [{ required: true, message: '请输入Grafana地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入Grafana端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入Grafana用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入Grafana密码', trigger: 'blur' }]
}

const alertRules = {
  smtp_server: [{ required: true, message: '请输入邮件服务器地址', trigger: 'blur' }],
  smtp_port: [{ required: true, message: '请输入邮件服务器端口', trigger: 'blur' }],
  smtp_username: [{ required: true, message: '请输入邮件用户名', trigger: 'blur' }],
  smtp_password: [{ required: true, message: '请输入邮件密码', trigger: 'blur' }],
  sender_email: [{ required: true, message: '请输入发件人邮箱', trigger: 'blur' }],
  alert_receivers: [{ required: true, message: '请选择告警接收人', trigger: 'change' }]
}

// 系统日志
const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 获取系统配置
const fetchConfig = async () => {
  try {
    const res = await getSystemConfig()
    Object.assign(serverConfig, res.server_config)
    Object.assign(grafanaConfig, res.grafana_config)
    Object.assign(alertConfig, res.alert_config)
  } catch (error) {
    ElMessage.error('获取系统配置失败')
  }
}

// 保存系统配置
const handleSave = async () => {
  try {
    await updateSystemConfig({
      server_config: serverConfig,
      grafana_config: grafanaConfig,
      alert_config: alertConfig
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 测试Grafana连接
const handleTestGrafana = async () => {
  try {
    await testGrafanaConnection(grafanaConfig)
    ElMessage.success('连接测试成功')
  } catch (error) {
    ElMessage.error('连接测试失败')
  }
}

// 获取系统日志
const fetchLogs = async () => {
  try {
    const res = await getSystemLogs({
      page: currentPage.value,
      size: pageSize.value
    })
    logs.value = res.logs
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取系统日志失败')
  }
}

// 清理系统日志
const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有系统日志吗?', '提示', {
      type: 'warning'
    })
    await clearSystemLogs()
    ElMessage.success('清理成功')
    fetchLogs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  }
}

// 刷新日志
const refreshLogs = () => {
  fetchLogs()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogs()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogs()
}

// 获取日志级别对应的标签类型
const getLogLevelType = (level) => {
  const types = {
    ERROR: 'danger',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: ''
  }
  return types[level.toUpperCase()] || ''
}

onMounted(() => {
  fetchConfig()
  fetchLogs()
})
</script>

<style scoped>
.system-config {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>