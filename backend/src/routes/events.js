import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

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

router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY event_date DESC').all(req.user.id);
  res.json(events.map(e => getEventFull(e.id)));
});

router.post('/', (req, res) => {
  const { name, client_name = '', client_email = '', client_phone = '', event_date = '', guest_count = 1, notes = '', status = 'Draft', menus = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO events (id,user_id,name,client_name,client_email,client_phone,event_date,guest_count,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(id, req.user.id, name, client_name, client_email, client_phone, event_date, guest_count, notes, status);
    menus.forEach(m => db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)').run(uuid(), id, m.menu_id, m.quantity || 1));
  });
  tx();
  res.status(201).json(getEventFull(id));
});

router.put('/:id', (req, res) => {
  const ev = db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  const { name, client_name, client_email, client_phone, event_date, guest_count, notes, status, menus = [] } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE events SET name=?,client_name=?,client_email=?,client_phone=?,event_date=?,guest_count=?,notes=?,status=?,updated_at=datetime('now') WHERE id=?`)
      .run(name, client_name, client_email, client_phone, event_date, guest_count, notes, status, req.params.id);
    db.prepare('DELETE FROM event_menus WHERE event_id = ?').run(req.params.id);
    menus.forEach(m => db.prepare('INSERT INTO event_menus (id,event_id,menu_id,quantity) VALUES (?,?,?,?)').run(uuid(), req.params.id, m.menu_id, m.quantity || 1));
  });
  tx();
  res.json(getEventFull(req.params.id));
});

router.delete('/:id', (req, res) => {
  const ev = db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
