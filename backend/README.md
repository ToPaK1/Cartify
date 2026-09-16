# Cartify Backend

REST API for the Cartify e-commerce application.

## Stack
- Node.js
- Express.js
- SQLite + better-sqlite3
- JWT authentication
- bcrypt password hashing

## Setup
```bash
cd backend
npm install
npm run db:init
```
Create `.env` from `.env.example` and set a strong `JWT_SECRET`.

Start:
```bash
npm run dev
```
API: `http://localhost:3000`
Health: `GET /api/health`

## Admin
```bash
npm run admin:create -- "Cartify Admin" "admin@cartify.com" "YourStrongPassword"
```

## API
- Auth: signup, login, me
- Categories: list/create/update/delete
- Products: list/details/create/update/delete with search, filters, sorting and pagination
- Cart: get/add/update/remove/clear
- Wishlist: get/add/remove
- Addresses: get/create/delete
- Orders: checkout, list, details, cancel
- Reviews: list/create-or-update
- Admin: statistics, users, roles, order management

## Business rules
- Customer is the default role; admin endpoints require JWT + admin role.
- Payment methods: COD and MockCard.
- Shipping is free for subtotal >= 1000, otherwise 60.
- Checkout validates stock, decrements stock transactionally and clears the cart.
- Eligible order cancellation restores stock.

Never commit `.env`, database files, uploads, or real credentials.
