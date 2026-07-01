import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const mapOrder = (o, items) => ({
  id: o.id,
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
  paymentStatus: o.payment_status,
  etaMinutes: o.eta_minutes,
  placedAt: o.placed_at,
  items: items.map((i) => ({
    id: i.id,
    menuItemId: i.menu_item_id,
    name: i.name,
    priceCents: i.price_cents,
    quantity: i.quantity,
  })),
});

const itemsFor = (orderId) =>
  db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

// POST /api/orders  — place a new order (prices are recomputed server-side)
router.post('/', (req, res) => {
  const { items, fulfillment, contact, address, notes, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }
  if (!contact?.name || !contact?.phone) {
    return res.status(400).json({ error: 'Contact name and phone are required' });
  }
  const mode = fulfillment === 'pickup' ? 'pickup' : 'delivery';
  if (mode === 'delivery' && (!address?.line1 || !address?.city)) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  // Trust only the menu item ids + quantities from the client; price from DB.
  const getItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND is_available = 1');
  const resolved = [];
  for (const line of items) {
    const dbItem = getItem.get(line.id);
    if (!dbItem) return res.status(400).json({ error: `Item ${line.id} is unavailable` });
    const qty = Math.max(1, Math.min(50, parseInt(line.quantity, 10) || 1));
    resolved.push({ item: dbItem, qty });
  }

  const subtotal = resolved.reduce((sum, r) => sum + r.item.price_cents * r.qty, 0);
  const deliveryFee = mode === 'delivery' ? Number(process.env.DELIVERY_FEE_CENTS || 299) : 0;
  const total = subtotal + deliveryFee;
  const eta = mode === 'delivery' ? 35 : 20;

  const tx = db.transaction(() => {
    const info = db
      .prepare(`
        INSERT INTO orders
          (user_id, status, fulfillment, contact_name, contact_phone,
           address_line1, address_city, notes, subtotal_cents, delivery_cents,
           total_cents, payment_method, payment_status, eta_minutes)
        VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`)
      .run(
        req.user.id, mode, contact.name, contact.phone,
        mode === 'delivery' ? address.line1 : null,
        mode === 'delivery' ? address.city : null,
        notes || null, subtotal, deliveryFee, total,
        paymentMethod === 'cash' ? 'cash' : 'card', eta
      );
    const orderId = info.lastInsertRowid;
    const insItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, name, price_cents, quantity) VALUES (?, ?, ?, ?, ?)'
    );
    for (const r of resolved) {
      insItem.run(orderId, r.item.id, r.item.name, r.item.price_cents, r.qty);
    }
    return orderId;
  });

  const orderId = tx();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json(mapOrder(order, itemsFor(orderId)));
});

// GET /api/orders — current user's order history
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY placed_at DESC')
    .all(req.user.id);
  res.json(orders.map((o) => mapOrder(o, itemsFor(o.id))));
});

// GET /api/orders/:id — single order (for tracking / confirmation)
router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Status is owner-driven (set from the admin console), so return it as stored.
  res.json(mapOrder(order, itemsFor(order.id)));
});

export default router;
