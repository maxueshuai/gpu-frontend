<template>
  <div class="alert-configs-container">
    <el-card class="alert-configs-card">
      <template #header>
        <div class="card-header">
          <h2 class="header-title">
            <el-icon><Bell /></el-icon>
            告警配置管理
          </h2>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加配置
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="configList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.type)">
              {{ getAlertTypeText(row.type, row.resource) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="100">
          <template #default="{ row }">
            {{ formatThreshold(row.type, row.threshold) }}
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通知方式" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="method in row.notification_methods"
              :key="method"
              class="notification-tag"
              size="small"
            >
              {{ getNotificationMethodText(method) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加告警配置' : '编辑告警配置'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入告警配置名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入告警配置描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="服务器" prop="server_id">
          <el-select v-model="form.server_id" placeholder="请选择服务器">
            <el-option label="全部服务器" :value="null" />
            <el-option v-for="srv in serverList" :key="srv.id" :label="srv.name" :value="srv.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型" prop="resource">
          <el-select v-model="form.resource" placeholder="请选择资源类型">
            <el-option label="CPU" value="cpu" />
            <el-option label="内存" value="memory" />
            <el-option label="磁盘" value="disk" />
            <el-option label="GPU" value="gpu" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测项" prop="type">
          <el-select v-model="form.type" placeholder="请选择检测项" :disabled="!form.resource">
            <el-option v-for="item in typeOptions[form.resource] || []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值" prop="threshold">
          <el-input-number
            v-model="form.threshold"
            :min="0"
            :max="100"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch
            v-model="form.enabled"
            :active-text="form.enabled ? '启用' : '禁用'"
            inline-prompt
          />
        </el-form-item>
        <el-form-item label="通知方式" prop="notification_methods">
          <el-select
            v-model="form.notification_methods"
            multiple
            placeholder="请选择通知方式"
            style="width: 100%"
          >
            <el-option
              v-for="item in notificationMethods"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="接收人" prop="recipients">
          <el-select
            v-model="form.recipients"
            multiple
            filterable
            allow-create
            placeholder="请输入接收人邮箱"
            style="width: 100%"
          >
            <el-option
              v-for="item in recipientOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.resource === 'disk'" label="磁盘挂载点" prop="disk_mount">
          <el-select v-model="form.disk_mount" multiple filterable allow-create placeholder="请输入或选择挂载点">
            <el-option v-for="mount in diskMountOptions" :key="mount" :label="mount" :value="mount" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测周期(秒)" prop="check_interval">
          <el-input-number v-model="form.check_interval" :min="10" :max="86400" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { 
  getAlertConfigs, 
  createAlertConfig, 
  updateAlertConfig, 
  deleteAlertConfig 
} from '@/api/alert'
import { getServerList } from '@/api/servers'

// 数据加载状态
const loading = ref(false)
const submitting = ref(false)

// 配置列表数据
const configList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const currentId = ref(null)

// 表单相关
const defaultForm = {
  name: '',
  description: '',
  resource: '',
  type: '',
  threshold: 80,
  enabled: true,
  notification_methods: ['email'],
  recipients: [],
  server_id: null,
  check_interval: 300,
  disk_mount: ''
}
const formRef = ref(null)
const form = ref({ ...defaultForm })

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入告警配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择告警类型', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请设置告警阈值', trigger: 'blur' }
  ],
  notification_methods: [
    { required: true, message: '请选择至少一种通知方式', trigger: 'change' }
  ]
}

// 告警类型选项
const alertTypes = [
  { label: 'GPU温度', value: 'gpu_temp' },
  { label: 'GPU使用率', value: 'gpu_usage' },
  { label: '显存使用率', value: 'memory_usage' }
]

// 通知方式选项
const notificationMethods = [
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: 'Webhook', value: 'webhook' }
]

// 接收人选项（可以从后端获取或本地存储）
const recipientOptions = ref([])

// 获取告警配置列表
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getAlertConfigs()
    configList.value = response.items || []
  } catch (error) {
    console.error('获取告警配置失败:', error)
    ElMessage.error('获取告警配置失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const handleAdd = () => {
  dialogType.value = 'add'
  currentId.value = null
  form.value = { ...defaultForm }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentId.value = row.id
  form.value = { ...defaultForm, ...row }
  // 类型兜底
  form.value.notification_methods = Array.isArray(row.notification_methods) ? row.notification_methods : []
  form.value.recipients = Array.isArray(row.recipients) ? row.recipients : []
  // 兜底：如果type不在typeOptions[form.value.resource]，则补充
  if (
    form.value.resource &&
    form.value.type &&
    !typeOptions[form.value.resource]?.some(item => item.value === form.value.type)
  ) {
    typeOptions[form.value.resource] = [
      ...(typeOptions[form.value.resource] || []),
      { label: getAlertTypeText(form.value.type, form.value.resource), value: form.value.type }
    ]
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个告警配置吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteAlertConfig(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除告警配置失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    if (dialogType.value === 'add') {
      await createAlertConfig(form.value)
      ElMessage.success('添加成功')
    } else {
      await updateAlertConfig(currentId.value, form.value)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 格式化告警类型显示
const getAlertTypeText = (type, resource) => {
  if (type === 'memory_usage') {
    if (resource === 'gpu') return '显存使用率'
    if (resource === 'memory') return '内存使用率'
  }
  const typeMap = {
    'gpu_temp': 'GPU温度',
    'gpu_usage': 'GPU使用率',
    'cpu_usage': 'CPU使用率',
    'disk_usage': '磁盘使用率'
  }
  return typeMap[type] || type
}

// 获取告警类型标签样式
const getAlertTypeTag = (type) => {
  const typeMap = {
    'gpu_temp': 'danger',
    'gpu_usage': 'warning',
    'memory_usage': 'info',
    'cpu_usage': 'primary',
    'disk_usage': 'success'
  }
  return typeMap[type] || ''
}

// 格式化阈值显示
const formatThreshold = (type, threshold) => {
  if (type === 'gpu_temp') {
    return `${threshold}°C`
  }
  return `${threshold}%`
}

// 格式化通知方式显示
const getNotificationMethodText = (method) => {
  const methodMap = {
    'email': '邮件',
    'sms': '短信',
    'webhook': 'Webhook'
  }
  return methodMap[method] || method
}

const serverList = ref([])
const typeOptions = {
  cpu: [{ label: 'CPU使用率', value: 'cpu_usage' }],
  memory: [{ label: '内存使用率', value: 'memory_usage' }],
  disk: [{ label: '磁盘使用率', value: 'disk_usage' }],
  gpu: [
    { label: 'GPU使用率', value: 'gpu_usage' },
    { label: 'GPU温度', value: 'gpu_temp' },
    { label: '显存使用率', value: 'memory_usage' }
  ]
}

onMounted(async () => {
  fetchData()
  const res = await getServerList()
  serverList.value = res.items || []
})
</script>

<style lang="scss" scoped>
.alert-configs-container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: #f5f7fa;
  
  .alert-configs-card {
    height: 100%;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-title {
        margin: 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  .notification-tag {
    margin-right: 4px;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.dialog-footer {
  padding-top: 16px;
  text-align: right;
}
</style>