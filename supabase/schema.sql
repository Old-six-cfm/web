create extension if not exists "pgcrypto";

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  date_key text not null,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  caption text default '',
  width_percent integer not null default 100 check (width_percent between 30 and 100),
  storage_path text,
  created_at timestamptz not null default now()
);

alter table public.media_items enable row level security;

drop policy if exists "media_items_public_read" on public.media_items;
create policy "media_items_public_read"
on public.media_items
for select
using (true);

drop policy if exists "media_items_public_insert" on public.media_items;
create policy "media_items_public_insert"
on public.media_items
for insert
with check (true);

drop policy if exists "media_items_public_update" on public.media_items;
create policy "media_items_public_update"
on public.media_items
for update
using (true)
with check (true);

drop policy if exists "media_items_public_delete" on public.media_items;
create policy "media_items_public_delete"
on public.media_items
for delete
using (true);
