import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, clearTables, createUser, createIngredient, getToken } from './helpers/index.js';
import db from '../db/index.js';

beforeEach(clearTables);

const newIng = { name: 'Salt', category: 'Spices', unit: 'kg', purchase_qty: 1, purchase_price: 1, supplier: '' };

describe('Subscription gating', () => {
  it('active user can write', async () => {
    const user = createUser({ email: 'active@test.com', subscription_status: 'active' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(201);
  });

  it('trial user within period can write', async () => {
    const user = createUser({ email: 'trial@test.com', subscription_status: 'trial' });
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    db.prepare('UPDATE users SET trial_end=? WHERE id=?').run(trialEnd.toISOString(), user.id);
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(201);
  });

  it('expired trial user is blocked', async () => {
    const user = createUser({ email: 'expired@test.com', subscription_status: 'trial' });
    const pastDate = new Date('2020-01-01').toISOString();
    db.prepare('UPDATE users SET trial_end=? WHERE id=?').run(pastDate, user.id);
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(403);
  });

  it('demo user is blocked from writing', async () => {
    const user = createUser({ email: 'demo@test.com', subscription_status: 'demo' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(403);
  });

  it('free user is blocked from writing', async () => {
    const user = createUser({ email: 'free@test.com', subscription_status: 'free' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(403);
  });

  it('admin bypasses subscription check', async () => {
    const admin = createUser({ email: 'admin@test.com', role: 'admin', subscription_status: 'free' });
    const token = await getToken(admin.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(201);
  });

  it('demo user can still read ingredients', async () => {
    const user = createUser({ email: 'demo@test.com', subscription_status: 'demo' });
    createIngredient(user.id);
    const token = await getToken(user.email);
    const res = await request(app).get('/api/ingredients').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
