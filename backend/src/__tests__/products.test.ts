import request from 'supertest';
import { app } from '../index';

describe('Products API', () => {
  it('GET /api/products — should return list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/products — should filter by category', async () => {
    const res = await request(app).get('/api/products?category=Электроника');
    expect(res.status).toBe(200);
    res.body.forEach((p: { category: string }) => {
      expect(p.category).toBe('Электроника');
    });
  });

  it('GET /api/products — should filter available only', async () => {
    const res = await request(app).get('/api/products?available=true');
    expect(res.status).toBe(200);
    res.body.forEach((p: { available: boolean }) => {
      expect(p.available).toBe(true);
    });
  });

  it('GET /api/products — should sort by price_asc', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');
    expect(res.status).toBe(200);
    const prices = res.body.map((p: { price: number }) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it('GET /api/products/categories — should return categories array', async () => {
    const res = await request(app).get('/api/products/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products/:id — should return product by id', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });

  it('GET /api/products/:id — should return 404 for unknown id', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });

  it('POST /api/products — should return 401 without auth', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Test', price: 100, category: 'Test' });
    expect(res.status).toBe(401);
  });

  it('POST /api/products/:id/like — should return 401 without auth', async () => {
    const res = await request(app).post('/api/products/1/like');
    expect(res.status).toBe(401);
  });
});

describe('Products Admin API', () => {
  let adminCookie: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@lshop.ru', password: 'admin123' });
    const setCookie = res.headers['set-cookie'];
    adminCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  });

  it('POST /api/products — admin should create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send({ name: 'Test Product', description: 'desc', price: 99, category: 'Test', available: true, stock: 5, tags: ['test'] });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });
});
