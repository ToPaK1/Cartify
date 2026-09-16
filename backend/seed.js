const bcrypt = require('bcryptjs');
const db = require('./config/database');

const email = 'admin@cartify.com';
const password = 'Admin@12345';

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (!existing) {
  const hash = bcrypt.hashSync(password, 12);
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`)
    .run('Cartify Admin', email, hash);
  console.log(`Admin created: ${email}`);
} else {
  console.log(`Admin already exists: ${email}`);
}
