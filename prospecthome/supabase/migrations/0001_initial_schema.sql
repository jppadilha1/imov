-- Tabela prospectos: registros de imóveis capturados pelos corretores
create table public.prospectos (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_url text not null,
  lat real not null,
  lng real not null,
  notes text,
  status text not null check (status in ('novo', 'contatado', 'negociando', 'fechado')),
  address_endereco text,
  address_bairro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger function para manter updated_at sincronizado em UPDATEs
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prospectos_set_updated_at
  before update on public.prospectos
  for each row
  execute function public.handle_updated_at();

-- Índice composto para acelerar pullUpdates(user_id, lastSyncDate)
create index prospectos_user_updated_idx
  on public.prospectos (user_id, updated_at desc);

-- Row Level Security: cada usuário só vê e modifica seus próprios prospectos
alter table public.prospectos enable row level security;

create policy "prospectos_select_own"
  on public.prospectos
  for select
  using (auth.uid() = user_id);

create policy "prospectos_insert_own"
  on public.prospectos
  for insert
  with check (auth.uid() = user_id);

create policy "prospectos_update_own"
  on public.prospectos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "prospectos_delete_own"
  on public.prospectos
  for delete
  using (auth.uid() = user_id);
