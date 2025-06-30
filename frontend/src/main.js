import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './assets/styles/apple-theme.scss'
import './assets/styles/global.scss'
import * as echarts from 'echarts'
import AppleUI from './components/AppleUI'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置 Element Plus
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
  experimentalFeatures: {
    virtualScrolling: true,
    virtualTree: true
  }
})

// 引入 Apple UI 组件
app.use(AppleUI)

// 配置全局属性
app.config.globalProperties.$echarts = echarts

// 性能优化配置
app.config.performance = true
app.config.unwrapInjectedRef = true

// 使用路由和状态管理
app.use(router)
app.use(store)

// 挂载应用
app.mount('#app') 