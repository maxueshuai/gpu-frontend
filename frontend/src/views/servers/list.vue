<template>
  <div class="server-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="left">
            <el-input
              v-model="searchQuery"
              placeholder="搜索服务器"
              style="width: 200px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="right">
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加服务器
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="serverList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="服务器名称" min-width="120" />
        <el-table-column prop="ip" label="IP地址" min-width="120" />
        <el-table-column prop="port" label="端口" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="100" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="success" link @click="handleTasks(row)">任务</el-button>
            <el-button type="warning" link @click="handleConfig(row)">配置</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getServers, deleteServer } from '@/api/servers'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const serverList = ref([])

// 获取服务器列表
const fetchServerList = async () => {
  loading.value = true
  try {
    // 调用API获取服务器列表
    const response = await getServers({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value
    })
    
    // 处理返回的数据
    serverList.value = response.items.map(server => ({
      id: server.id,
      name: server.name,
      ip: server.ip_address,
      port: server.port,
      username: server.username,
      status: server.status
    }))
    
    total.value = response.total
  } catch (error) {
    console.error('获取服务器列表失败:', error)
    ElMessage.error('获取服务器列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchServerList()
}

// 添加服务器
const handleAdd = () => {
  router.push('/servers/config')
}

// 查看详情
const handleDetail = (row) => {
  router.push(`/servers/${row.id}`)
}

// 查看任务
const handleTasks = (row) => {
  router.push({
    path: '/tasks',
    query: {
      server_ip: row.ip
    }
  })
}

// 配置服务器
const handleConfig = (row) => {
  router.push(`/servers/${row.id}/config`)
}

// 删除服务器
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除服务器 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteServer(row.id)
      ElMessage.success('删除成功')
      fetchServerList()
    } catch (error) {
      console.error('删除服务器失败:', error)
      ElMessage.error('删除服务器失败')
    }
  }).catch(() => {})
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchServerList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchServerList()
}

onMounted(() => {
  fetchServerList()
})
</script>

<style lang="scss" scoped>
.server-list-container {
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
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>