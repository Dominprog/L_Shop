import { Request, Response } from 'express';
import { readJson, writeJson } from '../middleware/fileHelper';
import { User, Product, AddToCartBody } from '../types';

export function getCart(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const products = readJson<Product[]>('products.json');
  const cartWithDetails = user.cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  res.json(cartWithDetails);
}

export function addToCart(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { productId, quantity } = req.body as AddToCartBody;

  if (!productId || !quantity || quantity < 1) {
    res.status(400).json({ error: 'Invalid data' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const existing = users[userIndex].cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    users[userIndex].cart.push({ productId, quantity });
  }

  writeJson('users.json', users);
  res.json(users[userIndex].cart);
}

export function updateCartItem(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { productId } = req.params;
  const { quantity } = req.body as { quantity: number };

  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Invalid quantity' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const item = users[userIndex].cart.find((i) => i.productId === productId);
  if (!item) {
    res.status(404).json({ error: 'Item not found in cart' });
    return;
  }

  item.quantity = quantity;
  writeJson('users.json', users);
  res.json(users[userIndex].cart);
}

export function removeFromCart(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { productId } = req.params;

  const users = readJson<User[]>('users.json');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  users[userIndex].cart = users[userIndex].cart.filter((i) => i.productId !== productId);
  writeJson('users.json', users);
  res.json(users[userIndex].cart);
}
