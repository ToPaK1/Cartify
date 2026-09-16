const db = require('../config/database');

function health(req, res) {
  const result = db.prepare('SELECT 1 AS ok').get();
  res.json({ success: true, database: result.ok === 1 ? 'connected' : 'error' });
}

module.exports = { health };
