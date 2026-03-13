import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../middleware/fileHelper';
import { Product, ProductsQuery, User, ProductBody, RecommendedTag } from '../types';

const RECOMMENDATION_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days

export function getProducts(req: Request, res: Response): void {
  const { search, category, available, sort } = req.query as ProductsQuery;
  let products = readJson<Product[]>('products.json');

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (category) products = products.filter((p) => p.category === category);
  if (available !== undefined) products = products.filter((p) => p.available === (available === 'true'));
  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);

  res.json(products);
}

export function getProductById(req: Request, res: Response): void {
  const { id } = req.params;
  const products = readJson<Product[]>('products.json');
  const product = products.find((p) => p.id === id);
  if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json(product);
}

export function getCategories(_req: Request, res: Response): void {
  const products = readJson<Product[]>('products.json');
  const categories = [...new Set(products.map((p) => p.category))];
  res.json(categories);
}

export function getRecommended(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  if (!user) { res.json([]); return; }

  const now = Date.now();
  const activeTags = (user.recommendedTags || [])
    .filter((rt) => now - rt.timestamp < RECOMMENDATION_TTL)
    .map((rt) => rt.tag);

  if (activeTags.length === 0) { res.json([]); return; }

  const products = readJson<Product[]>('products.json');
  const recommended = products
    .filter((p) => p.available && p.tags && p.tags.some((t) => activeTags.includes(t)))
    .slice(0, 4);

  res.json(recommended);
}

export function likeProduct(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const { id } = req.params;

  const products = readJson<Product[]>('products.json');
  const product = products.find((p) => p.id === id);
  if (!product) { res.status(404).json({ error: 'Product not found' }); return; }

  const users = readJson<User[]>('users.json');
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) { res.status(404).json({ error: 'User not found' }); return; }

  const user = users[userIndex];
  const likes = user.likes || [];
  const alreadyLiked = likes.includes(id);

  if (alreadyLiked) {
    users[userIndex].likes = likes.filter((l) => l !== id);
  } else {
    users[userIndex].likes = [...likes, id];
    const now = Date.now();
    const existingTags = user.recommendedTags || [];
    const productTags = product.tags || [];
    const newTags: RecommendedTag[] = [...existingTags];
    productTags.forEach((tag) => {
      const existing = newTags.find((rt) => rt.tag === tag);
      if (existing) existing.timestamp = now;
      else newTags.push({ tag, timestamp: now });
    });
    users[userIndex].recommendedTags = newTags;
  }

  writeJson('users.json', users);
  res.json({ liked: !alreadyLiked, likes: users[userIndex].likes });
}

export function getLikes(req: Request, res: Response): void {
  const userId = res.locals['userId'] as string;
  const users = readJson<User[]>('users.json');
  const user = users.find((u) => u.id === userId);
  res.json({ likes: user?.likes || [] });
}

export function createProduct(req: Request, res: Response): void {
  const body = req.body as ProductBody;
  if (!body.name || !body.price || !body.category) {
    res.status(400).json({ error: 'name, price, category are required' });
    return;
  }
  const products = readJson<Product[]>('products.json');
  const newProduct: Product = {
    id: uuidv4(),
    name: body.name,
    description: body.description || '',
    price: Number(body.price),
    category: body.category,
    available: body.available ?? true,
    imageUrl: body.imageUrl || 'https://via.placeholder.com/300x200?text=Product',
    stock: Number(body.stock) || 0,
    tags: body.tags || [],
  };
  products.push(newProduct);
  writeJson('products.json', products);
  res.status(201).json(newProduct);
}

export function updateProduct(req: Request, res: Response): void {
  const { id } = req.params;
  const body = req.body as Partial<ProductBody>;
  const products = readJson<Product[]>('products.json');
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) { res.status(404).json({ error: 'Product not found' }); return; }
  products[idx] = { ...products[idx], ...body };
  writeJson('products.json', products);
  res.json(products[idx]);
}

export function deleteProduct(req: Request, res: Response): void {
  const { id } = req.params;
  const products = readJson<Product[]>('products.json');
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) { res.status(404).json({ error: 'Product not found' }); return; }
  writeJson('products.json', filtered);
  res.json({ message: 'Deleted' });
}
