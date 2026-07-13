import { Router } from 'express';
import multer from 'multer';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('owner'));

/* ---------------------------- image uploads ---------------------------- */

// Dish photos are stored next to the database and served at /uploads/<file>,
// so the owner can add pictures straight from a phone or computer instead of
// hunting for a hosted image URL.
const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', '..', 'data', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

const imageExt = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${imageExt[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, !!imageExt[file.mimetype]),
});

router.post('/menu/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : 'Upload failed';
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Choose a JPG, PNG, WEBP, or GIF image up to 5 MB' });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

/* ------------------------------- helpers ------------------------------- */

const mapItem = (r) => ({
  id: r.id,
  categoryId: r.category_id,
  categorySlug: r.category_slug,
  categoryName: r.category_name,
  name: r.name,
  description: r.description,
  priceCents: r.price_cents,
  image: r.image,
  tags: r.tags ? r.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  popular: !!r.popular,
  available: !!r.is_available,
});

const mapOrder = (o) => ({
  id: o.id,
  userId: o.user_id,
  status: o.status,
  fulfillment: o.fulfillment,
  contactName: o.contact_name,
  contactPhone: o.contact_phone,
  addressLine1: o.address_line1,
  addressCity: o.address_city,
  notes: o.notes,
  subtotalCents: o.subtotal_cents,
  deliveryCents: o.delivery_cents,
  totalCents: o.total_cents,
  paymentMethod: o.payment_method,
  etaMinutes: o.eta_minutes,
  placedAt: o.placed_at,
  items: db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(o.id)
    .map((i) => ({ id: i.id, menuItemId: i.menu_item_id, name: i.name, priceCents: i.price_cents, quantity: i.quantity })),
});

/* ------------------------------- stats --------------------------------- */

router.get('/stats', (_req, res) => {
  const pending = db.prepare("SELECT COUNT(*) c FROM orders WHERE status = 'pending'").get().c;
  const total = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const today = db
    .prepare("SELECT COUNT(*) c, COALESCE(SUM(total_cents),0) rev FROM orders WHERE date(placed_at) = date('now') AND status != 'rejected'")
    .get();
  const menuCount = db.prepare('SELECT COUNT(*) c FROM menu_items').get().c;
  res.json({
    pending,
    totalOrders: total,
    todayOrders: today.c,
    todayRevenueCents: today.rev,
    menuCount,
  });
});

/* ------------------------------- orders -------------------------------- */

router.get('/orders', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM orders';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY placed_at DESC';
  res.json(db.prepare(sql).all(...params).map(mapOrder));
});

// Valid status transitions, given the requested action.
function nextStatus(order, action) {
  switch (action) {
    case 'accept':
      return order.status === 'pending' ? 'preparing' : null;
    case 'reject':
      return order.status === 'pending' ? 'rejected' : null;
    case 'advance':
      if (order.status === 'preparing') return order.fulfillment === 'pickup' ? 'ready' : 'on_the_way';
      if (order.status === 'on_the_way' || order.status === 'ready') return 'delivered';
      return null;
    default:
      return null;
  }
}

router.patch('/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const next = nextStatus(order, req.body.action);
  if (!next) return res.status(400).json({ error: 'That action is not allowed for this order' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(next, order.id);
  res.json(mapOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id)));
});

/* -------------------------------- menu --------------------------------- */

const itemJoin = `
  SELECT m.*, c.slug AS category_slug, c.name AS category_name
  FROM menu_items m JOIN categories c ON c.id = m.category_id`;

router.get('/menu', (_req, res) => {
  const rows = db.prepare(`${itemJoin} ORDER BY c.sort, m.name`).all();
  res.json(rows.map(mapItem));
});

function validItem(body) {
  const name = (body.name || '').trim();
  const priceCents = parseInt(body.priceCents, 10);
  const categoryId = parseInt(body.categoryId, 10);
  if (!name) return { error: 'Name is required' };
  if (!Number.isFinite(priceCents) || priceCents < 0) return { error: 'Enter a valid price' };
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId)) {
    return { error: 'Pick a valid category' };
  }
  return {
    value: {
      name,
      description: (body.description || '').trim(),
      priceCents,
      categoryId,
      image: (body.image || '').trim() || null,
      tags: Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || ''),
      popular: body.popular ? 1 : 0,
      available: body.available === false ? 0 : 1,
    },
  };
}

router.post('/menu', (req, res) => {
  const { value, error } = validItem(req.body);
  if (error) return res.status(400).json({ error });
  const info = db
    .prepare(`INSERT INTO menu_items
      (category_id, name, description, price_cents, image, tags, popular, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(value.categoryId, value.name, value.description, value.priceCents, value.image, value.tags, value.popular, value.available);
  const row = db.prepare(`${itemJoin} WHERE m.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(mapItem(row));
});

router.put('/menu/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  const { value, error } = validItem(req.body);
  if (error) return res.status(400).json({ error });
  db.prepare(`UPDATE menu_items SET
      category_id = ?, name = ?, description = ?, price_cents = ?,
      image = ?, tags = ?, popular = ?, is_available = ? WHERE id = ?`)
    .run(value.categoryId, value.name, value.description, value.priceCents, value.image, value.tags, value.popular, value.available, existing.id);
  const row = db.prepare(`${itemJoin} WHERE m.id = ?`).get(existing.id);
  res.json(mapItem(row));
});

// Quick availability toggle (used by the menu manager switch).
router.patch('/menu/:id/availability', (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(req.body.available ? 1 : 0, existing.id);
  const row = db.prepare(`${itemJoin} WHERE m.id = ?`).get(existing.id);
  res.json(mapItem(row));
});

router.delete('/menu/:id', (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ----------------------------- categories ------------------------------ */

router.post('/categories', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)) {
    return res.status(409).json({ error: 'That category already exists' });
  }
  const maxSort = db.prepare('SELECT COALESCE(MAX(sort),0) m FROM categories').get().m;
  const info = db.prepare('INSERT INTO categories (slug, name, sort) VALUES (?, ?, ?)').run(slug, name, maxSort + 1);
  res.status(201).json(db.prepare('SELECT id, slug, name FROM categories WHERE id = ?').get(info.lastInsertRowid));
});

export default router;
