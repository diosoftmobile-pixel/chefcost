import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, clearTables, createUser } from './helpers/index.js';

beforeEach(clearTables);

describe('POST /api/auth/register', () => {
  it('creates a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Marco Rossi', email: 'marco@test.com', password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('marco@test.com');
    expect(res.body.user.subscription_status).toBe('free');
  });

  it('rejects duplicate email', async () => {
    createUser({ email: 'dup@test.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup', email: 'dup@test.com', password: 'secret123',
    });
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test', email: 'test@test.com', password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    createUser({ email: 'chef@test.com', password: 'pass1234' });
    const res = await request(app).post('/api/auth/login').send({ email: 'chef@test.com', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    createUser({ email: 'chef@test.com' });
    const res = await request(app).post('/api/auth/login').send({ email: 'chef@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('blocks locked accounts', async () => {
    createUser({ email: 'locked@test.com', is_locked: 1 });
    const res = await request(app).post('/api/auth/login').send({ email: 'locked@test.com', password: 'pass1234' });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/locked/i);
  });
});
