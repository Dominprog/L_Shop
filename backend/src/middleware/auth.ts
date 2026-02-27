import { Request, Response, NextFunction } from 'express';
import { readJson } from './fileHelper';
import { User } from '../types';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = req.cookies['session'];
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.locals['userId'] = userId;
  next();
}

