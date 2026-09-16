const db = require('../config/database');

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
}

function findById(id) {
  return db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(id);
}

function create({ name, email, phone, passwordHash, role = 'customer' }) {
  const result = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), email.trim().toLowerCase(), phone?.trim() || null, passwordHash, role);
  return findById(result.lastInsertRowid);
}

module.exports = { findByEmail, findById, create };
