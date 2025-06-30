<template>
  <div class="task-detail">
    <div class="header">
      <h2>任务详情</h2>
      <div class="actions">
        <el-button
          v-if="task.status === 'stopped'"
          type="success"
          @click="handleStart"
        >
          启动任务
        </el-button>
        <el-button
          v-if="task.status === 'running'"
          type="warning"
          @click="handleStop"
        >
          停止任务
        </el-button>
        <el-button type="primary" @click="handleEdit">编辑任务</el-button>
        <el-button type="danger" @click="handleDelete">删除任务</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(task.status)">
                {{ getStatusText(task.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="服务器">{{ getServerName(task.server_id) }}</el-descriptions-item>
            <el-descriptions-item label="GPU索引">{{ task.gpu_indices?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(task.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatTime(task.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatTime(task.start_time) }}</el-descriptions-item>
            <el-descriptions-item label="停止时间">{{ formatTime(task.stop_time) }}</el-descriptions-item>
            <el-descriptions-item label="进程ID">{{ task.pid || '-' }}</el-descriptions-item>
            <el-descriptions-item label="任务类型">{{ getTaskTypeText(task.type) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-if="task.description">
      <el-col :span="24">
        <el-card class="description-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务描述</span>
            </div>
          </template>
          <div class="description-content">
            {{ task.description || '暂无描述' }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-if="task.type === 'command' && task.command">
      <el-col :span="24">
        <el-card class="command-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>执行命令</span>
            </div>
          </template>
          <div class="command-content">
            <pre>{{ task.command }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" v-if="task.type === 'script' && task.script_content">
      <el-col :span="24">
        <el-card class="script-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>脚本内容 ({{ task.script_type || 'bash' }})</span>
            </div>
          </template>
          <div class="script-content">
            <pre>{{ task.script_content }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" v-if="task.type === 'file_transfer'">
      <el-col :span="24">
        <el-card class="transfer-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>文件传输信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="传输类型">
              {{ task.transfer_type === 'upload' ? '上传' : '下载' }}
            </el-descriptions-item>
            <el-descriptions-item label="源路径">{{ task.source_path }}</el-descriptions-item>
            <el-descriptions-item label="目标路径">{{ task.target_path }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="log-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务日志</span>
              <div class="log-filter">
                <el-select v-model="logFilter.level" placeholder="日志级别" clearable>
                  <el-option label="信息" value="info" />
                  <el-option label="警告" value="warning" />
                  <el-option label="错误" value="error" />
                  <el-option label="调试" value="debug" />
                </el-select>
                <el-date-picker
                  v-model="logFilter.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                />
                <el-button type="primary" @click="handleLogSearch">搜索</el-button>
                <el-button @click="resetLogFilter">重置</el-button>
                <el-button type="success" @click="refreshLogs">刷新</el-button>
              </div>
            </div>
          </template>
          <div class="log-content">
            <el-table
              v-loading="logLoading"
              :data="taskLogs"
              border
              style="width: 100%"
            >
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="级别" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLogLevelType(row.level)">
                    {{ row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="消息" />
            </el-table>
            <div class="pagination-container" v-if="total > 0">
              <el-pagination
                v-model:current-page="queryParams.page"
                v-model:page-size="queryParams.limit"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑任务对话框 -->
    <el-dialog
      title="编辑任务"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="服务器" prop="server_id">
          <el-select v-model="taskForm.server_id" placeholder="选择服务器">
            <el-option
              v-for="server in servers"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="taskForm.priority" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="GPU限制" v-if="taskForm.type !== 'file_transfer'">
          <el-switch v-model="taskForm.gpu_limit_enabled" />
          <div v-if="taskForm.gpu_limit_enabled" class="gpu-limit-container">
            <el-form-item label="使用GPU数量" label-width="120px">
              <el-input-number v-model="taskForm.gpu_limit" :min="0" :max="8" />
            </el-form-item>
            <el-form-item label="指定GPU索引" label-width="120px">
              <el-select 
                v-model="taskForm.gpu_indices" 
                multiple 
                placeholder="请选择GPU索引（可多选）"
              >
                <el-option
                  v-for="index in availableGpuIndices"
                  :key="index"
                  :label="`GPU ${index}`"
                  :value="index"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskDetail, updateTask, deleteTask, stopTask, retryTask, getTaskLogs, directStopTask } from '@/api/task'
import { getServers, getServerGpus } from '@/api/server'

const route = useRoute()
const router = useRouter()
const task = ref({})
const servers = ref([])
const serverGpus = ref([])
const dialogVisible = ref(false)
const taskFormRef = ref(null)
const logLoading = ref(false)
const taskLogs = ref([])
const total = ref(0)
const loading = ref(false)

// 分页查询参数
const queryParams = reactive({
  page: 1,
  limit: 20
})

// 可用的GPU索引
const availableGpuIndices = ref([0, 1, 2, 3, 4, 5, 6, 7])

// 任务表单
const taskForm = reactive({
  name: '',
  description: '',
  server_id: '',
  priority: 5,
  gpu_limit_enabled: false,
  gpu_limit: 1,
  gpu_indices: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  server_id: [
    { required: true, message: '请选择服务器', trigger: 'change' }
  ]
}

// 日志过滤表单
const logFilter = reactive({
  level: '',
  timeRange: []
})

// 获取任务详情
const fetchTaskDetail = async () => {
  loading.value = true
  try {
    const res = await getTaskDetail(route.params.id)
    task.value = res.data || {}
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

// 获取服务器列表
const fetchServers = async () => {
  try {
    const res = await getServers()
    servers.value = res.items || []
  } catch (error) {
    console.error('获取服务器列表失败:', error)
    ElMessage.error('获取服务器列表失败')
  }
}

// 获取服务器GPU列表
const fetchServerGpus = async (serverId) => {
  if (!serverId) return
  
  try {
    const res = await getServerGpus(serverId)
    serverGpus.value = res.data || []
    // 更新可用的GPU索引
    availableGpuIndices.value = serverGpus.value.map(gpu => gpu.index)
  } catch (error) {
    console.error('获取服务器GPU信息失败:', error)
  }
}

// 获取服务器名称
const getServerName = (serverId) => {
  const server = servers.value.find(s => s.id === serverId)
  return server ? server.name : serverId
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    running: 'success',
    pending: 'warning',
    stopped: 'info',
    completed: 'success',
    failed: 'danger',
    error: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    pending: '等待中',
    stopped: '已停止',
    completed: '已完成',
    failed: '失败',
    error: '错误'
  }
  return texts[status] || status
}

// 获取任务类型文本
const getTaskTypeText = (type) => {
  const texts = {
    command: '命令执行',
    script: '脚本执行',
    file_transfer: '文件传输'
  }
  return texts[type] || type
}

// 获取日志级别类型
const getLogLevelType = (level) => {
  const types = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
    debug: ''
  }
  return types[level] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

// 显示编辑对话框
const handleEdit = () => {
  taskForm.name = task.value.name
  taskForm.description = task.value.description || ''
  taskForm.server_id = task.value.server_id
  taskForm.priority = task.value.priority || 5
  taskForm.gpu_limit_enabled = !!task.value.gpu_limit
  taskForm.gpu_limit = task.value.gpu_limit || 1
  taskForm.gpu_indices = task.value.gpu_indices || []
  
  // 获取服务器GPU信息
  fetchServerGpus(taskForm.server_id)
  
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 准备更新数据
      const updateData = {
        name: taskForm.name,
        description: taskForm.description,
        priority: taskForm.priority
      }
      
      // GPU相关设置
      if (taskForm.gpu_limit_enabled && task.value.type !== 'file_transfer') {
        updateData.gpu_limit = taskForm.gpu_limit
        updateData.gpu_indices = taskForm.gpu_indices
      }
      
      await updateTask(task.value.id, updateData)
      ElMessage.success('更新任务成功')
      dialogVisible.value = false
      fetchTaskDetail()
    } catch (error) {
      console.error('更新任务失败:', error)
      ElMessage.error('更新任务失败: ' + (error.message || '未知错误'))
    }
  })
}

// 删除任务
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
      type: 'warning'
    })
    await deleteTask(task.value.id)
    ElMessage.success('删除任务成功')
    router.push('/tasks')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
      ElMessage.error('删除任务失败')
    }
  }
}

// 启动任务
const handleStart = async () => {
  try {
    const mongoTaskId = task.value.mongo_task_id || task.value.stream_id || task.value._id || task.value.id
    const response = await retryTask(task.value.id, { mongo_task_id: mongoTaskId })
    
    console.log('启动任务响应:', response)
    ElMessage.success('启动任务成功')
    
    // 立即更新本地状态
    task.value.status = 'running'
    task.value.updated_at = new Date().toISOString()
    
    // 延迟获取完整任务详情
    setTimeout(() => {
      fetchTaskDetail()
    }, 1000)
  } catch (error) {
    console.error('启动任务失败:', error)
    
    // 获取更详细的错误信息
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     '未知错误'
    
    // 如果错误是因为任务已经在运行，则不显示错误，而是提示信息
    if (errorMsg.includes('已经运行') || errorMsg.includes('already running')) {
      console.log('任务已经在运行中，更新本地状态')
      ElMessage.info('任务已经在运行中')
      
      // 立即更新本地状态
      task.value.status = 'running'
      
      // 延迟获取完整任务详情
      setTimeout(() => {
        fetchTaskDetail()
      }, 1000)
      
      return
    }
    
    ElMessage.error(`启动任务失败: ${errorMsg}`)
  }
}

// 停止任务
const handleStop = async () => {
  try {
    // 优先使用mongo_task_id，其次使用stream_id，最后使用_id或id
    const mongoTaskId = task.value.mongo_task_id || task.value.stream_id || task.value._id || task.value.id
    const serverIp = task.value.server_ip
    
    // 尝试使用直接方式停止任务（如果有MongoDB任务ID和服务器IP）
    if (mongoTaskId && serverIp) {
      try {
        const directResponse = await directStopTask(mongoTaskId, serverIp)
        console.log('直接方式停止任务响应:', directResponse)
        ElMessage.success('停止任务成功')
        
        // 立即更新本地状态
        task.value.status = 'stopped'
        task.value.updated_at = new Date().toISOString()
        
        // 延迟获取完整任务详情
        setTimeout(() => {
          fetchTaskDetail()
        }, 1000)
        
        return
      } catch (directError) {
        console.error('直接方式停止任务失败，尝试常规方式:', directError)
        // 继续尝试常规方式
      }
    }
    
    // 常规方式停止任务
    const response = await stopTask(task.value.id, { mongo_task_id: mongoTaskId })
    console.log('常规方式停止任务响应:', response)
    ElMessage.success('停止任务成功')
    
    // 立即更新本地状态
    task.value.status = 'stopped'
    task.value.updated_at = new Date().toISOString()
    
    // 延迟获取完整任务详情
    setTimeout(() => {
      fetchTaskDetail()
    }, 1000)
    
  } catch (error) {
    console.error('停止任务失败:', error)
    
    // 获取详细错误信息
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     '未知错误'
                     
    // 如果错误是因为任务已经是停止状态，则显示信息提示
    if (errorMsg.includes('不能停止') || errorMsg.includes('already stopped')) {
      ElMessage.info('任务已经是停止状态')
      
      // 立即更新本地状态
      task.value.status = 'stopped'
      
      // 延迟获取完整任务详情
      setTimeout(() => {
        fetchTaskDetail()
      }, 1000)
      
      return
    }
    
    ElMessage.error(`停止任务失败: ${errorMsg}`)
  }
}

// 获取任务日志
const fetchTaskLogs = async () => {
  try {
    logLoading.value = true
    const params = {
      page: queryParams.page,
      limit: queryParams.limit,
      level: logFilter.level || undefined,
      start_time: logFilter.timeRange?.[0] ? new Date(logFilter.timeRange[0]).toISOString() : undefined,
      end_time: logFilter.timeRange?.[1] ? new Date(logFilter.timeRange[1]).toISOString() : undefined
    }
    const res = await getTaskLogs(task.value.id, params)
    taskLogs.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取任务日志失败:', error)
    ElMessage.error('获取任务日志失败')
  } finally {
    logLoading.value = false
  }
}

// 重置日志过滤
const resetLogFilter = () => {
  logFilter.level = ''
  logFilter.timeRange = []
  queryParams.page = 1
  fetchTaskLogs()
}

// 刷新日志
const refreshLogs = () => {
  fetchTaskLogs()
}

// 日志搜索
const handleLogSearch = () => {
  queryParams.page = 1
  fetchTaskLogs()
}

// 页码改变
const handleCurrentChange = (page) => {
  queryParams.page = page
  fetchTaskLogs()
}

// 每页条数改变
const handleSizeChange = (size) => {
  queryParams.limit = size
  queryParams.page = 1
  fetchTaskLogs()
}

// 返回列表
const goBack = () => {
  router.push('/tasks')
}

// 初始化
onMounted(() => {
  fetchServers()
  fetchTaskDetail()
  fetchTaskLogs()
})
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.info-card,
.description-card,
.command-card,
.script-card,
.transfer-card,
.log-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description-content,
.command-content,
.script-content {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
}

.log-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.log-content {
  max-height: 600px;
  overflow-y: auto;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.gpu-limit-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style> 