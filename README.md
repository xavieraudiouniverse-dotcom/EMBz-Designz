# EMBZ DESIGNZ

A streetwear storefront built with Next.js 14 (App Router) + Supabase (auth, Postgres,
row-level security). Customer accounts, an admin dashboard, AUD/NZD currency switching,
order tracking, and a Merchize integration scaffold are all wired up — this README is
everything you need to get it live, for free.

## 1. Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. Once it's ready, open **SQL Editor** → New query, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This creates every
   table, security policy, and seeds a handful of sample products.
3. Go to **Project Settings → API** and copy three values — you'll need them in step 3:
   - `Project URL`
   - `anon` `public` key
   - `service_role` key (keep this one secret — never put it in client-side code)

## 2. Push this code to GitHub

1. Go to [github.com/new](https://github.com/new), create a new repository (public or
   private, your choice), and **don't** initialize it with a README.
2. On the empty repo's page, use **"uploading an existing file"** and drag in every file
   from this folder (keep the folder structure — `src/`, `supabase/`, `package.json`, etc.)
   — or, if you're comfortable with a terminal:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/embz-designz.git
   git add -A && git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```

## 3. Deploy on Vercel (free)

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just
   created (sign in with GitHub if you haven't).
2. Before clicking Deploy, open **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |

   (Leave the `MERCHIZE_*` and `STRIPE_*` variables out until you have credentials
   from their respective dashboards — the site works fine without them, payment and
   Merchize import will just show friendly "not configured" messages until then.)

   Optionally add `GEMINI_API_KEY` (see **AI assistant** below) — or add it later and redeploy.
   See sections below for setting up Stripe, Merchize, and the AI assistant.

3. Click **Deploy**. In a minute or two you'll have a live URL.

## 4. Make yourself admin

1. On your live site, sign up for an account normally (this makes you a `customer` by
   default).
2. Back in Supabase → SQL Editor, run:
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com'
   on conflict (user_id, role) do nothing;
   ```
3. Reload the site and visit `/admin` — you're in.

## Product Designer — customize shirts & all-over-print products yourself

Admin → Designer is a real mockup studio, no Merchize account needed to create a
product:

- Upload a **blank garment photo** once per product type (Admin → Designer → "Manage
  blank garment templates" — a white/light tee or hoodie front photo works best,
  since garment recoloring uses a multiply blend against it) and mark its print-safe
  area.
- Pick a template, choose a **garment color**, then **drag artwork or text directly on
  the canvas** — drag the piece to move it, the bottom-right knob to resize, the top
  knob to rotate (sliders in the side panel give you pixel-precise control too).
- Toggle **All-over print** on any artwork layer to tile it across the entire garment
  instead of a bounded chest print — for true AOP products.
- Stack multiple layers (several images + text), reorder them, front **and** back
  sides, each with its own template and layers.
- **Save as product** flattens the canvas to a real product photo, uploads it, and
  creates (or updates) the live listing in your shop — instantly, no import step.
- **Download this side as PNG** exports a print-ready flat file any time you still
  want to hand a design to Merchize (or another printer) manually.

Run `supabase/migrations/002_product_designer.sql` in Supabase's SQL Editor if you
already set up your database before this feature existed (brand-new setups get this
automatically as part of `schema.sql`).

If you're adding Stripe payments to an existing database, also run `supabase/migrations/003_stripe_payments.sql`
to add the payment tracking columns (`payment_status`, `stripe_session_id`, `stripe_payment_intent_id`) to orders.

## Bulk importing products

Admin → Products has two ways to add many products at once:

- **CSV upload** — click "Show expected format" for the exact template, or use this:
  ```csv
  name,price,stock,description,image_url,category,is_featured,is_active
  Chrome Crown Tee,45.00,40,Heavyweight cotton tee,https://example.com/tee.jpg,Tees,true,true
  ```
  Export a spreadsheet as CSV (Excel/Sheets/Numbers: File → Download/Export → CSV) and
  upload it. `category` matches an existing category's name or slug — leave it blank to
  skip. Re-uploading the same file **updates** matching products (matched by name)
  instead of creating duplicates, so it's safe to re-run after fixing a typo.
- **Bulk Merchize import** — in the "Import from Merchize" box, switch to bulk mode and
  paste a list of Merchize product IDs/SKUs, one per line.

Both report exactly which rows succeeded and which failed (with the reason), so a bad
row never silently drops the rest of the batch.

## Payments (Stripe)

