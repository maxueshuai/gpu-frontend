<template>
  <div class="server-detail">
    <div class="update-status" :class="{ 'error': !updateStatus.success }">
      <span>{{ updateStatus.message }}</span>
      <span v-if="updateStatus.timestamp">最后更新: {{ updateStatus.timestamp }}</span>
    </div>
    
    <el-button 
      :loading="loading" 
      @click="refreshData" 
      type="primary" 
      icon="el-icon-refresh">
      刷新
    </el-button>
    
    <!-- 在模板中添加Grafana面板 -->
    <div class="grafana-panels">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="panel-card">
            <div slot="header">
              <span>CPU使用率</span>
            </div>
            <grafana-panel
              dashboard-uid="server-metrics"
              panel-id="1"
              :height="300"
              :refresh-interval="30"
              :time-range="timeRange"
            />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="panel-card">
            <div slot="header">
              <span>内存使用率</span>
            </div>
            <grafana-panel
              dashboard-uid="server-metrics"
              panel-id="2"
              :height="300"
              :refresh-interval="30"
              :time-range="timeRange"
            />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="panel-card">
            <div slot="header">
              <span>磁盘使用率</span>
            </div>
            <grafana-panel
              dashboard-uid="server-metrics"
              panel-id="3"
              :height="300"
              :refresh-interval="30"
              :time-range="timeRange"
            />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="panel-card">
            <div slot="header">
              <span>网络流量</span>
            </div>
            <grafana-panel
              dashboard-uid="server-metrics"
              panel-id="4"
              :height="300"
              :refresh-interval="30"
              :time-range="timeRange"
            />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="panel-card">
            <div slot="header">
              <span>GPU使用情况</span>
            </div>
            <grafana-panel
              dashboard-uid="server-metrics"
              panel-id="5"
              :height="400"
              :refresh-interval="30"
              :time-range="timeRange"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="disk-card" style="margin-top: 24px;">
      <div slot="header">磁盘信息</div>
      <el-table :data="server.disks || []" style="width: 100%">
        <el-table-column prop="mount" label="挂载点" />
        <el-table-column prop="usage" label="使用率">
          <template #default="{ row }">
            <el-progress :percentage="row.usage" :status="row.usage > 90 ? 'exception' : 'success'" />
          </template>
        </el-table-column>
        <el-table-column prop="used" label="已用(GB)" />
        <el-table-column prop="total" label="总容量(GB)" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getServerDetail, getServerStatus, getServerGpus } from '../../api/server';
import GrafanaPanel from '@/components/GrafanaPanel.vue';

export default {
  components: {
    GrafanaPanel
  },

  data() {
    return {
      serverId: null,
      serverInfo: {},
      statusInfo: {},
      gpuList: [],
      loading: false,
      refreshTimer: null,
      updateStatus: {
        success: true,
        message: '',
        timestamp: ''
      },
      timeRange: {
        from: 'now-6h',
        to: 'now'
      }
    };
  },

  created() {
    this.serverId = this.$route.params.id;
    this.fetchServerInfo();
    this.startAutoRefresh();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },

  methods: {
    async fetchServerInfo() {
      try {
        this.loading = true;
        const [serverRes, statusRes, gpuRes] = await Promise.all([
          getServerDetail(this.serverId),
          getServerStatus(this.serverId),
          getServerGpus(this.serverId)
        ]);
        
        this.serverInfo = serverRes.data;
        this.statusInfo = statusRes.data;
        this.gpuList = gpuRes.data;
        
        // 更新状态
        this.updateStatus = {
          success: true,
          message: '更新成功',
          timestamp: new Date().toLocaleString()
        };
        
      } catch (error) {
        console.error('获取服务器详情失败:', error);
        this.updateStatus = {
          success: false,
          message: error.message || '更新失败',
          timestamp: new Date().toLocaleString()
        };
      } finally {
        this.loading = false;
      }
    },
    
    startAutoRefresh() {
      // 清除可能存在的旧定时器
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      
      // 设置新的定时器，每10秒更新一次
      this.refreshTimer = setInterval(() => {
        this.refreshData();
      }, 10 * 1000);
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    
    async refreshData() {
      if (!this.loading) {
        await this.fetchServerInfo();
      }
    },
    
    updateTimeRange(range) {
      this.timeRange = range;
    }
  }
};
</script>

<style scoped>
.grafana-panels {
  margin-top: 20px;
}

.panel-card {
  margin-bottom: 20px;
}

.panel-card :deep(.el-card__header) {
  padding: 10px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: bold;
}

.disk-card {
  margin-top: 24px;
}
</style> 