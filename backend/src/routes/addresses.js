import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const mapAddress = (a) => ({
  id: a.id,
  label: a.label,
  line1: a.line1,
  city: a.city,
  phone: a.phone,
  isDefault: !!a.is_default,
});

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC')
    .all(req.user.id);
  res.json(rows.map(mapAddress));
});

router.post('/', (req, res) => {
  const { label, line1, city, phone, isDefault } = req.body;
  if (!line1 || !city) return res.status(400).json({ error: 'Address line and city are required' });

  const tx = db.transaction(() => {
    if (isDefault) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    const info = db
      .prepare('INSERT INTO addresses (user_id, label, line1, city, phone, is_default) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.user.id, label || 'Home', line1, city, phone || null, isDefault ? 1 : 0);
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json(mapAddress(db.prepare('SELECT * FROM addresses WHERE id = ?').get(id)));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

export default router;
