// aaaaa/server-app/src/middleware/admin.middleware.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 确保用户已登录且角色为 ADMIN
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'forbidden_admin_only' });
  }
  next();
}