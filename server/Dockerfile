# aaaaa/server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm install

# 复制源码
COPY . .

# 暴露端口 (对应 y-websocket-server.js 中的 1234)
EXPOSE 1234

# 启动命令
CMD ["npm", "start"]