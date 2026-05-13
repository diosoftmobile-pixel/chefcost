import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = Router();
router.use(auth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM ingredients WHERE user_id = ? ORDER BY category, name').all(req.user.id);
  res.json(rows);
});

router.post('/', requireSubscription, (req, res) => {
  const {
    name, category, unit, purchase_qty, purchase_price, supplier = '', notes = '', allergens = [],
    yield_pct = 100, cal_per_100g = 0, protein_per_100g = 0, carbs_per_100g = 0, fat_per_100g = 0
  } = req.body;
  if (!name || !category || !unit) return res.status(400).json({ error: 'name, category, unit required' });
  const id = uuid();
  const allergensJson = JSON.stringify(Array.isArray(allergens) ? allergens : []);
  db.prepare(`INSERT INTO ingredients (id,user_id,name,category,unit,purchase_qty,purchase_price,supplier,notes,allergens,yield_pct,cal_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, name, category, unit, purchase_qty || 1, purchase_price || 0, supplier, notes, allergensJson,
      yield_pct, cal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g);
  res.status(201).json(db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id));
});

router.put('/:id', requireSubscription, (req, res) => {
  const ing = db.prepare('SELECT id FROM ingredients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ing) return res.status(404).json({ error: 'Not found' });
  const {
    name, category, unit, purchase_qty, purchase_price, supplier, notes, allergens = [],
    yield_pct = 100, cal_per_100g = 0, protein_per_100g = 0, carbs_per_100g = 0, fat_per_100g = 0
  } = req.body;
  const allergensJson = JSON.stringify(Array.isArray(allergens) ? allergens : []);
  db.prepare(`UPDATE ingredients SET name=?,category=?,unit=?,purchase_qty=?,purchase_price=?,supplier=?,notes=?,allergens=?,yield_pct=?,cal_per_100g=?,protein_per_100g=?,carbs_per_100g=?,fat_per_100g=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, category, unit, purchase_qty, purchase_price, supplier ?? '', notes ?? '', allergensJson,
      yield_pct, cal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, req.params.id);
  res.json(db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireSubscription, (req, res) => {
  const ing = db.prepare('SELECT id FROM ingredients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ing) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
