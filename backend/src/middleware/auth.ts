import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet } from '../database';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await dbGet('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?', [decoded.userId]) as User;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
