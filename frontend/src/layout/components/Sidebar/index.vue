<template>
  <div :class="{'has-logo': showLogo}">
    <Logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :is-collapse="isCollapse"
        />
        
        <!-- 监控告警菜单组 -->
        <el-sub-menu index="monitoring" v-if="hasRole(['admin'])">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>监控告警</span>
          </template>
          
          <el-menu-item index="/alerts/configs">
            <el-icon><Bell /></el-icon>
            <span>告警配置</span>
          </el-menu-item>
          
          <el-menu-item index="/alerts/history">
            <el-icon><List /></el-icon>
            <span>告警历史</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import variables from '@/styles/variables.module.scss'
import { Bell, List, Monitor } from '@element-plus/icons-vue'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const store = useStore()

// 获取路由配置
const routes = computed(() => store.state.permission.routes)

// 是否折叠
const isCollapse = computed(() => !store.state.app.sidebar.opened)

// 是否显示Logo
const showLogo = computed(() => store.state.settings.sidebarLogo)

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 检查用户角色
const hasRole = (roles) => {
  const userRoles = store.state.user.roles
  return roles.some(role => userRoles.includes(role))
}
</script> 