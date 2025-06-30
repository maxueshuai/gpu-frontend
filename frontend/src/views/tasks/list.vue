<template>
  <div class="task-list-container">
    <el-card shadow="hover" class="list-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2 class="section-title">任务列表</h2>
          </div>
        </div>
      </template>

      <!-- 任务筛选 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索任务名称"
          style="width: 200px;"
          class="filter-item"
          clearable
          @input="handleSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px" class="filter-item" @change="handleFilterChange">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.serverId" placeholder="服务器" clearable style="width: 160px" class="filter-item" @change="handleFilterChange">
          <el-option v-for="server in servers" :key="server.id" :label="server.name" :value="server.id" />
        </el-select>
        <el-select v-model="filters.isDeleted" placeholder="删除状态" style="width: 120px" class="filter-item" @change="handleFilterChange">
          <el-option v-for="item in deletedOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch" class="filter-item">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button type="info" @click="resetFilters" class="filter-item">
          <el-icon><RefreshRight /></el-icon> 重置
        </el-button>
      </div>

      <!-- 任务列表 -->
      <el-table
        :data="taskList"
        style="width: 100%"
        border
        v-loading="loading"
        :empty-text="loading ? '加载中...' : '暂无任务数据'"
      >
        <el-table-column prop="name" label="任务名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="server_ip" label="服务器IP" width="140">
          <template #default="{ row }">
            {{ row.server_ip || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status || '')">
              {{ getStatusName(row.status || '') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                v-if="row.status === 'stopped' || row.status === 'completed' || row.status === 'failed'"
                type="primary"
                link
                @click="runTask(row)"
              >
                <el-icon><VideoPlay /></el-icon>
                <span>运行</span>
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'running'"
                type="warning"
                link
                @click="stopTask(row)"
              >
                <el-icon><VideoPause /></el-icon>
                <span>停止</span>
              </el-button>
              <el-button
                v-if="row.status !== 'running'"
                type="danger"
                link
                @click="deleteTask(row)"
              >
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Search as SearchIcon, Refresh as RefreshIcon, RefreshRight, VideoPlay, VideoPause, Delete } from '@element-plus/icons-vue'
import { getServers } from '@/api/servers'
import {
  getDeletedTasks
} from '@/api/task'
import {
  getTaskList as getTasks,
  deleteTask as apiDeleteTask, 
  stopTask as apiStopTask, 
  startTask as apiStartTask,
  directStopTask as apiDirectStopTask,
  syncTaskStatus as apiSyncTaskStatus
} from '@/api/tasks'

const router = useRouter()
const route = useRoute()  // 引入route对象，用于获取查询参数
const loading = ref(false)
const searchQuery = ref('')  // 确保正确定义搜索查询变量
const dateRange = ref([])
const taskList = ref([])
const servers = ref([])

// 状态选项
const statusOptions = ref([
  { label: '运行中', value: 'running' },
  { label: '等待中', value: 'pending' },
  { label: '已完成', value: 'completed' },
  { label: '已失败', value: 'failed' },
  { label: '已取消', value: 'canceled' },
  { label: '已停止', value: 'stopped' },
  { label: '重试中', value: 'retry' }
])

// 删除状态选项
const deletedOptions = ref([
  { label: '正常', value: 0 },
  { label: '已删除', value: 1 }
])

// 筛选条件
const filters = reactive({
  status: '',
  serverId: '',
  serverIp: '',  // 添加服务器IP字段
  startDate: '',
  endDate: '',
  isDeleted: 0  // 默认显示正常任务，修改为0而非false
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 初始加载状态标志
const isFirstLoad = ref(true);

// 将各种格式的is_deleted转换为布尔值
const convertToBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  // 处理null和undefined
  if (value === null || value === undefined) {
    return false;
  }
  return Boolean(value);
};

// 获取任务列表
const fetchTasks = async (page = 1, pageSize = pagination.pageSize) => {
  loading.value = true;
  try {
    const params = {
      page,
      page_size: pageSize,
      status: filters.status,
      server_id: filters.serverId,
      server_ip: filters.serverIp,
      keyword: searchQuery.value, // 修改为keyword
      start_date: filters.startDate,
      end_date: filters.endDate,
      is_deleted: filters.isDeleted
    };

    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('发送请求参数:', params);
    let response;
    
    // 根据是否查询删除的任务决定使用哪个API
    if (parseInt(params.is_deleted) === 1) {
      console.log('使用已删除任务专用API');
      response = await getDeletedTasks(params);
    } else {
      console.log('使用普通任务API');
      response = await getTasks(params);
    }
    
    console.log('API原始响应:', response);
    
    if (response) {
      console.log('处理前的响应数据:', response);
      
      // 处理不同的响应格式
      if (response.items) {
        // 直接包含items的格式
        taskList.value = response.items;
        pagination.total = response.total || response.items.length;
      } else if (response.data && response.data.items) {
        // 嵌套在data中的格式
        taskList.value = response.data.items;
        pagination.total = response.data.total || response.data.items.length;
      } else if (Array.isArray(response)) {
        // 数组格式
        taskList.value = response;
        pagination.total = response.length;
      } else {
        console.log('响应数据格式不符合预期');
        taskList.value = [];
        pagination.total = 0;
      }
      
      // 检查任务的is_deleted状态
      if (taskList.value.length > 0) {
        console.log('任务列表是否包含已删除任务:', taskList.value.map(task => ({
          id: task.id,
          name: task.name,
          is_deleted: task.is_deleted
        })));
      }
      
      // 打印搜索结果的详细信息
      console.log('搜索结果:', {
        关键词: searchQuery.value,
        总数: pagination.total,
        当前页数据: taskList.value.map(task => ({
          id: task.id,
          name: task.name,
          status: task.status,
          is_deleted: task.is_deleted
        }))
      });
    } else {
      console.log('响应数据为空');
      taskList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response);
      console.error('错误数据:', error.response.data);
    }
    ElMessage.error('获取任务列表失败: ' + (error.message || '未知错误'));
    taskList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取服务器列表（用于筛选）
const fetchServers = async () => {
  try {
    const res = await getServers()
    servers.value = res.items || []
  } catch (error) {
    console.error('获取服务器列表失败:', error)
  }
}

// 刷新列表
const refreshList = () => {
  fetchTasks()
}

// 同步任务状态
const syncStatus = async () => {
  try {
    // 询问用户是否要同步所有任务
    ElMessageBox.confirm(
      '是否同步所有任务的状态？选择"否"则只同步未完成的任务。',
      '同步任务状态',
      {
        confirmButtonText: '是，同步所有',
        cancelButtonText: '否，只同步未完成',
        type: 'info'
      }
    ).then(async () => {
      // 用户选择同步所有任务
      await performSync(true);
    }).catch(async () => {
      // 用户选择只同步未完成的任务
      await performSync(false);
    });
  } catch (error) {
    console.error('同步任务状态失败:', error)
    ElMessage.error('同步任务状态失败')
  }
}

// 执行同步
const performSync = async (syncAll = false) => {
  try {
    loading.value = true
    const res = await apiSyncTaskStatus(syncAll)
    if (res.success) {
      ElMessage.success(`同步完成，已更新${res.data.synced_count}个任务状态`)
    } else {
      ElMessage.info(res.message || '没有需要同步的任务')
    }
    fetchTasks()
  } catch (error) {
    console.error('同步任务状态失败:', error)
    ElMessage.error('同步任务状态失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  console.log('执行搜索，关键词:', searchQuery.value);
  pagination.currentPage = 1;
  fetchTasks(1, pagination.pageSize);
}

// 防抖处理搜索输入
let searchTimeout = null;
const handleSearchInput = (value) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    console.log('搜索输入:', value);
    searchQuery.value = value;
    handleSearch();
  }, 300);
}

// 重置筛选条件
const resetFilters = () => {
  filters.status = '';
  filters.serverId = '';
  filters.serverIp = '';
  filters.startDate = '';
  filters.endDate = '';
  filters.isDeleted = 0;
  searchQuery.value = '';
  handleSearch();
}

// 处理筛选条件变化
const handleFilterChange = () => {
  console.log('筛选条件变化:', filters);
  handleSearch();
}

// 处理日期范围变化
const handleDateRangeChange = (val) => {
  if (val && val.length === 2) {
    filters.startDate = val[0]
    filters.endDate = val[1]
  } else {
    filters.startDate = ''
    filters.endDate = ''
  }
  pagination.currentPage = 1
  fetchTasks()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchTasks(val, pagination.pageSize)
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1  // 重置到第一页
  fetchTasks(1, val)
}

// 停止任务
const stopTask = (task) => {
  ElMessageBox.confirm(`确认停止任务 "${task.name}"？`, '确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 优先使用mongo_task_id，其次使用stream_id，最后使用_id或id
      const mongoTaskId = task.mongo_task_id || task.stream_id || task._id || task.id
      const serverIp = task.server_ip
      
      console.log(`准备停止任务，任务信息:`, {
        id: task.id,
        name: task.name,
        status: task.status,
        mongo_task_id: task.mongo_task_id,
        stream_id: task.stream_id,
        server_ip: task.server_ip,
        使用的ID: mongoTaskId
      })
      
      // 尝试直接使用备用方法停止任务，更加可靠
      if (mongoTaskId && serverIp) {
        try {
          const directResponse = await apiDirectStopTask(mongoTaskId, serverIp)
          console.log('通过直接方式停止任务成功，响应：', directResponse)
          ElMessage.success('任务已成功停止')
          
          // 立即更新本地任务状态
          task.status = 'stopped'
          task.updated_at = new Date().toISOString()
          
          // 如果需要获取完整任务信息，可以通过API获取
          setTimeout(() => {
            fetchTasks() // 稍后刷新完整列表以确保与服务器同步
          }, 1000)
          
          return
        } catch (directError) {
          console.error('直接方式停止任务失败，尝试常规方式:', directError)
          // 直接方式失败，继续尝试常规方式
        }
      }
      
      // 常规方式停止
      const response = await apiStopTask(task.id, { mongo_task_id: mongoTaskId })
      console.log('常规方式停止任务成功，响应：', response)
      ElMessage.success('任务已停止')
      
      // 立即更新本地任务状态
      task.status = 'stopped'
      task.updated_at = new Date().toISOString()
      
      // 稍后刷新完整列表以确保与服务器同步
      setTimeout(() => {
        fetchTasks()
      }, 1000)
      
    } catch (error) {
      console.error('停止任务失败:', error)
      
      // 获取更详细的错误信息
      const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     '未知错误'
      
      // 如果错误是因为任务已经是停止状态，则不显示错误，而是成功提示
      if (errorMsg.includes('不能停止') || errorMsg.includes('already stopped')) {
        console.log('任务已经是停止状态，自动刷新列表')
        ElMessage.info('任务已经是停止状态')
        
        // 立即更新本地任务状态
        task.status = 'stopped'
        
        // 稍后刷新完整列表以确保与服务器同步
        setTimeout(() => {
          fetchTasks()
        }, 1000)
        
        return
      }
      
      console.error('错误详情:', {
        statusCode: error.response?.status,
        message: errorMsg,
        taskId: task.id,
        mongoTaskId: task.mongo_task_id
      })
      
      ElMessage.error(`停止任务失败: ${errorMsg}`)
    }
  }).catch(() => {
    // 用户取消操作，不做任何处理
  })
}

// 运行任务
const runTask = (task) => {
  ElMessageBox.confirm(`确认重新运行任务 "${task.name}"？`, '确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      // 优先使用mongo_task_id，其次使用stream_id，最后使用_id或id
      const mongoTaskId = task.mongo_task_id || task.stream_id || task._id || task.id
      const serverIp = task.server_ip
      
      console.log(`准备运行任务，任务信息:`, {
        id: task.id,
        name: task.name,
        status: task.status,
        mongo_task_id: task.mongo_task_id,
        stream_id: task.stream_id,
        使用的ID: mongoTaskId
      })
      
      const response = await apiStartTask(task.id, { mongo_task_id: mongoTaskId })
      console.log('运行任务成功，响应：', response)
      ElMessage.success('任务已启动')
      
      // 立即更新本地任务状态
      task.status = 'running'
      task.updated_at = new Date().toISOString()
      
      // 稍后刷新完整列表以确保与服务器同步
      setTimeout(() => {
        fetchTasks()
      }, 1000)
      
    } catch (error) {
      console.error('运行任务失败:', error)
      
      // 获取更详细的错误信息
      const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     '未知错误'
      
      // 如果错误是因为任务已经在运行，则不显示错误，而是提示信息
      if (errorMsg.includes('已经运行') || errorMsg.includes('already running')) {
        console.log('任务已经在运行中，更新本地状态')
        ElMessage.info('任务已经在运行中')
        
        // 立即更新本地任务状态
        task.status = 'running'
        
        // 稍后刷新完整列表以确保与服务器同步
        setTimeout(() => {
          fetchTasks()
        }, 1000)
        
        return
      }
      
      ElMessage.error(`运行任务失败: ${errorMsg}`)
    }
  }).catch(() => {
    // 用户取消操作，不做任何处理
  })
}

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(`确认删除任务 "${task.name}"？此操作不可恢复！`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      // 使用stream_id作为MongoDB任务ID
      const mongoTaskId = task.stream_id || task._id || task.id
      const response = await apiDeleteTask(task.id, { mongo_task_id: mongoTaskId })
      console.log('删除任务成功，响应：', response);
      ElMessage.success('任务已删除')
      fetchTasks()
    } catch (error) {
      console.error('删除任务失败:', error)
      const errorMsg = error.response?.data?.detail ||
                      error.response?.data?.message ||
                      error.message ||
                      '未知错误'
      ElMessage.error(`删除任务失败: ${errorMsg}`)
    }
  }).catch(() => {})
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'running': return 'success'
    case 'pending': return 'info'
    case 'completed': return 'primary'
    case 'failed': return 'danger'
    case 'canceled': return 'warning'
    default: return 'info'
  }
}

