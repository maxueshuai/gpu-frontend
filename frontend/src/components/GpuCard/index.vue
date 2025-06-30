<template>
  <div class="gpu-card" :class="{ 'warning': isWarning }">
    <div class="gpu-header">
      <div class="gpu-title">
        <i class="el-icon-cpu"></i>
        <span class="gpu-name">{{ gpu.model }}</span>
      </div>
      <div class="gpu-status">
        <span class="status-tag" :class="temperatureClass">{{ temperatureText }}</span>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="gpu-content">
      <!-- GPU利用率 -->
      <div class="progress-item">
        <div class="progress-label">
          <span>GPU利用率</span>
          <span class="progress-value">{{ gpu.usage }}%</span>
        </div>
        <el-progress 
          :percentage="gpu.usage" 
          :color="getUsageColor(gpu.usage)"
          :stroke-width="8"
        ></el-progress>
      </div>
      
      <!-- 显存使用率 -->
      <div class="progress-item">
        <div class="progress-label">
          <span>显存</span>
          <span class="progress-value">{{ formatMemory(gpu.memory_used) }} / {{ formatMemory(gpu.memory_total) }}</span>
        </div>
        <el-progress 
          :percentage="memoryPercentage" 
          :color="getUsageColor(memoryPercentage)"
          :stroke-width="8"
        ></el-progress>
      </div>
      
      <!-- GPU温度与功率 -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-label">温度</div>
          <div class="stat-value" :style="{ color: getTemperatureColor(gpu.temperature) }">
            {{ gpu.temperature }} ℃
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">功率</div>
          <div class="stat-value">
            {{ gpu.power_usage }} W
          </div>
        </div>
      </div>
    </div>
    
    <div class="gpu-footer">
      <el-button type="link" size="small" @click="viewDetail">查看详情</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GpuCard',
  props: {
    gpu: {
      type: Object,
      required: true
    }
  },
  computed: {
    memoryPercentage() {
      if (!this.gpu.memory_total) return 0
      return Math.round((this.gpu.memory_used / this.gpu.memory_total) * 100)
    },
    isWarning() {
      return this.gpu.temperature > 80 || this.gpu.usage > 90
    },
    temperatureClass() {
      if (this.gpu.temperature > 85) return 'danger'
      if (this.gpu.temperature > 75) return 'warning'
      return 'success'
    },
    temperatureText() {
      if (this.gpu.temperature > 85) return '温度过高'
      if (this.gpu.temperature > 75) return '温度警告'
      return '温度正常'
    }
  },
  methods: {
    formatMemory(value) {
      if (!value) return '0 GB';
      if (value < 1024 * 1024 * 1024) return `${value} MB`;
      return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
    },
    getUsageColor(percentage) {
      if (percentage > 90) return '#ff3b30'
      if (percentage > 70) return '#ff9500'
      return '#34c759'
    },
    getTemperatureColor(temp) {
      if (temp > 85) return '#ff3b30'
      if (temp > 75) return '#ff9500'
      return '#34c759'
    },
    viewDetail() {
      this.$router.push(`/gpus/detail/${this.gpu.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.gpu-card {
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
  
  &.warning {
    border-left: 4px solid #ff9500;
  }
  
  .gpu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .gpu-title {
      display: flex;
      align-items: center;
      
      i {
        font-size: 20px;
        margin-right: 10px;
        color: #0071e3;
      }
      
      .gpu-name {
        font-size: 18px;
        font-weight: 500;
        color: #1d1d1f;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 170px;
      }
    }
    
    .gpu-status {
      .status-tag {
        display: inline-block;
        padding: 0 8px;
        height: 24px;
        line-height: 22px;
        font-size: 12px;
        border-radius: 12px;
        
        &.success {
          background-color: rgba(52, 199, 89, 0.1);
          color: #34c759;
          border: 1px solid rgba(52, 199, 89, 0.2);
        }
        
        &.warning {
          background-color: rgba(255, 149, 0, 0.1);
          color: #ff9500;
          border: 1px solid rgba(255, 149, 0, 0.2);
        }
        
        &.danger {
          background-color: rgba(255, 59, 48, 0.1);
          color: #ff3b30;
          border: 1px solid rgba(255, 59, 48, 0.2);
        }
      }
    }
  }
  
  .divider {
    height: 1px;
    background-color: #f0f0f0;
    margin-bottom: 16px;
  }
  
  .gpu-content {
    flex: 1;
    
    .progress-item {
      margin-bottom: 16px;
      
      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #1d1d1f;
        
        .progress-value {
          font-weight: 500;
        }
      }
    }
    
    .stats-row {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        
        .stat-label {
          font-size: 14px;
          color: #86868b;
          margin-bottom: 6px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 500;
          color: #1d1d1f;
        }
      }
    }
  }
  
  .gpu-footer {
    margin-top: 16px;
    text-align: right;
  }
}
</style> 