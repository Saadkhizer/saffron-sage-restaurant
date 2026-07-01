import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import db from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar || null,
  phone: u.phone || null,
  role: u.role || 'customer',
});

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/signup', (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hash);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.post('/google', async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(400).json({ error: 'Google sign-in is not configured' });

  const credential = req.body.credential;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;
    const avatar = payload.picture || null;

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const info = db
        .prepare('INSERT INTO users (name, email, google_id, avatar) VALUES (?, ?, ?, ?)')
        .run(name, email, googleId, avatar);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    } else if (!user.google_id) {
      db.prepare('UPDATE users SET google_id = ?, avatar = COALESCE(avatar, ?) WHERE id = ?')
        .run(googleId, avatar, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Could not verify Google sign-in' });
  }
});

// Returns the current user (used to re-hydrate the session on app load).
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

router.put('/me', requireAuth, (req, res) => {
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

export default router;
