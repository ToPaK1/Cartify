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
    categories: db.prepare('SELECT COUNT(*) count FROM categories').get().count,
    revenue: db.prepare("SELECT COALESCE(SUM(total),0) total FROM orders WHERE status != 'Cancelled'").get().total,
    pending: db.prepare("SELECT COUNT(*) count FROM orders WHERE status='Pending'").get().count,
    lowStock: db.prepare('SELECT COUNT(*) count FROM products WHERE stock <= 5').get().count
  };
  res.json({ success:true, stats });
});

router.get('/orders', (req, res) => {
  const orders = db.prepare(`SELECT o.id,o.status,o.payment_method,o.subtotal,o.shipping_fee,o.total,o.created_at,u.name customer_name,u.email customer_email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 50`).all();
  res.json({ success:true, orders });
});

router.get('/orders/:id', (req, res) => {
  const order = db.prepare(`SELECT o.*,u.name customer_name,u.email customer_email,u.phone customer_phone FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?`).get(req.params.id);
  if (!order) return res.status(404).json({success:false,message:'Order not found'});
  const items = db.prepare(`SELECT oi.*,p.name product_name,p.image product_image FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?`).all(req.params.id);
  res.json({success:true,order,items});
});

router.patch('/orders/:id/status', (req, res) => {
  const allowed = ['Pending','Processing','Shipped','Delivered','Cancelled'];
  const { status } = req.body;
  if (!allowed.includes(status)) return res.status(400).json({success:false,message:'Invalid order status'});
  const order = db.prepare('SELECT id,status FROM orders WHERE id=?').get(req.params.id);
  if (!order) return res.status(404).json({success:false,message:'Order not found'});
  db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
  res.json({success:true,order:db.prepare('SELECT id,status FROM orders WHERE id=?').get(req.params.id)});
});

router.get('/users', (req, res) => {
  const users = db.prepare("SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC LIMIT 100").all();
  res.json({success:true,users});
});

router.patch('/users/:id/role', (req, res) => {
  const role = req.body.role;
  if (!['customer','admin'].includes(role)) return res.status(400).json({success:false,message:'Invalid role'});
  if (Number(req.params.id) === Number(req.user.id) && role !== 'admin') return res.status(400).json({success:false,message:'You cannot remove your own admin role'});
  const user = db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({success:false,message:'User not found'});
  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  res.json({success:true,user:db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(req.params.id)});
});

router.get('/products/low-stock', (req, res) => {
  const products = db.prepare('SELECT id,name,brand,price,stock,image FROM products WHERE stock <= 5 ORDER BY stock ASC,name ASC').all();
  res.json({success:true,products});
});

module.exports = router;