Customers pay through Stripe Checkout — a secure, hosted payment page that Stripe manages
for you. Every payment settles directly into your own Stripe account, on your normal
payout schedule. There's no middleman, no monthly fees, just Stripe's standard payment
processing fees (2.9% + $0.30 per transaction for US-issued cards, rates vary by card type
and region — see [stripe.com/pricing](https://stripe.com/pricing)).

### Setup

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com), create a free Stripe account (or sign in).
2. Go to **Developers → API keys** (in the menu, bottom-left):
   - Copy your **Secret key** (starts with `sk_live_` or `sk_test_`).
3. In **Vercel project settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY` = your Secret key
4. Still in Stripe Dashboard, go to **Developers → Webhooks** and click **Add endpoint**:
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook` (replace with your live Vercel URL)
   - Select event: `checkout.session.completed` (this tells Stripe to notify you when a payment succeeds)
   - Click **Reveal signing secret** and copy it
5. Add to **Vercel environment variables**:
   - `STRIPE_WEBHOOK_SECRET` = the signing secret from step 4
6. **Redeploy** the Vercel site (Vercel auto-redeploys when you add env vars, but manually trigger if it doesn't).

Once configured:
- Checkout redirects customers to Stripe's hosted payment page
- After payment succeeds, Stripe notifies your `/api/stripe/webhook` endpoint
- The webhook marks the order paid and triggers fulfillment (Merchize push, if applicable)
- The customer is sent back to their order page with a "Payment received" badge

**Testing**: Use Stripe's [test mode cards](https://stripe.com/docs/testing) (e.g. `4242 4242 4242 4242`) with your `sk_test_` key to test without real charges. Switch to `sk_live_` when you're ready.

## AI assistant (free)

A chat widget (bottom-right of every page) helps customers find products, understand
where to go on the site, and check their own order status/tracking — powered by Google's
Gemini API, which has a genuinely free tier (no credit card): 1,500 requests/day.

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (sign in
   with any Google account, click "Create API key").
2. Add it to Vercel: **Project → Settings → Environment Variables** → `GEMINI_API_KEY` →
   redeploy.

Until that key is set, the widget stays visible but tells visitors the assistant isn't
configured yet, rather than erroring. The assistant only ever sees the signed-in visitor's
own orders — it queries Supabase through the same row-level-security policies as the rest
of the site, so it can't see (or be tricked into revealing) anyone else's data.

## Branding

Drop your real logo at:
- `public/logo.png` — then swap `src/components/Logo.tsx`'s placeholder for an `<Image>` tag
- `src/app/icon.png` — Next.js automatically uses this as the favicon

## The Legacy page (`/legacy`)

A tribute page dedicated to Ella Mary Broughton & John Broughton — linked from the
homepage ("Explore the legacy") and the main nav. To add their real photos, drop the
image files at:
- `public/legacy/ella.jpg`
- `public/legacy/john.jpg`

The page shows a soft monogram in their place until those files exist, so nothing looks
broken in the meantime — it swaps to the real photo automatically the moment you add it,
no code change or redeploy needed beyond pushing the image file. Edit the copy (the
tribute text, the four "what their legacy means" pillars, the Legacy Fund note) directly
in `src/app/legacy/page.tsx`.

## What's built

- **Storefront**: homepage, shop grid, product pages, cart (localStorage), checkout
- **Accounts**: sign up / sign in / sign out, profile, private order history
- **Admin command center** (`/admin`, role-protected): revenue and signups over the last
  30 days, orders by status, top products by revenue, currency split, low-stock alerts,
  and recent Merchize fulfillment activity — plus product CRUD, order management with
  shipping status + tracking, and a user list with suspend/unsuspend
- **Currency**: AUD/NZD switcher, admin-editable exchange rate (`exchange_rates` table)
- **Shipping & tracking**: per-order status timeline, carrier tracking deep-links
  (USPS/UPS/FedEx/DHL/Australia Post/NZ Post), `order_status_events` history
- **Merchize**: `src/lib/merchize.ts` client, admin "Import from Merchize" button (single
  or bulk — paste a list of product IDs), order-fulfillment push on checkout, and a
  stubbed webhook at `/api/merchize/webhook` (protected by `MERCHIZE_WEBHOOK_SECRET`)
  ready to receive real tracking updates once you have Merchize's API docs
- **Bulk product import**: upload a CSV from Admin → Products to create/update many
  products at once (see below)
- **Product Designer**: a drag/resize/rotate canvas studio at Admin → Designer for
  mocking up shirts, hoodies, and all-over-print products directly in the store
- **Stripe payments**: Checkout redirects to Stripe's secure hosted payment page, payments
  settle directly to your Stripe account (no middleman), webhook marks order paid and
  triggers Merchize fulfillment — fully gated, no fake payments possible
- **AI assistant**: a site-wide chat widget (Gemini API, free tier) that answers product
  and navigation questions and looks up the signed-in customer's own orders
- **Cyberpunk homepage hero**: animated holographic grid, drifting particles, and a scan
  sweep in chrome/purple/cyan, with a "global movement online" status pill and stats row
- **Legacy page** (`/legacy`): tribute page for Ella Mary Broughton & John Broughton with
  a Legacy Fund section — see "The Legacy page" below for adding real photos

## Local development (optional)

If you ever want to run this on your own machine:
```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys
npm run dev
```
