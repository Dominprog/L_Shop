import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../middleware/fileHelper';
import { User, Delivery, DeliveryBody, Product } from '../types';

export function createDelivery(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { address, phone, email, paymentMethod } = req.body as DeliveryBody;

  if (!address || !phone || !email || !paymentMethod) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const users = readJson<User[]>('users.json');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const user = users[userIndex];
  if (user.cart.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  const products = readJson<Product[]>('products.json');
  const totalPrice = user.cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const delivery: Delivery = {
    id: uuidv4(),
    userId,
    address,
    phone,
    email,
    paymentMethod,
    items: [...user.cart],
    totalPrice,
    createdAt: new Date().toISOString(),
  };

  const deliveries = readJson<Delivery[]>('deliveries.json');
  deliveries.push(delivery);
  writeJson('deliveries.json', deliveries);

  users[userIndex].deliveries.push(delivery);
  users[userIndex].cart = [];
  writeJson('users.json', users);

  res.status(201).json(delivery);
}

export function getDeliveries(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user.deliveries);
}
