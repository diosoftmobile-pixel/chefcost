import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, role, subscription_status, subscription_plan, trial_end, cancel_at, currency, language, profit_margin, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/', (req, res) => {
  const { name, currency, language, profit_margin } = req.body;
  const allowed = ['EUR', 'USD', 'GBP', 'RON', 'HUF'];
  const allowedLangs = ['en', 'fr', 'ro', 'hu'];
  if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
  if (currency && !allowed.includes(currency)) return res.status(400).json({ error: 'Invalid currency' });
  if (language && !allowedLangs.includes(language)) return res.status(400).json({ error: 'Invalid language' });
  if (profit_margin !== undefined) {
    const pct = parseFloat(profit_margin);
    if (isNaN(pct) || pct < 0 || pct > 1000) return res.status(400).json({ error: 'Invalid profit margin' });
  }
  const margin = profit_margin !== undefined ? parseFloat(profit_margin) : null;
  db.prepare(
    `UPDATE users SET name=COALESCE(?,name), currency=COALESCE(?,currency), language=COALESCE(?,language), profit_margin=COALESCE(?,profit_margin) WHERE id=?`
  ).run(name || null, currency || null, language || null, margin, req.user.id);
  const updated = db.prepare(
    'SELECT id, name, email, role, subscription_status, trial_end, currency, language, profit_margin FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json(updated);
});

export default router;
