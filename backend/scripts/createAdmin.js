require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const [, , name = 'Cartify Admin', email = 'admin@cartify.com', password = 'Admin@12345'] = process.argv;

(async () => {
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  const hash = await bcrypt.hash(password, 12);
  if (existing) {
    db.prepare('UPDATE users SET name=?,password_hash=?,role=\'admin\' WHERE id=?').run(name, hash, existing.id);
    console.log(`Admin updated: ${email}`);
  } else {
    db.prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,\'admin\')').run(name,email.toLowerCase(),hash);
    console.log(`Admin created: ${email}`);
  }
  console.log('Use the password supplied to this script. Do not commit it to Git.');
})();
