<template>
  <div class="server-management">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>服务器管理</span>
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>添加服务器
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="servers"
          :loading="loading"
          loading-text="加载中..."
          no-data-text="暂无服务器数据"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" small>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon small @click="testConnection(item)">
              <v-icon small>mdi-connection</v-icon>
            </v-btn>
            <v-btn icon small @click="viewDetail(item)">
              <v-icon small>mdi-eye</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="confirmDelete(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- 添加服务器对话框 -->
    <v-dialog v-model="addDialog" max-width="600px">
      <v-card>
        <v-card-title>添加服务器</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="serverForm.hostname"
              label="主机名/IP地址"
              :rules="[rules.required, rules.hostname]"
              required
            ></v-text-field>
            <v-text-field
              v-model="serverForm.username"
              label="用户名"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-text-field
              v-model.number="serverForm.port"
              label="SSH端口"
              type="number"
              :rules="[rules.required, rules.port]"
              required
            ></v-text-field>
            <v-text-field
              v-model="serverForm.password"
              label="密码"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.required]"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              required
            ></v-text-field>
            <v-textarea
              v-model="serverForm.description"
              label="描述（可选）"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeAddDialog">取消</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="!valid || submitting"
            @click="submitForm"
          >添加</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          您确定要删除服务器 <strong>{{ selectedServer.hostname }}</strong> 吗？此操作无法撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">取消</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteServer"
          >删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { getServers, addGpuServer, deleteServer, getServerGpuInfo } from '@/api/server'
import { reactive, ref, onMounted } from 'vue'

export default {
  name: 'ServerManagement',
  setup() {
    // 数据表格相关
    const headers = [
      { text: 'ID', value: 'id', sortable: true },
      { text: '主机名/IP', value: 'hostname', sortable: true },
      { text: '用户名', value: 'username' },
      { text: 'SSH端口', value: 'port' },
      { text: '状态', value: 'status' },
      { text: '描述', value: 'description' },
      { text: '添加时间', value: 'created_at' },
      { text: '操作', value: 'actions', sortable: false }
    ]
    const servers = ref([])
    const loading = ref(false)

    // 表单相关
    const form = ref(null)
    const valid = ref(false)
    const addDialog = ref(false)
    const showPassword = ref(false)
    const submitting = ref(false)
    const serverForm = reactive({
      hostname: '',
      username: '',
      port: 22,
      password: '',
      description: ''
    })
    const rules = {
      required: v => !!v || '此字段为必填项',
      hostname: v => /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]{0,61}[a-zA-Z0-9])?$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v) || '请输入有效的主机名或IP地址',
      port: v => (v > 0 && v <= 65535) || 'SSH端口必须在1-65535之间'
    }

    // 删除相关
    const deleteDialog = ref(false)
    const deleting = ref(false)
    const selectedServer = ref({})

    // 加载服务器列表
    const loadServers = async () => {
      loading.value = true
      try {
        const res = await getServers()
        servers.value = res.data.map(server => ({
          ...server,
          status: server.status || 'unknown'
        }))
      } catch (error) {
        console.error('加载服务器列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 表单提交
    const submitForm = async () => {
      if (!form.value.validate()) return
      
      submitting.value = true
      try {
        await addGpuServer(serverForm)
        // 重新加载服务器列表
        await loadServers()
        // 关闭对话框并重置表单
        closeAddDialog()
      } catch (error) {
        console.error('添加服务器失败:', error)
      } finally {
        submitting.value = false
      }
    }

    // 打开添加对话框
    const openAddDialog = () => {
      form.value && form.value.reset()
      serverForm.hostname = ''
      serverForm.username = ''
      serverForm.port = 22
      serverForm.password = ''
      serverForm.description = ''
      addDialog.value = true
    }

    // 关闭添加对话框
    const closeAddDialog = () => {
      addDialog.value = false
    }

    // 确认删除
    const confirmDelete = (server) => {
      selectedServer.value = server
      deleteDialog.value = true
    }

    // 删除服务器
    const deleteServer = async () => {
      deleting.value = true
      try {
        await deleteServer(selectedServer.value.id)
        await loadServers()
        deleteDialog.value = false
      } catch (error) {
        console.error('删除服务器失败:', error)
      } finally {
        deleting.value = false
      }
    }

    // 测试连接
    const testConnection = async (server) => {
      try {
        await getServerGpuInfo(server.id)
        // 可以在这里添加一个提示连接成功的逻辑
      } catch (error) {
        console.error('连接测试失败:', error)
        // 可以在这里添加一个提示连接失败的逻辑
      }
    }
    
    // 查看详情
    const viewDetail = (server) => {
      // 实现查看服务器详情的逻辑，可以是导航到详情页或打开详情对话框
      console.log('查看服务器详情:', server)
    }

    // 获取状态颜色
    const getStatusColor = (status) => {
      const statusMap = {
        'online': 'success',
        'offline': 'error',
        'unknown': 'grey'
      }
      return statusMap[status] || 'grey'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'unknown': '未知'
      }
      return statusMap[status] || '未知'
    }

    onMounted(() => {
      loadServers()
    })

    return {
      headers,
      servers,
      loading,
      form,
      valid,
      addDialog,
      serverForm,
      rules,
      showPassword,
      submitting,
      deleteDialog,
      selectedServer,
      deleting,
      loadServers,
      openAddDialog,
      closeAddDialog,
      submitForm,
      confirmDelete,
      deleteServer,
      testConnection,
      viewDetail,
      getStatusColor,
      getStatusText
    }
  }
}
</script>

<style scoped>
.server-management {
  padding: 16px;
}
</style> 