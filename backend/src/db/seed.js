import db from './index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

// Run migrations first
import '../db/migrate.js';

const userId = uuid();
const hash = bcrypt.hashSync('demo1234', 10);

const run = db.transaction(() => {
  // Clear existing seed data
  db.prepare("DELETE FROM users WHERE email = 'demo@chefcost.app'").run();

  db.prepare(`INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)`).run(userId, 'Demo Chef', 'demo@chefcost.app', hash, 'admin');

  const ings = [
    [uuid(), 'Beef Tenderloin', 'Meat', 'kg', 1, 38, 'Local Butcher'],
    [uuid(), 'Extra Virgin Olive Oil', 'Oils & Fats', 'liter', 1, 12, ''],
    [uuid(), 'Arborio Rice', 'Grains', 'kg', 1, 4.5, ''],
    [uuid(), 'Parmesan Reggiano', 'Dairy', 'kg', 1, 22, ''],
    [uuid(), 'Fresh Cream', 'Dairy', 'liter', 1, 3.8, ''],
    [uuid(), 'Atlantic Salmon', 'Fish & Seafood', 'kg', 1, 28, ''],
    [uuid(), 'Cherry Tomatoes', 'Vegetables', 'kg', 1, 3.2, ''],
    [uuid(), 'Garlic', 'Vegetables', 'kg', 1, 6, ''],
    [uuid(), 'White Wine', 'Beverages', 'liter', 1, 9, ''],
    [uuid(), 'Unsalted Butter', 'Dairy', 'kg', 1, 8, ''],
  ];
  const ingIds = {};
  const stmt = db.prepare(`INSERT INTO ingredients (id,user_id,name,category,unit,purchase_qty,purchase_price,supplier) VALUES (?,?,?,?,?,?,?,?)`);
  ings.forEach(([id, name, cat, unit, qty, price, supplier]) => {
    stmt.run(id, userId, name, cat, unit, qty, price, supplier);
    ingIds[name] = id;
  });

  // Recipe 1
  const r1 = uuid();
  db.prepare(`INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)`).run(r1, userId, 'Beef Tenderloin with Cream Sauce', 'Main Course', 10, 'Signature dish');
  [
    [ingIds['Beef Tenderloin'], 2, 'kg'],
    [ingIds['Fresh Cream'], 0.5, 'liter'],
    [ingIds['Unsalted Butter'], 0.1, 'kg'],
    [ingIds['Extra Virgin Olive Oil'], 0.05, 'liter'],
  ].forEach(([iid, qty, unit]) => db.prepare(`INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)`).run(uuid(), r1, iid, qty, unit));

  // Recipe 2
  const r2 = uuid();
  db.prepare(`INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)`).run(r2, userId, 'Truffle Risotto', 'Starter', 8, 'Vegetarian option');
  [
    [ingIds['Arborio Rice'], 0.8, 'kg'],
    [ingIds['Parmesan Reggiano'], 0.2, 'kg'],
    [ingIds['White Wine'], 0.3, 'liter'],
    [ingIds['Unsalted Butter'], 0.08, 'kg'],
  ].forEach(([iid, qty, unit]) => db.prepare(`INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)`).run(uuid(), r2, iid, qty, unit));

  // Recipe 3
  const r3 = uuid();
  db.prepare(`INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)`).run(r3, userId, 'Grilled Salmon Fillet', 'Main Course', 8, '');
  [
    [ingIds['Atlantic Salmon'], 1.6, 'kg'],
    [ingIds['Cherry Tomatoes'], 0.4, 'kg'],
    [ingIds['Extra Virgin Olive Oil'], 0.06, 'liter'],
    [ingIds['Garlic'], 0.02, 'kg'],
  ].forEach(([iid, qty, unit]) => db.prepare(`INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)`).run(uuid(), r3, iid, qty, unit));

  // Menu 1
  const m1 = uuid();
  db.prepare(`INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)`).run(m1, userId, 'Wedding Gala Menu', 'Premium 3-course menu', 80, 35, 19);
  db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(), m1, r2, 80);
  db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(), m1, r1, 80);

  // Menu 2
  const m2 = uuid();
  db.prepare(`INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)`).run(m2, userId, 'Corporate Lunch', 'Business catering package', 30, 30, 19);
  db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(), m2, r3, 30);
  db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(), m2, r2, 30);

  // Event 1
  const e1 = uuid();
  db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(e1, userId, 'Smith Wedding Reception', 'John & Emily Smith', 'smith@email.com', '+40 722 111 222', '2026-06-15', 80, 'Outdoor garden venue', 'Sent Offer');
  db.prepare(`INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)`).run(uuid(), e1, m1, 1);

  // Event 2
  const e2 = uuid();
  db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(e2, userId, 'TechCorp Annual Dinner', 'TechCorp Ltd.', 'events@techcorp.com', '+40 733 444 555', '2026-05-25', 30, 'Conference room setup', 'Approved');
  db.prepare(`INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)`).run(uuid(), e2, m2, 1);
});

run();
console.log('✅ Seed data inserted');
console.log('📧 Login: demo@chefcost.app');
console.log('🔑 Password: demo1234');
