const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ success: true, categories });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireAdmin, (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug are required' });
    const result = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name.trim(), slug.trim().toLowerCase());
    res.status(201).json({ success: true, category: db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) });
  } catch (error) { next(error); }
});

module.exports = router;
