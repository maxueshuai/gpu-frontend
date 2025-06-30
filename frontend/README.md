# GPU服务器监控系统前端

> 详细的部署、测试、API、采集脚本等说明已全部合并进主文档 [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)。本文件仅保留前端代码结构和快速启动说明。

## 目录结构

```
frontend/
├── src/            # 前端源码
│   ├── api/        # API接口
│   ├── assets/     # 静态资源
│   ├── components/ # 公共组件
│   ├── layout/     # 布局组件
│   ├── router/     # 路由配置
│   ├── store/      # 状态管理
│   ├── utils/      # 工具函数
│   ├── views/      # 页面组件
│   └── ...
├── public/         # 公共资源
├── index.html      # HTML模板
├── package.json    # 项目配置
├── vite.config.js  # Vite配置
└── README.md       # 项目说明
```

## 快速启动

1. 安装依赖
   ```bash
   npm install
   ```
2. 启动开发服务器
   ```bash
   npm run dev
   ```
3. 访问页面
   - http://localhost:5173

> 更多详细说明请参见 [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## 项目简介
GPU服务器监控系统是一个用于监控和管理GPU服务器资源的Web应用。该系统提供以下功能：
- GPU服务器资源监控
- 任务管理和调度
- 用户认证和授权
- 系统配置管理
- 日志记录和查询

## 技术栈
- Vue 3: 前端框架
- Element Plus: UI组件库
- Vite: 构建工具
- Vuex: 状态管理
- Vue Router: 路由管理
- Axios: HTTP客户端

## 启动顺序说明
1. 确保已安装 Node.js (推荐 v16 或更高版本)
2. 进入前端项目目录
```bash
cd gpu-monitor/frontend
```

3. 安装依赖
```bash
npm install
```

4. 启动开发服务器
```bash
npm run dev
```

5. 访问应用
- 开发环境: http://localhost:5173
- 生产环境: http://localhost:3000

## 开发说明
1. 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

2. 构建生产版本
```bash
npm run build
```

3. 预览生产版本
```bash
npm run preview
```

## 环境变量配置
1. 开发环境 (.env.development)
```
VITE_API_BASE_URL=http://localhost:8000
```

2. 生产环境 (.env.production)
```
VITE_API_BASE_URL=http://your-production-api-url
```

## 部署说明
1. 构建生产版本
```bash
npm run build
```

2. 部署 dist 目录
- 将 dist 目录下的文件部署到 Web 服务器
- 配置服务器支持 HTML5 History 模式
- 配置适当的缓存策略

## 常见问题
1. 如果遇到 `'vue-cli-service' 不是内部或外部命令` 错误
   - 这是因为项目使用 Vite 而不是 Vue CLI
   - 请使用 `npm run dev` 而不是 `npm run serve`

2. 如果遇到依赖安装失败
   - 尝试删除 node_modules 目录和 package-lock.json
   - 重新运行 `npm install`

3. 路由参数类型注意事项
- 路由跳转和 API 调用时，务必保证 id 参数为字符串或数字类型，避免将整个对象作为 id 传递，防止出现 URL 变成 /api/v1/servers/[object Object] 的错误。
- 例如：router.push(`/servers/${row.id}`) 而不是 router.push(`/servers/${row}`)。

## 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
MIT License 