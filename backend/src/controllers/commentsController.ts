import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../middleware/fileHelper';
import { Comment, CommentBody, User } from '../types';

export function getComments(req: Request, res: Response): void {
  const { productId } = req.params;
  const comments = readJson<Comment[]>('comments.json');
  const productComments = comments.filter((c) => c.productId === productId);
  res.json(productComments);
}

export function addComment(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { productId } = req.params;
  const { text, rating } = req.body as CommentBody;

  if (!text || !rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'text and rating (1-5) are required' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const comments = readJson<Comment[]>('comments.json');
  const newComment: Comment = {
    id: uuidv4(),
    userId,
    userName: user.name,
    productId,
    text,
    rating: Number(rating),
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  writeJson('comments.json', comments);
  res.status(201).json(newComment);
}
