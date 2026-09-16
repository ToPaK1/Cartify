const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const configuredPath = process.env.DATABASE_PATH || './database/cartify.db';
const resolvedPath = path.isAbsolute(configuredPath) ? configuredPath : path.join(__dirname, '..', configuredPath.replace(/^\.\//, ''));
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
const db = new Database(resolvedPath);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,phone TEXT,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,category_id INTEGER,name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,description TEXT,brand TEXT,price REAL NOT NULL CHECK(price>=0),old_price REAL CHECK(old_price IS NULL OR old_price>=0),stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),rating REAL NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),image TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS product_images (id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,image_url TEXT NOT NULL,FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS carts (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS cart_items (id INTEGER PRIMARY KEY AUTOINCREMENT,cart_id INTEGER NOT NULL,product_id INTEGER NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>0),UNIQUE(cart_id,product_id),FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS wishlists (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,product_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,product_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS addresses (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,full_name TEXT NOT NULL,phone TEXT NOT NULL,address_line TEXT NOT NULL,city TEXT NOT NULL,governorate TEXT NOT NULL,postal_code TEXT,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,address_id INTEGER,status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),payment_method TEXT NOT NULL DEFAULT 'COD',subtotal REAL NOT NULL CHECK(subtotal>=0),shipping_fee REAL NOT NULL DEFAULT 0,total REAL NOT NULL CHECK(total>=0),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(address_id) REFERENCES addresses(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL,product_id INTEGER,product_name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>0),unit_price REAL NOT NULL CHECK(unit_price>=0),total REAL NOT NULL CHECK(total>=0),FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,product_id INTEGER NOT NULL,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,product_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE);
`);

const categories = [
  ['Electronics','electronics'],
  ['Fashion','fashion'],
  ['Home & Living','home-living'],
  ['Beauty','beauty'],
  ['Sports','sports'],
  ['Grocery','grocery']
];
const insertCategory = db.prepare('INSERT OR IGNORE INTO categories(name,slug) VALUES(?,?)');
for (const c of categories) insertCategory.run(...c);

const cat = name => db.prepare('SELECT id FROM categories WHERE name=?').get(name).id;
const insert = db.prepare('INSERT OR IGNORE INTO products(category_id,name,slug,description,brand,price,old_price,stock,rating,image) VALUES(?,?,?,?,?,?,?,?,?,?)');
const seed = db.transaction(() => {
  insert.run(cat('Electronics'),'Wireless Headphones','wireless-headphones','Comfortable wireless headphones with clear sound.','SoundMax',1499,1799,25,4.6,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e');
  insert.run(cat('Electronics'),'Smart Watch Pro','smart-watch-pro','Modern smartwatch with health and fitness features.','TechFit',2299,2699,18,4.5,'https://images.unsplash.com/photo-1523275335684-37898b6baf30');
  insert.run(cat('Fashion'),'Classic Sneakers','classic-sneakers','Everyday sneakers with a clean modern design.','UrbanStep',1199,1499,30,4.4,'https://images.unsplash.com/photo-1542291026-7eec264c27ff');
  insert.run(cat('Home & Living'),'Minimal Desk Lamp','minimal-desk-lamp','Minimal LED desk lamp for work and study.','Luma',699,899,40,4.7,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c');
  insert.run(cat('Electronics'),'Portable Bluetooth Speaker','portable-bluetooth-speaker','Compact wireless speaker with rich sound and deep bass.','SoundMax',899,1099,22,4.5,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1');
  insert.run(cat('Electronics'),'Mechanical Keyboard','mechanical-keyboard','Premium mechanical keyboard with tactile switches.','KeyCraft',1599,1899,16,4.8,'https://images.unsplash.com/photo-1587829741301-dc798b83add3');
  insert.run(cat('Fashion'),'Leather Crossbody Bag','leather-crossbody-bag','Structured leather crossbody bag for everyday carry.','Avenue',1799,2199,14,4.6,'https://images.unsplash.com/photo-1548036328-c9fa89d128fa');
  insert.run(cat('Fashion'),'Oversized Cotton Shirt','oversized-cotton-shirt','Relaxed fit cotton shirt with a clean editorial silhouette.','Northline',849,999,35,4.3,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab');
  insert.run(cat('Home & Living'),'Ceramic Table Vase','ceramic-table-vase','Hand-finished ceramic vase for modern interiors.','Form Studio',549,699,28,4.7,'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c');
  insert.run(cat('Home & Living'),'Linen Cushion Set','linen-cushion-set','Soft neutral linen cushions for a refined living space.','Casa',799,999,20,4.5,'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2');
  insert.run(cat('Beauty'),'Daily Skincare Set','daily-skincare-set','Simple cleanser, moisturizer and serum daily routine.','PureForm',1299,1599,24,4.6,'https://images.unsplash.com/photo-1556228578-8c89e6adf883');
  insert.run(cat('Beauty'),'Signature Fragrance','signature-fragrance','Warm woody fragrance designed for everyday wear.','Noir Atelier',1899,2299,12,4.8,'https://images.unsplash.com/photo-1541643600914-78b084683601');
  insert.run(cat('Sports'),'Performance Running Shoes','performance-running-shoes','Lightweight running shoes with responsive cushioning.','Motion',1699,1999,26,4.5,'https://images.unsplash.com/photo-1552674605-db6ffd4facb5');
  insert.run(cat('Sports'),'Training Water Bottle','training-water-bottle','Insulated stainless-steel bottle for training and travel.','ActiveLab',449,599,45,4.4,'https://images.unsplash.com/photo-1602143407151-7111542de6e8');
  insert.run(cat('Grocery'),'Organic Coffee Beans','organic-coffee-beans','Fresh roasted arabica coffee beans with balanced notes.','Roast House',599,749,32,4.7,'https://images.unsplash.com/photo-1447933601403-0c6688de566e');
  insert.run(cat('Grocery'),'Premium Dark Chocolate','premium-dark-chocolate','Rich dark chocolate made with premium cocoa.','Cacao Co.',299,399,50,4.6,'https://images.unsplash.com/photo-1548907040-4d42c31c8c7a');
});
seed();

db.close();
console.log(`Cartify database initialized: ${resolvedPath}`);
