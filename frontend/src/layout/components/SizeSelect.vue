<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div class="size-select-container">
      <el-icon><Setting /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :command="item.value">
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'

const sizeOptions = ref([
  { label: '默认', value: 'default' },
  { label: '中等', value: 'medium' },
  { label: '小型', value: 'small' },
  { label: '迷你', value: 'mini' }
])

const handleSetSize = (size) => {
  // 设置全局尺寸
  document.documentElement.style.setProperty('--el-component-size', size)
}
</script>

<style lang="scss" scoped>
.size-select-container {
  display: inline-block;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  transition: background .3s;
  -webkit-tap-highlight-color:transparent;

  &:hover {
    background: rgba(0, 0, 0, .025)
  }

  .el-icon {
    line-height: 50px;
  }
}
</style> 