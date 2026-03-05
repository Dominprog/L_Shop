import { Request, Response } from 'express';
import { readJson } from '../middleware/fileHelper';
import { Product, ProductsQuery } from '../types';

export function getProducts(req: Request, res: Response): void {
  const { search, category, available, sort } = req.query as ProductsQuery;
  let products = readJson<Product[]>('products.json');

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (available !== undefined) {
    products = products.filter((p) => p.available === (available === 'true'));
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  }

  res.json(products);
}

export function getProductById(req: Request, res: Response): void {
  const { id } = req.params;
  const products = readJson<Product[]>('products.json');
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
}

export function getCategories(_req: Request, res: Response): void {
  const products = readJson<Product[]>('products.json');
  const categories = [...new Set(products.map((p) => p.category))];
  res.json(categories);
}

