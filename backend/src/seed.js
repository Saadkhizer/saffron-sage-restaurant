import db from "./db.js";
import bcrypt from "bcryptjs";

const reset = db.transaction(() => {
  db.exec(
    "DELETE FROM order_items; DELETE FROM orders; DELETE FROM menu_items; DELETE FROM categories;",
  );
  db.exec(
    "DELETE FROM sqlite_sequence WHERE name IN ('menu_items','categories');",
  );

  const insCat = db.prepare(
    "INSERT INTO categories (slug, name, sort) VALUES (?, ?, ?)",
  );
  const catId = {};
  for (const c of categories) {
    const info = insCat.run(c.slug, c.name, c.sort);
    catId[c.slug] = info.lastInsertRowid;
  }

  const insItem = db.prepare(
    "INSERT INTO menu_items (category_id, name, description, price_cents, image, tags, popular) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  for (const it of items) {
    insItem.run(
      catId[it.cat],
      it.name,
      it.desc,
      it.price,
      it.image,
      it.tags,
      it.popular,
    );
  }
});

export function seed() {
  reset();
  console.log(
    `Seeded ${categories.length} categories and ${items.length} menu items.`,
  );

  const ownerEmail = "owner@saffronsage.test";
  const existingOwner = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(ownerEmail);
  if (!existingOwner) {
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'owner')",
    ).run("Restaurant Owner", ownerEmail, bcrypt.hashSync("owner123", 10));
    console.log("Created owner login → owner@saffronsage.test / owner123");
  } else {
    db.prepare("UPDATE users SET role = 'owner' WHERE email = ?").run(
      ownerEmail,
    );
    console.log("Owner account ready → owner@saffronsage.test");
  }
}

if (process.argv[1].includes("seed")) {
  seed();
  process.exit(0);
}
