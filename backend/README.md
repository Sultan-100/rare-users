# IA Shop Backend

Node.js/Express + PostgreSQL API for auth, products, wishlist, and feedback.

## Setup
1) Install deps: `npm install`
2) Copy `env.sample` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, etc.
3) Start dev: `npm run dev` (defaults to port 4000)

## Endpoints (prefix `/api`)
- `POST /auth/signup` `{ username, password }`
- `POST /auth/login` `{ username, password }`
- `POST /auth/refresh` `{ refresh }`
- `GET /products` (public)
- `POST /products` (admin) `{ name, price, platform }`
- `DELETE /products/:id` (admin)
- `GET /wishlist` (auth)
- `POST /wishlist` (auth) `{ product_id }`
- `DELETE /wishlist/:productId` (auth)
- `GET /feedback` (admin)
- `POST /feedback` (auth) `{ message }`
- `PATCH /feedback/:id/mark` (admin) `{ unread: boolean }`
- `DELETE /feedback/:id` (admin)
- `GET /admin/accounts` (admin)
- `POST /admin/accounts/:id/block` (admin) `{ block: boolean }`
- `POST /admin/accounts/:id/admin` (admin) `{ makeAdmin: boolean }`
- `DELETE /admin/accounts/:id` (admin)
- `GET /me` (auth)

Default super admin is created automatically with username `admin` and password `admin123` (change it!). 

