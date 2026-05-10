import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { signToken, auth } from '../middleware/auth.js';
import { notifyNewChef } from '../lib/mailer.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password, role = 'chef' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const id = uuid();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)').run(id, name, email, hash, role);
  const token = signToken({ id, name, email, role });
  notifyNewChef({ name, email });
  res.status(201).json({ token, user: { id, name, email, role } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

export default router;
