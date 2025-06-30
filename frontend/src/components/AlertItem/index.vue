<template>
  <div class="alert-item" :class="{ 'is-resolved': alert.is_resolved }">
    <div class="alert-icon">
      <i :class="alertIcon" :style="{ color: alertColor }"></i>
    </div>
    
    <div class="alert-content">
      <div class="alert-header">
        <span class="alert-type" :style="{ color: alertColor }">{{ alertTypeText }}</span>
        <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
      </div>
      
      <div class="alert-message">{{ alert.message }}</div>
      
      <div class="alert-info">
        <div class="info-row">
          <span class="info-label">服务器：</span>
          <span class="info-value">{{ alert.server_name }}</span>
        </div>
        
        <div class="info-row" v-if="alert.gpu_model">
          <span class="info-label">GPU：</span>
          <span class="info-value">{{ alert.gpu_model }}</span>
        </div>
        
        <div class="info-row" v-if="alert.business_name">
          <span class="info-label">业务：</span>
          <span class="info-value">{{ alert.business_name }}</span>
        </div>
        
        <div class="info-row" v-if="hasValue">
          <span class="info-label">数值：</span>
          <span class="info-value">{{ alert.value }}{{ valueUnit }}
            <span class="sub-text">阈值: {{ alert.threshold }}{{ valueUnit }}</span>
          </span>
        </div>
      </div>
    </div>
    
    <div class="alert-actions">
      <el-button 
        v-if="!alert.is_resolved" 
        size="small" 
        type="primary" 
        plain 
        @click="handleResolve"
      >标记已解决</el-button>
      
      <el-button 
        v-if="alert.is_resolved" 
        size="small" 
        type="info" 
        plain 
        disabled
      >已解决 ({{ formatTime(alert.resolved_at) }})</el-button>
      
      <el-button 
        size="small" 
        type="link" 
        @click="viewDetail"
      >查看详情</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertItem',
  props: {
    alert: {
      type: Object,
      required: true
    }
  },
  computed: {
    alertTypeText() {
      const typeMap = {
        'gpu_temp': 'GPU温度告警',
        'gpu_usage': 'GPU使用率告警',
        'server_offline': '服务器离线告警',
        'business_error': '业务异常告警'
      }
      return typeMap[this.alert.alert_type] || this.alert.alert_type
    },
    alertIcon() {
      const iconMap = {
        'gpu_temp': 'el-icon-warning',
        'gpu_usage': 'el-icon-warning',
        'server_offline': 'el-icon-error',
        'business_error': 'el-icon-warning'
      }
      return iconMap[this.alert.alert_type] || 'el-icon-warning'
    },
    alertColor() {
      const colorMap = {
        'gpu_temp': '#ff9500',
        'gpu_usage': '#ff9500',
        'server_offline': '#ff3b30',
        'business_error': '#ff3b30'
      }
      return colorMap[this.alert.alert_type] || '#ff9500'
    },
    hasValue() {
      return this.alert.value !== undefined && this.alert.value !== null
    },
    valueUnit() {
      if (this.alert.alert_type === 'gpu_temp') return ' ℃'
      if (this.alert.alert_type === 'gpu_usage') return ' %'
      return ''
    }
  },
  methods: {
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    handleResolve() {
      this.$emit('resolve', this.alert.id)
    },
    viewDetail() {
      // 根据告警类型跳转到不同详情页
      if (this.alert.gpu_id) {
        this.$router.push(`/gpus/detail/${this.alert.gpu_id}`)
      } else if (this.alert.business_id) {
        this.$router.push(`/business/detail/${this.alert.business_id}`)
      } else if (this.alert.server_id) {
        this.$router.push(`/servers/detail/${this.alert.server_id}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-item {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  position: relative;
  
  &.is-resolved {
    opacity: 0.7;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(245, 245, 245, 0.4);
      border-radius: 12px;
      pointer-events: none;
    }
  }
  
  .alert-icon {
    padding-right: 16px;
    
    i {
      font-size: 24px;
    }
  }
  
  .alert-content {
    flex: 1;
    overflow: hidden;
    
    .alert-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .alert-type {
        font-weight: 500;
        font-size: 16px;
      }
      
      .alert-time {
        font-size: 14px;
        color: #86868b;
      }
    }
    
    .alert-message {
      font-size: 15px;
      margin-bottom: 12px;
      color: #1d1d1f;
      line-height: 1.5;
    }
    
    .alert-info {
      font-size: 14px;
      color: #86868b;
      margin-bottom: 8px;
      
      .info-row {
        margin-bottom: 4px;
        
        .info-label {
          display: inline-block;
          width: 60px;
        }
        
        .info-value {
          font-weight: 500;
          color: #1d1d1f;
          
          .sub-text {
            margin-left: 10px;
            font-weight: normal;
            color: #86868b;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .alert-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 16px;
    min-width: 120px;
    
    button {
      margin-left: 0;
      margin-bottom: 8px;
      width: 100%;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .alert-item {
    flex-direction: column;
    
    .alert-icon {
      padding-right: 0;
      margin-bottom: 12px;
    }
    
    .alert-actions {
      padding-left: 0;
      margin-top: 16px;
      flex-direction: row;
      
      button {
        margin-right: 8px;
        margin-bottom: 0;
        width: auto;
      }
    }
  }
}
</style> 