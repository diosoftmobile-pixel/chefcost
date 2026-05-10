import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Run migrations on startup
import './db/migrate.js';
import db from './db/index.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

// Auto-seed demo data if database is empty
const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
if (userCount === 0) {
  const userId = uuid();
  const hash = bcrypt.hashSync('demo1234', 10);
  db.transaction(() => {
    db.prepare(`INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)`).run(userId, 'Demo Chef', 'demo@chefcost.app', hash, 'admin');
    const ings = [
      [uuid(),'Beef Tenderloin','Meat','kg',1,38,'Local Butcher'],
      [uuid(),'Extra Virgin Olive Oil','Oils & Fats','liter',1,12,''],
      [uuid(),'Arborio Rice','Grains','kg',1,4.5,''],
      [uuid(),'Parmesan Reggiano','Dairy','kg',1,22,''],
      [uuid(),'Fresh Cream','Dairy','liter',1,3.8,''],
      [uuid(),'Atlantic Salmon','Fish & Seafood','kg',1,28,''],
      [uuid(),'Cherry Tomatoes','Vegetables','kg',1,3.2,''],
      [uuid(),'Garlic','Vegetables','kg',1,6,''],
      [uuid(),'White Wine','Beverages','liter',1,9,''],
      [uuid(),'Unsalted Butter','Dairy','kg',1,8,''],
    ];
    const ingIds = {};
    const si = db.prepare(`INSERT INTO ingredients (id,user_id,name,category,unit,purchase_qty,purchase_price,supplier) VALUES (?,?,?,?,?,?,?,?)`);
    ings.forEach(([id,name,cat,unit,qty,price,sup]) => { si.run(id,userId,name,cat,unit,qty,price,sup); ingIds[name]=id; });
    const sr = db.prepare(`INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)`);
    const sri = db.prepare(`INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)`);
    const r1=uuid(); sr.run(r1,userId,'Beef Tenderloin with Cream Sauce','Main Course',10,'Signature dish');
    [[ingIds['Beef Tenderloin'],2,'kg'],[ingIds['Fresh Cream'],0.5,'liter'],[ingIds['Unsalted Butter'],0.1,'kg']].forEach(([i,q,u])=>sri.run(uuid(),r1,i,q,u));
    const r2=uuid(); sr.run(r2,userId,'Truffle Risotto','Starter',8,'Vegetarian option');
    [[ingIds['Arborio Rice'],0.8,'kg'],[ingIds['Parmesan Reggiano'],0.2,'kg'],[ingIds['White Wine'],0.3,'liter']].forEach(([i,q,u])=>sri.run(uuid(),r2,i,q,u));
    const r3=uuid(); sr.run(r3,userId,'Grilled Salmon Fillet','Main Course',8,'');
    [[ingIds['Atlantic Salmon'],1.6,'kg'],[ingIds['Cherry Tomatoes'],0.4,'kg'],[ingIds['Extra Virgin Olive Oil'],0.06,'liter']].forEach(([i,q,u])=>sri.run(uuid(),r3,i,q,u));
    const m1=uuid(); db.prepare(`INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)`).run(m1,userId,'Wedding Gala Menu','Premium 3-course menu',80,35,19);
    db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(),m1,r2,80);
    db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(),m1,r1,80);
    const m2=uuid(); db.prepare(`INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)`).run(m2,userId,'Corporate Lunch','Business catering package',30,30,19);
    db.prepare(`INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)`).run(uuid(),m2,r3,30);
    const e1=uuid(); db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(e1,userId,'Smith Wedding Reception','John & Emily Smith','smith@email.com','+40 722 111 222','2026-06-15',80,'Outdoor garden venue','Sent Offer');
    db.prepare(`INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)`).run(uuid(),e1,m1,1);
    const e2=uuid(); db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(e2,userId,'TechCorp Annual Dinner','TechCorp Ltd.','events@techcorp.com','+40 733 444 555','2026-05-25',30,'Conference room setup','Approved');
    db.prepare(`INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)`).run(uuid(),e2,m2,1);
  })();
  console.log('✅ Demo data seeded — login: demo@chefcost.app / demo1234');
}

import authRoutes from './routes/auth.js';
import ingredientRoutes from './routes/ingredients.js';
import recipeRoutes from './routes/recipes.js';
import menuRoutes from './routes/menus.js';
import eventRoutes from './routes/events.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/events', eventRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve frontend in production
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => console.log(`🚀 ChefCost API running on http://localhost:${PORT}`));
