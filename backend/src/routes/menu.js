import { Router } from 'express';
import db from '../db.js';

const router = Router();

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

// GET /api/menu/categories
router.get('/categories', (_req, res) => {
  const rows = db.prepare('SELECT id, slug, name FROM categories ORDER BY sort, name').all();
  res.json(rows);
});

// GET /api/menu?category=mains&search=tikka
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = `
    SELECT m.*, c.slug AS category_slug, c.name AS category_name
    FROM menu_items m
    JOIN categories c ON c.id = m.category_id
    WHERE 1 = 1`;
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (m.name LIKE ? OR m.description LIKE ? OR m.tags LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY m.popular DESC, m.name';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapItem));
});

// GET /api/menu/:id
router.get('/:id', (req, res) => {
  const row = db
    .prepare(`
      SELECT m.*, c.slug AS category_slug, c.name AS category_name
      FROM menu_items m JOIN categories c ON c.id = m.category_id
      WHERE m.id = ?`)
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Item not found' });
  res.json(mapItem(row));
});

export default router;
