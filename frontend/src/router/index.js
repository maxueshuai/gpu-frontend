import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import store from '@/store'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register/index.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '系统总览', icon: 'Monitor' }
      }
    ]
  },
  {
    path: '/servers',
    component: Layout,
    meta: { title: '服务器管理', icon: 'Service' },
    children: [
      {
        path: '',
        name: 'ServerList',
        component: () => import('@/views/servers/list.vue'),
        meta: { title: '服务器列表' }
      },
      {
        path: 'config',
        name: 'AddServer',
        component: () => import('@/views/servers/config.vue'),
        meta: { title: '添加服务器' }
      },
      {
        path: ':id/config',
        name: 'ServerEdit',
        component: () => import('@/views/servers/config.vue'),
        meta: { title: '编辑服务器' },
        hidden: true
      },
      {
        path: ':id',
        name: 'ServerDetail',
        component: () => import('@/views/servers/detail.vue'),
        meta: { title: '服务器详情' },
        hidden: true,
        props: true
      },
      {
        path: ':id/tasks',
        name: 'ServerTasks',
        component: () => import('@/views/servers/tasks.vue'),
        meta: { title: '任务管理' },
        hidden: true
      }
    ]
  },
  {
    path: '/gpus',
    component: Layout,
    redirect: '/gpus/index',
    meta: { title: 'GPU管理', icon: 'Cpu' },
    children: [
      {
        path: 'index',
        name: 'GpuList',
        component: () => import('@/views/gpus/list.vue'),
        meta: { title: 'GPU列表' }
      },
      {
        path: ':id',
        name: 'GpuDetail',
        component: () => import('@/views/gpus/detail.vue'),
        meta: { title: 'GPU详情' },
        hidden: true
      }
    ]
  },
  // 任务管理模块
  {
    path: '/tasks',
    component: Layout,
    meta: { title: '任务管理', icon: 'List' },
    children: [
      {
        path: '',
        name: 'TaskList',
        component: () => import('@/views/tasks/list.vue'),
        meta: { title: '任务列表' }
      },
      {
        path: ':id',
        name: 'TaskDetail',
        component: () => import('@/views/tasks/detail.vue'),
        meta: { title: '任务详情' },
        hidden: true
      }
    ]
  },
  // 告警管理
  {
    path: '/alerts',
    component: Layout,
    meta: { title: '告警管理', icon: 'AlarmClock' },
    children: [
      {
        path: '',
        name: 'AlertList',
        component: () => import('@/views/alerts/list.vue'),
        meta: { title: '告警列表' }
      },
      {
        path: 'configs',
        name: 'AlertConfigs',
        component: () => import('@/views/alert-configs/index.vue'),
        meta: { 
          title: '告警配置',
          roles: ['admin']
        }
      },
      {
        path: 'overview',
        name: 'AlertOverview',
        component: () => import('@/views/alerts/index.vue'),
        meta: { title: '告警统计' }
      }
    ]
  },
  // 配置管理路由
  {
    path: '/configuration',
    component: Layout,
    redirect: '/configuration/database',
    meta: { title: '配置管理', icon: 'Setting' },
    children: [
      {
        path: 'database',
        name: 'DatabaseConfig',
        component: () => import('@/views/system/mongo.vue'),
        meta: { title: '数据库配置', icon: 'DataLine' }
      },
      {
        path: 'server',
        name: 'ServerConfigSettings',
        component: () => import('@/views/settings/MongoServers.vue'),
        meta: { title: '服务器配置', icon: 'Server' }
      }
    ]
  },
  // 系统管理路由
  {
    path: '/system',
    component: Layout,
    redirect: '/system/overview',
    meta: { title: '系统管理', icon: 'SetUp' },
    children: [
      {
        path: 'overview',
        name: 'SystemOverview',
        component: () => import('@/views/system/overview.vue'),
        meta: { title: '系统概览', icon: 'DataAnalysis' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/system/users/index.vue'),
        meta: { title: '用户管理', icon: 'UserFilled' }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/system-logs/index.vue'),
        meta: { title: '系统日志', icon: 'DocumentCopy' }
      }
    ]
  },
  // 重定向
  {
    path: '/server/add',
    redirect: '/servers/config'
  },
  {
    path: '/server/:id',
    redirect: to => ({ path: `/servers/${to.params.id}` })
  },
  {
    path: '/server/:id/tasks',
    redirect: to => ({ path: `/servers/${to.params.id}/tasks` })
  },
  {
    path: '/settings/mongodb',
    redirect: '/configuration/database'
  },
  {
    path: '/system/mongo',
    redirect: '/configuration/database'
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const token = store.state.user.token

  if (to.path === '/login' || to.path === '/register') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!token) {
      next(`/login?redirect=${to.path}`)
    } else {
      if (!store.state.user.userInfo) {
        try {
          await store.dispatch('user/getInfo')
          next()
        } catch (error) {
          await store.dispatch('user/resetToken')
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  }
})

export default router