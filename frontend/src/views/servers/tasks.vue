<template>
  <div class="server-tasks-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="left">
            <span>任务管理</span>
            <el-tag class="ml-2" type="info">{{ serverInfo.name }}</el-tag>
            <el-tag v-if="serverInfo.ip_address" type="success">IP: {{ serverInfo.ip_address }}</el-tag>
          </div>
          <div class="right">
            <el-button type="primary" @click="refreshData" :loading="loading">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>新建任务
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="taskList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeTag(row.type)">{{ getTaskTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="server_ip" label="服务器IP" width="130">
          <template #default="{ row }">
            {{ row.server_ip || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gpu_indices" label="GPU" width="120">
          <template #default="{ row }">
            <el-tooltip
              :content="row.gpu_indices.join(', ')"
              placement="top"
              :disabled="!row.gpu_indices?.length"
            >
              <span>{{ formatGpuIndices(row.gpu_indices) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'running'"
              type="danger"
              link
              @click="handleStop(row)"
            >停止</el-button>
            <el-button
              v-if="row.status === 'stopped'"
              type="success"
              link
              @click="handleStart(row)"
            >启动</el-button>
            <el-button type="primary" link @click="handleLogs(row)">日志</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建任务"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="任务类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="训练" value="training" />
            <el-option label="推理" value="inference" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="服务器IP" prop="server_ip">
          <el-input 
            v-model="form.server_ip" 
            placeholder="服务器IP地址" 
            :disabled="true"
          />
          <span class="form-help-text">IP地址将自动使用服务器配置中的地址</span>
        </el-form-item>

        <el-form-item label="GPU" prop="gpu_indices">
          <el-select
            v-model="form.gpu_indices"
            multiple
            placeholder="请选择GPU"
            style="width: 100%"
          >
            <el-option
              v-for="gpu in gpuList"
              :key="gpu.index"
              :label="'GPU ' + gpu.index"
              :value="gpu.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="命令" prop="command">
          <el-input
            v-model="form.command"
            type="textarea"
            :rows="3"
            placeholder="请输入执行命令"
          />
        </el-form-item>

        <el-form-item label="工作目录" prop="work_dir">
          <el-input v-model="form.work_dir" placeholder="请输入工作目录" />
        </el-form-item>

        <el-form-item label="环境变量">
          <div v-for="(env, index) in form.env_vars" :key="index" class="env-item">
            <el-input v-model="env.key" placeholder="名称" style="width: 200px" />
            <span class="env-separator">=</span>
            <el-input v-model="env.value" placeholder="值" style="width: 200px" />
            <el-button
              type="danger"
              link
              @click="removeEnvVar(index)"
              :disabled="index === 0 && form.env_vars.length === 1"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" link @click="addEnvVar">
            <el-icon><Plus /></el-icon>添加环境变量
          </el-button>
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

    <!-- 任务日志对话框 -->
    <el-dialog
      v-model="logDialogVisible"
      :title="'任务日志 - ' + currentTask?.name"
      width="80%"
      class="log-dialog"
    >
      <div class="log-toolbar">
        <el-button type="primary" size="small" @click="refreshLog">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="toggleAutoRefresh"
          :type="autoRefresh ? 'success' : 'info'"
        >
          <el-icon><VideoPlay v-if="!autoRefresh" /><VideoPause v-else /></el-icon>
          {{ autoRefresh ? '停止自动刷新' : '自动刷新' }}
        </el-button>
        <span class="log-path">{{ currentTask?.log_path }}</span>
      </div>

      <div class="log-content" v-loading="logLoading">
        <pre>{{ logContent }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Delete,
  VideoPlay,
  VideoPause
} from '@element-plus/icons-vue'
import { getServerDetail, getServerGpus } from '@/api/server'
import {
  getServerTasks,
  createServerTask,
  startTask,
  stopTask,
  deleteTask,
  getTaskLog
} from '@/api/tasks'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const serverInfo = ref({})
const taskList = ref([])
const gpuList = ref([])
const searchQuery = ref('')  // 添加搜索查询变量

// 获取服务器信息
const fetchServerInfo = async () => {
  try {
    const res = await getServerDetail(route.params.id)
    serverInfo.value = res.data
  } catch (error) {
    console.error('获取服务器信息失败:', error)
  }
}

// 获取任务列表
const fetchTaskList = async () => {
  loading.value = true;
  try {
    const res = await getServerTasks(route.params.id, {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      server_ip: serverInfo.value.ip_address  // 使用服务器IP作为过滤条件
    });
    
    if (res && res.data) {
      // 兼容不同的API响应格式
      if (res.data.items) {
        taskList.value = res.data.items;
        total.value = res.data.total || res.data.items.length;
      } else if (Array.isArray(res.data)) {
        taskList.value = res.data;
        total.value = res.data.length;
      } else {
        taskList.value = [];
        total.value = 0;
        ElMessage.warning('没有找到任务数据');
      }
    } else {
      taskList.value = [];
      total.value = 0;
      ElMessage.warning('没有找到任务数据');
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    taskList.value = [];
    total.value = 0;
    
    // 根据错误类型显示不同的错误信息
    if (error.response && error.response.status === 404) {
      ElMessage.warning('该服务器暂无任务数据');
    } else if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error('获取任务列表失败：' + error.response.data.detail);
    } else {
      ElMessage.error('获取任务列表失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
}

// 获取GPU列表
const fetchGpuList = async () => {
  try {
    const res = await getServerGpus(route.params.id)
    gpuList.value = res.data
  } catch (error) {
    console.error('获取GPU列表失败:', error)
  }
}

// 新建任务相关
const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  name: '',
  type: '',
  server_ip: '',  // 添加服务器IP字段
  gpu_indices: [],
  command: '',
  work_dir: '',
  env_vars: [{ key: '', value: '' }]
})

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  gpu_indices: [
    { required: true, message: '请选择GPU', trigger: 'change' }
  ],
  command: [
    { required: true, message: '请输入执行命令', trigger: 'blur' }
  ],
  work_dir: [
    { required: true, message: '请输入工作目录', trigger: 'blur' }
  ]
}

// 日志相关
const logDialogVisible = ref(false)
const logLoading = ref(false)
const logContent = ref('')
const currentTask = ref(null)
const autoRefresh = ref(false)
let autoRefreshTimer = null

// 刷新数据
const refreshData = () => {
  fetchTaskList()
}

// 新建任务
const handleAdd = () => {
  // 设置服务器IP
  form.server_ip = serverInfo.value.ip_address || ''
  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.name = ''
  form.type = ''
  form.server_ip = ''  // 重置服务器IP
  form.gpu_indices = []
  form.command = ''
  form.work_dir = ''
  form.env_vars = [{ key: '', value: '' }]
}

// 添加环境变量
const addEnvVar = () => {
  form.env_vars.push({ key: '', value: '' })
}

// 删除环境变量
const removeEnvVar = (index) => {
  form.env_vars.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 构建环境变量对象
    const envVars = {}
    form.env_vars.forEach(env => {
      if (env.key && env.value) {
        envVars[env.key] = env.value
      }
    })
    
    await createServerTask(route.params.id, {
      name: form.name,
      type: form.type,
      server_ip: form.server_ip,  // 添加服务器IP
      gpu_indices: form.gpu_indices,
      command: form.command,
      work_dir: form.work_dir,
      env_vars: envVars
    })
    
    ElMessage.success('创建任务成功')
    dialogVisible.value = false
    refreshData()
  } catch (error) {
    console.error('创建任务失败:', error)
    ElMessage.error('创建任务失败')
  } finally {
    submitting.value = false
  }
}

// 启动任务
const handleStart = async (task) => {
  try {
    await startTask(task.id)
    ElMessage.success('启动任务成功')
    refreshData()
  } catch (error) {
    console.error('启动任务失败:', error)
    ElMessage.error('启动任务失败')
  }
}

// 停止任务
const handleStop = (task) => {
  ElMessageBox.confirm(
    `确定要停止任务 ${task.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await stopTask(task.id)
      ElMessage.success('停止任务成功')
      refreshData()
    } catch (error) {
      console.error('停止任务失败:', error)
      ElMessage.error('停止任务失败')
    }
  }).catch(() => {})
}

// 查看日志
const handleLogs = async (task) => {
  currentTask.value = task
  logDialogVisible.value = true
  await refreshLog()
}

// 刷新日志
const refreshLog = async () => {
  if (!currentTask.value?.id) return
  
  logLoading.value = true
  try {
    const res = await getTaskLog(currentTask.value.id)
    logContent.value = res.data || '暂无日志内容'
  } catch (error) {
    console.error('获取任务日志失败:', error)
    logContent.value = '获取日志失败: ' + error.message
  } finally {
    logLoading.value = false
  }
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    autoRefreshTimer = setInterval(refreshLog, 5000)
  } else {
    clearInterval(autoRefreshTimer)
  }
}

// 删除任务
const handleDelete = (task) => {
  ElMessageBox.confirm(
    `确定要删除任务 ${task.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteTask(task.id)
      ElMessage.success('删除任务成功')
      refreshData()
    } catch (error) {
      console.error('删除任务失败:', error)
      ElMessage.error('删除任务失败')
    }
  }).catch(() => {})
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchTaskList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTaskList()
}

// 工具函数
const getTaskTypeTag = (type) => {
  const map = {
    training: 'primary',
    inference: 'success',
    other: 'info'
  }
  return map[type] || 'info'
}

const getTaskTypeName = (type) => {
  const map = {
    training: '训练',
    inference: '推理',
    other: '其他'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    running: 'success',
    stopped: 'danger',
    completed: 'info',
    failed: 'warning'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    running: '运行中',
    stopped: '已停止',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const formatGpuIndices = (indices) => {
  if (!indices?.length) return '无'
  if (indices.length <= 2) return indices.join(', ')
  return `${indices.length}个`
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchServerInfo()
  fetchGpuList()
  fetchTaskList()
})

onBeforeUnmount(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.server-tasks-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .right {
      display: flex;
      gap: 10px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .env-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    .env-separator {
      color: #909399;
      margin: 0 5px;
    }
  }
}

.log-dialog {
  .log-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    
    .log-path {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .log-content {
    max-height: 60vh;
    overflow-y: auto;
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 16px;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #d4d4d4;
    }
  }
}
</style> 