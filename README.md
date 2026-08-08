# Used Dirt Bike Store — External Website

A Next.js 14 headless ecommerce storefront that integrates with the **Used Dirt Bike E-commerce API**.

## Quick start

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_COMMERCE_API_URL=https://www.charlesdiscus.website/api
EXTERNAL_ADMIN_AUTH_URL=https://www.charlesdiscus.website
ADMIN_SECRET=change-this-secret
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_COMMERCE_API_URL` | The Used Dirt Bike E-commerce API base URL |
| `EXTERNAL_ADMIN_AUTH_URL` | The external API host for admin auth (no `/api` suffix) |
| `ADMIN_SECRET` | The admin secret used to authenticate admin registration/login |

## Features

### Public storefront (no auth required)
- Browse products with search and category filtering
- View product details, galleries, stock, and customer reviews
- Full checkout flow that creates an order via `POST /api/orders`
- Order confirmation page with resend confirmation email
- Homepage hero banners from `GET /api/hero`
- Store reviews from `GET /api/reviews/store`
- Categories, product types, and suppliers lists

### Public API endpoints used
| Endpoint | Purpose |
|----------|---------|
| `GET /api/products` | List products (supports `category_id`, `search`) |
| `GET /api/products/:id` | Get product by ID |
| `GET /api/categories` | List categories |
| `GET /api/product-types` | List product types |
| `GET /api/suppliers` | List suppliers |
| `GET /api/hero` | Get hero banners |
| `GET /api/reviews/store` | Get approved store reviews |
| `GET /api/reviews/product/:productId` | Get approved product reviews |
| `POST /api/orders` | Create an order (checkout) |
| `GET /api/orders/:id` | Get order by ID |
| `POST /api/orders/:orderId/resend-confirmation` | Resend confirmation email |

### Admin panel (`/admin`)
Admin auth uses the external admin API with an HTTP-only cookie.

- **Products** — full CRUD with Cloudinary image upload, category/type/supplier selection, stock, sizes
- **Categories** — full CRUD
- **Product types** — full CRUD
- **Suppliers** — full CRUD
- **Hero banners** — full CRUD
- **Reviews** — approve, reject, set pending, delete
- **Orders** — update status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) and send payment status emails

### Admin API endpoints used
| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/admin/login` | Admin login |
| `POST /api/auth/admin/register` | Admin registration |
| `GET/POST /api/products` | List / create products |
| `PUT/DELETE /api/products/:id` | Update / delete product |
| `GET/POST /api/categories` | List / create categories |
| `PUT/DELETE /api/categories/:id` | Update / delete category |
| `GET/POST /api/product-types` | List / create product types |
| `PUT/DELETE /api/product-types/:id` | Update / delete product type |
| `GET/POST /api/suppliers` | List / create suppliers |
| `PUT/DELETE /api/suppliers/:id` | Update / delete supplier |
| `GET/POST /api/hero` | List / create hero banners |
| `PUT/DELETE /api/hero/:id` | Update / delete hero banner |
| `GET /api/reviews` | List reviews (supports `status`, `product_id`, `limit`, `offset`) |
| `PUT /api/reviews/:reviewId` | Update review status |
| `DELETE /api/reviews/:reviewId` | Delete review |
| `GET /api/orders` | List all orders |
| `PUT /api/orders/:id/status` | Update order status |
| `POST /api/orders/:orderId/payment-status` | Send payment status email |
| `POST /api/upload/upload` | Upload image to Cloudinary |
| `DELETE /api/upload/delete` | Delete image from Cloudinary |

## Architecture

The storefront uses Next.js API proxy routes (`/api/*`) that forward requests to the external
Used Dirt Bike E-commerce API. This keeps admin credentials and API calls server-side.

- `lib/types.ts` — shared TypeScript types
- `lib/commerce.ts` — public commerce API client
- `lib/admin.ts` — admin commerce API client (proxy layer)
- `lib/auth.ts` — admin authentication helpers (HMAC token + HTTP-only cookie)