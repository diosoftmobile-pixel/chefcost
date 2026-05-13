import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = Router();
router.use(auth);

function getEventFull(id) {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!event) return null;
  event.menus = db.prepare(`
    SELECT em.*, m.name as menu_name, m.markup, m.vat, m.guest_count
    FROM event_menus em JOIN menus m ON m.id = em.menu_id WHERE em.event_id = ?
  `).all(id);
  return event;
}

function makeQuoteNumber() {
  return 'Q-' + Date.now().toString().slice(-6);
}

router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY event_date DESC').all(req.user.id);
  res.json(events.map(e => getEventFull(e.id)));
});

router.post('/', requireSubscription, (req, res) => {
  const {
    name, client_name = '', client_email = '', client_phone = '', event_date = '',
    guest_count = 1, notes = '', status = 'Draft', menus = [], location = '',
    staff_cost = 0, transport_cost = 0, rental_cost = 0, packaging_cost = 0, other_costs = 0,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const qn = makeQuoteNumber();
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status,location,staff_cost,transport_cost,rental_cost,packaging_cost,other_costs,quote_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.user.id, name, client_name, client_email, client_phone, event_date, guest_count, notes, status,
        location, staff_cost, transport_cost, rental_cost, packaging_cost, other_costs, qn);
    menus.forEach(m => db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)').run(uuid(), id, m.menu_id, m.quantity || 1));
  });
  tx();
  res.status(201).json(getEventFull(id));
});

router.put('/:id', requireSubscription, (req, res) => {
  const ev = db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  const {
    name, client_name, client_email, client_phone, event_date, guest_count, notes, status, menus = [],
    location = '', staff_cost = 0, transport_cost = 0, rental_cost = 0, packaging_cost = 0, other_costs = 0,
  } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE events SET name=?,client_name=?,client_email=?,client_phone=?,event_date=?,guest_count=?,notes=?,status=?,location=?,staff_cost=?,transport_cost=?,rental_cost=?,packaging_cost=?,other_costs=?,updated_at=datetime('now') WHERE id=?`)
      .run(name, client_name, client_email, client_phone, event_date, guest_count, notes, status,
        location, staff_cost, transport_cost, rental_cost, packaging_cost, other_costs, req.params.id);
    db.prepare('DELETE FROM event_menus WHERE event_id = ?').run(req.params.id);
    menus.forEach(m => db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)').run(uuid(), req.params.id, m.menu_id, m.quantity || 1));
  });
  tx();
  res.json(getEventFull(req.params.id));
});

// Mark as sent — updates status to 'Sent Offer'
router.post('/:id/mark-sent', requireSubscription, (req, res) => {
  const ev = db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  db.prepare(`UPDATE events SET status='Sent Offer', updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  res.json(getEventFull(req.params.id));
});

// Duplicate event
router.post('/:id/duplicate', requireSubscription, (req, res) => {
  const ev = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  const evMenus = db.prepare('SELECT * FROM event_menus WHERE event_id = ?').all(req.params.id);
  const newId = uuid();
  const qn = makeQuoteNumber();
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status,location,staff_cost,transport_cost,rental_cost,packaging_cost,other_costs,quote_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(newId, req.user.id, ev.name + ' (Copy)', ev.client_name, ev.client_email, ev.client_phone,
        ev.event_date, ev.guest_count, ev.notes, 'Draft', ev.location || '',
        ev.staff_cost || 0, ev.transport_cost || 0, ev.rental_cost || 0, ev.packaging_cost || 0, ev.other_costs || 0, qn);
    evMenus.forEach(m => db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)').run(uuid(), newId, m.menu_id, m.quantity));
  });
  tx();
  res.status(201).json(getEventFull(newId));
});

router.delete('/:id', requireSubscription, (req, res) => {
  const ev = db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
