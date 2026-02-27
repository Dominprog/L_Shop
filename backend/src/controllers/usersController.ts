import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../middleware/fileHelper';
import { User, RegisterBody, LoginBody } from '../types';

export function register(req: Request, res: Response): void {
  const { name, email, phone, password } = req.body as RegisterBody;

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const exists = users.find((u) => u.email === email);
  if (exists) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    phone,
    password,
    cart: [],
    deliveries: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJson('users.json', users);

  res.cookie('session', newUser.id, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });

  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
}

export function login(req: Request, res: Response): void {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.cookie('session', user.id, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });

  res.json({ id: user.id, name: user.name, email: user.email });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('session');
  res.json({ message: 'Logged out' });
}

export function getMe(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, cart: user.cart, deliveries: user.deliveries });
}
