# plan.md

## 1) Objectives
- Build a **standalone EMBZ Designs / Existeance storefront** (React + Tailwind + shadcn/ui) backed by **FastAPI + MongoDB**.
- Integrate **Merchize** securely (token only in backend) to support: **catalog browsing, product detail/variants, cart + checkout creating real Merchize orders, shipping cheapest/fastest quotes, order tracking, and admin order management (push/cancel/hold/resume)**.
- Maintain premium brand feel: **muted chocolate/brown + beige + mustard accents**, editorial typography (Bitter-like serif), clean product-first layout.

## 2) Implementation Steps

### Phase 1 — Core Integration POC (Isolation) (required, but already proven)
> Core connectivity already validated via curl; convert this into a repeatable backend-only proof so future changes don’t break it.
1. Add a minimal `MerchizeClient` (httpx) in backend using:
   - `MERCHIZE_BASE_URL=https://bo-group-1-2.merchize.com/jwz6ha0/bo-api`
   - `Authorization: Bearer <token>`
   - Handle Merchize’s **HTTP 200 + success:false** error style.
2. Add `/api/merchize/health` that calls `/product/catalog?page=1&limit=1` and returns `{ok, merchize_success, total}`.
3. Add an isolated script/test (pytest or small python script) that hits the client and asserts:
   - catalog returns `success:true` and `total > 0`
   - order-detail for a random external_number returns `success:false`
4. Quick web search checkpoint (short): verify order payload fields and required item mapping (merchize_sku / product_id) align with latest docs.

**Phase 1 user stories**
1. As a developer, I can run one endpoint to confirm Merchize auth works.
2. As a developer, I can fetch the first page of catalog reliably.
3. As a developer, I can detect Merchize “logical errors” when HTTP status is 200.
4. As a developer, I can see timeouts/retries behave predictably.
5. As a developer, I can rotate the token without code changes (env-only).

### Phase 2 — V1 App Development (Storefront + Backend) + E2E test

#### Backend (FastAPI)
1. **Data model in MongoDB**
   - `products` collection: store catalog items with embedded variants; index on `sku`, `slug`, `title`.
   - `orders` collection: local order record (external_number/order_id, status, merchize response, timestamps).
2. **Product sync job**
   - Endpoint: `POST /api/admin/sync-products` (manual trigger for MVP).
   - Pull catalog pages (limit=50) until complete; upsert into Mongo.
3. **Storefront APIs (read)**
   - `GET /api/products?query=&category=&page=&limit=&sort=`
   - `GET /api/products/{id}` (from Mongo)
   - `GET /api/products/{id}/variants` (use embedded variants; fallback to Merchize endpoint if needed)
4. **Pricing & categories**
   - Retail price computed: `tier1_price * RETAIL_MARKUP` (default 2.2) rounded.
   - Category inference by title keywords (Apparel / Drinkware / Home & Living / Accessories).
5. **Shipping quote (cheapest/fastest)**
   - Endpoint: `POST /api/shipping/quote`
   - Input: destination country + cart lines (selected variant SKUs + qty)
   - Map country → zone (US/EU/GB/CA/ROW) and compute:
     - Cheapest = min(total_cost)
     - Fastest = heuristic: prefer zones/warehouse + production_time; for MVP treat “fastest” as same cost table but choose lowest first_item_price+additional (documented limitation).
6. **Checkout / order creation**
   - Endpoint: `POST /api/checkout` creates external order in Merchize via `POST /order/external/orders`.
   - Persist local order with:
     - `external_number` (generated), `identifier` ("embz"), request payload (sanitized), Merchize response.
7. **Order management + tracking**
   - `GET /api/orders/{external_number}` → proxies Merchize order-detail.
   - `GET /api/orders/{external_number}/tracking` → proxies tracking.
   - Admin actions:
     - `POST /api/admin/orders/{external_number}/push`
     - `POST /api/admin/orders/{external_number}/cancel`
     - `POST /api/admin/orders/{external_number}/hold`
     - `POST /api/admin/orders/{external_number}/resume`
   - `GET /api/admin/orders` lists local orders.

#### Frontend (React + Tailwind + shadcn/ui)
1. App shell + routing: Home, Shop, Product, Cart, Checkout, Tracking, Admin.
2. Shop page:
   - Search, category filter, sort, pagination, product cards with thumbnail + retail price.
3. Product detail:
   - Variant selection (size/color/label), display production time, price, shipping preview (optional).
4. Cart:
   - Quantity update/remove; compute subtotal; request shipping quote (cheapest/fastest) based on entered country.
5. Checkout:
   - Shipping form; choose shipping preference (cheapest vs fastest); place order.
   - Confirmation page shows external order number for tracking.
6. Tracking:
   - Lookup by external order number; show status + tracking link/info.
7. Admin dashboard (no-auth MVP):
   - Orders list + buttons to push/cancel/hold/resume.

**Phase 2 user stories**
1. As a shopper, I can browse products with images and retail prices.
2. As a shopper, I can search/filter/sort products to find what I want quickly.
3. As a shopper, I can select a variant (size/color) and add it to my cart.
4. As a shopper, I can see cheapest and fastest shipping quotes for my country.
5. As a shopper, I can checkout and create a real Merchize order.
6. As a shopper, I can track my order by order number.
7. As an admin, I can view orders and push/cancel them.

#### Phase 2 testing
- Run one full E2E pass (testing agent):
  - Sync products → browse → product detail → add to cart → shipping quote → checkout → order detail → tracking.
  - Admin: list orders → push/cancel (use a clearly marked test order).

### Phase 3 — Hardening + UX polish + shipping improvements
1. Shipping “fastest” improvement:
   - Incorporate `production_time` min/max + fulfillment location + destination heuristics.
   - Show explicit disclaimer if Merchize doesn’t provide transit time.
2. Better catalog performance:
   - Background sync option, incremental updates, cached queries.
3. Admin safety:
   - Confirm dialogs; prevent destructive actions without explicit confirmation.
4. Token rotation & safety:
   - Move token to a secure secret; add `/api/admin/merchize-token-status` (expiry warnings).
5. Design polish:
   - Implement brand palette, typography scale, hero layout, consistent cards/forms.

**Phase 3 user stories**
1. As a shopper, I see a clearly “recommended/cheapest/fastest” shipping option with explanation.
2. As an admin, I can’t accidentally cancel/push an order without confirmation.
3. As a developer, I can rotate Merchize tokens safely without breaking the app.
4. As a shopper, the catalog loads quickly even with 900+ products.
5. As a brand owner, the UI matches the premium EMBZ aesthetic.

### Phase 4+ — Optional expansions (only after approval)
- Payments (Stripe), embroidery configurator, customer accounts/auth, webhooks, email notifications.

## 3) Next Actions
1. Implement backend `MerchizeClient` + `/api/merchize/health` + minimal integration test.
2. Implement product sync to Mongo + read APIs.
3. Build storefront pages (Shop/Product/Cart/Checkout/Tracking/Admin) with shadcn/ui.
4. Implement checkout → real Merchize order creation and persist local orders.
5. Run E2E testing agent; fix until stable.

## 4) Success Criteria
- Merchize integration is stable (catalog + order create + tracking) and **token never reaches frontend**.
- Storefront supports full flow: **browse → variant → cart → shipping cheapest/fastest quote → checkout → tracking**.
- Admin can **list and manage** orders (push/cancel/hold/resume) via backend.
- Products are synced into Mongo and browsing is fast for ~900+ items.
- Visual design is consistent with EMBZ/Existeance premium aesthetic.
