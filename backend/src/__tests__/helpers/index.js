import db from '../../db/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import request from 'supertest';
import { createApp } from '../../app.js';

export const app = createApp();

export function clearTables() {
  db.exec(`
    DELETE FROM event_menus;
    DELETE FROM events;
    DELETE FROM menu_recipes;
    DELETE FROM menus;
    DELETE FROM recipe_ingredients;
    DELETE FROM recipes;
    DELETE FROM ingredients;
    DELETE FROM users;
  `);
}

export function createUser({ name = 'Test Chef', email, password = 'pass1234', role = 'chef', subscription_status = 'active', is_locked = 0 } = {}) {
  const id = uuid();
  const hash = bcrypt.hashSync(password, 4);
  db.prepare(`INSERT INTO users (id, name, email, password_hash, role, subscription_status, is_locked)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, name, email || `user-${id}@test.com`, hash, role, subscription_status, is_locked);
  return { id, name, email: email || `user-${id}@test.com`, password, role, subscription_status };
}

export async function getToken(email, password = 'pass1234') {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

export function createIngredient(userId, overrides = {}) {
  const id = uuid();
  const data = { name: 'Test Ingredient', category: 'Vegetables', unit: 'kg', purchase_qty: 1, purchase_price: 5, supplier: '', ...overrides };
  db.prepare(`INSERT INTO ingredients (id, user_id, name, category, unit, purchase_qty, purchase_price, supplier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, userId, data.name, data.category, data.unit, data.purchase_qty, data.purchase_price, data.supplier);
  return { id, user_id: userId, ...data };
}
