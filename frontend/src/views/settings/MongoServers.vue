<template>
  <div class="mongo-servers">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>MongoDB服务器管理</span>
          <el-button type="primary" @click="showAddDialog">添加服务器</el-button>
        </div>
      </template>

      <!-- 服务器列表 -->
      <el-table :data="servers" style="width: 100%">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="ip" label="IP地址" />
        <el-table-column prop="database" label="数据库" />
        <el-table-column prop="auth_source" label="认证数据库" />
        <el-table-column prop="collection" label="集合" />
        <el-table-column prop="sync_interval" label="同步间隔(秒)" />
        <el-table-column prop="last_sync" label="最后同步时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.last_sync) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="testConnection(scope.row)"
              :loading="scope.row.testing"
            >
              测试连接
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="triggerSync(scope.row)"
              :loading="scope.row.syncing"
            >
              同步
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      :title="dialogType === 'add' ? '添加MongoDB服务器' : '编辑MongoDB服务器'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item label="数据库" prop="database">
          <el-input v-model="form.database" />
        </el-form-item>
        <el-form-item label="认证数据库" prop="auth_source">
          <el-input v-model="form.auth_source" placeholder="默认为admin" />
          <div class="form-tip">通常使用admin作为认证数据库，除非MongoDB特别配置</div>
        </el-form-item>
        <el-form-item label="集合" prop="collection">
          <el-input v-model="form.collection" />
        </el-form-item>
        <el-form-item label="同步间隔(秒)" prop="sync_interval">
          <el-input-number v-model="form.sync_interval" :min="60" :max="3600" />
        </el-form-item>
      </el-form>
      
      <!-- 错误消息显示区域 -->
      <div v-if="errorMsg" class="error-message">
        <el-alert
          :title="errorMsg"
          type="error"
          :closable="true"
          show-icon
        />
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="success" @click="testConnectionParams">测试连接</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getMongoServers, 
  createMongoServer, 
  updateMongoServer, 
  deleteMongoServer, 
  testMongoConnection,
  testMongoConnectionParams,
  syncMongoServer
} from '@/api/mongo'

