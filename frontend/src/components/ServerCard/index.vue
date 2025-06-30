<template>
  <div class="server-card" :class="statusClass">
    <div class="server-header">
      <div class="server-title">
        <i class="el-icon-s-platform"></i>
        <div class="server-info">
          <h3 class="server-name">{{ server.name }}</h3>
          <p class="server-ip">{{ server.ip_address }}</p>
        </div>
      </div>
      <div class="server-status">
        <span class="status-tag" :class="serverStatus.status">{{ statusText }}</span>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="server-content">
      <!-- 系统信息 -->
      <div class="info-row">
        <div class="info-item">
          <div class="info-label">系统版本</div>
          <div class="info-value">{{ serverStatus.os_version }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">GPU数量</div>
          <div class="info-value">{{ serverStatus.gpu_count }} 个</div>
        </div>
      </div>
      
      <!-- 资源使用情况 -->
      <div v-if="serverStatus && serverStatus.status !== 'waiting'" class="resource-usage">
        <!-- CPU使用率 -->
        <div class="progress-item">
          <div class="progress-label">
            <span>CPU</span>
            <span class="progress-value">{{ serverStatus.cpu_usage }}%</span>
          </div>
          <el-progress 
            :percentage="serverStatus.cpu_usage" 
            :color="getUsageColor(serverStatus.cpu_usage)"
            :stroke-width="8"
          ></el-progress>
        </div>
        
        <!-- 内存使用率 -->
        <div class="progress-item">
          <div class="progress-label">
            <span>内存</span>
            <span class="progress-value">{{ serverStatus.memory_usage }}%</span>
          </div>
          <el-progress 
            :percentage="serverStatus.memory_usage" 
            :color="getUsageColor(serverStatus.memory_usage)"
            :stroke-width="8"
          ></el-progress>
        </div>
        
        <!-- 磁盘使用率 -->
        <div class="progress-item">
          <div class="progress-label">
            <span>磁盘</span>
            <span class="progress-value">{{ serverStatus.disk_usage }}%</span>
          </div>
          <el-progress 
            :percentage="serverStatus.disk_usage" 
            :color="getUsageColor(serverStatus.disk_usage)"
            :stroke-width="8"
          ></el-progress>
        </div>
      </div>
      
      <div v-else-if="serverStatus && serverStatus.status === 'waiting'" class="waiting-state">
        <i class="el-icon-loading"></i>
        <span>正在获取数据，请稍候...</span>
        <el-progress 
          :percentage="loadingProgress"
          :show-text="false"
          :stroke-width="4"
          class="waiting-progress"
        ></el-progress>
      </div>
      
      <div v-else class="loading-state">
        <i class="el-icon-loading"></i>
        <span>获取状态中...</span>
      </div>
    </div>
    
    <div class="server-footer">
      <el-button type="link" size="small" @click="viewDetail">查看详情</el-button>
      <el-button type="link" size="small" v-if="server.grafana_url" @click="viewGrafana">
        <i class="el-icon-data-analysis"></i>
        Grafana监控
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerCard',
  props: {
    server: {
      type: Object,
      required: true
    },
    serverStatus: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loadingProgress: 0,
      progressInterval: null
    }
  },
  computed: {
    statusClass() {
      return {
        'offline': this.serverStatus.status === 'offline',
        'maintenance': this.serverStatus.status === 'maintenance',
        'waiting': this.serverStatus && this.serverStatus.status === 'waiting'
      }
    },
    statusText() {
      const statusMap = {
        'online': '在线',
        'offline': '离线',
        'maintenance': '维护中',
        'waiting': '等待中'
      }
      return statusMap[this.serverStatus.status] || this.serverStatus.status
    }
  },
  watch: {
    'serverStatus.status': {
      handler(newVal) {
        if (newVal === 'waiting') {
          this.startProgressAnimation();
        } else {
          this.stopProgressAnimation();
        }
      },
      immediate: true
    }
  },
  methods: {
    getUsageColor(percentage) {
      if (percentage > 90) return '#ff3b30'
      if (percentage > 70) return '#ff9500'
      return '#34c759'
    },
    viewDetail() {
      this.$router.push(`/servers/detail/${this.server.id}`)
    },
    viewGrafana() {
      if (this.server.grafana_url) {
        this.$router.push(`/servers/detail/${this.server.id}?section=grafana`);
      }
    },
    startProgressAnimation() {
      this.stopProgressAnimation();
      this.loadingProgress = 0;
      this.progressInterval = setInterval(() => {
        // 缓慢增加进度但永远不到100%
        if (this.loadingProgress < 95) {
          this.loadingProgress += (95 - this.loadingProgress) * 0.05;
        }
      }, 500);
    },
    stopProgressAnimation() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }
  },
  beforeUnmount() {
    this.stopProgressAnimation();
  }
}
</script>

<style lang="scss" scoped>
.server-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  &.offline {
    border-left: 4px solid #ff3b30;
  }
  
  &.maintenance {
    border-left: 4px solid #ff9500;
  }
  
  &.waiting {
    border-left: 4px solid #409EFF;
  }
  
  .server-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .server-title {
      display: flex;
      align-items: center;
      
      i {
        font-size: 22px;
        margin-right: 12px;
        color: #0071e3;
      }
      
      .server-info {
        .server-name {
          font-size: 18px;
          font-weight: 500;
          color: #1d1d1f;
          margin: 0;
        }
        
        .server-ip {
          font-size: 14px;
          color: #86868b;
          margin: 5px 0 0 0;
        }
      }
    }
    
    .server-status {
      .status-tag {
        display: inline-block;
        padding: 0 8px;
        height: 24px;
        line-height: 22px;
        font-size: 12px;
        border-radius: 12px;
        
        &.online {
          background-color: rgba(52, 199, 89, 0.1);
          color: #34c759;
          border: 1px solid rgba(52, 199, 89, 0.2);
        }
        
        &.offline {
          background-color: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
          border: 1px solid rgba(255, 59, 48, 0.2);
        }
        
        &.maintenance {
          background-color: rgba(255, 149, 0, 0.1);
          color: #ff9500;
          border: 1px solid rgba(255, 149, 0, 0.2);
        }
        
        &.waiting {
          background-color: rgba(64, 158, 255, 0.1);
          color: #409EFF;
          border: 1px solid rgba(64, 158, 255, 0.2);
        }
      }
    }
  }
  
  .divider {
    height: 1px;
    background-color: #f0f0f0;
    margin-bottom: 16px;
  }
  
  .server-content {
    flex: 1;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      
      .info-item {
        .info-label {
          font-size: 14px;
          color: #86868b;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 15px;
          font-weight: 500;
          color: #1d1d1f;
        }
      }
    }
    
    .loading-state, .waiting-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 0;
      color: #909399;
      
      i {
        font-size: 24px;
        margin-bottom: 10px;
      }
      
      span {
        font-size: 14px;
      }
    }
    
    .waiting-state {
      .waiting-progress {
        margin-top: 15px;
        width: 90%;
      }
    }
    
    .resource-usage {
      .progress-item {
        margin-bottom: 16px;
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          span {
            font-size: 14px;
            color: #86868b;
          }
          
          .progress-value {
            font-weight: 500;
            color: #1d1d1f;
          }
        }
      }
    }
  }
  
  .server-footer {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
}
</style> 