// 获取状态名称
const getStatusName = (status) => {
  switch (status) {
    case 'running': return '运行中'
    case 'pending': return '等待中'
    case 'completed': return '已完成'
    case 'failed': return '已失败'
    case 'canceled': return '已取消'
    case 'stopped': return '已停止'
    case 'retry': return '重试中'
    default: return status || '未知'
  }
}

// 获取服务器名称
const getServerNameById = (id) => {
  const server = servers.value.find(s => s.id === id)
  return server ? server.name : '未知'
}

// 初始化
onMounted(() => {
  console.log('组件挂载，开始初始化');
  // 检查URL查询参数中是否有server_ip
  if (route.query.server_ip) {
    filters.serverIp = route.query.server_ip;
    console.log(`从URL参数获取服务器IP: ${filters.serverIp}`);
  }
  
  console.log('开始获取服务器列表');
  fetchServers();
  console.log('开始获取任务列表');
  fetchTasks();
})
</script>

<style scoped>
.task-list-container {
  padding: 20px;
}

.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.list-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #0056b3;
  border-radius: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 250px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background-color: #f9f9fa;
  padding: 12px;
  border-radius: 8px;
}

.filter-item {
  margin-right: 10px;
  margin-bottom: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 自定义表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover td) {
  background-color: #f0f7ff !important;
}

