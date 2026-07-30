import db from "./db.js";
import bcrypt from "bcryptjs";

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=70`;

const categories = [
  { slug: "starters", name: "Starters", sort: 1 },
  { slug: "mains", name: "Mains", sort: 2 },
  { slug: "pizza", name: "Pizza", sort: 3 },
  { slug: "desserts", name: "Desserts", sort: 4 },
  { slug: "drinks", name: "Drinks", sort: 5 },
];

const items = [
  // Starters
  {
    cat: "starters",
    name: "Crispy Calamari",
    desc: "Lightly battered squid, lemon aioli, fresh herbs.",
    price: 1100,
    popular: 1,
    tags: "seafood",
    image: img("1604908176997-125f25cc6f3d"),
  },
  {
    cat: "starters",
    name: "Truffle Arancini",
    desc: "Golden risotto balls, truffle, parmesan crema.",
    price: 950,
    popular: 0,
    tags: "vegetarian",
    image: img("1541014741259-de529411b96a"),
  },
  {
    cat: "starters",
    name: "Loaded Nachos",
    desc: "Melted cheese, jalapeños, guacamole, sour cream.",
    price: 990,
    popular: 1,
    tags: "vegetarian,spicy",
    image: img("1513456852971-30c0b8199d4d"),
  },
  {
    cat: "starters",
    name: "Buffalo Wings",
    desc: "Six wings tossed in house buffalo sauce, blue cheese dip.",
    price: 1050,
    popular: 0,
    tags: "spicy",
    image: img("1608039755401-742074f0548d"),
  },

  // Mains
  {
    cat: "mains",
    name: "Grilled Ribeye Steak",
    desc: "10oz ribeye, garlic butter, rosemary fries.",
    price: 2650,
    popular: 1,
    tags: "beef",
    image: img("1546964124-0cce460f38ef"),
  },
  {
    cat: "mains",
    name: "Herb Roast Chicken",
    desc: "Half chicken, lemon-thyme jus, seasonal greens.",
    price: 1850,
    popular: 0,
    tags: "chicken",
    image: img("1604908176997-125f25cc6f3d"),
  },
  {
    cat: "mains",
    name: "Pan-Seared Salmon",
    desc: "Atlantic salmon, dill cream, roasted asparagus.",
    price: 2150,
    popular: 1,
    tags: "seafood",
    image: img("1467003909585-2f8a72700288"),
  },
  {
    cat: "mains",
    name: "Wild Mushroom Risotto",
    desc: "Arborio rice, porcini, truffle oil, parmesan.",
    price: 1650,
    popular: 0,
    tags: "vegetarian",
    image: img("1476124369491-e7addf5db371"),
  },
  {
    cat: "mains",
    name: "Classic Beef Burger",
    desc: "Double patty, cheddar, smoked bacon, brioche bun.",
    price: 1450,
    popular: 1,
    tags: "beef",
    image: img("1568901346375-23c9450c58cd"),
  },

  // Pizza
  {
    cat: "pizza",
    name: "Margherita",
    desc: "San Marzano tomato, fior di latte, basil.",
    price: 1300,
    popular: 1,
    tags: "vegetarian",
    image: img("1574071318508-1cdbab80d002"),
  },
  {
    cat: "pizza",
    name: "Pepperoni",
    desc: "Double pepperoni, mozzarella, oregano.",
    price: 1550,
    popular: 1,
    tags: "",
    image: img("1628840042765-356cda07504e"),
  },
  {
    cat: "pizza",
    name: "Quattro Formaggi",
    desc: "Mozzarella, gorgonzola, parmesan, taleggio.",
    price: 1600,
    popular: 0,
    tags: "vegetarian",
    image: img("1513104890138-7c749659a591"),
  },
  {
    cat: "pizza",
    name: "Spicy Diavola",
    desc: "Spicy salami, chilli, tomato, mozzarella.",
    price: 1650,
    popular: 0,
    tags: "spicy",
    image: img("1565299624946-b28f40a0ae38"),
  },

  // Desserts
  {
    cat: "desserts",
    name: "Molten Chocolate Cake",
    desc: "Warm chocolate fondant, vanilla bean ice cream.",
    price: 850,
    popular: 1,
    tags: "vegetarian",
    image: img("1606313564200-e75d5e30476c"),
  },
  {
    cat: "desserts",
    name: "Classic Tiramisu",
    desc: "Espresso-soaked ladyfingers, mascarpone, cocoa.",
    price: 800,
    popular: 0,
    tags: "vegetarian",
    image: img("1571877227200-a0d98ea607e9"),
  },
  {
    cat: "desserts",
    name: "New York Cheesecake",
    desc: "Baked vanilla cheesecake, berry compote.",
    price: 820,
    popular: 0,
    tags: "vegetarian",
    image: img("1533134242443-d4fd215305ad"),
  },

  // Drinks
  {
    cat: "drinks",
    name: "Fresh Lemonade",
    desc: "Hand-pressed lemons, mint, sparkling water.",
    price: 450,
    popular: 0,
    tags: "vegan",
    image: img("1621263764928-df1444c5e859"),
  },
  {
    cat: "drinks",
    name: "Iced Caramel Latte",
    desc: "Double espresso, milk, caramel, ice.",
    price: 520,
    popular: 1,
    tags: "vegetarian",
    image: img("1461023058943-07fcbe16d735"),
  },
  {
    cat: "drinks",
    name: "Mango Smoothie",
    desc: "Alphonso mango, yoghurt, honey.",
    price: 560,
    popular: 0,
    tags: "vegetarian",
    image: img("1546173159-315724a31696"),
  },
  {
    cat: "drinks",
    name: "Sparkling Water",
    desc: "Chilled premium sparkling mineral water.",
    price: 300,
    popular: 0,
    tags: "vegan",
    image: img("1523362628745-0c100150b504"),
  },
];

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
}

export function seed() {
  reset();
  console.log(
    `Seeded ${categories.length} categories and ${items.length} menu items.`,
  );

  // Ensure an owner account exists for the admin console.
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
