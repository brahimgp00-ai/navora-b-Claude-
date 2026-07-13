# NAVORA API

Order & catalog API for **NAVORA** — a premium *rimless* eyewear brand for the
Moroccan market. The storefront is a single-page, high-converting site built
around the Cash-on-Delivery (COD / *paiement à la livraison*) flow that
dominates Moroccan e-commerce, so this API is deliberately small and focused:

- Serve the product catalog and pricing (the **source of truth** for totals).
- Accept and validate COD orders (Moroccan phone format, address, city).
- Persist orders and expose a token-protected admin read endpoint.

The storefront lives in the companion repo **navora-f-Claude-**.

## Tech stack

- Node.js 20+ / TypeScript (ESM)
- Express 4
- Zod for request validation
- Flat-file JSON persistence (no database to run)
- Vitest + Supertest for unit and API tests

## Getting started

```bash
npm install
cp .env.example .env      # adjust ADMIN_TOKEN / CORS_ORIGIN
npm run dev               # http://localhost:4000
```

Production build:

```bash
npm run build && npm start
```

## Configuration

| Variable       | Default                 | Description                                            |
| -------------- | ----------------------- | ------------------------------------------------------ |
| `PORT`         | `4000`                  | HTTP port.                                             |
| `CORS_ORIGIN`  | `*`                     | Comma-separated allowed origins, or `*` for any.       |
| `ADMIN_TOKEN`  | `change-me-in-production` | Value required in the `x-admin-token` header.        |
| `ORDERS_FILE`  | `data/orders.json`      | Where orders are persisted (relative to project root). |

## API

### `GET /api/health`
Liveness probe. Returns `{ status: "ok", ... }`.

### `GET /api/products`
Returns the catalog and the list of Moroccan cities used by the checkout.

```json
{ "products": [ { "id": "navora-aura", "tiers": [ ... ] } ], "cities": ["Casablanca", ...] }
```

### `GET /api/products/:id`
Returns a single product, or `404`.

### `POST /api/orders`
Creates a COD order. Prices are recomputed server-side from the catalog.

Request body:

```json
{
  "productId": "navora-aura",
  "colorId": "gold",
  "quantity": 2,
  "customer": {
    "fullName": "Youssef El Amrani",
    "phone": "0612345678",
    "city": "Casablanca",
    "address": "12 Rue des Orangers, Maârif",
    "notes": "Livraison le soir"
  }
}
```

Responses:
- `201` — `{ ok: true, order: { reference, total, ... } }`
- `422` — validation failed (`details` lists the offending fields)
- `400` — unknown color / unavailable quantity
- `404` — unknown product

Phone numbers accept the local (`0612345678`) and international (`+212612345678`)
Moroccan mobile formats; spaces, dots and dashes are stripped automatically.

### `GET /api/orders` *(admin)*
Requires header `x-admin-token: <ADMIN_TOKEN>`. Returns all orders, newest first.

### `GET /api/orders/:id` *(admin)*
Returns a single order by id.

## Tests

```bash
npm test          # vitest: validation, order building, and full API tests
npm run typecheck # tsc --noEmit
```
