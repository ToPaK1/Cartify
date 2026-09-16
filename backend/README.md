# Cartify Backend

REST API backend for the Cartify E-Commerce application.

## Stack
- Node.js
- Express.js
- SQLite + better-sqlite3
- JWT authentication
- bcryptjs password hashing

## Setup

```bash
cd backend
npm install
npm run db:init
```

Create `.env` from `.env.example`, then run:

```bash
npm run dev
```

API: `http://localhost:3000`

Health check: `GET /api/health`

## Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)

## Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

Product listing supports search, category, brand, price range, sorting and pagination.
