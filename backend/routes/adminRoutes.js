const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/stats', (req, res) => {
  const stats = {
    products: db.prepare('SELECT COUNT(*) count FROM products').get().count,
    customers: db.prepare("SELECT COUNT(*) count FROM users WHERE role='customer'").get().count,
    orders: db.prepare('SELECT COUNT(*) count FROM orders').get().count,
    revenue: db.prepare("SELECT COALESCE(SUM(total),0) total FROM orders WHERE status != 'Cancelled'").get().total,
    pending: db.prepare("SELECT COUNT(*) count FROM orders WHERE status='Pending'").get().count,
    lowStock: db.prepare('SELECT COUNT(*) count FROM products WHERE stock <= 5').get().count
  };
  res.json({ success: true, stats });
});

router.get('/orders', (req, res) => {
  const orders = db.prepare(`SELECT o.id,o.status,o.payment_method,o.subtotal,o.shipping_fee,o.total,o.created_at,u.name customer_name,u.email customer_email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 20`).all();
  res.json({ success: true, orders });
});

router.patch('/orders/:id/status', (req, res) => {
  const allowed = ['Pending','Processing','Shipped','Delivered','Cancelled'];
  const { status } = req.body;
  if (!allowed.includes(status)) return res.status(400).json({ success:false, message:'Invalid order status' });
  const order = db.prepare('SELECT id,status FROM orders WHERE id=?').get(req.params.id);
  if (!order) return res.status(404).json({ success:false, message:'Order not found' });
  db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ success:true, order: db.prepare('SELECT id,status FROM orders WHERE id=?').get(req.params.id) });
});

router.get('/users', (req, res) => {
  const users = db.prepare("SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC LIMIT 50").all();
  res.json({ success:true, users });
});

module.exports = router;
