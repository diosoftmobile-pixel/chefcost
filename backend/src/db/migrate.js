import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/chefcost.db');

import fs from 'fs';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'chef' CHECK(role IN ('admin','chef','staff','accountant')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    purchase_qty REAL NOT NULL DEFAULT 1,
    purchase_price REAL NOT NULL DEFAULT 0,
    supplier TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Main Course',
    portions INTEGER NOT NULL DEFAULT 4,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    qty REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg'
  );

  CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    guest_count INTEGER NOT NULL DEFAULT 1,
    markup REAL NOT NULL DEFAULT 30,
    vat REAL NOT NULL DEFAULT 19,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_recipes (
    id TEXT PRIMARY KEY,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    portions INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_name TEXT DEFAULT '',
    client_email TEXT DEFAULT '',
    client_phone TEXT DEFAULT '',
    event_date TEXT DEFAULT '',
    guest_count INTEGER NOT NULL DEFAULT 1,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft','Sent Offer','Approved','Cancelled','Completed')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_menus (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1
  );
`);

// Add new columns to existing tables (idempotent)
const alterColumns = [
  "ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free'",
  "ALTER TABLE users ADD COLUMN trial_end TEXT DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN stripe_customer_id TEXT DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'EUR'",
  "ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'en'",
  "ALTER TABLE users ADD COLUMN is_locked INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN cancel_at TEXT DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT NULL",
  "ALTER TABLE ingredients ADD COLUMN allergens TEXT NOT NULL DEFAULT '[]'",
  "ALTER TABLE menus ADD COLUMN ai_analysis TEXT DEFAULT NULL",
  "ALTER TABLE menus ADD COLUMN ai_analyzed_at TEXT DEFAULT NULL",
];
for (const sql of alterColumns) {
  try { db.exec(sql); } catch {}
}

// Migrations table for one-time data fixes
db.exec(`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT DEFAULT (datetime('now')))`);

// Migration: convert menu_recipes.portions from total-per-event to per-person
// Old design: portions = total portions for all guests (e.g. 30 for 30 guests)
// New design: portions = portions per person (e.g. 1)
// Formula: new_portions = old_portions / menu.guest_count
const MIG1 = 'normalize_menu_recipe_portions_v1';
if (!db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(MIG1)) {
  db.prepare(`
    UPDATE menu_recipes
    SET portions = MAX(1, CAST(ROUND(CAST(portions AS REAL) /
      COALESCE((SELECT guest_count FROM menus WHERE menus.id = menu_recipes.menu_id), 1)
    ) AS INTEGER))
    WHERE (SELECT guest_count FROM menus WHERE menus.id = menu_recipes.menu_id) > 1
  `).run();
  db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(MIG1);
  console.log('✅ Migration: normalized menu_recipe portions to per-person');
}

// Migration: seed Elegance Wedding Menu + John & Mary Wedding event for demo account
const MIG2 = 'seed_wedding_menu_v1';
if (!db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(MIG2)) {
  const demo = db.prepare("SELECT id FROM users WHERE email = 'demo@chefcost.app'").get();
  if (demo) {
    const uid = demo.id;

    // Helper: get existing ingredient by name or insert new one
    const ing = (name, category, unit, price, supplier = '') => {
      const ex = db.prepare('SELECT id FROM ingredients WHERE user_id=? AND name=?').get(uid, name);
      if (ex) return ex.id;
      const id = uuid();
      db.prepare('INSERT INTO ingredients (id,user_id,name,category,unit,purchase_qty,purchase_price,supplier) VALUES (?,?,?,?,?,?,?,?)')
        .run(id, uid, name, category, unit, 1, price, supplier);
      return id;
    };

    const i = {
      beefTenderloin:    ing('Beef Tenderloin',       'Meat',           'kg',    38,   'Local Butcher'),
      arborioRice:       ing('Arborio Rice',           'Grains',         'kg',    4.5),
      parmesan:          ing('Parmesan Reggiano',      'Dairy',          'kg',    22),
      whiteWine:         ing('White Wine',             'Beverages',      'liter', 9),
      truffleOil:        ing('Truffle Oil',            'Oils & Fats',    'liter', 85),
      atlanticSalmon:    ing('Atlantic Salmon',        'Fish & Seafood', 'kg',    28),
      capers:            ing('Capers',                 'Vegetables',     'kg',    12),
      lemon:             ing('Lemon',                  'Fruits',         'kg',    2.5),
      freshDill:         ing('Fresh Dill',             'Vegetables',     'kg',    15),
      creamCheese:       ing('Cream Cheese',           'Dairy',          'kg',    8),
      porcini:           ing('Porcini Mushrooms',      'Vegetables',     'kg',    45),
      freshCream:        ing('Fresh Cream',            'Dairy',          'liter', 3.8),
      butter:            ing('Unsalted Butter',        'Dairy',          'kg',    8),
      garlic:            ing('Garlic',                 'Vegetables',     'kg',    6),
      redWine:           ing('Red Wine',               'Beverages',      'liter', 12),
      potatoes:          ing('Potatoes',               'Vegetables',     'kg',    1.2),
      greenBeans:        ing('Green Beans',            'Vegetables',     'kg',    3.5),
      seaBass:           ing('Sea Bass',               'Fish & Seafood', 'kg',    32),
      babySpinach:       ing('Baby Spinach',           'Vegetables',     'kg',    5),
      darkChocolate:     ing('Dark Chocolate',         'Other',          'kg',    18),
      raspberries:       ing('Raspberries',            'Fruits',         'kg',    14),
    };

    const sr  = db.prepare('INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)');
    const sri = db.prepare('INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)');

    const recipe = (name, category, portions, notes, items) => {
      const id = uuid(); sr.run(id, uid, name, category, portions, notes);
      items.forEach(([ingId, qty, unit]) => sri.run(uuid(), id, ingId, qty, unit));
      return id;
    };

    // 5-course recipes — each makes 4 portions
    const r = {
      risotto: recipe('Truffle Risotto', 'Starter', 4, 'Creamy Arborio with truffle oil and aged Parmesan', [
        [i.arborioRice,    0.40, 'kg'],
        [i.parmesan,       0.08, 'kg'],
        [i.whiteWine,      0.12, 'liter'],
        [i.truffleOil,     0.02, 'liter'],
        [i.butter,         0.04, 'kg'],
      ]),
      tartare: recipe('Salmon Tartare', 'Starter', 4, 'Fresh salmon, capers, lemon, dill cream', [
        [i.atlanticSalmon, 0.60, 'kg'],
        [i.capers,         0.04, 'kg'],
        [i.lemon,          0.10, 'kg'],
        [i.freshDill,      0.02, 'kg'],
        [i.creamCheese,    0.08, 'kg'],
      ]),
      veloute: recipe('Wild Mushroom Velouté', 'Soup', 4, 'Porcini cream soup with truffle shavings', [
        [i.porcini,        0.40, 'kg'],
        [i.freshCream,     0.30, 'liter'],
        [i.butter,         0.05, 'kg'],
        [i.garlic,         0.02, 'kg'],
      ]),
      beef: recipe('Beef Tenderloin Royale', 'Main Course', 4, 'Pan-seared beef, red wine reduction, garlic mash, green beans', [
        [i.beefTenderloin, 0.80, 'kg'],
        [i.redWine,        0.20, 'liter'],
        [i.butter,         0.05, 'kg'],
        [i.potatoes,       0.40, 'kg'],
        [i.garlic,         0.03, 'kg'],
        [i.greenBeans,     0.20, 'kg'],
      ]),
      fondant: recipe('Dark Chocolate Fondant', 'Dessert', 4, 'Warm fondant, vanilla ice cream, raspberry coulis', [
        [i.darkChocolate,  0.20, 'kg'],
        [i.butter,         0.10, 'kg'],
        [i.freshCream,     0.10, 'liter'],
        [i.raspberries,    0.12, 'kg'],
      ]),
    };

    // Menu: 1 portion per person, 40% markup, 19% VAT
    const menuId = uuid();
    db.prepare('INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)')
      .run(menuId, uid, 'Elegance Wedding Menu', 'Premium 5-course wedding dinner', 1, 40, 19);
    const smr = db.prepare('INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)');
    Object.values(r).forEach(rid => smr.run(uuid(), menuId, rid, 1));

    // Event
    const evId = uuid();
    db.prepare('INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(evId, uid, 'John & Mary Wedding', 'John & Mary Smith', 'john.mary@email.com', '', '2026-08-02', 200, 'Elegance 5-course wedding dinner', 'Sent Offer');
    db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)')
      .run(uuid(), evId, menuId, 1);
  }
  db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(MIG2);
  console.log('✅ Migration: seeded Elegance Wedding Menu + John & Mary Wedding event');
}

console.log('✅ Database migrated successfully');
export default db;
