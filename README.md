# 📝 在线即时协同文档编辑系统 (Online Collaborative Document System)

> 软件工程课程设计项目：基于 CRDT 算法与 WebSocket 的多人实时在线文档协作平台。

## 📖 项目简介

本项目旨在解决远程办公场景下文档协作效率低、版本混乱的问题。系统实现了类似 Google Docs 或 腾讯文档的核心功能，支持多用户同时编辑同一文档，内容毫秒级同步，并提供历史版本回溯、权限管理及后台监管功能。

系统采用前后端分离架构，基于 **Docker** 容器化部署，确保了环境的一致性与易用性。

## ✨ 核心功能

- **👥 多人实时协同**：基于 Yjs 算法和 WebSocket，支持多端同时输入，解决并发冲突，实现毫秒级同步。
- **✨ 富文本编辑**：支持标题、粗体、列表、引用及**图片上传**与展示。
- **📍 光标感知**：实时显示协作者的头像、昵称及光标位置。
- **🔐 权限管理**：
  - 文档拥有者 (Owner) 可邀请他人协作，并分配 `VIEW` (只读) 或 `EDIT` (编辑) 权限。
  - JWT 身份鉴权，保护 API 接口安全。
- **CLOCK 历史版本**：支持手动保存版本快照，随时查看和回溯历史内容。
- **🛡️ 后台管理**：管理员可查看全站用户列表，强制管理或删除违规文档。

## 🛠️ 技术栈

| **模块**        | **技术选型**                | **说明**                    |
| --------------- | --------------------------- | --------------------------- |
| **前端**        | React 18, TypeScript, Vite  | UI 构建与交互               |
| **编辑器**      | Tiptap, Yjs                 | 富文本与协同核心算法        |
| **业务后端**    | Node.js, Express            | RESTful API (用户/文档管理) |
| **协同服务**    | WebSocket (ws), Y-Websocket | 处理长连接与增量更新        |
| **数据库**      | PostgreSQL, Prisma ORM      | 元数据持久化与数据建模      |
| **缓存/中间件** | Redis                       | 协同状态缓存与消息分发      |
| **部署/网关**   | Docker, Nginx               | 容器化编排与反向代理        |

## 📂 项目结构

Bash

```
online-doc-system/
├── client/                 # 前端项目 (React + Vite)
│   ├── src/components/     # 编辑器等组件
│   └── nginx.conf          # Nginx 配置文件
├── server-app/             # 业务后端 (Express + Prisma)
│   ├── src/controllers/    # 业务逻辑控制器
│   ├── src/routes/         # API 路由定义
│   └── prisma/             # 数据库模型 Schema
├── server/                 # 协同服务 (Y-Websocket)
│   └── y-websocket-server.js
└── docker-compose.yml      # Docker 编排文件
```

## 🚀 快速开始 (Getting Started)

### 方法一：使用 Docker 一键启动（推荐）

确保本地已安装 [Docker Desktop](https://www.google.com/search?q=https://www.docker.com/products/docker-desktop/)。

1. **克隆仓库**

   Bash

   ```
   git clone https://github.com/your-username/online-doc-system.git
   cd online-doc-system
   ```

2. 配置环境变量

   复制 server-app/.env.example 为 server-app/.env，并填入必要的数据库配置（Docker 模式下通常无需修改，使用默认即可）。

3. **启动服务**

   Bash

   ```
   docker-compose up -d --build
   ```

4. **访问系统**

   - 前端页面：`http://localhost:80` (或 `http://localhost:3000`)
   - API 服务：`http://localhost:5000`
   - 协同服务：`ws://localhost:1234`

### 方法二：本地手动运行

若不使用 Docker，需分别启动各个服务。

1. 基础设施

确保本地运行了 PostgreSQL (Port 5432) 和 Redis (Port 6379)。

**2. 启动业务后端**

Bash

```
cd server-app
npm install
npx prisma migrate dev  # 数据库迁移
npm run dev             # 运行在 http://localhost:5000
```

**3. 启动协同服务**

Bash

```
cd server
npm install
npm start               # 运行在 http://localhost:1234
```

**4. 启动前端**

Bash

```
cd client
npm install
npm run dev             # 运行在 http://localhost:5173
```

## 📸 系统截图

*(在此处替换为您实际的运行截图，这在实验报告中非常加分)*

| **登录/注册** | **文档列表** |
| ------------- | ------------ |
|               |              |

| **协同编辑 (多光标)** | **历史版本回溯** |
| --------------------- | ---------------- |
|                       |                  |

## 🧪 测试

本项目包含完整的单元测试与集成测试。

Bash

```
# 进入后端目录运行测试
cd server-app
npm test
```

## 👥 作者与贡献

- **Team Leader**: [姓名] - 架构设计 & 协同服务
- **Member**: [姓名] - 前端编辑器 & UI
- **Member**: [姓名] - 后端 API & 数据库

## 📄 版权说明

本项目为《软件工程》课程设计作业，遵循 MIT 开源协议。
