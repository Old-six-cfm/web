-- Enable public read/write for bucket: media-files
-- Run in Supabase SQL Editor

insert into storage.buckets (id, name, public)
values ('media-files', 'media-files', true)
on conflict (id) do update set public = true;

-- Read objects in this bucket
drop policy if exists "media_files_public_read" on storage.objects;
create policy "media_files_public_read"
on storage.objects
for select
using (bucket_id = 'media-files');

-- Upload objects to this bucket
drop policy if exists "media_files_public_insert" on storage.objects;
create policy "media_files_public_insert"
on storage.objects
for insert
with check (bucket_id = 'media-files');

-- Update objects in this bucket
drop policy if exists "media_files_public_update" on storage.objects;
create policy "media_files_public_update"
on storage.objects
for update
using (bucket_id = 'media-files')
with check (bucket_id = 'media-files');

-- Delete objects in this bucket
drop policy if exists "media_files_public_delete" on storage.objects;
create policy "media_files_public_delete"
on storage.objects
for delete
using (bucket_id = 'media-files');
