require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');
require('./database/seedProducts');
const storeRoutes = require('./routes/storeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Idempotency records for successful Stripe Checkout sessions.
db.exec(`CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_reference TEXT NOT NULL UNIQUE,
  order_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
)`);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => res.json({ success: true, message: 'Cartify API is running', version: '1.0.0' }));
app.get('/api/health', (req, res) => {
  const result = db.prepare('SELECT 1 AS ok').get();
  res.json({ success: true, database: result.ok === 1 ? 'connected' : 'error' });
});

app.use('/api', storeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 409 : (err.status || 500);
  res.status(status).json({ success: false, message: status === 409 ? 'A record with the same unique value already exists' : (err.message || 'Internal server error') });
});

if (require.main === module) app.listen(PORT, () => console.log(`Cartify API running on http://localhost:${PORT}`));
module.exports = app;
