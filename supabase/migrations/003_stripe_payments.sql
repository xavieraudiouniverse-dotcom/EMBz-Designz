-- ============================================================================
-- Stripe payments: adds payment tracking columns to orders.
-- Run this once in Supabase's SQL Editor if your project already existed before
-- this feature shipped. Brand-new setups get this automatically via schema.sql.
-- ============================================================================

do $$ begin
  create type public.payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

alter table public.orders add column if not exists payment_status public.payment_status not null default 'unpaid';
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent_id text;

create index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);

-- The webhook writes with the service role key (bypasses RLS) so no policy change is
-- needed for it, but make sure admins can see the new columns in their existing "all"
-- policy on orders (they already can — this is just a column addition, not a new table).
