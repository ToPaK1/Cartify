const db = require('../config/database');

// Expanded demo catalog. Product ideas/prices are based on current Egyptian retail references.
const products = [
  ['Electronics','Portable Bluetooth Speaker','portable-bluetooth-speaker','Compact wireless speaker with rich sound and deep bass.','SoundMax',699,899,22,4.5,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1'],
  ['Electronics','Mechanical Keyboard','mechanical-keyboard','Premium mechanical keyboard with tactile switches.','KeyCraft',999,1299,16,4.8,'https://images.unsplash.com/photo-1587829741301-dc798b83add3'],
  ['Fashion','Leather Crossbody Bag','leather-crossbody-bag','Structured leather crossbody bag for everyday carry.','Avenue',899,1099,14,4.6,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa'],
  ['Fashion','Oversized Cotton Shirt','oversized-cotton-shirt','Relaxed fit cotton shirt with a clean editorial silhouette.','Northline',499,699,35,4.3,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
  ['Home & Living','Ceramic Table Vase','ceramic-table-vase','Hand-finished ceramic vase for modern interiors.','Form Studio',349,499,28,4.7,'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c'],
  ['Home & Living','Linen Cushion Set','linen-cushion-set','Soft neutral linen cushions for a refined living space.','Casa',449,599,20,4.5,'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2'],
  ['Beauty','Daily Skincare Set','daily-skincare-set','Simple cleanser, moisturizer and serum daily routine.','PureForm',799,999,24,4.6,'https://images.unsplash.com/photo-1556228578-8c89e6adf883'],
  ['Beauty','Signature Fragrance','signature-fragrance','Warm woody fragrance designed for everyday wear.','Noir Atelier',999,1299,12,4.8,'https://images.unsplash.com/photo-1541643600914-78b084683601'],
  ['Sports','Performance Running Shoes','performance-running-shoes','Lightweight running shoes with responsive cushioning.','Motion',1199,1499,26,4.5,'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'],
  ['Sports','Training Water Bottle','training-water-bottle','Insulated stainless-steel bottle for training and travel.','ActiveLab',299,399,45,4.4,'https://images.unsplash.com/photo-1602143407151-7111542de6e8'],
  ['Grocery','Organic Coffee Beans','organic-coffee-beans','Fresh roasted arabica coffee beans with balanced notes.','Roast House',349,449,32,4.7,'https://images.unsplash.com/photo-1447933601403-0c6688de566e'],
  ['Grocery','Premium Dark Chocolate','premium-dark-chocolate','Rich dark chocolate made with premium cocoa.','Cacao Co.',179,249,50,4.6,'https://images.unsplash.com/photo-1548907040-4d42c31c8c7a'],

  ['Electronics','JBL Tune 520BT Wireless Headphones','jbl-tune-520bt-wireless-headphones','Wireless on-ear headphones with Pure Bass sound and up to 57 hours of battery life.','JBL',2099,2450,18,4.5,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
  ['Electronics','Anker Soundcore P40i Wireless Earbuds','anker-soundcore-p40i-wireless-earbuds','Noise-cancelling wireless earbuds with long playtime and Bluetooth connectivity.','Anker',2199,2499,20,4.5,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'],
  ['Electronics','Logitech MX Keys S Wireless Keyboard','logitech-mx-keys-s-wireless-keyboard','Low-profile wireless keyboard with backlighting and programmable keys.','Logitech',7499,8999,9,4.4,'https://images.unsplash.com/photo-1587829741301-dc798b83add3'],
  ['Electronics','Xiaomi 10000mAh Power Bank','xiaomi-10000mah-power-bank','Compact 10000mAh power bank with USB-C fast charging.','Xiaomi',699,899,30,4.0,'https://images.unsplash.com/photo-1609592424670-e2cdbf3b7c12'],
  ['Electronics','Anker 67W USB-C Fast Charger','anker-67w-usb-c-fast-charger','Compact 67W USB-C fast charger for laptops, tablets and phones.','Anker',1499,1799,14,4.5,'https://images.unsplash.com/photo-1625842268584-8f3296236761'],
  ['Electronics','Baseus Blade 20000mAh Power Bank','baseus-blade-20000mah-power-bank','High-capacity power bank with fast charging and digital display.','Baseus',2999,3499,8,4.4,'https://images.unsplash.com/photo-1609592424670-e2cdbf3b7c12'],
  ['Electronics','Casio MTP-V001GL-1B Dress Watch','casio-mtp-v001gl-1b-dress-watch','Classic analog dress watch with leather band and clean dial.','Casio',999,1199,11,4.6,'https://images.unsplash.com/photo-1524805444758-089113d48a6d'],
  ['Electronics','Logitech G G715 Wireless Gaming Keyboard','logitech-g-g715-wireless-gaming-keyboard','Wireless gaming keyboard with RGB lighting and tactile switches.','Logitech G',6999,7999,5,4.7,'https://images.unsplash.com/photo-1595225476474-87563907a212']
];

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function seedProducts() {
  const category = db.prepare('SELECT id FROM categories WHERE name = ?');
  const insert = db.prepare(`
    INSERT OR IGNORE INTO products
      (category_id,name,slug,description,brand,price,old_price,stock,rating,image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const add = db.transaction(() => {
    for (const [categoryName,name,slug,description,brand,price,oldPrice,stock,rating,image] of products) {
      const categoryRow = category.get(categoryName);
      if (!categoryRow) continue;
      insert.run(categoryRow.id,name,slug || slugify(name),description,brand,price,oldPrice,stock,rating,image);
    }
  });

  add();

  // Keep existing seeded products realistic too when this startup seeder runs again.
  const priceFixes = {
    'Portable Bluetooth Speaker':[699,899],
    'Mechanical Keyboard':[999,1299],
    'Leather Crossbody Bag':[899,1099],
    'Oversized Cotton Shirt':[499,699],
    'Ceramic Table Vase':[349,499],
    'Linen Cushion Set':[449,599],
    'Daily Skincare Set':[799,999],
    'Signature Fragrance':[999,1299],
    'Performance Running Shoes':[1199,1499],
    'Training Water Bottle':[299,399],
    'Organic Coffee Beans':[349,449],
    'Premium Dark Chocolate':[179,249]
  };

  const updatePrice = db.prepare('UPDATE products SET price=?, old_price=? WHERE name=?');
  for (const [name, values] of Object.entries(priceFixes)) updatePrice.run(values[0], values[1], name);

  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
  console.log(`Cartify catalog ready: ${count} products`);
}

seedProducts();
