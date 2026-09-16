require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cartify API is running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const result = db.prepare('SELECT 1 AS ok').get();
  res.json({ success: true, database: result.ok === 1 ? 'connected' : 'error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Cartify API running on http://localhost:${PORT}`);
});

module.exports = app;
