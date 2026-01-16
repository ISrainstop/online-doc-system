// aaaaa/server-app/src/controllers/admin.controller.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';

// 获取所有用户列表
export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
            select: { documents: true } // 同时返回该用户创建的文档数量
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    // 防止自杀
    if (id === req.user?.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// 3. 🔥 新增：获取系统所有文档 (带分页)
export async function getAllDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const documents = await prisma.document.findMany({
      where: { isDeleted: false }, // 只看未删除的
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { username: true } } // 显示是谁创建的
      },
      take: 50 // 限制返回数量，防止数据量过大
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

// 获取系统统计数据
export async function getSystemStats(req: AuthenticatedRequest, res: Response) {
  try {
    const userCount = await prisma.user.count();
    const documentCount = await prisma.document.count();
    const versionCount = await prisma.documentVersion.count();

    res.json({
      users: userCount,
      documents: documentCount,
      versions: versionCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}