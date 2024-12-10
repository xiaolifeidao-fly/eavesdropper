## commmon
```
公共组件
│   ├── api (请求服务端api代码)
│   ├── model (相关数据模型代码)
│   └── utils (相关常用工具代码)
├── tsconfig.json
└── package.json
环境安装 : pnpm install

```

## app

```
桌面端应用（electron）
client/app
├── src
│   ├── config (配置相关)
│   ├── kernel
│   │   ├── app.ts  (核心启动逻辑)
│   │   ├── windows.ts (窗口管理)
│   │   └── register (rpc 注册)
│   │   └── api (rpc 接口实现)
│   │   └── session (会话管理)
│   │   └── store (存储)
│   └── main.ts (程序入口)
├── tsconfig.json
├── package.sh
└── package.json

环境安装 : pnpm install

开发启动 : pnpm run dev

```

## webview

```
nextjs + react + antd

├── demo (相关demo案例)
├── src
│   ├── app (相关界面组件代码)
│   ├── components
│   │   ├── layout  (菜单、整体布局)
│   └── pages
│   │   ├── [...all].js  (前端中默认的api路由,类似express转发应用请求（可解决跨域问题）)
├── tsconfig.json
├── package.sh
└── package.json

环境安装 : pnpm install
开发启动 : pnpm run dev

```

