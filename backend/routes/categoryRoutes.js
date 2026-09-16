const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const slugify = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/', (req, res, next) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ success: true, categories });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireAdmin, (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const slug = slugify(req.body.slug || name);
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Category name is required' });
    const result = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name, slug);
    res.status(201).json({ success: true, category: db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ success:false, message:'A category with this name or slug already exists' });
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id=?').get(req.params.id);
    if (!existing) return res.status(404).json({ success:false, message:'Category not found' });
    const name = String(req.body.name || '').trim();
    const slug = slugify(req.body.slug || name);
    if (!name || !slug) return res.status(400).json({ success:false, message:'Category name is required' });
    db.prepare('UPDATE categories SET name=?, slug=? WHERE id=?').run(name, slug, req.params.id);
    res.json({ success:true, category: db.prepare('SELECT * FROM categories WHERE id=?').get(req.params.id) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ success:false, message:'A category with this name or slug already exists' });
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM categories WHERE id=?').get(req.params.id);
    if (!existing) return res.status(404).json({ success:false, message:'Category not found' });
    db.prepare('UPDATE products SET category_id=NULL WHERE category_id=?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
    res.json({ success:true, message:'Category deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
