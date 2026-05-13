import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { buildResearchForm, buildResearchThanks } from '../lib/research-form.js';
import { notifyAdminNewResearchResponse, sendChefThankYou } from '../lib/mailer.js';

const router = Router();

// ── Public: render the research form, 4 languages ─────────────────────────────
router.get('/research', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(buildResearchForm('en'));
});

router.get('/research/:lang', (req, res, next) => {
  const { lang } = req.params;
  if (lang === 'thanks') return next();
  if (!['en', 'fr', 'ro', 'hu'].includes(lang)) return res.redirect('/research');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(buildResearchForm(lang));
});

router.get('/research/thanks/:lang?', (req, res) => {
  const lang = req.params.lang && ['en','fr','ro','hu'].includes(req.params.lang) ? req.params.lang : 'en';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(buildResearchThanks(lang));
});

// ── Public: submit a response ────────────────────────────────────────────────
router.post('/api/research/submit', async (req, res) => {
  const b = req.body || {};
  if (!b.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  const id = uuid();
  // Short, human-readable trial code: 4 chars + 4 chars
  const trial_code = uuid().replace(/-/g, '').slice(0, 4).toUpperCase()
    + '-' + uuid().replace(/-/g, '').slice(0, 4).toUpperCase();

  const lang = ['en', 'fr', 'ro', 'hu'].includes(b.language) ? b.language : 'en';
  const confidence = b.pricing_confidence ? parseInt(b.pricing_confidence, 10) : null;
  const allowFollowup = b.allow_followup === '1' || b.allow_followup === 1 ? 1 : 0;

  try {
    db.prepare(`
      INSERT INTO research_responses (
        id, language, trial_code,
        name, email, role, business_type, country, city,
        team_size, events_per_week, avg_ticket, years_experience,
        recipe_costing_method, quote_building_method, tools_used, hours_per_week, pricing_confidence,
        biggest_frustration, last_mistake, magic_wand, whats_stopping,
        tried_software, stopped_reason, must_have_feature, monthly_budget, decision_maker,
        allow_followup, beta_tester
      ) VALUES (?,?,?, ?,?,?,?,?,?, ?,?,?,?, ?,?,?,?,?, ?,?,?,?, ?,?,?,?,?, ?,?)
    `).run(
      id, lang, trial_code,
      (b.name || '').trim(), b.email.trim().toLowerCase(), b.role || '', b.business_type || '', b.country || '', b.city || '',
      b.team_size || '', b.events_per_week || '', b.avg_ticket || '', b.years_experience || '',
      b.recipe_costing_method || '', b.quote_building_method || '', b.tools_used || '', b.hours_per_week || '', confidence,
      b.biggest_frustration || '', b.last_mistake || '', b.magic_wand || '', b.whats_stopping || '',
      b.tried_software || '', b.stopped_reason || '', b.must_have_feature || '', b.monthly_budget || '', b.decision_maker || '',
      allowFollowup, b.beta_tester || ''
    );
  } catch (e) {
    console.error('[research] insert failed', e.message);
    return res.status(500).json({ error: 'save_failed' });
  }

  // Fire-and-forget the emails (don't block the response)
  const stored = db.prepare('SELECT * FROM research_responses WHERE id = ?').get(id);
  Promise.allSettled([
    notifyAdminNewResearchResponse(stored),
    sendChefThankYou({ email: stored.email, name: stored.name, language: lang, trial_code }),
  ]).catch(e => console.error('[research] mailer error', e));

  res.json({ ok: true, trial_code });
});

// ── Admin: list responses ────────────────────────────────────────────────────
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

router.get('/api/admin/research', auth, adminOnly, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM research_responses ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

router.get('/api/admin/research/:id', auth, adminOnly, (req, res) => {
  const row = db.prepare('SELECT * FROM research_responses WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json(row);
});

router.put('/api/admin/research/:id/reviewed', auth, adminOnly, (req, res) => {
  const { reviewed } = req.body;
  db.prepare('UPDATE research_responses SET reviewed = ? WHERE id = ?')
    .run(reviewed ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/api/admin/research/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM research_responses WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/api/admin/research/export/csv', auth, adminOnly, (req, res) => {
  const rows = db.prepare('SELECT * FROM research_responses ORDER BY created_at DESC').all();
  const cols = [
    'created_at', 'language', 'trial_code', 'redeemed_at', 'name', 'email',
    'role', 'business_type', 'country', 'city',
    'team_size', 'events_per_week', 'avg_ticket', 'years_experience',
    'recipe_costing_method', 'quote_building_method', 'tools_used', 'hours_per_week', 'pricing_confidence',
    'biggest_frustration', 'last_mistake', 'magic_wand', 'whats_stopping',
    'tried_software', 'stopped_reason', 'must_have_feature', 'monthly_budget', 'decision_maker',
    'allow_followup', 'beta_tester', 'reviewed',
  ];
  const esc = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="app4chef-research-${new Date().toISOString().slice(0,10)}.csv"`);
  res.send(csv);
});

// ── Redeem a trial code: requires auth, grants 6 months 'active' status ──────
router.post('/api/research/redeem', auth, (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'no_code' });

  const normalized = String(code).trim().toUpperCase();
  const row = db.prepare('SELECT * FROM research_responses WHERE trial_code = ?').get(normalized);
  if (!row) return res.status(404).json({ error: 'invalid_code' });
  if (row.redeemed_at) return res.status(400).json({ error: 'already_redeemed' });

  // Grant 6 months of active subscription
  const cancelAt = new Date();
  cancelAt.setMonth(cancelAt.getMonth() + 6);

  db.prepare(`UPDATE users SET subscription_status='active', cancel_at=?, subscription_plan='research-6mo' WHERE id=?`)
    .run(cancelAt.toISOString(), req.user.id);

  db.prepare(`UPDATE research_responses SET redeemed_at = datetime('now'), redeemed_user_id = ? WHERE id = ?`)
    .run(req.user.id, row.id);

  res.json({ ok: true, expires: cancelAt.toISOString() });
});

export default router;
