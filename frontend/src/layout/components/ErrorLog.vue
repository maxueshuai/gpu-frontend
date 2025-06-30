<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom"
    width="400"
    trigger="click"
  >
    <template #reference>
      <div class="error-log-container">
        <el-badge :is-dot="true" class="error-log-badge">
          <el-icon><Warning /></el-icon>
        </el-badge>
      </div>
    </template>

    <div class="error-log">
      <div class="error-log-header">
        <span>错误日志</span>
        <el-button type="link" @click="clearAll">清空</el-button>
      </div>
      <el-scrollbar height="300px">
        <div v-for="(item, index) in errorLogs" :key="index" class="error-log-item">
          <div class="error-log-item-header">
            <span class="error-log-item-title">{{ item.title }}</span>
            <span class="error-log-item-time">{{ item.time }}</span>
          </div>
          <div class="error-log-item-content">{{ item.message }}</div>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const visible = ref(false)
const errorLogs = ref([
  {
    title: '系统错误',
    message: '无法连接到GPU服务器',
    time: '2024-01-20 10:30:00'
  },
  {
    title: '任务错误',
    message: '任务执行失败：内存不足',
    time: '2024-01-20 09:15:00'
  }
])

const clearAll = () => {
  errorLogs.value = []
}
</script>

<style lang="scss" scoped>
.error-log-container {
  display: inline-block;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  transition: background .3s;
  -webkit-tap-highlight-color:transparent;

  &:hover {
    background: rgba(0, 0, 0, .025)
  }

  .error-log-badge {
    line-height: 50px;
  }
}

.error-log {
  .error-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e6e6e6;
    margin-bottom: 10px;

    span {
      font-size: 14px;
      font-weight: bold;
    }
  }

  .error-log-item {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .error-log-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;

      .error-log-item-title {
        font-size: 14px;
        color: #333;
        font-weight: bold;
      }

      .error-log-item-time {
        font-size: 12px;
        color: #999;
      }
    }

    .error-log-item-content {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }
  }
}
</style> 