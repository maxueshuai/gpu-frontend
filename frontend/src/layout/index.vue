<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapsed': !sidebarOpened }">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="logo" class="logo">
        <h1 class="logo-text" v-if="sidebarOpened">GPU服务器监控</h1>
      </div>
      
      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="!sidebarOpened"
        :collapse-transition="false"
        background-color="#ffffff"
        text-color="#1d1d1f"
        active-text-color="#0071e3"
        :router="true"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </div>
    
    <!-- 主要内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left-area">
          <i 
            :class="sidebarOpened ? 'el-icon-s-fold' : 'el-icon-s-unfold'" 
            class="fold-btn"
            @click="toggleSidebar"
          ></i>
          <breadcrumb />
        </div>
        
        <div class="right-area">
          <!-- 用户退出按钮 -->
          <el-dropdown trigger="hover">
            <el-button class="logout-btn" text>
              <el-icon class="user-icon"><UserFilled /></el-icon>
              {{ userInfo?.username || '用户' }}
              <el-icon class="arrow-icon"><CaretBottom /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <div class="app-container">
        <app-main />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { SwitchButton, UserFilled, CaretBottom } from '@element-plus/icons-vue'
import Breadcrumb from './components/Breadcrumb.vue'
import SidebarItem from './components/SidebarItem.vue'
import AppMain from './components/AppMain.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()

const sidebarOpened = computed(() => store.state.app.sidebar.opened)
const alertCount = computed(() => store.state.app.alertCount)
const userInfo = computed(() => store.state.user.userInfo)

const routes = computed(() => {
  return router.options.routes.filter(route => !route.hidden)
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const toggleSidebar = () => {
  store.dispatch('app/toggleSideBar')
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await store.dispatch('user/logout')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  
  .sidebar-container {
    width: 210px;
    height: 100vh;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    transition: width 0.3s;
    overflow: hidden;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1001;
    
    &.is-collapsed {
      width: 64px;
    }
    
    .logo-container {
      height: 50px;
      padding: 10px;
      display: flex;
      align-items: center;
      background: #fff;
      margin: 0;
      
      .logo {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      
      .logo-text {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1d1d1f;
        white-space: nowrap;
      }
    }

    .el-menu {
      border: none;
      width: 100% !important;
      margin: 0;
      padding: 0;
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100vh;
    padding: 0;
    margin: 0;
    margin-left: 210px;
    transition: margin-left 0.3s;
    
    .navbar {
      position: fixed;
      top: 0;
      right: 0;
      left: 210px;
      height: 50px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 15px;
      z-index: 1000;
      transition: left 0.3s;
      
      .left-area {
        display: flex;
        align-items: center;
        
        .fold-btn {
          font-size: 20px;
          cursor: pointer;
          margin-right: 15px;
          
          &:hover {
            color: #0071e3;
          }
        }
      }
      
      .right-area {
        display: flex;
        align-items: center;
        
        .logout-btn {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #606266;
          padding: 5px 12px;
          height: 32px;
          border-radius: 16px;
          transition: all 0.3s;
          
          &:hover {
            background-color: #f6f6f6;
            color: #409EFF;
          }
          
          .user-icon {
            margin-right: 6px;
            font-size: 16px;
          }
          
          .arrow-icon {
            margin-left: 4px;
            font-size: 12px;
          }
        }
      }
    }
    
    .app-container {
      flex: 1;
      overflow: auto;
      background: #f0f2f5;
      padding: 0;
      margin: 0;
      margin-top: 50px;
    }
  }
  
  &:has(.sidebar-container.is-collapsed) {
    .main-container {
      margin-left: 64px;
      
      .navbar {
        left: 64px;
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  
  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background-color: #f6f6f6;
    color: #409EFF;
  }
}
</style> 