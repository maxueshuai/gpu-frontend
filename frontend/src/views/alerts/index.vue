<template>
  <div class="alert-management">
    <!-- 标题栏 -->
    <div class="title-container">
      <h2>告警统计</h2>
      <el-button type="primary" @click="handleRefresh" :loading="loading">
        刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-container">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>总告警数</span>
              <el-tag type="info">{{ stats.total || 0 }}</el-tag>
            </div>
          </template>
          <div class="stats-content">
            <div class="stats-item">
              <span class="label">未处理</span>
              <span class="value warning">{{ stats.unresolved || 0 }}</span>
            </div>
            <div class="stats-item">
              <span class="label">已处理</span>
              <span class="value success">{{ stats.resolved || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>严重告警</span>
              <el-tag type="danger">{{ stats.critical || 0 }}</el-tag>
            </div>
          </template>
          <div class="stats-content">
            <div class="stats-item">
              <span class="label">未处理</span>
              <span class="value danger">{{ stats.critical_unresolved || 0 }}</span>
            </div>
            <div class="stats-item">
              <span class="label">已处理</span>
              <span class="value success">{{ stats.critical_resolved || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>警告</span>
              <el-tag type="warning">{{ stats.warning || 0 }}</el-tag>
            </div>
          </template>
          <div class="stats-content">
            <div class="stats-item">
              <span class="label">未处理</span>
              <span class="value warning">{{ stats.warning_unresolved || 0 }}</span>
            </div>
            <div class="stats-item">
              <span class="label">已处理</span>
              <span class="value success">{{ stats.warning_resolved || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <template #header>
            <div class="card-header">
              <span>今日告警</span>
              <el-tag type="info">{{ stats.today || 0 }}</el-tag>
            </div>
          </template>
          <div class="stats-content">
            <div class="stats-item">
              <span class="label">未处理</span>
              <span class="value warning">{{ stats.today_unresolved || 0 }}</span>
            </div>
            <div class="stats-item">
              <span class="label">已处理</span>
              <span class="value success">{{ stats.today_resolved || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索告警..."
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="filterLevel" placeholder="告警级别" clearable>
        <el-option label="严重" value="critical" />
        <el-option label="警告" value="warning" />
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="处理状态" clearable>
        <el-option label="未处理" value="unresolved" />
        <el-option label="已处理" value="resolved" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
    </div>

    <!-- 告警列表 -->
    <el-table
      v-loading="loading"
      :data="filteredAlerts"
      style="width: 100%"
      border
    >
      <el-table-column prop="level" label="级别" width="100">
        <template #default="{ row }">
          <el-tag :type="getLevelTag(row.level)">
            {{ getLevelLabel(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="target" label="告警对象" width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="handleTargetClick(row)">
            {{ row.target }}
          </el-link>
        </template>
      </el-table-column>
      
      <el-table-column prop="message" label="告警信息" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="created_at" label="时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              size="small"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.status === 'unresolved'"
              type="success"
              size="small"
              @click="handleResolve(row)"
            >
              处理
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="告警详情"
      width="600px"
    >
      <div v-if="currentAlert" class="alert-detail">
        <div class="detail-item">
          <span class="label">告警级别:</span>
          <el-tag :type="getLevelTag(currentAlert.level)">
            {{ getLevelLabel(currentAlert.level) }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <span class="label">告警类型:</span>
          <el-tag :type="getTypeTag(currentAlert.type)">
            {{ getTypeLabel(currentAlert.type) }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <span class="label">告警对象:</span>
          <el-link type="primary" @click="handleTargetClick(currentAlert)">
            {{ currentAlert.target }}
          </el-link>
        </div>
        
        <div class="detail-item">
          <span class="label">告警信息:</span>
          <span class="value">{{ currentAlert.message }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">告警时间:</span>
          <span class="value">{{ formatTime(currentAlert.created_at) }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">处理状态:</span>
          <el-tag :type="getStatusTag(currentAlert.status)">
            {{ getStatusLabel(currentAlert.status) }}
          </el-tag>
        </div>
        
        <div v-if="currentAlert.resolved_at" class="detail-item">
          <span class="label">处理时间:</span>
          <span class="value">{{ formatTime(currentAlert.resolved_at) }}</span>
        </div>
        
        <div v-if="currentAlert.resolved_by" class="detail-item">
          <span class="label">处理人:</span>
          <span class="value">{{ currentAlert.resolved_by }}</span>
        </div>
        
        <div v-if="currentAlert.resolution" class="detail-item">
          <span class="label">处理说明:</span>
          <span class="value">{{ currentAlert.resolution }}</span>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            v-if="currentAlert?.status === 'unresolved'"
            type="primary"
            @click="handleResolve(currentAlert)"
          >
            处理
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="resolveVisible"
      title="处理告警"
      width="500px"
    >
      <el-form
        ref="resolveFormRef"
        :model="resolveForm"
        :rules="resolveRules"
        label-width="100px"
      >
        <el-form-item label="处理说明" prop="resolution">
          <el-input
            v-model="resolveForm.resolution"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resolveVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResolveSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getAlertConfigs,
  getAlertDetail,
  updateAlertConfig,
  getAlertStats
} from '@/api/alert'
import { formatTime } from '@/utils/format'
import { useRouter } from 'vue-router'

export default {
  name: 'AlertManagement',
  
  components: {
    Search
  },
  
  setup() {
    const router = useRouter()
    
    // 数据
    const loading = ref(false)
    const submitting = ref(false)
    const alerts = ref([])
    const stats = ref({})
    const searchQuery = ref('')
    const filterLevel = ref('')
    const filterStatus = ref('')
    const dateRange = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const detailVisible = ref(false)
    const resolveVisible = ref(false)
    const currentAlert = ref(null)
    const resolveFormRef = ref(null)
    
    const resolveForm = ref({
      resolution: ''
    })
    
    const resolveRules = {
      resolution: [
        { required: true, message: '请输入处理说明', trigger: 'blur' }
      ]
    }
    
    // 计算属性
    const filteredAlerts = computed(() => {
      return alerts.value.filter(alert => {
        const matchQuery = !searchQuery.value || 
          alert.message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          alert.target.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchLevel = !filterLevel.value || alert.level === filterLevel.value
        const matchStatus = !filterStatus.value || alert.status === filterStatus.value
        const matchDate = !dateRange.value?.length || 
          (new Date(alert.created_at) >= new Date(dateRange.value[0]) &&
           new Date(alert.created_at) <= new Date(dateRange.value[1]))
        return matchQuery && matchLevel && matchStatus && matchDate
      })
    })
    
    // 方法
    const fetchData = async () => {
      try {
        loading.value = true
        const [alertsRes, statsRes] = await Promise.all([
          getAlertConfigs({
            page: currentPage.value,
            per_page: pageSize.value
          }),
          getAlertStats()
        ])
        
        if (alertsRes.code === 200) {
          alerts.value = alertsRes.items || []
          total.value = alertsRes.total || 0
        }
        
        if (statsRes.code === 200) {
          stats.value = statsRes
        }
      } catch (error) {
        ElMessage.error('获取数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleRefresh = () => {
      fetchData()
    }
    
    const handleDetail = async (row) => {
      try {
        const res = await getAlertDetail(row.id)
        if (res.code === 200) {
          currentAlert.value = res.data
          detailVisible.value = true
        }
      } catch (error) {
        ElMessage.error('获取告警详情失败')
      }
    }
    
    const handleResolve = (row) => {
      currentAlert.value = row
      resolveForm.value = {
        resolution: ''
      }
      resolveVisible.value = true
    }
    
    const handleResolveSubmit = async () => {
      if (!resolveFormRef.value) return
      
      try {
        await resolveFormRef.value.validate()
        submitting.value = true
        
        const res = await updateAlertConfig(currentAlert.value.id, {
          status: 'resolved',
          resolution: resolveForm.value.resolution
        })
        
        if (res.code === 200) {
          ElMessage.success('处理成功')
          resolveVisible.value = false
          detailVisible.value = false
          fetchData()
        }
      } catch (error) {
        ElMessage.error('处理失败')
      } finally {
        submitting.value = false
      }
    }
    
    const handleTargetClick = (row) => {
      // 根据告警类型跳转到对应的详情页面
      const type = row.type.split('_')[0]
      const id = row.target_id
      
      switch (type) {
        case 'server':
          router.push(`/servers/${id}`)
          break
        case 'gpu':
          router.push(`/gpus/${id}`)
          break
        case 'business':
          router.push(`/business/${id}`)
          break
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      fetchData()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      fetchData()
    }
    
    // 工具方法
    const getLevelLabel = (level) => {
      return level === 'critical' ? '严重' : '警告'
    }
    
    const getLevelTag = (level) => {
      return level === 'critical' ? 'danger' : 'warning'
    }
    
    const getTypeLabel = (type) => {
      const types = {
        server_offline: '服务器离线',
        server_high_cpu: '服务器CPU使用率过高',
        server_high_memory: '服务器内存使用率过高',
        gpu_usage: 'GPU使用率过高',
        gpu_temperature: 'GPU温度过高',
        gpu_memory: 'GPU显存使用率过高',
        business_error: '业务运行错误',
        business_offline: '业务离线'
      }
      return types[type] || type
    }
    
    const getTypeTag = (type) => {
      const tags = {
        server_offline: 'danger',
        server_high_cpu: 'warning',
        server_high_memory: 'warning',
        gpu_usage: 'warning',
        gpu_temperature: 'danger',
        gpu_memory: 'warning',
        business_error: 'danger',
        business_offline: 'warning'
      }
      return tags[type] || 'info'
    }
    
    const getStatusLabel = (status) => {
      return status === 'unresolved' ? '未处理' : '已处理'
    }
    
    const getStatusTag = (status) => {
      return status === 'unresolved' ? 'warning' : 'success'
    }
    
    const formatTime = (time) => {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    }
    
    // 生命周期
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      submitting,
      alerts,
      stats,
      searchQuery,
      filterLevel,
      filterStatus,
      dateRange,
      currentPage,
      pageSize,
      total,
      detailVisible,
      resolveVisible,
      currentAlert,
      resolveFormRef,
      resolveForm,
      resolveRules,
      filteredAlerts,
      handleRefresh,
      handleDetail,
      handleResolve,
      handleResolveSubmit,
      handleTargetClick,
      handleSizeChange,
      handleCurrentChange,
      getLevelLabel,
      getLevelTag,
      getTypeLabel,
      getTypeTag,
      getStatusLabel,
      getStatusTag,
      formatTime
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-management {
  padding: 20px;
  
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
  }
  
  .stats-container {
    margin-bottom: 20px;
    
    .stats-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .stats-content {
        .stats-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .label {
            color: #666;
          }
          
          .value {
            font-weight: 500;
            
            &.success {
              color: #67c23a;
            }
            
            &.warning {
              color: #e6a23c;
            }
            
            &.danger {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
  
  .search-container {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    
    .search-input {
      width: 300px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .alert-detail {
    .detail-item {
      display: flex;
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        width: 100px;
        color: #666;
      }
      
      .value {
        flex: 1;
      }
    }
  }
}
</style>