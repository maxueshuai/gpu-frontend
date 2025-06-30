<template>
  <div class="servers-container">
    <div class="title-container">
      <h2 class="page-title">服务器管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加服务器
        </el-button>
        <el-button type="primary" :loading="loading" @click="fetchData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索服务器名称或IP地址"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
        <el-option label="在线" value="online"></el-option>
        <el-option label="离线" value="offline"></el-option>
        <el-option label="维护中" value="maintenance"></el-option>
      </el-select>
    </div>
    
    <!-- 服务器列表 -->
    <el-row :gutter="20" class="server-list">
      <el-col 
        v-for="server in filteredServers" 
        :key="server.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
      >
        <server-card 
          :server="server"
          :server-status="serverStatusMap[server.id]"
          @refresh="fetchServerStatus(server.id)"
        />
      </el-col>
    </el-row>
    
    <!-- 添加/编辑服务器对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加服务器' : '编辑服务器'"
      v-model:visible="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="serverForm"
        :model="serverForm"
        :rules="serverRules"
        label-width="100px"
      >
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="serverForm.name" placeholder="请输入服务器名称"></el-input>
        </el-form-item>
        
        <el-form-item label="IP地址" prop="ip_address">
          <el-input v-model="serverForm.ip_address" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        
        <el-form-item label="操作系统" prop="os_version">
          <el-input v-model="serverForm.os_version" placeholder="操作系统版本（自动获取）"></el-input>
          <span class="form-tip">添加服务器后自动获取</span>
        </el-form-item>
        
        <el-form-item label="内存大小" prop="memory_total">
          <el-input v-model="serverForm.memory_total" disabled placeholder="内存大小（自动获取）"></el-input>
          <span class="form-tip">添加服务器后自动获取</span>
        </el-form-item>
        
        <el-form-item label="硬盘大小" prop="disk_total">
          <el-input v-model="serverForm.disk_total" disabled placeholder="硬盘大小（自动获取）"></el-input>
          <span class="form-tip">添加服务器后自动获取</span>
        </el-form-item>
        
        <el-divider content-position="left">Grafana 监控配置（可选）</el-divider>
        
        <el-form-item label="Grafana地址" prop="grafana_url">
          <el-input v-model="serverForm.grafana_url" placeholder="请输入Grafana监控地址"></el-input>
        </el-form-item>
        
        <el-form-item label="Grafana端口" prop="grafana_port">
          <el-input v-model="serverForm.grafana_port" placeholder="请输入Grafana端口号"></el-input>
        </el-form-item>
        
        <el-form-item label="用户名" prop="grafana_username">
          <el-input v-model="serverForm.grafana_username" placeholder="Grafana用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="grafana_password">
          <el-input v-model="serverForm.grafana_password" type="password" placeholder="Grafana密码"></el-input>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="serverForm.status" placeholder="请选择状态">
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template v-slot:footer>
<div  class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </div>
</template>
    </el-dialog>
  </div>
</template>

<script>
import { getServerList, createServer, updateServer, deleteServer, getServerStatus } from '@/api/server'
import ServerCard from '@/components/ServerCard'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'

export default {
  name: 'Servers',
  components: {
    ServerCard,
    Plus,
    Refresh,
    Search
  },
  data() {
    return {
      loading: false,
      submitting: false,
      servers: [],
      serverStatusMap: {},
      searchQuery: '',
      statusFilter: '',
      dialogVisible: false,
      dialogType: 'add', // 'add' or 'edit'
      serverForm: {
        name: '',
        ip_address: '',
        os_version: '',
        memory_total: '',
        disk_total: '',
        grafana_url: '',
        grafana_port: '',
        grafana_username: '',
        grafana_password: '',
        status: 'online'
      },
      serverRules: {
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
    }
  },
  computed: {
    filteredServers() {
      let result = this.servers
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(server => 
          server.name.toLowerCase().includes(query) ||
          server.ip_address.toLowerCase().includes(query)
        )
      }
      
      // 状态过滤
      if (this.statusFilter) {
        result = result.filter(server => server.status === this.statusFilter)
      }
      
      return result
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getServerList()
        this.servers = res.data || []
        
        // 获取每个服务器的状态
        await Promise.all(
          this.servers.map(server => this.fetchServerStatus(server.id))
        )
      } catch (error) {
        console.error('获取服务器列表失败', error)
        this.$message.error('获取服务器列表失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async fetchServerStatus(serverId) {
      try {
        const res = await getServerStatus(serverId)
        this.$set(this.serverStatusMap, serverId, res.data)
      } catch (error) {
        console.error(`获取服务器 ${serverId} 状态失败`, error)
      }
    },
    handleSearch() {
      // 搜索和筛选逻辑已通过计算属性实现
    },
    handleAdd() {
      this.dialogType = 'add'
      this.serverForm = {
        name: '',
        ip_address: '',
        os_version: '',
        memory_total: '',
        disk_total: '',
        grafana_url: '',
        grafana_port: '',
        grafana_username: '',
        grafana_password: '',
        status: 'online'
      }
      this.dialogVisible = true
    },
    handleEdit(server) {
      this.dialogType = 'edit'
      this.serverForm = { ...server }
      this.dialogVisible = true
    },
    handleDelete(server) {
      this.$confirm('确认删除该服务器吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await deleteServer(server.id)
          this.$message.success('删除成功')
          this.fetchData()
        } catch (error) {
          console.error('删除服务器失败', error)
          this.$message.error('删除服务器失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    },
    handleDialogClose() {
      this.$refs.serverForm?.resetFields()
    },
    async handleSubmit() {
      this.$refs.serverForm.validate(async valid => {
        if (!valid) return
        
        this.submitting = true
        try {
          if (this.dialogType === 'add') {
            await createServer(this.serverForm)
            this.$message.success('添加服务器成功')
          } else {
            await updateServer(this.serverForm.id, this.serverForm)
            this.$message.success('更新服务器成功')
          }
          
          this.dialogVisible = false
          this.fetchData()
        } catch (error) {
          console.error('保存服务器失败', error)
          this.$message.error('保存服务器失败: ' + (error.message || '未知错误'))
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.servers-container {
  padding: 20px;
  
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      font-size: 22px;
      font-weight: 500;
      color: #1d1d1f;
      margin: 0;
    }
    
    .actions {
      button {
        margin-left: 12px;
      }
    }
  }
  
  .filter-container {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    
    .el-input {
      width: 300px;
    }
    
    .el-select {
      width: 120px;
    }
  }
  
  .server-list {
    margin-bottom: 20px;
  }
  
  .form-tip {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 3px;
  }
}

@media (max-width: 768px) {
  .servers-container {
    .filter-container {
      flex-direction: column;
      
      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }
}
</style> 