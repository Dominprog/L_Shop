import request from 'supertest';
import { app } from '../index';

describe('Users API', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    phone: '+71234567890',
    password: 'password123',
  };

  let cookie: string;

  it('POST /api/users/register — should register a new user', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.role).toBe('user');
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  });

  it('POST /api/users/register — should reject duplicate email', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /api/users/register — should reject missing fields', async () => {
    const res = await request(app).post('/api/users/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/users/login — should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    const setCookie = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  });

  it('POST /api/users/login — should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /api/users/me — should return current user when authenticated', async () => {
    const res = await request(app).get('/api/users/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('GET /api/users/me — should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/users/logout — should clear session', async () => {
    const res = await request(app).post('/api/users/logout').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });
});

describe('Admin Login', () => {
  it('POST /api/users/login — admin should login and get admin role', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@lshop.ru', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
  });
});
