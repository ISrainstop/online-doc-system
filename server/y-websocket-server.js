// aaaaa/server/y-websocket-server.js

require('dotenv').config();
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const Y = require('yjs');
const { Client } = require('pg'); 

const PORT = process.env.PORT || 1234;
const REDIS_URL = process.env.REDIS_URL; 
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const DATABASE_URL = process.env.DATABASE_URL;

console.log('[Startup] Config check:');
console.log(`- PORT: ${PORT}`);
console.log(`- REDIS_URL: ${REDIS_URL ? 'Set' : 'Not Set'}`);
console.log(`- JWT_SECRET: ${JWT_SECRET.substring(0, 3)}***`);
console.log(`- DATABASE_URL: ${DATABASE_URL ? 'Set' : 'Not Set'}`);

// --- Redis 初始化 ---
let redis;
if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: null
  });
} else {
  const store = new Map();
  redis = {
    getBuffer: async (key) => store.get(key),
    set: async (key, val) => store.set(key, val),
  };
}

// --- Postgres 初始化 ---
let dbClient = null;
if (DATABASE_URL) {
  dbClient = new Client({ connectionString: DATABASE_URL });
  dbClient.connect()
    .then(() => console.log('[DB] Connected successfully'))
    .catch(e => console.error('[DB] Failed to connect', e));
}

// --- 持久化配置 ---
setPersistence({
  bindState: async (docName, ydoc) => {
    const key = `ydoc:${docName}`;
    try {
      const data = await redis.getBuffer(key);
      if (data) Y.applyUpdate(ydoc, data);
    } catch (err) {
      console.error(`[BindState] Error:`, err.message);
    }
    ydoc.on('update', async (update, origin) => {
      try {
        const fullState = Y.encodeStateAsUpdate(ydoc);
        await redis.set(key, Buffer.from(fullState));
      } catch (err) {
        console.error(`[Update] Error:`, err.message);
      }
    });
  },
  writeState: async (docName, ydoc) => {
    try {
      const key = `ydoc:${docName}`;
      const fullState = Y.encodeStateAsUpdate(ydoc);
      await redis.set(key, Buffer.from(fullState));
    } catch (err) {
      console.error(`[WriteState] Error:`, err.message);
    }
  }
});

// --- Server ---
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('y-websocket server running');
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
  const reject = (code, message) => {
    console.log(`[Auth] ❌ Rejected: ${message}`);
    socket.write(`HTTP/1.1 ${code} ${message}\r\n\r\n`);
    socket.destroy();
  };

  try {
    const parsed = url.parse(request.url, true);
    const docId = parsed.pathname.split('/')[1] || parsed.pathname.slice(1);
    const token = parsed.query.token;
    
    // 1. JWT 校验
    if (!token) return reject(401, 'Unauthorized');

    let userId, userRole;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
      userRole = decoded.role; // 🔥 获取用户角色
    } catch (e) {
      return reject(401, `Invalid Token: ${e.message}`);
    }

    // 2. 数据库权限校验
    if (dbClient) {
      try {
        // 🔥 修改 SQL: 允许管理员 (role='ADMIN') 访问任何未删除的文档
        const query = `
          SELECT 1 FROM "Document" d
          LEFT JOIN "DocumentCollaborator" c ON d.id = c."documentId"
          WHERE d.id = $1 
            AND d."isDeleted" = false
            AND (
              $3 = 'ADMIN' OR          -- 如果是管理员，直接通过
              d."createdById" = $2 OR  -- 或是创建者
              c."userId" = $2          -- 或是协作者
            )
          LIMIT 1;
        `;
        const res = await dbClient.query(query, [docId, userId, userRole]);
        
        if (res.rowCount === 0) {
           return reject(403, 'Forbidden');
        }
      } catch (dbErr) {
        console.error('[DB] Auth check error', dbErr);
        return reject(500, 'Internal Server Error');
      }
    }

    // 3. 升级连接
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, docId);
    });

  } catch (err) {
    console.error('[Upgrade] Error:', err);
    socket.destroy();
  }
});

wss.on('connection', (ws, req, docId) => {
  if (!docId) {
    const urlParts = req.url.split('?');
    docId = urlParts[0].slice(1) || 'default';
  }
  setupWSConnection(ws, req, { docName: docId, gc: true });
});

server.listen(PORT, () => {
  console.log(`[Startup] y-websocket listening on port ${PORT}`);
});