import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(join(dataDir, 'restaurant.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// node:sqlite has no built-in transaction helper. Provide a better-sqlite3-style
// one: db.transaction(fn) returns a function that runs fn inside BEGIN/COMMIT.
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN');
  try {
    const result = fn(...args);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    google_id     TEXT,
    avatar        TEXT,
    phone         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    line1      TEXT NOT NULL,
    city       TEXT NOT NULL,
    phone      TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    slug  TEXT NOT NULL UNIQUE,
    name  TEXT NOT NULL,
    sort  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    price_cents  INTEGER NOT NULL,
    image        TEXT,
    tags         TEXT NOT NULL DEFAULT '',
    popular      INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'confirmed',
    fulfillment     TEXT NOT NULL DEFAULT 'delivery',
    contact_name    TEXT NOT NULL,
    contact_phone   TEXT NOT NULL,
    address_line1   TEXT,
    address_city    TEXT,
    notes           TEXT,
    subtotal_cents  INTEGER NOT NULL,
    delivery_cents  INTEGER NOT NULL DEFAULT 0,
    total_cents     INTEGER NOT NULL,
    payment_method  TEXT NOT NULL DEFAULT 'card',
    payment_status  TEXT NOT NULL DEFAULT 'paid',
    eta_minutes     INTEGER NOT NULL DEFAULT 35,
    placed_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER,
    name         TEXT NOT NULL,
    price_cents  INTEGER NOT NULL,
    quantity     INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

// --- lightweight migrations (run on every boot, safe to repeat) ---
const userColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!userColumns.includes('role')) {
  // 'customer' or 'owner' — owners get access to the admin console.
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'");
}

export default db;
