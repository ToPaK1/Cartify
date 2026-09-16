const db = require('../config/database');

function getCategories(req, res, next) {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ success: true, categories });
  } catch (error) { next(error); }
}

module.exports = { getCategories };
