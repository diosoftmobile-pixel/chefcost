import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, clearTables, createUser, getToken } from './helpers/index.js';

beforeEach(clearTables);

describe('GET /api/admin/users', () => {
  it('returns all users for admin', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    createUser({ email: 'chef1@test.com' });
    createUser({ email: 'chef2@test.com' });
    const token = await getToken(admin.email);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('blocks non-admin access', async () => {
    const chef = createUser({ email: 'chef@test.com', role: 'chef' });
    const token = await getToken(chef.email);
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/admin/users/:id/lock', () => {
  it('admin can lock a chef account', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const chef = createUser({ email: 'chef@test.com' });
    const token = await getToken(admin.email);
    const res = await request(app).put(`/api/admin/users/${chef.id}/lock`).set('Authorization', `Bearer ${token}`).send({ locked: true });
    expect(res.status).toBe(200);
    // verify locked account can't login
    const loginRes = await request(app).post('/api/auth/login').send({ email: chef.email, password: 'pass1234' });
    expect(loginRes.status).toBe(403);
  });

  it('admin can unlock a locked account', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const chef = createUser({ email: 'chef@test.com', is_locked: 1 });
    const token = await getToken(admin.email);
    await request(app).put(`/api/admin/users/${chef.id}/lock`).set('Authorization', `Bearer ${token}`).send({ locked: false });
    const loginRes = await request(app).post('/api/auth/login').send({ email: chef.email, password: 'pass1234' });
    expect(loginRes.status).toBe(200);
  });

  it('prevents admin from locking own account', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const token = await getToken(admin.email);
    const res = await request(app).put(`/api/admin/users/${admin.id}/lock`).set('Authorization', `Bearer ${token}`).send({ locked: true });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/users/:id/subscription', () => {
  it('admin can set subscription to active', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const chef = createUser({ email: 'chef@test.com', subscription_status: 'free' });
    const token = await getToken(admin.email);
    const res = await request(app).put(`/api/admin/users/${chef.id}/subscription`).set('Authorization', `Bearer ${token}`).send({ subscription_status: 'active' });
    expect(res.status).toBe(200);
  });

  it('rejects invalid subscription status', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const chef = createUser({ email: 'chef@test.com' });
    const token = await getToken(admin.email);
    const res = await request(app).put(`/api/admin/users/${chef.id}/subscription`).set('Authorization', `Bearer ${token}`).send({ subscription_status: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('admin can delete a chef account', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const chef = createUser({ email: 'chef@test.com' });
    const token = await getToken(admin.email);
    const res = await request(app).delete(`/api/admin/users/${chef.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('prevents admin from deleting own account', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin' });
    const token = await getToken(admin.email);
    const res = await request(app).delete(`/api/admin/users/${admin.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
