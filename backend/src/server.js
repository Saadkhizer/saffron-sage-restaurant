import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import configRoutes from './routes/config.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import addressRoutes from './routes/addresses.js';
import adminRoutes from './routes/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4500;

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);

// Owner-uploaded dish photos (saved by /api/admin/menu/upload).
app.use('/uploads', express.static(join(__dirname, '..', 'data', 'uploads')));

// In production the frontend is built to ../frontend/dist and served from this
// same service, so the whole app is one URL with no CORS/proxy to configure.
// Locally this folder doesn't exist (Vite's own dev server handles the frontend
// on :5173), so the block below simply never activates.
const frontendDist = join(__dirname, '..', '..', 'frontend', 'dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(frontendDist, 'index.html'));
  });
}

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

import db from './db.js';
import { seed } from './seed.js';
const menuCount = db.prepare("SELECT COUNT(*) as c FROM menu_items").get().c;
if (menuCount === 0) {
  console.log('🌱 Seeding database...');
  seed();
}

app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
});
