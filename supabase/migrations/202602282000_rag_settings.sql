create table if not exists public.rag_settings (
  id boolean primary key default true check (id = true),
  search_level text not null default 'medio' check (search_level in ('baixo', 'medio', 'alto')),
  use_legacy_fallback boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.rag_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.rag_settings enable row level security;

create policy "rag_settings_select_authenticated" on public.rag_settings
for select using (auth.uid() is not null);

create policy "rag_settings_admin_write" on public.rag_settings
for all using (public.is_admin()) with check (public.is_admin());
