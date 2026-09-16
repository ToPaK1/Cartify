const db = require('../config/database');

function list({ search, category, brand, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 }) {
  const conditions = [];
  const params = [];
  if (search) { conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)'); const q = `%${search}%`; params.push(q, q, q); }
  if (category) { conditions.push('(c.slug = ? OR c.id = ?)'); params.push(category, Number(category) || 0); }
  if (brand) { conditions.push('p.brand = ?'); params.push(brand); }
  if (minPrice !== undefined) { conditions.push('p.price >= ?'); params.push(Number(minPrice)); }
  if (maxPrice !== undefined) { conditions.push('p.price <= ?'); params.push(Number(maxPrice)); }

  const orderMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    rating: 'p.rating DESC',
    name: 'p.name ASC'
  };
  const orderBy = orderMap[sort] || orderMap.newest;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 12));
  const offset = (safePage - 1) * safeLimit;
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS count FROM products p LEFT JOIN categories c ON c.id = p.category_id ${where}`).get(...params).count;
  const products = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?
  `).all(...params, safeLimit, offset);

  return { products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } };
}

function findById(id) {
  return db.prepare(`SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`).get(id);
}

function create(data) {
  const result = db.prepare(`INSERT INTO products (category_id,name,slug,description,brand,price,old_price,stock,rating,image) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    data.category_id || null, data.name, data.slug, data.description || null, data.brand || null,
    Number(data.price), data.old_price == null ? null : Number(data.old_price), Number(data.stock || 0), Number(data.rating || 0), data.image || null
  );
  return findById(result.lastInsertRowid);
}

function update(id, data) {
  db.prepare(`UPDATE products SET category_id=?,name=?,slug=?,description=?,brand=?,price=?,old_price=?,stock=?,rating=?,image=? WHERE id=?`).run(
    data.category_id || null, data.name, data.slug, data.description || null, data.brand || null,
    Number(data.price), data.old_price == null ? null : Number(data.old_price), Number(data.stock || 0), Number(data.rating || 0), data.image || null, id
  );
  return findById(id);
}

function remove(id) { return db.prepare('DELETE FROM products WHERE id = ?').run(id); }

module.exports = { list, findById, create, update, remove };
