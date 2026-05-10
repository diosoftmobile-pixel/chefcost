import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM ingredients WHERE user_id = ? ORDER BY category, name').all(req.user.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, category, unit, purchase_qty, purchase_price, supplier = '', notes = '' } = req.body;
  if (!name || !category || !unit) return res.status(400).json({ error: 'name, category, unit required' });
  const id = uuid();
  db.prepare(`INSERT INTO ingredients (id,user_id,name,category,unit,purchase_qty,purchase_price,supplier,notes) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, name, category, unit, purchase_qty || 1, purchase_price || 0, supplier, notes);
  res.status(201).json(db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const ing = db.prepare('SELECT id FROM ingredients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ing) return res.status(404).json({ error: 'Not found' });
  const { name, category, unit, purchase_qty, purchase_price, supplier, notes } = req.body;
  db.prepare(`UPDATE ingredients SET name=?,category=?,unit=?,purchase_qty=?,purchase_price=?,supplier=?,notes=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, category, unit, purchase_qty, purchase_price, supplier ?? '', notes ?? '', req.params.id);
  res.json(db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const ing = db.prepare('SELECT id FROM ingredients WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ing) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
