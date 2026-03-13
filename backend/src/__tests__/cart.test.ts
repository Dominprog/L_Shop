import request from 'supertest';
import { app } from '../index';

describe('Cart API', () => {
  it('GET /api/cart — should return 401 without auth', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('POST /api/cart — should return 401 without auth', async () => {
    const res = await request(app).post('/api/cart').send({ productId: '1', quantity: 1 });
    expect(res.status).toBe(401);
  });

  describe('Authenticated cart', () => {
    let cookie: string;

    beforeAll(async () => {
      const email = `carttest_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Cart User', email, phone: '+70000000001', password: 'pass123' });
      const setCookie = res.headers['set-cookie'];
      cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    });

    it('GET /api/cart — should return empty cart', async () => {
      const res = await request(app).get('/api/cart').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/cart — should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Cookie', cookie)
        .send({ productId: '1', quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.some((i: { productId: string }) => i.productId === '1')).toBe(true);
    });

    it('PUT /api/cart/:productId — should update quantity', async () => {
      const res = await request(app)
        .put('/api/cart/1')
        .set('Cookie', cookie)
        .send({ quantity: 5 });
      expect(res.status).toBe(200);
      const item = res.body.find((i: { productId: string }) => i.productId === '1');
      expect(item.quantity).toBe(5);
    });

    it('DELETE /api/cart/:productId — should remove item', async () => {
      const res = await request(app).delete('/api/cart/1').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.some((i: { productId: string }) => i.productId === '1')).toBe(false);
    });

    it('PUT /api/cart/:productId — should return 400 for invalid quantity', async () => {
      const res = await request(app)
        .put('/api/cart/1')
        .set('Cookie', cookie)
        .send({ quantity: 0 });
      expect(res.status).toBe(400);
    });
  });
});

describe('Comments API', () => {
  it('GET /api/comments/:productId — should return empty array', async () => {
    const res = await request(app).get('/api/comments/999');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/comments/:productId — should return 401 without auth', async () => {
    const res = await request(app).post('/api/comments/1').send({ text: 'Good', rating: 5 });
    expect(res.status).toBe(401);
  });

  describe('Authenticated comments', () => {
    let cookie: string;

    beforeAll(async () => {
      const email = `commtest_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/users/register')
        .send({ name: 'Comment User', email, phone: '+70000000002', password: 'pass123' });
      const setCookie = res.headers['set-cookie'];
      cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    });

    it('POST /api/comments/:productId — should add comment', async () => {
      const res = await request(app)
        .post('/api/comments/1')
        .set('Cookie', cookie)
        .send({ text: 'Отличный товар!', rating: 5 });
      expect(res.status).toBe(201);
      expect(res.body.text).toBe('Отличный товар!');
      expect(res.body.rating).toBe(5);
    });

    it('POST /api/comments/:productId — should reject invalid rating', async () => {
      const res = await request(app)
        .post('/api/comments/1')
        .set('Cookie', cookie)
        .send({ text: 'Bad', rating: 10 });
      expect(res.status).toBe(400);
    });

    it('GET /api/comments/:productId — should return added comment', async () => {
      const res = await request(app).get('/api/comments/1');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
