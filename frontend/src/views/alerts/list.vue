<template>
  <div class="alerts-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="left">
            <h3>告警列表</h3>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新建告警
            </el-button>
          </div>
          <div class="right">
            <el-input
              v-model="searchQuery"
              placeholder="搜索告警"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="alerts"
        style="width: 100%"
      >
        <el-table-column prop="message" label="告警信息" min-width="200" />
        <el-table-column prop="type" label="告警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.type)">
              {{ getAlertTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="监控目标" min-width="150">
          <template #default="{ row }">
            <span v-if="row.server_id">服务器 #{{ row.server_id }}</span>
            <span v-else-if="row.gpu_id">GPU #{{ row.gpu_id }}</span>
            <span v-else-if="row.business_id">业务 #{{ row.business_id }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="告警条件" min-width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 告警表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建告警' : '编辑告警'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="告警名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入告警名称" />
        </el-form-item>

        <el-form-item label="告警类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择告警类型">
            <el-option label="GPU使用率" value="gpu_usage" />
            <el-option label="显存使用率" value="gpu_memory" />
            <el-option label="CPU使用率" value="cpu_usage" />
            <el-option label="内存使用率" value="memory_usage" />
          </el-select>
        </el-form-item>

        <el-form-item label="监控目标" prop="target_id">
          <el-select
            v-model="form.target_id"
            placeholder="请选择监控目标"
            @change="handleTargetChange"
          >
            <el-option
              v-for="target in targetList"
              :key="target.id"
              :label="target.name"
              :value="target.id"
            >
              <span>{{ target.name }}</span>
              <span class="target-info">
                ({{ target.type }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="告警条件" required>
          <div class="condition-container">
            <el-select v-model="form.metric" placeholder="指标">
              <el-option
                v-for="metric in metricOptions"
                :key="metric.value"
                :label="metric.label"
                :value="metric.value"
              />
            </el-select>
            <el-select v-model="form.operator" placeholder="运算符">
              <el-option label="大于" value=">" />
              <el-option label="小于" value="<" />
              <el-option label="等于" value="=" />
              <el-option label="大于等于" value=">=" />
              <el-option label="小于等于" value="<=" />
            </el-select>
            <el-input-number
              v-model="form.threshold"
              :min="0"
              :max="100"
              :step="1"
              placeholder="阈值"
            />
            <el-select v-model="form.unit" placeholder="单位">
              <el-option label="%" value="%" />
              <el-option label="GB" value="GB" />
              <el-option label="MB" value="MB" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="告警级别" prop="level">
          <el-select v-model="form.level" placeholder="请选择告警级别">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知方式" prop="notify_methods">
          <el-select
            v-model="form.notify_methods"
            multiple
            placeholder="请选择通知方式"
          >
            <el-option label="邮件" value="email" />
            <el-option label="短信" value="sms" />
            <el-option label="Webhook" value="webhook" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知接收人" prop="notify_users">
          <el-select
            v-model="form.notify_users"
            multiple
            placeholder="请选择通知接收人"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入告警描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import {
  getAlertList,
  createAlert,
  updateAlert,
  deleteAlert
} from '@/api/alerts'
import { getServerList } from '@/api/server'
import { getUserList } from '@/api/user'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const alerts = ref([])
const targetList = ref([])
const userList = ref([])
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  type: '',
  target_id: '',
  metric: '',
  operator: '',
  threshold: 0,
  unit: '%',
  level: 'medium',
  notify_methods: [],
  notify_users: [],
  description: ''
})

// 指标选项
const metricOptions = [
  { label: 'GPU使用率', value: 'gpu_usage' },
  { label: '显存使用率', value: 'gpu_memory' },
  { label: 'CPU使用率', value: 'cpu_usage' },
  { label: '内存使用率', value: 'memory_usage' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入告警名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择告警类型', trigger: 'change' }
  ],
  target_id: [
    { required: true, message: '请选择监控目标', trigger: 'change' }
  ],
  metric: [
    { required: true, message: '请选择指标', trigger: 'change' }
  ],
  operator: [
    { required: true, message: '请选择运算符', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ],
  notify_methods: [
    { required: true, message: '请选择通知方式', trigger: 'change' }
  ],
  notify_users: [
    { required: true, message: '请选择通知接收人', trigger: 'change' }
  ]
}

// 获取告警列表
const fetchAlerts = async () => {
  loading.value = true
  try {
    const res = await getAlertList({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value
    })
    alerts.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取告警列表失败:', error)
    ElMessage.error('获取告警列表失败')
  } finally {
    loading.value = false
  }
}

// 获取目标列表
const fetchTargets = async () => {
  try {
    const res = await getServerList()
    targetList.value = res.data.map(server => ({
      id: server.id,
      name: server.name,
      type: '服务器'
    }))
  } catch (error) {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败')
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const res = await getUserList()
    userList.value = res.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAlerts()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAlerts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAlerts()
}

// 新建告警
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    name: '',
    type: '',
    target_id: '',
    metric: '',
    operator: '',
    threshold: 0,
    unit: '%',
    level: 'medium',
    notify_methods: [],
    notify_users: [],
    description: ''
  })
  dialogVisible.value = true
}

// 编辑告警
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除告警
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该告警吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteAlert(row.id)
      ElMessage.success('删除成功')
      fetchAlerts()
    } catch (error) {
      console.error('删除告警失败:', error)
      ElMessage.error('删除告警失败')
    }
  })
}

// 目标变更
const handleTargetChange = (targetId) => {
  // 根据目标类型更新指标选项
  const target = targetList.value.find(t => t.id === targetId)
  if (target) {
    // 这里可以根据目标类型设置不同的指标选项
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await createAlert(form)
          ElMessage.success('创建成功')
        } else {
          await updateAlert(form.id, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchAlerts()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败: ' + error.message)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 工具函数
const getAlertTypeTag = (type) => {
  const map = {
    gpu_usage: 'success',
    gpu_memory: 'warning',
    cpu_usage: 'info',
    memory_usage: 'danger'
  }
  return map[type] || 'info'
}

const getAlertTypeName = (type) => {
  const map = {
    gpu_usage: 'GPU使用率',
    gpu_memory: '显存使用率',
    cpu_usage: 'CPU使用率',
    memory_usage: '内存使用率'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    active: 'success',
    inactive: 'info',
    error: 'danger'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    active: '启用',
    inactive: '禁用',
    error: '错误'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

onMounted(() => {
  fetchAlerts()
  fetchTargets()
  fetchUsers()
})
</script>

<style lang="scss" scoped>
.alerts-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
    
    .right {
      width: 300px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .condition-container {
    display: flex;
    gap: 10px;
    align-items: center;
    
    .el-select {
      width: 120px;
    }
    
    .el-input-number {
      width: 120px;
    }
  }
  
  .target-info {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
  }
}
</style> 