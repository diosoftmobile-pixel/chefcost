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
    `SELECT id, name, email, role, subscription_status, trial_end, is_locked, created_at FROM users ORDER BY created_at DESC`
  ).all();
  res.json(users);
});

router.delete('/users/:id', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

router.put('/users/:id/lock', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ error: 'Cannot lock your own account' });
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot lock admin accounts' });
  const { locked } = req.body;
  db.prepare('UPDATE users SET is_locked = ? WHERE id = ?').run(locked ? 1 : 0, id);
  res.json({ ok: true });
});

router.put('/users/:id/subscription', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  const { subscription_status } = req.body;
  const allowed = ['free', 'trial', 'active'];
  if (!allowed.includes(subscription_status)) return res.status(400).json({ error: 'Invalid status' });
  const trialEnd = subscription_status === 'trial'
    ? (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString(); })()
    : null;
  db.prepare('UPDATE users SET subscription_status=?, trial_end=? WHERE id=?').run(subscription_status, trialEnd, id);
  res.json({ ok: true });
});

export default router;
