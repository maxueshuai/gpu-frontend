<template>
  <div class="screenfull-container">
    <el-icon @click="click"><FullScreen /></el-icon>
  </div>
</template>

<script setup>
import { FullScreen } from '@element-plus/icons-vue'

const click = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<style lang="scss" scoped>
.screenfull-container {
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