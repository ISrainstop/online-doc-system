// aaaaa/server-app/src/routes/admin.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { 
  getAllUsers, 
  deleteUser,        // 新增
  getAllDocuments,   // 新增
  getSystemStats 
} from '../controllers/admin.controller';

const router = Router();

// 全局中间件：验证 Token + 验证 Admin 身份
router.use(authenticateToken, requireAdmin);

// 用户管理
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser); // 🔥 删除用户接口

// 文档管理
router.get('/documents', getAllDocuments); // 🔥 获取所有文档列表
// router.delete('/documents/:id') 可以复用 document.routes.ts 中的接口，因为我们已经在那里添加了 Admin 权限支持

// 系统统计
router.get('/stats', getSystemStats);

export default router;