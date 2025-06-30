export default [
  {
    title: '仪表盘',
    icon: 'el-icon-s-home',
    path: '/dashboard'
  },
  {
    title: '服务器管理',
    icon: 'el-icon-monitor',
    children: [
      {
        title: '服务器列表',
        path: '/servers'
      },
      {
        title: 'GPU管理',
        path: '/gpus'
      }
    ]
  },
  {
    title: '业务管理',
    icon: 'el-icon-s-operation',
    children: [
      {
        title: '业务列表',
        path: '/business'
      },
      {
        title: '业务日志',
        path: '/business-logs'
      }
    ]
  },
  {
    title: '告警管理',
    icon: 'el-icon-warning',
    children: [
      {
        title: '告警列表',
        path: '/alerts'
      },
      {
        title: '告警配置',
        path: '/alert-configs'
      }
    ]
  },
  {
    title: '系统管理',
    icon: 'el-icon-setting',
    children: [
      {
        title: '用户管理',
        path: '/users'
      },
      {
        title: '系统配置',
        path: '/system-config'
      },
      {
        title: '系统日志',
        path: '/system-logs'
      }
    ]
  }
] 