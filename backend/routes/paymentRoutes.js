const express = require('express');
const Stripe = require('stripe');
const db = require('../config/database');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function getCart(userId) {
  const cart = db.prepare('SELECT * FROM carts WHERE user_id=?').get(userId);
  if (!cart) return { cart: null, items: [] };
  const items = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
    FROM cart_items ci
    JOIN products p ON p.id=ci.product_id
    WHERE ci.cart_id=?
  `).all(cart.id);
  return { cart, items };
}

function createOrder(userId, addressId, paymentMethod, paymentReference) {
  const { cart, items } = getCart(userId);
  if (!cart || !items.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });

  if (addressId && !db.prepare('SELECT id FROM addresses WHERE id=? AND user_id=?').get(addressId, userId)) {
    throw Object.assign(new Error('Invalid address'), { status: 400 });
  }

  for (const item of items) {
    if (item.quantity > item.stock) {
      throw Object.assign(new Error(`Insufficient stock for ${item.name}`), { status: 400 });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const shipping = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shipping;

  return db.transaction(() => {
    const existing = paymentReference
      ? db.prepare('SELECT order_id FROM payment_transactions WHERE payment_reference=?').get(paymentReference)
      : null;
    if (existing) return existing.order_id;

    const order = db.prepare(`
      INSERT INTO orders(user_id,address_id,payment_method,subtotal,shipping_fee,total)
      VALUES(?,?,?,?,?,?)
    `).run(userId, addressId || null, paymentMethod, subtotal, shipping, total);

    for (const item of items) {
      db.prepare(`
        INSERT INTO order_items(order_id,product_id,product_name,quantity,unit_price,total)
        VALUES(?,?,?,?,?,?)
      `).run(order.lastInsertRowid, item.product_id, item.name, item.quantity, item.price, item.quantity * item.price);
      db.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE cart_id=?').run(cart.id);
    if (paymentReference) {
      db.prepare('INSERT INTO payment_transactions(payment_reference,order_id) VALUES(?,?)').run(paymentReference, order.lastInsertRowid);
    }

    return order.lastInsertRowid;
  })();
}

router.post('/create-checkout-session', authenticate, async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Card payments are not configured. Add STRIPE_SECRET_KEY to backend/.env' });

    const { address_id } = req.body;
    const { items } = getCart(req.user.id);
    if (!items.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    if (address_id && !db.prepare('SELECT id FROM addresses WHERE id=? AND user_id=?').get(address_id, req.user.id)) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    for (const item of items) {
      if (item.quantity > item.stock) return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const shipping = subtotal >= 1000 ? 0 : 60;
    const total = subtotal + shipping;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        ...items.map(item => ({
          price_data: {
            currency: 'egp',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        })),
        ...(shipping > 0 ? [{
          price_data: {
            currency: 'egp',
            product_data: { name: 'Shipping' },
            unit_amount: Math.round(shipping * 100)
          },
          quantity: 1
        }] : [])
      ],
      metadata: {
        user_id: String(req.user.id),
        address_id: address_id ? String(address_id) : ''
      },
      success_url: 'http://localhost:4200/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/checkout?payment=cancelled'
    });

    res.json({ success: true, checkout_url: session.url, session_id: session.id, total });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:sessionId', authenticate, async (req, res, next) => {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Card payments are not configured' });
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.metadata?.user_id !== String(req.user.id)) return res.status(403).json({ success: false, message: 'Payment session does not belong to this user' });
    if (session.payment_status !== 'paid') return res.status(400).json({ success: false, message: 'Payment has not been completed' });

    const addressId = session.metadata?.address_id ? Number(session.metadata.address_id) : null;
    const orderId = createOrder(req.user.id, addressId, 'CARD', session.id);
    const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(orderId, req.user.id);
    res.json({ success: true, message: 'Payment completed and order created', order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
