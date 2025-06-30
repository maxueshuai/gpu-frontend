<template>
  <div class="server-config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button link @click="router.back()">
            <el-icon><Back /></el-icon>返回
          </el-button>
          <h3>{{ isEdit ? '编辑服务器' : '添加服务器' }}</h3>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="server-form"
      >
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务器名称" />
        </el-form-item>
        
        <el-form-item label="IP地址" prop="ip_address">
          <el-input v-model="form.ip_address" placeholder="请输入IP地址" />
        </el-form-item>
        
        <el-form-item label="端口">
          <el-input v-model="form.port" placeholder="请输入服务器端口" />
        </el-form-item>
        
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入服务器用户名" />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入服务器密码" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择服务器状态" style="width: 100%">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">Grafana监控配置（可选）</el-divider>
        
        <el-form-item label="Grafana URL">
          <el-input v-model="form.grafana_url" placeholder="请输入Grafana URL" />
        </el-form-item>
        
        <el-form-item label="Grafana 端口">
          <el-input v-model="form.grafana_port" placeholder="请输入Grafana端口" />
        </el-form-item>
        
        <el-form-item label="Grafana 用户名">
          <el-input v-model="form.grafana_username" placeholder="请输入Grafana用户名" />
        </el-form-item>
        
        <el-form-item label="Grafana 密码">
          <el-input v-model="form.grafana_password" placeholder="请输入Grafana密码" type="password" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存修改' : '添加服务器' }}
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { createServer, getServer, updateServer } from '@/api/servers'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)

// 判断是添加还是编辑
const serverId = computed(() => {
  const id = route.params.id
  // 修正：如果 id 是对象，取其 id 字段，否则直接返回
  if (id && typeof id === 'object') {
    return id.id || ''
  }
  return id
})
const isEdit = computed(() => {
  const result = !!serverId.value
  console.log('是否为编辑模式:', result) // 添加日志
  return result
})

// 表单数据
const form = reactive({
  name: '',
  ip_address: '',
  port: '22',
  username: '',
  password: '',
  grafana_url: '',
  grafana_port: '',
  grafana_username: '',
  grafana_password: '',
  status: 'online'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  ip_address: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 如果是编辑模式，获取服务器详情
const fetchServerDetail = async () => {
  try {
    console.log('Fetching server details for ID:', serverId);
    const response = await getServer(serverId);
    console.log('Server details response:', response);

    if (response) {
      form.name = response.name || '';
      form.ip_address = response.ip_address || '';
      form.port = response.port || 22;
      form.username = response.username || '';
      form.password = response.password || '';
      form.grafana_url = response.grafana_url || '';
      form.grafana_port = response.grafana_port || 3000;
      form.grafana_username = response.grafana_username || '';
      form.grafana_password = response.grafana_password || '';
      console.log('Updated form data:', form);
    } else {
      console.error('No server data received');
    }
  } catch (error) {
    console.error('Error fetching server details:', error);
  }
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 创建API请求数据，映射前端字段到后端字段
    const apiData = {
      name: form.name,
      ip_address: form.ip_address, // 保持与后端模型一致
      port: parseInt(form.port) || 22, // 确保是数字类型
      username: form.username || null,
      password: form.password || null,
      status: form.status,
      grafana_url: form.grafana_url || null,
      grafana_port: form.grafana_port || "3000",
      grafana_username: form.grafana_username || null,
      grafana_password: form.grafana_password || null
    }
    
    console.log('提交数据:', apiData)
    
    if (isEdit.value) {
      // 编辑服务器
      await updateServer(serverId.value, apiData)
      ElMessage.success('更新服务器成功')
    } else {
      // 添加服务器
      await createServer(apiData)
      ElMessage.success('添加服务器成功')
    }
    
    // 添加短暂延迟，确保API处理完成
    setTimeout(() => {
      router.push('/servers')
    }, 500)
  } catch (error) {
    console.error('保存服务器失败:', error)
    if (error.response && error.response.data && error.response.data.detail) {
      ElMessage.error('保存服务器失败：' + error.response.data.detail)
    } else {
      ElMessage.error('保存服务器失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  console.log('Component mounted, serverId:', serverId);
  if (serverId) {
    fetchServerDetail();
  }
});
</script>

<style lang="scss" scoped>
.server-config-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-card {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-tip {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 3px;
  }
}
</style> 