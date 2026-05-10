import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

function getMenuFull(id) {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(id);
  if (!menu) return null;
  menu.recipes = db.prepare(`
    SELECT mr.*, r.name as recipe_name, r.category, r.portions as recipe_portions
    FROM menu_recipes mr JOIN recipes r ON r.id = mr.recipe_id WHERE mr.menu_id = ?
  `).all(id);
  return menu;
}

router.get('/', (req, res) => {
  const menus = db.prepare('SELECT * FROM menus WHERE user_id = ? ORDER BY name').all(req.user.id);
  res.json(menus.map(m => getMenuFull(m.id)));
});

router.post('/', (req, res) => {
  const { name, description = '', guest_count = 1, markup = 30, vat = 19, recipes = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)').run(id, req.user.id, name, description, guest_count, markup, vat);
    recipes.forEach(r => db.prepare('INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)').run(uuid(), id, r.recipe_id, r.portions));
  });
  tx();
  res.status(201).json(getMenuFull(id));
});

router.put('/:id', (req, res) => {
  const menu = db.prepare('SELECT id FROM menus WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!menu) return res.status(404).json({ error: 'Not found' });
  const { name, description, guest_count, markup, vat, recipes = [] } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE menus SET name=?,description=?,guest_count=?,markup=?,vat=?,updated_at=datetime('now') WHERE id=?`).run(name, description, guest_count, markup, vat, req.params.id);
    db.prepare('DELETE FROM menu_recipes WHERE menu_id = ?').run(req.params.id);
    recipes.forEach(r => db.prepare('INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)').run(uuid(), req.params.id, r.recipe_id, r.portions));
  });
  tx();
  res.json(getMenuFull(req.params.id));
});

router.delete('/:id', (req, res) => {
  const menu = db.prepare('SELECT id FROM menus WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!menu) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
