import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import db from '../db/index.js';

const router = Router();

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

router.get('/users', auth, adminOnly, (req, res) => {
  const users = db.prepare(
    `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
  ).all();
  res.json(users);
});

router.delete('/users/:id', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
