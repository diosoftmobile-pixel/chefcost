import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const SELECT_COLS = 'id,name,email,role,subscription_status,subscription_plan,trial_end,cancel_at,currency,language,profit_margin,company_name,company_address,vat_number,company_email,company_phone,default_vat,food_cost_target,created_at';

router.get('/', (req, res) => {
  const user = db.prepare(`SELECT ${SELECT_COLS} FROM users WHERE id = ?`).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/', (req, res) => {
  const {
    name, currency, language, profit_margin,
    company_name, company_address, vat_number, company_email, company_phone,
    default_vat, food_cost_target,
  } = req.body;

  const allowed = ['EUR','USD','GBP','RON','HUF'];
  const allowedLangs = ['en','fr','ro','hu'];
  if (name !== undefined && !String(name).trim()) return res.status(400).json({ error: 'Name cannot be empty' });
  if (currency && !allowed.includes(currency)) return res.status(400).json({ error: 'Invalid currency' });
  if (language && !allowedLangs.includes(language)) return res.status(400).json({ error: 'Invalid language' });
  if (profit_margin !== undefined) {
    const p = parseFloat(profit_margin);
    if (isNaN(p) || p < 0 || p > 1000) return res.status(400).json({ error: 'Invalid profit_margin' });
  }
  if (default_vat !== undefined) {
    const v = parseFloat(default_vat);
    if (isNaN(v) || v < 0 || v > 100) return res.status(400).json({ error: 'Invalid default_vat' });
  }
  if (food_cost_target !== undefined) {
    const f = parseFloat(food_cost_target);
    if (isNaN(f) || f < 0 || f > 100) return res.status(400).json({ error: 'Invalid food_cost_target' });
  }

  db.prepare(`
    UPDATE users SET
      name=COALESCE(?,name),
      currency=COALESCE(?,currency),
      language=COALESCE(?,language),
      profit_margin=COALESCE(?,profit_margin),
      company_name=COALESCE(?,company_name),
      company_address=COALESCE(?,company_address),
      vat_number=COALESCE(?,vat_number),
      company_email=COALESCE(?,company_email),
      company_phone=COALESCE(?,company_phone),
      default_vat=COALESCE(?,default_vat),
      food_cost_target=COALESCE(?,food_cost_target)
    WHERE id=?
  `).run(
    name?.trim() || null, currency || null, language || null,
    profit_margin !== undefined ? parseFloat(profit_margin) : null,
    company_name ?? null, company_address ?? null, vat_number ?? null,
    company_email ?? null, company_phone ?? null,
    default_vat !== undefined ? parseFloat(default_vat) : null,
    food_cost_target !== undefined ? parseFloat(food_cost_target) : null,
    req.user.id,
  );

  const updated = db.prepare(`SELECT ${SELECT_COLS} FROM users WHERE id = ?`).get(req.user.id);
  res.json(updated);
});

export default router;
