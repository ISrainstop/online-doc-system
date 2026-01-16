# aaaaa/server-app/Dockerfile
FROM node:18-alpine

# 安装 openssl (Prisma 在 Alpine 下可能需要)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# 复制 Prisma Schema 并生成 Client
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000

# 这里 CMD 可以保留默认，docker-compose 中的 command 会覆盖它
CMD ["node", "dist/index.js"]