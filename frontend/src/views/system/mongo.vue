<template>
  <div class="mongo-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据库配置</span>
          <el-button type="primary" @click="testConnection" :loading="testing">测试连接</el-button>
        </div>
      </template>
      
      <el-form :model="config" label-width="120px" ref="formRef" :rules="rules" v-loading="loading">
        <el-form-item label="连接状态">
          <el-tag :type="connected ? 'success' : 'danger'">
            {{ connected ? '已连接' : '未连接' }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="连接方式">
          <el-radio-group v-model="config.connectionType">
            <el-radio label="uri">连接字符串</el-radio>
            <el-radio label="config">连接配置</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="config.connectionType === 'uri'">
          <el-form-item label="连接字符串" prop="uri">
            <el-input v-model="config.uri" placeholder="mongodb://username:password@host:port/database" />
          </el-form-item>
        </template>
        
        <template v-else>
          <el-form-item label="主机" prop="host">
            <el-input v-model="config.host" placeholder="localhost" />
          </el-form-item>
          
          <el-form-item label="端口" prop="port">
            <el-input-number v-model="config.port" :min="1" :max="65535" placeholder="27017" />
          </el-form-item>
          
          <el-form-item label="数据库名" prop="database">
            <el-input v-model="config.database" placeholder="gpu_monitor" />
          </el-form-item>
          
          <el-form-item label="认证">
            <el-switch v-model="config.authentication" />
          </el-form-item>
          
          <template v-if="config.authentication">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="config.username" placeholder="用户名" />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input v-model="config.password" type="password" placeholder="密码" show-password />
            </el-form-item>
            
            <el-form-item label="认证数据库" prop="authSource">
              <el-input v-model="config.authSource" placeholder="admin" />
            </el-form-item>
          </template>
        </template>
        
        <el-form-item label="高级选项">
          <el-collapse>
            <el-collapse-item title="连接选项" name="options">
              <el-form-item label="连接超时(ms)" prop="connectTimeoutMS">
                <el-input-number v-model="config.connectTimeoutMS" :min="1000" :step="1000" />
              </el-form-item>
              
              <el-form-item label="最大连接数" prop="maxPoolSize">
                <el-input-number v-model="config.maxPoolSize" :min="1" :max="100" />
              </el-form-item>
              
              <el-form-item label="副本集" prop="replicaSet">
                <el-input v-model="config.replicaSet" placeholder="副本集名称（可选）" />
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
        
        <el-divider />
        
        <el-form-item>
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="connected" class="database-info">
        <h3>数据库信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="服务器版本">{{ dbInfo.version || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="数据库">{{ dbInfo.database || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="集合数量">{{ dbInfo.collections || 0 }}</el-descriptions-item>
          <el-descriptions-item label="文档总数">{{ dbInfo.documents || 0 }}</el-descriptions-item>
          <el-descriptions-item label="存储大小">{{ formatSize(dbInfo.storageSize) }}</el-descriptions-item>
          <el-descriptions-item label="索引大小">{{ formatSize(dbInfo.indexSize) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div v-if="connected" class="collections-section">
        <h3>集合列表</h3>
        <el-table :data="collections" style="width: 100%" border stripe v-loading="loadingCollections">
          <el-table-column prop="name" label="集合名称" min-width="150" />
          <el-table-column prop="count" label="文档数量" width="120" />
          <el-table-column prop="size" label="存储大小" width="120">
            <template #default="{ row }">
              {{ formatSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="indexSize" label="索引大小" width="120">
            <template #default="{ row }">
              {{ formatSize(row.indexSize) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" link @click="viewCollection(row)">查看</el-button>
                <el-button type="danger" link @click="dropCollection(row)">删除</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMongoServers, testMongoConnectionParams, testMongoConnection, createMongoServer, updateMongoServer } from '@/api/mongo'
import { getMongoDBCollections, dropMongoDBCollection } from '@/api/system'

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const connected = ref(false)
const loadingCollections = ref(false)

// MongoDB配置
const config = reactive({
  connectionType: 'config',
  uri: '',
  host: 'localhost',
  port: 27017,
  database: 'gpu_monitor',
  authentication: false,
  username: '',
  password: '',
  authSource: 'admin',
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  replicaSet: ''
})

// 数据库信息
const dbInfo = ref({
  version: '',
  database: '',
  collections: 0,
  documents: 0,
  storageSize: 0,
  indexSize: 0
})

// 集合列表
const collections = ref([])

// 表单验证规则
const rules = {
  uri: [
    { required: true, message: '请输入连接字符串', trigger: 'blur' }
  ],
  host: [
    { required: true, message: '请输入主机地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' }
  ],
  database: [
    { required: true, message: '请输入数据库名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 获取MongoDB配置
const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await getMongoServers()
    if (res.data && res.data.length > 0) {
      Object.assign(config, res.data[0])
    }
    fetchStatus()
  } catch (error) {
    console.error('获取MongoDB配置失败:', error)
    ElMessage.error('获取MongoDB配置失败')
  } finally {
    loading.value = false
  }
}

// 获取MongoDB状态
const fetchStatus = async () => {
  try {
    // 使用getMongoServer获取第一个MongoDB服务器的状态
    const servers = await getMongoServers();
    if (servers.data && servers.data.length > 0) {
      const serverId = servers.data[0].id;
      // 测试连接以获取状态
      const res = await testMongoConnection(serverId);
      connected.value = res.success === true;
      if (connected.value && res.status) {
        dbInfo.value = {
          version: res.status.version || '',
          database: res.status.database || '',
          collections: res.status.collections || 0,
          documents: res.status.documents || 0,
          storageSize: res.status.storageSize || 0,
          indexSize: res.status.indexSize || 0
        }
        fetchCollections()
      }
    } else {
      connected.value = false;
    }
  } catch (error) {
    console.error('获取MongoDB状态失败:', error)
    connected.value = false
  }
}

// 获取集合列表
const fetchCollections = async () => {
  if (!connected.value) return
  
  loadingCollections.value = true
  try {
    const res = await getMongoDBCollections()
    collections.value = res.data || []
  } catch (error) {
    console.error('获取集合列表失败:', error)
    ElMessage.error('获取集合列表失败')
  } finally {
    loadingCollections.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    saving.value = true
    try {
      if (config.id) {
        await updateMongoServer(config.id, config)
      } else {
        await createMongoServer(config)
      }
      ElMessage.success('配置保存成功')
      fetchStatus()
    } catch (error) {
      console.error('保存配置失败:', error)
      ElMessage.error('保存配置失败')
    } finally {
      saving.value = false
    }
  })
}

// 测试连接
const testConnection = async () => {
  testing.value = true
  try {
    const res = await testMongoConnectionParams(config)
    if (res.success) {
      ElMessage.success('连接成功')
      connected.value = true
      fetchStatus()
    } else {
      ElMessage.error(`连接失败: ${res.message}`)
      connected.value = false
    }
  } catch (error) {
    console.error('测试连接失败:', error)
    ElMessage.error('测试连接失败')
    connected.value = false
  } finally {
    testing.value = false
  }
}

// 查看集合
const viewCollection = (collection) => {
  // 跳转到集合详情页
  ElMessage.info(`查看集合 ${collection.name} 的详细信息`)
}

// 删除集合
const dropCollection = (collection) => {
  ElMessageBox.confirm(`确认删除集合 ${collection.name}？此操作不可恢复！`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await dropMongoDBCollection(collection.name)
      ElMessage.success('集合删除成功')
      fetchCollections()
    } catch (error) {
      console.error('删除集合失败:', error)
      ElMessage.error('删除集合失败')
    }
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fetchConfig()
}

// 格式化大小
const formatSize = (bytes) => {
  if (bytes === 0 || bytes === undefined) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.mongo-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.database-info {
  margin-top: 30px;
}

.collections-section {
  margin-top: 30px;
}

h3 {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}
</style> 