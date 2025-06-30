<template>
  <div class="business-control">
    <div class="control-header">
      <div class="business-info">
        <h3 class="business-name">{{ business.name }}</h3>
        <div class="business-meta">
          <span class="server-name">服务器: {{ business.server_name }}</span>
          <span class="gpu-info" v-if="business.gpu_indices">GPU: {{ business.gpu_indices }}</span>
        </div>
      </div>
      
      <div class="status-wrapper">
        <span class="status-tag" :class="business.status">{{ statusText }}</span>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="control-content">
      <div class="description" v-if="business.description">
        <p>{{ business.description }}</p>
      </div>
      
      <div class="command-info">
        <h4>执行命令</h4>
        <div class="command-box">
          {{ business.command }}
        </div>
      </div>
      
      <div class="runtime-info">
        <div class="info-row" v-if="business.start_time">
          <span class="info-label">启动时间:</span>
          <span class="info-value">{{ formatTime(business.start_time) }}</span>
        </div>
        
        <div class="info-row" v-if="business.log_path">
          <span class="info-label">日志路径:</span>
          <span class="info-value">{{ business.log_path }}</span>
          <el-button type="link" size="mini" @click="viewLog">查看日志</el-button>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="control-actions">
      <el-button 
        type="success" 
        :disabled="business.status === 'running' || loading" 
        @click="startBusiness"
      >
        <i class="el-icon-video-play"></i> 启动
      </el-button>
      
      <el-button 
        type="warning" 
        :disabled="business.status !== 'running' || loading" 
        @click="stopBusiness"
      >
        <i class="el-icon-video-pause"></i> 停止
      </el-button>
      
      <el-button 
        type="primary" 
        :disabled="business.status !== 'running' || loading" 
        @click="restartBusiness"
      >
        <i class="el-icon-refresh"></i> 重启
      </el-button>
      
      <el-button 
        type="info" 
        @click="refreshStatus"
        :loading="refreshing"
      >
        <i class="el-icon-refresh"></i> 刷新状态
      </el-button>
    </div>
    
    <!-- 日志查看对话框 -->
    <el-dialog
      title="业务日志"
      v-model:visible="logDialogVisible"
      width="80%"
      class="log-dialog"
    >
      <div class="log-toolbar">
        <el-button type="primary" size="small" @click="refreshLog">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
        <span class="log-path">{{ business.log_path }}</span>
      </div>
      
      <div class="log-content" v-loading="logLoading">
        <pre>{{ logContent }}</pre>
      </div>
      
      <template v-slot:footer>
<div  class="dialog-footer">
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </div>
</template>
    </el-dialog>
  </div>
</template>

<script>
import { startBusiness, stopBusiness, restartBusiness, getBusinessLog } from '@/api/business'

export default {
  name: 'BusinessControl',
  props: {
    business: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      logDialogVisible: false,
      logContent: '',
      logLoading: false
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        'running': '运行中',
        'stopped': '已停止',
        'error': '异常'
      }
      return statusMap[this.business.status] || this.business.status
    }
  },
  methods: {
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN')
    },
    async startBusiness() {
      this.loading = true
      try {
        await startBusiness(this.business.id)
        this.$message.success('业务启动成功')
        this.$emit('refresh')
      } catch (error) {
        console.error('启动业务失败', error)
        this.$message.error('启动业务失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async stopBusiness() {
      this.loading = true
      try {
        await stopBusiness(this.business.id)
        this.$message.success('业务停止成功')
        this.$emit('refresh')
      } catch (error) {
        console.error('停止业务失败', error)
        this.$message.error('停止业务失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async restartBusiness() {
      this.loading = true
      try {
        await restartBusiness(this.business.id)
        this.$message.success('业务重启成功')
        this.$emit('refresh')
      } catch (error) {
        console.error('重启业务失败', error)
        this.$message.error('重启业务失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    refreshStatus() {
      this.refreshing = true
      this.$emit('refresh')
      setTimeout(() => {
        this.refreshing = false
      }, 1000)
    },
    async viewLog() {
      if (!this.business.log_path) {
        this.$message.warning('未设置日志路径')
        return
      }
      
      this.logDialogVisible = true
      await this.refreshLog()
    },
    async refreshLog() {
      if (!this.business.log_path) return
      
      this.logLoading = true
      try {
        const res = await getBusinessLog(this.business.id)
        this.logContent = res.data || '暂无日志内容'
      } catch (error) {
        console.error('获取日志失败', error)
        this.logContent = '获取日志失败: ' + (error.message || '未知错误')
      } finally {
        this.logLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.business-control {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  
  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .business-info {
      .business-name {
        font-size: 18px;
        font-weight: 500;
        color: #1d1d1f;
        margin: 0 0 8px 0;
      }
      
      .business-meta {
        font-size: 14px;
        color: #86868b;
        
        .server-name, .gpu-info {
          margin-right: 16px;
        }
      }
    }
    
    .status-wrapper {
      .status-tag {
        display: inline-block;
        padding: 0 10px;
        height: 28px;
        line-height: 26px;
        font-size: 14px;
        border-radius: 14px;
        
        &.running {
          background-color: rgba(52, 199, 89, 0.1);
          color: #34c759;
          border: 1px solid rgba(52, 199, 89, 0.2);
        }
        
        &.stopped {
          background-color: rgba(142, 142, 147, 0.1);
          color: #8e8e93;
          border: 1px solid rgba(142, 142, 147, 0.2);
        }
        
        &.error {
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
    margin: 20px 0;
  }
  
  .control-content {
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #1d1d1f;
      margin-bottom: 20px;
    }
    
    .command-info {
      margin-bottom: 20px;
      
      h4 {
        font-size: 15px;
        font-weight: 500;
        margin: 0 0 10px 0;
        color: #1d1d1f;
      }
      
      .command-box {
        background-color: #f5f5f7;
        border-radius: 8px;
        padding: 12px;
        font-family: monospace;
        font-size: 14px;
        color: #1d1d1f;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
    
    .runtime-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .info-label {
          width: 80px;
          font-size: 14px;
          color: #86868b;
        }
        
        .info-value {
          font-size: 14px;
          color: #1d1d1f;
          font-weight: 500;
        }
        
        button {
          margin-left: 12px;
          padding: 0;
        }
      }
    }
  }
  
  .control-actions {
    display: flex;
    justify-content: flex-end;
    
    button {
      margin-left: 12px;
    }
  }
}

.log-dialog {
  .log-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .log-path {
      margin-left: 12px;
      font-size: 14px;
      color: #86868b;
    }
  }
  
  .log-content {
    max-height: 50vh;
    overflow-y: auto;
    background-color: #f5f5f7;
    border-radius: 8px;
    padding: 16px;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
    }
  }
}
</style> 