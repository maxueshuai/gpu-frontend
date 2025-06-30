<template>
  <div class="create-task-container">
    <el-card shadow="hover" class="form-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">创建任务</h2>
        </div>
      </template>

      <el-form 
        ref="taskFormRef" 
        :model="taskForm" 
        :rules="rules" 
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="服务器" prop="server_id">
          <el-select v-model="taskForm.server_id" placeholder="请选择服务器" style="width: 100%">
            <el-option
              v-for="server in servers"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="命令执行" value="command" />
            <el-option label="脚本执行" value="script" />
            <el-option label="文件传输" value="file_transfer" />
          </el-select>
        </el-form-item>

        <template v-if="taskForm.type === 'command'">
          <el-form-item label="执行命令" prop="command">
            <el-input
              v-model="taskForm.command"
              type="textarea"
              rows="4"
              placeholder="请输入要执行的命令"
            />
          </el-form-item>
        </template>

        <template v-else-if="taskForm.type === 'script'">
          <el-form-item label="脚本内容" prop="script_content">
            <el-input
              v-model="taskForm.script_content"
              type="textarea"
              rows="8"
              placeholder="请输入脚本内容"
            />
          </el-form-item>
          <el-form-item label="脚本类型" prop="script_type">
            <el-select v-model="taskForm.script_type" placeholder="请选择脚本类型">
              <el-option label="Shell (bash)" value="bash" />
              <el-option label="Python" value="python" />
              <el-option label="Node.js" value="node" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else-if="taskForm.type === 'file_transfer'">
          <el-form-item label="传输类型" prop="transfer_type">
            <el-radio-group v-model="taskForm.transfer_type">
              <el-radio label="upload">上传</el-radio>
              <el-radio label="download">下载</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="源路径" prop="source_path">
            <el-input v-model="taskForm.source_path" placeholder="请输入源文件/目录路径" />
          </el-form-item>
          <el-form-item label="目标路径" prop="target_path">
            <el-input v-model="taskForm.target_path" placeholder="请输入目标文件/目录路径" />
          </el-form-item>
        </template>

        <el-form-item label="工作目录" prop="work_dir">
          <el-input v-model="taskForm.work_dir" placeholder="请输入工作目录（可选）" />
        </el-form-item>

        <el-form-item label="环境变量">
          <el-button type="primary" link @click="addEnvVar">添加环境变量</el-button>
          <div v-for="(item, index) in taskForm.env_vars" :key="index" class="env-var-item">
            <el-input v-model="item.key" placeholder="KEY" style="width: 40%" />
            <span class="env-var-separator">=</span>
            <el-input v-model="item.value" placeholder="VALUE" style="width: 40%" />
            <el-button type="danger" link @click="removeEnvVar(index)">删除</el-button>
          </div>
        </el-form-item>

        <el-form-item label="任务优先级">
          <el-select v-model="taskForm.priority" placeholder="请选择优先级">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="5" />
            <el-option label="高" :value="10" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入任务描述（可选）"
          />
        </el-form-item>

        <el-form-item label="GPU限制">
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
                :disabled="!serverGpus.length"
              >
                <el-option
                  v-for="gpu in serverGpus"
                  :key="gpu.index"
                  :label="`GPU ${gpu.index} (${gpu.model})`"
                  :value="gpu.index"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>

        <el-divider />

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">提交任务</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getServerList, getServerGpus } from '@/api/server'
import { createTask } from '@/api/task'

const router = useRouter()
const taskFormRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const servers = ref([])
const serverGpus = ref([])

