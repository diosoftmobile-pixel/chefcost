import db from '../db/index.js';

export function requireSubscription(req, res, next) {
  if (req.user.role === 'admin') return next();
  const user = db.prepare('SELECT subscription_status, trial_end FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (user.subscription_status === 'active') return next();
  if (user.subscription_status === 'trial' && user.trial_end && new Date(user.trial_end) > new Date()) return next();
  return res.status(403).json({ error: 'subscription_required' });
}