export default {
  name: 'MongoServers',
  setup() {
    const servers = ref([])
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const formRef = ref(null)
    const errorMsg = ref('')  // 添加错误消息
    
    const form = ref({
      name: '',
      ip: '',
      port: 27017,
      username: '',
      password: '',
      database: '',
      auth_source: 'admin',  // 添加认证数据库字段，默认admin
      collection: '',
      sync_interval: 600
    })

    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
      port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
      collection: [{ required: true, message: '请输入集合名', trigger: 'blur' }],
      sync_interval: [{ required: true, message: '请输入同步间隔', trigger: 'blur' }]
    }

    // 获取服务器列表
    const fetchServers = async () => {
      try {
        const response = await getMongoServers()
        console.log('获取服务器列表响应:', response)
        
        // 修复：检查响应格式，根据后端返回的实际数据结构处理
        if (Array.isArray(response)) {
          // 如果后端直接返回数组
          servers.value = response
        } else if (response && response.data && Array.isArray(response.data)) {
          // 兼容旧的格式（如果后端返回{data:[...]}格式）
          servers.value = response.data
        } else if (response && response.items && Array.isArray(response.items)) {
          // 处理{items: Array, total: number}格式
          servers.value = response.items
        } else {
          // 其他情况，设置为空数组
          console.error('获取服务器列表格式错误:', response)
          servers.value = []
          ElMessage.warning('获取服务器列表数据格式异常')
        }
      } catch (error) {
        console.error('获取服务器列表错误:', error)
        ElMessage.error('获取服务器列表失败')
        servers.value = []
      }
    }

    // 显示添加对话框
    const showAddDialog = () => {
      dialogType.value = 'add'
      form.value = {
        name: '',
        ip: '',
        port: 27017,
        username: '',
        password: '',
        database: '',
        auth_source: 'admin',  // 默认值
        collection: '',
        sync_interval: 600
      }
      errorMsg.value = ''  // 清空错误消息
      dialogVisible.value = true
    }

    // 显示编辑对话框
    const showEditDialog = (server) => {
      dialogType.value = 'edit'
      // 确保server中有auth_source字段，没有则默认为admin
      const serverWithDefaults = {
        ...server,
        auth_source: server.auth_source || 'admin'
      }
      form.value = { ...serverWithDefaults }
      errorMsg.value = ''  // 清空错误消息
      dialogVisible.value = true
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            let response;
            if (dialogType.value === 'add') {
              response = await createMongoServer(form.value)
              console.log('添加MongoDB服务器响应:', response)
              ElMessage.success('添加成功')
            } else {
              response = await updateMongoServer(form.value.id, form.value)
              console.log('更新MongoDB服务器响应:', response)
              ElMessage.success('更新成功')
            }
            
            // 无论添加还是更新成功，关闭对话框并刷新列表
            dialogVisible.value = false
            
            // 延迟一点刷新列表，确保后端数据已更新
            setTimeout(() => {
              fetchServers()
            }, 500)
          } catch (error) {
            console.error('提交表单错误:', error)
            const errorMessage = error.response?.data?.detail || (dialogType.value === 'add' ? '添加失败' : '更新失败')
            ElMessage.error(errorMessage)
            errorMsg.value = errorMessage
          }
        }
      })
    }

    // 删除服务器
    const handleDelete = async (server) => {
      try {
        await ElMessageBox.confirm('确定要删除该服务器吗？', '提示', {
          type: 'warning'
        })
        await deleteMongoServer(server.id)
        ElMessage.success('删除成功')
        fetchServers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 触发同步
    const triggerSync = async (server) => {
      try {
        server.syncing = true
        await syncMongoServer(server.id)
        ElMessage.success('同步任务已启动')
        fetchServers()
      } catch (error) {
        ElMessage.error('启动同步失败')
      } finally {
        server.syncing = false
      }
    }

    // 测试连接
    const testConnection = async (server) => {
      try {
        server.testing = true
        const response = await testMongoConnection(server.id)
        console.log('测试连接响应:', response)
        
        // 修复: 检查响应格式并正确处理成功情况
        if (response && response.success === true) {
          ElMessage.success(`连接成功: ${response.message || ''}`)
        } else {
          const errorMessage = response && response.message ? response.message : '连接失败'
          ElMessage.error(`连接失败: ${errorMessage}`)
        }
      } catch (error) {
        console.error('测试连接错误:', error)
        ElMessage.error('测试连接失败')
      } finally {
        server.testing = false
      }
    }

    // 测试连接参数
    const testConnectionParams = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            errorMsg.value = ''  // 清空错误消息
            const response = await testMongoConnectionParams(form.value)
            console.log('测试连接参数响应:', response)
            
            // 修复: 检查响应格式并正确处理成功情况
            // 直接检查响应对象中的success字段
            if (response && response.success === true) {
              ElMessage.success(`连接成功: ${response.message || ''}`)
            } else {
              // 处理连接失败的情况
              const errorMessage = response && response.message ? response.message : '连接失败'
              ElMessage.error(`连接失败: ${errorMessage}`)
              errorMsg.value = errorMessage
            }
          } catch (error) {
            console.error('测试连接参数错误:', error)
            const errorMessage = error.response?.data?.detail || '测试连接失败'
            ElMessage.error(errorMessage)
            errorMsg.value = errorMessage
          }
        }
      })
    }

    // 格式化日期时间
    const formatDateTime = (datetime) => {
      if (!datetime) return '-'
      return new Date(datetime).toLocaleString()
    }

    onMounted(() => {
      fetchServers()
    })

    return {
      servers,
      dialogVisible,
      dialogType,
      formRef,
      form,
      rules,
      errorMsg,  // 添加错误消息到返回值
      showAddDialog,
      showEditDialog,
      handleSubmit,
      handleDelete,
      triggerSync,
      testConnection,
      testConnectionParams,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.mongo-servers {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.error-message {
  margin: 15px 0;
}
</style> 