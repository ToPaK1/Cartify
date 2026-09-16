const db = require('../config/database');

// Adds the expanded demo catalog without deleting or replacing existing products.
const products = [
  ['Electronics','Portable Bluetooth Speaker','portable-bluetooth-speaker','Compact wireless speaker with rich sound and deep bass.','SoundMax',899,1099,22,4.5,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1'],
  ['Electronics','Mechanical Keyboard','mechanical-keyboard','Premium mechanical keyboard with tactile switches.','KeyCraft',1599,1899,16,4.8,'https://images.unsplash.com/photo-1587829741301-dc798b83add3'],
  ['Fashion','Leather Crossbody Bag','leather-crossbody-bag','Structured leather crossbody bag for everyday carry.','Avenue',1799,2199,14,4.6,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa'],
  ['Fashion','Oversized Cotton Shirt','oversized-cotton-shirt','Relaxed fit cotton shirt with a clean editorial silhouette.','Northline',849,999,35,4.3,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
  ['Home & Living','Ceramic Table Vase','ceramic-table-vase','Hand-finished ceramic vase for modern interiors.','Form Studio',549,699,28,4.7,'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c'],
  ['Home & Living','Linen Cushion Set','linen-cushion-set','Soft neutral linen cushions for a refined living space.','Casa',799,999,20,4.5,'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2'],
  ['Beauty','Daily Skincare Set','daily-skincare-set','Simple cleanser, moisturizer and serum daily routine.','PureForm',1299,1599,24,4.6,'https://images.unsplash.com/photo-1556228578-8c89e6adf883'],
  ['Beauty','Signature Fragrance','signature-fragrance','Warm woody fragrance designed for everyday wear.','Noir Atelier',1899,2299,12,4.8,'https://images.unsplash.com/photo-1541643600914-78b084683601'],
  ['Sports','Performance Running Shoes','performance-running-shoes','Lightweight running shoes with responsive cushioning.','Motion',1699,1999,26,4.5,'https://images.unsplash.com/photo-1552674605-db6ffd4facb5'],
  ['Sports','Training Water Bottle','training-water-bottle','Insulated stainless-steel bottle for training and travel.','ActiveLab',449,599,45,4.4,'https://images.unsplash.com/photo-1602143407151-7111542de6e8'],
  ['Grocery','Organic Coffee Beans','organic-coffee-beans','Fresh roasted arabica coffee beans with balanced notes.','Roast House',599,749,32,4.7,'https://images.unsplash.com/photo-1447933601403-0c6688de566e'],
  ['Grocery','Premium Dark Chocolate','premium-dark-chocolate','Rich dark chocolate made with premium cocoa.','Cacao Co.',299,399,50,4.6,'https://images.unsplash.com/photo-1548907040-4d42c31c8c7a']
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
  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
  console.log(`Cartify catalog ready: ${count} products`);
}

seedProducts();
