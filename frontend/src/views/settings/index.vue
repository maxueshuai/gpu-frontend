<template>
  <div class="settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-menu 
        :default-active="activeIndex" 
        class="settings-menu"
        router
      >
        <el-menu-item index="/settings/system">
          <el-icon><setting /></el-icon>
          <span>通用设置</span>
        </el-menu-item>
        <el-menu-item index="/settings/mongo-servers">
          <el-icon><data-analysis /></el-icon>
          <span>MongoDB 服务器</span>
        </el-menu-item>
        <el-menu-item index="/settings/alert-rules">
          <el-icon><bell /></el-icon>
          <span>告警规则</span>
        </el-menu-item>
        <el-menu-item index="/settings/users">
          <el-icon><user /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/settings/logs">
          <el-icon><document /></el-icon>
          <span>系统日志</span>
        </el-menu-item>
      </el-menu>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Setting, 
  DataAnalysis, 
  Bell, 
  User, 
  Document 
} from '@element-plus/icons-vue'

const route = useRoute()
const activeIndex = computed(() => route.path)
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-menu {
  border-right: none;
}
</style> 