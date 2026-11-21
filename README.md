# FreshCart

Next.js (App Router) + TypeScript + Tailwind storefront for the Route E-commerce API
(`https://ecommerce.routemisr.com`).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## What's inside

| Area | Pages | Endpoints used |
| --- | --- | --- |
| Auth | `/login` `/register` `/forgot-password` (email → code → new password) `/change-password` | signin, signup, forgotPasswords, verifyResetCode, resetPassword, verifyToken, changeMyPassword |
| Home | `/` slider, categories, featured products, brands | categories, products, brands |
| Catalog | `/products` (search, sort, price, category, brand, pagination) `/products/[id]` `/brands` `/brands/[id]` `/categories` `/categories/[id]` | products, brands, categories, subcategories, reviews (get/create/update/delete) |
| Cart | `/cart` | cart get / add / update qty / remove item / clear |
| Wishlist | `/wishlist` + heart on every card | wishlist get / add / remove |
| Checkout | `/checkout` – saved addresses + cash / online (Stripe) | addresses, orders (cash v2 → v1 fallback), checkout-session |
| Orders | `/orders` (`/allorders` redirects here for Stripe's return URL) | orders/user/:id |

Token lives in `localStorage` and is sent as the `token` header. `userId` comes from the decoded JWT.
Not wired in the UI (no screen needs them): `GET /orders`, `GET /reviews`, `GET /reviews/:id`, `PUT /users/updateMe`, `GET /subcategories/:id`, `GET /addresses/:id`
— they exist in `src/lib/api.ts` if you want to use them.
