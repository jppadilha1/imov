-- Bucket privado para fotos de prospectos
insert into storage.buckets (id, name, public)
values ('prospecto-photos', 'prospecto-photos', false)
on conflict (id) do nothing;

-- Storage policies: usuário só lê/escreve em paths que começam com seu próprio uid
create policy "prospecto_photos_select_own"
  on storage.objects
  for select
  using (
    bucket_id = 'prospecto-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "prospecto_photos_insert_own"
  on storage.objects
  for insert
  with check (
    bucket_id = 'prospecto-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "prospecto_photos_update_own"
  on storage.objects
  for update
  using (
    bucket_id = 'prospecto-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "prospecto_photos_delete_own"
  on storage.objects
  for delete
  using (
    bucket_id = 'prospecto-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