// 任务表单
const taskForm = reactive({
  name: '',
  server_id: '',
  type: 'command',
  command: '',
  script_content: '',
  script_type: 'bash',
  transfer_type: 'upload',
  source_path: '',
  target_path: '',
  work_dir: '',
  env_vars: [],
  priority: 5,
  description: '',
  gpu_limit_enabled: false,
  gpu_limit: 1,
  gpu_indices: []
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  server_id: [{ required: true, message: '请选择服务器', trigger: 'change' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  command: [{ 
    required: true, 
    message: '请输入执行命令', 
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (taskForm.type === 'command' && !value) {
        callback(new Error('请输入执行命令'))
      } else {
        callback()
      }
    }
  }],
  script_content: [{ 
    required: true, 
    message: '请输入脚本内容', 
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (taskForm.type === 'script' && !value) {
        callback(new Error('请输入脚本内容'))
      } else {
        callback()
      }
    }
  }],
  script_type: [{
    required: true,
    message: '请选择脚本类型',
    trigger: 'change',
    validator: (rule, value, callback) => {
      if (taskForm.type === 'script' && !value) {
        callback(new Error('请选择脚本类型'))
      } else {
        callback()
      }
    }
  }],
  source_path: [{
    required: true,
    message: '请输入源路径',
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (taskForm.type === 'file_transfer' && !value) {
        callback(new Error('请输入源路径'))
      } else {
        callback()
      }
    }
  }],
  target_path: [{
    required: true,
    message: '请输入目标路径',
    trigger: 'blur',
    validator: (rule, value, callback) => {
      if (taskForm.type === 'file_transfer' && !value) {
        callback(new Error('请输入目标路径'))
      } else {
        callback()
      }
    }
  }]
}

// 获取服务器列表
const fetchServers = async () => {
  loading.value = true
  try {
    const res = await getServerList()
    servers.value = res.items || []
  } catch (error) {
    console.error('获取服务器列表失败:', error)
    ElMessage.error('获取服务器列表失败')
  } finally {
    loading.value = false
  }
}

// 获取服务器GPU列表
const fetchServerGpus = async (serverId) => {
  if (!serverId) {
    serverGpus.value = []
    return
  }
  
  try {
    const res = await getServerGpus(serverId)
    serverGpus.value = res.data || []
  } catch (error) {
    console.error('获取服务器GPU信息失败:', error)
    serverGpus.value = []
  }
}

// 监听服务器变化
watch(() => taskForm.server_id, (newVal) => {
  fetchServerGpus(newVal)
  
  // 重置GPU相关选项
  taskForm.gpu_indices = []
})

// 添加环境变量
const addEnvVar = () => {
  taskForm.env_vars.push({ key: '', value: '' })
}

// 移除环境变量
const removeEnvVar = (index) => {
  taskForm.env_vars.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 根据任务类型准备数据
      const taskData = {
        name: taskForm.name,
        server_id: taskForm.server_id,
        type: taskForm.type,
        work_dir: taskForm.work_dir || undefined,
        priority: taskForm.priority,
        description: taskForm.description || undefined,
        env_vars: taskForm.env_vars.reduce((acc, curr) => {
          if (curr.key && curr.value) {
            acc[curr.key] = curr.value
          }
          return acc
        }, {})
      }
      
      // GPU相关设置
      if (taskForm.gpu_limit_enabled) {
        taskData.gpu_limit = taskForm.gpu_limit
        if (taskForm.gpu_indices.length > 0) {
          taskData.gpu_indices = taskForm.gpu_indices
        }
      }
      
      // 根据任务类型添加不同的数据
      if (taskForm.type === 'command') {
        taskData.command = taskForm.command
      } else if (taskForm.type === 'script') {
        taskData.script_content = taskForm.script_content
        taskData.script_type = taskForm.script_type
      } else if (taskForm.type === 'file_transfer') {
        taskData.transfer_type = taskForm.transfer_type
        taskData.source_path = taskForm.source_path
        taskData.target_path = taskForm.target_path
      }
      
      const res = await createTask(taskData)
      ElMessage.success('任务创建成功')
      router.push('/tasks')
    } catch (error) {
      console.error('创建任务失败:', error)
      ElMessage.error('创建任务失败: ' + (error.message || '未知错误'))
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (taskFormRef.value) {
    taskFormRef.value.resetFields()
  }
  
  // 重置不在默认表单中的字段
  taskForm.env_vars = []
  taskForm.gpu_limit_enabled = false
  taskForm.gpu_limit = 1
  taskForm.gpu_indices = []
}

// 返回任务列表
const goBack = () => {
  router.push('/tasks')
}

// 初始化
onMounted(() => {
  fetchServers()
})
</script>

<style scoped>
.create-task-container {
  padding: 20px;
}

.form-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.env-var-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
}

.env-var-separator {
  font-weight: bold;
  margin: 0 8px;
}

.gpu-limit-container {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style> 