/* 按钮样式优化 */
:deep(.el-button--primary.is-link),
:deep(.el-button--success.is-link),
:deep(.el-button--warning.is-link),
:deep(.el-button--danger.is-link) {
  padding: 4px 8px;
  height: 28px;
  margin-right: 8px;
  border-radius: 4px;
}

:deep(.el-button-group .el-button--primary.is-link) {
  color: #0056b3;
}

:deep(.el-button-group .el-button--warning.is-link) {
  color: #d87400;
}

:deep(.el-button-group .el-button--danger.is-link) {
  color: #c9302c;
}

:deep(.el-button-group .el-button--success.is-link) {
  color: #2a9d54;
}

/* 图标按钮样式 */
.text-no-show {
  display: inline-block !important;
  margin-left: 4px;
}

.no-text-button-group .el-button {
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
}

.no-text-button-group .el-button + .el-button {
  margin-left: 5px;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
}

.operation-buttons .el-button {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  height: 28px;
  background: transparent !important;
}

.operation-buttons .el-button span {
  margin-left: 4px;
}

.operation-buttons .el-button.el-button--primary {
  color: var(--el-color-primary);
}

.operation-buttons .el-button.el-button--warning {
  color: var(--el-color-warning);
}

.operation-buttons .el-button.el-button--danger {
  color: var(--el-color-danger);
}

/* 移除按钮的背景色和边框 */
:deep(.el-button--primary.is-link),
:deep(.el-button--success.is-link),
:deep(.el-button--warning.is-link),
:deep(.el-button--danger.is-link) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 移除按钮组的样式 */
.no-text-button-group {
  display: flex;
  gap: 8px;
}

.no-text-button-group .el-button {
  margin: 0;
}
</style> 