-- ============================================================================
-- Product Designer add-on. Run this in Supabase -> SQL Editor if you already
-- ran the original supabase/schema.sql. (Brand-new setups: this is also
-- appended to the bottom of schema.sql, so running that once is enough.)
-- ============================================================================

-- Blank garment templates (front/back photos + the print-safe area on them)
create table if not exists public.product_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  garment_type text not null default 'tee',
  blank_image_url text not null,
  print_area jsonb not null default '{"x":25,"y":20,"width":50,"height":45}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.product_templates enable row level security;

drop policy if exists "Templates are public" on public.product_templates;
create policy "Templates are public" on public.product_templates for select using (true);

drop policy if exists "Admins manage templates" on public.product_templates;
create policy "Admins manage templates" on public.product_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Where a product's design (layers, garment color, template) is stored, so it
-- can be re-opened and edited later.
alter table public.products add column if not exists design_data jsonb;

-- Storage bucket for uploaded artwork + generated mockups
insert into storage.buckets (id, name, public)
  values ('designs', 'designs', true)
  on conflict (id) do nothing;

drop policy if exists "Designs are publicly readable" on storage.objects;
create policy "Designs are publicly readable" on storage.objects for select
  using (bucket_id = 'designs');

drop policy if exists "Admins upload designs" on storage.objects;
create policy "Admins upload designs" on storage.objects for insert to authenticated
  with check (bucket_id = 'designs' and public.is_admin());

drop policy if exists "Admins update designs" on storage.objects;
create policy "Admins update designs" on storage.objects for update to authenticated
  using (bucket_id = 'designs' and public.is_admin());

drop policy if exists "Admins delete designs" on storage.objects;
create policy "Admins delete designs" on storage.objects for delete to authenticated
  using (bucket_id = 'designs' and public.is_admin());

-- Two starter templates so the Designer isn't empty. Upload your own blank
-- garment photos to replace the blank_image_url via Admin -> Designer ->
-- Manage blank garment templates (delete these and add real ones, or edit
-- them directly in the table).
insert into public.product_templates (name, garment_type, blank_image_url, print_area)
select 'Blank Tee — Front', 'tee', '', '{"x":25,"y":20,"width":50,"height":45}'::jsonb
where not exists (select 1 from public.product_templates);
