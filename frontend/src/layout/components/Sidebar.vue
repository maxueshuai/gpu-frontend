<template>
  <div :class="{'has-logo': showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBackground"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import variables from '@/assets/styles/variables.module.scss'

const route = useRoute()
const store = useStore()

const showLogo = computed(() => store.state.settings.sidebarLogo)
const routes = computed(() => store.state.permission.routes)
const isCollapse = computed(() => !store.state.app.sidebar.opened)
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100% - 50px);
  }
}

.el-scrollbar {
  height: 100%;

  :deep(.scrollbar-wrapper) {
    overflow-x: hidden !important;
  }

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
}

.el-menu {
  border: none;
  height: 100%;
  width: 100% !important;
}
</style> 