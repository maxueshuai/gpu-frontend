<template>
  <div class="search-container">
    <el-input
      ref="searchInput"
      v-model="search"
      placeholder="搜索页面"
      class="search-input"
      @keyup.enter.native="searchClick"
    >
      <template #prefix>
        <el-icon class="el-input__icon"><Search /></el-icon>
      </template>
    </el-input>
    <el-drawer
      v-model="show"
      :with-header="false"
      size="100%"
      direction="rtl"
      :visible.sync="show"
      :before-close="handleClose"
    >
      <div class="search-drawer">
        <div class="search-header">
          <el-input
            ref="searchInputDrawer"
            v-model="search"
            placeholder="搜索页面"
            class="search-input"
            @keyup.enter.native="searchClick"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="search-content">
          <div v-if="search" class="search-list">
            <div
              v-for="(item, index) in searchList"
              :key="index"
              class="search-item"
              @click="handleSelect(item)"
            >
              <el-icon><Document /></el-icon>
              <span>{{ item.title }}</span>
            </div>
          </div>
          <div v-else class="search-tip">
            <el-icon><Search /></el-icon>
            <span>输入关键字开始搜索</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Document } from '@element-plus/icons-vue'

const router = useRouter()
const search = ref('')
const show = ref(false)
const searchInput = ref(null)
const searchInputDrawer = ref(null)

const searchList = computed(() => {
  if (!search.value) return []
  return [
    { title: '首页', path: '/dashboard' },
    { title: 'GPU监控', path: '/gpu' },
    { title: '任务管理', path: '/tasks' },
    { title: '系统设置', path: '/settings' }
  ].filter(item => item.title.toLowerCase().includes(search.value.toLowerCase()))
})

const searchClick = () => {
  if (search.value) {
    show.value = true
  }
}

const handleSelect = (item) => {
  router.push(item.path)
  show.value = false
  search.value = ''
}

const handleClose = () => {
  show.value = false
  search.value = ''
}
</script>

<style lang="scss" scoped>
.search-container {
  display: inline-block;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  transition: background .3s;
  -webkit-tap-highlight-color:transparent;

  &:hover {
    background: rgba(0, 0, 0, .025)
  }

  .search-input {
    width: 200px;
    height: 100%;
    line-height: 50px;
    background: transparent;
    border-radius: 0;
    border: 0;
    color: #bfcbd9;
    cursor: pointer;

    :deep(.el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      background: transparent;
      color: #bfcbd9;
      cursor: pointer;
    }

    :deep(.el-input__prefix) {
      color: #bfcbd9;
    }
  }
}

.search-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-header {
    padding: 20px;
    border-bottom: 1px solid #e6e6e6;

    .search-input {
      :deep(.el-input__inner) {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        background: transparent;
        color: #333;
        font-size: 16px;
      }

      :deep(.el-input__prefix) {
        color: #909399;
      }
    }
  }

  .search-content {
    flex: 1;
    overflow: auto;
    padding: 20px;

    .search-list {
      .search-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        cursor: pointer;
        color: #333;
        font-size: 14px;

        &:hover {
          color: #409EFF;
        }

        .el-icon {
          margin-right: 8px;
        }
      }
    }

    .search-tip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      font-size: 14px;

      .el-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
    }
  }
}
</style> 