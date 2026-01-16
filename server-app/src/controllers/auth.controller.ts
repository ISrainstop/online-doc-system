import { Request, Response } from 'express';
import prisma from '../config/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// 生成 Token 的辅助函数
function generateToken(user: any) {
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username,
      role: user.role // 加入角色
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
}

// 1. 注册接口
export async function register(req: Request, res: Response) {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码为必填项' });
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: '用户名已被占用' });
    }

    // 检查邮箱是否已存在 (如果有填邮箱)
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: '邮箱已被注册' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email: email || undefined,
        role: 'USER' // 🔥 显式设置为 USER (虽然有默认值，但这样更清晰)
      }
    });

    // 注册成功后直接签发 Token，让用户自动登录
    const token = generateToken(user);
    
    // 返回时不带 passwordHash
    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json({ token, user: safeUser });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '注册失败，请稍后重试' });
  }
}

// 2. 登录接口
export async function login(req: Request, res: Response) {
  const { username, email, password } = req.body;
  
  // 支持用户名或邮箱登录
  const identifier = (username || email || '').trim();
  if (!identifier || !password) {
    return res.status(400).json({ error: '请输入账号和密码' });
  }

  try {
    // 查找用户
    let user = await prisma.user.findUnique({ where: { username: identifier } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    }

    // 用户不存在
    if (!user) {
      return res.status(401).json({ error: '账号不存在或密码错误' });
    }

    // 校验密码
    const isValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!isValid) {
      return res.status(401).json({ error: '账号不存在或密码错误' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;
    
    return res.json({ token, user: safeUser });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '登录服务异常' });
  }
}