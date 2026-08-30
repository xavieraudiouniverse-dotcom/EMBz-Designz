-- ============================================================================
-- embz-designz database schema
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run
-- ============================================================================

-- ---------- Roles ----------
create type public.app_role as enum ('admin', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  postal_code text,
  country text,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict (user_id, role) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "Users view own profile" on public.profiles for select to authenticated
  using (auth.uid() = id or public.is_admin());
create policy "Users insert own profile" on public.profiles for insert to authenticated
  with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated
  using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
create policy "Admins delete profiles" on public.profiles for delete to authenticated
  using (public.is_admin());

create policy "Users view own roles" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------- Catalog ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories are public" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  stock integer not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  merchize_product_id text,
  merchize_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Active products are public" on public.products for select using (is_active or public.is_admin());
create policy "Admins manage products" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create trigger products_updated_at before update on public.products
  for each row execute function public.update_updated_at_column();

-- ---------- Currency ----------
create table public.exchange_rates (
  currency_code text primary key,
  rate_to_aud numeric(10,6) not null,
  updated_at timestamptz not null default now()
);
alter table public.exchange_rates enable row level security;
create policy "Exchange rates are public" on public.exchange_rates for select using (true);
create policy "Admins manage exchange rates" on public.exchange_rates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
insert into public.exchange_rates (currency_code, rate_to_aud) values
  ('AUD', 1.0),
  ('NZD', 1.08);

-- ---------- Orders ----------
create type public.shipping_status as enum
  ('pending','processing','shipped','in_transit','out_for_delivery','delivered','exception');

create type public.payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  shipping_status public.shipping_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  stripe_session_id text,
  stripe_payment_intent_id text,
  currency text not null default 'AUD',
  display_currency text not null default 'AUD',
  total numeric(10,2) not null default 0,
  display_total numeric(10,2) not null default 0,
  carrier text,
  tracking_number text,
  customer_name text not null,
  customer_email text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text not null,
  country text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_stripe_session_id_idx on public.orders (stripe_session_id);
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select to authenticated
  using (auth.uid() = user_id or public.is_admin());
create policy "Users create own orders" on public.orders for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Admins update orders" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete orders" on public.orders for delete to authenticated
  using (public.is_admin());
create trigger orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "Users create own order items" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins manage order items" on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Order tracking timeline ----------
create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.shipping_status not null,
  note text,
  created_at timestamptz not null default now()
);
alter table public.order_status_events enable row level security;
create policy "Users view own order events" on public.order_status_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "Admins manage order events" on public.order_status_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Merchize fulfillment log ----------
create table public.order_fulfillment_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null default 'failed',
  message text,
  created_at timestamptz not null default now()
);
alter table public.order_fulfillment_log enable row level security;
create policy "Admins view fulfillment log" on public.order_fulfillment_log for select to authenticated
  using (public.is_admin());
create policy "Admins manage fulfillment log" on public.order_fulfillment_log for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Seed sample products ----------
insert into public.categories (name, slug, description) values
  ('Tees', 'tees', 'Heavyweight graphic tees'),
  ('Hoodies', 'hoodies', 'Oversized fleece hoodies'),
  ('Headwear', 'headwear', 'Caps and beanies'),
  ('Accessories', 'accessories', 'Finishing touches');

insert into public.products (name, slug, description, price, stock, category_id, is_featured) values
  ('Chrome Crown Tee', 'chrome-crown-tee', 'Heavyweight 240gsm cotton tee with a metallic chrome crown print.', 45.00, 40, (select id from public.categories where slug='tees'), true),
  ('Skyline Drip Hoodie', 'skyline-drip-hoodie', 'Oversized fleece hoodie with dripping skyline embroidery.', 110.00, 25, (select id from public.categories where slug='hoodies'), true),
  ('Purple Static Tee', 'purple-static-tee', 'Washed black tee with glitched purple static graphic.', 48.00, 30, (select id from public.categories where slug='tees'), false),
  ('Midnight Chrome Cap', 'midnight-chrome-cap', 'Structured 6-panel cap with chrome-thread EMBZ wordmark.', 38.00, 60, (select id from public.categories where slug='headwear'), true),
  ('Cyan Sweep Beanie', 'cyan-sweep-beanie', 'Ribbed cuff beanie with cyan reflective stripe.', 28.00, 45, (select id from public.categories where slug='headwear'), false),
  ('Crown Chain', 'crown-chain', 'Stainless steel chain with a polished chrome crown pendant.', 65.00, 22, (select id from public.categories where slug='accessories'), true);

-- ---------- Product Designer (design shirts/AOP products in-store) ----------
create table public.product_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  garment_type text not null default 'tee',
  blank_image_url text not null,
  print_area jsonb not null default '{"x":25,"y":20,"width":50,"height":45}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.product_templates enable row level security;
create policy "Templates are public" on public.product_templates for select using (true);
create policy "Admins manage templates" on public.product_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.products add column design_data jsonb;

insert into storage.buckets (id, name, public) values ('designs', 'designs', true)
  on conflict (id) do nothing;
create policy "Designs are publicly readable" on storage.objects for select
  using (bucket_id = 'designs');
create policy "Admins upload designs" on storage.objects for insert to authenticated
  with check (bucket_id = 'designs' and public.is_admin());
create policy "Admins update designs" on storage.objects for update to authenticated
  using (bucket_id = 'designs' and public.is_admin());
create policy "Admins delete designs" on storage.objects for delete to authenticated
  using (bucket_id = 'designs' and public.is_admin());

insert into public.product_templates (name, garment_type, blank_image_url, print_area) values
  ('Blank Tee — Front', 'tee', '', '{"x":25,"y":20,"width":50,"height":45}'::jsonb);
-- Upload your own blank garment photos in Admin -> Designer -> Manage blank
-- garment templates (this placeholder has no image yet).

-- ============================================================================
-- To make yourself admin after you sign up:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com'
--   on conflict (user_id, role) do nothing;
-- ============================================================================
