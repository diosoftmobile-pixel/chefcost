import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, clearTables, createUser, createIngredient, getToken } from './helpers/index.js';

beforeEach(clearTables);

const newIng = { name: 'Olive Oil', category: 'Oils & Fats', unit: 'liter', purchase_qty: 1, purchase_price: 12, supplier: '' };

describe('GET /api/ingredients', () => {
  it('returns ingredients for authenticated user', async () => {
    const user = createUser({ email: 'chef@test.com', subscription_status: 'active' });
    createIngredient(user.id, { name: 'Tomato' });
    const token = await getToken(user.email);
    const res = await request(app).get('/api/ingredients').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Tomato');
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/ingredients');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/ingredients', () => {
  it('allows paid user to create ingredient', async () => {
    const user = createUser({ email: 'paid@test.com', subscription_status: 'active' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Olive Oil');
  });

  it('blocks demo user from creating ingredient', async () => {
    const user = createUser({ email: 'demo@test.com', subscription_status: 'demo' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(403);
  });

  it('blocks free user from creating ingredient', async () => {
    const user = createUser({ email: 'free@test.com', subscription_status: 'free' });
    const token = await getToken(user.email);
    const res = await request(app).post('/api/ingredients').set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/ingredients/:id', () => {
  it('allows paid user to update own ingredient', async () => {
    const user = createUser({ email: 'chef@test.com', subscription_status: 'active' });
    const ing = createIngredient(user.id);
    const token = await getToken(user.email);
    const res = await request(app).put(`/api/ingredients/${ing.id}`).set('Authorization', `Bearer ${token}`).send({ ...newIng, name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('prevents updating another user\'s ingredient', async () => {
    const owner = createUser({ email: 'owner@test.com', subscription_status: 'active' });
    const other = createUser({ email: 'other@test.com', subscription_status: 'active' });
    const ing = createIngredient(owner.id);
    const token = await getToken(other.email);
    const res = await request(app).put(`/api/ingredients/${ing.id}`).set('Authorization', `Bearer ${token}`).send(newIng);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/ingredients/:id', () => {
  it('allows paid user to delete own ingredient', async () => {
    const user = createUser({ email: 'chef@test.com', subscription_status: 'active' });
    const ing = createIngredient(user.id);
    const token = await getToken(user.email);
    const res = await request(app).delete(`/api/ingredients/${ing.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('blocks demo user from deleting', async () => {
    const user = createUser({ email: 'demo@test.com', subscription_status: 'demo' });
    const ing = createIngredient(user.id);
    const token = await getToken(user.email);
    const res = await request(app).delete(`/api/ingredients/${ing.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
