create table public.veyra_sync (
 user_id uuid not null references auth.users(id) on delete cascade,
 device_id uuid not null,
 platform text not null check (platform in ('windows','android')),
 payload jsonb not null check (octet_length(payload::text) <= 2097152),
 updated_at timestamptz not null default now(),
 primary key(user_id,device_id)
);
alter table public.veyra_sync enable row level security;
revoke all on public.veyra_sync from anon, authenticated;
grant select,insert,update,delete on public.veyra_sync to authenticated;
create policy own_sync_select on public.veyra_sync for select to authenticated using ((select auth.uid())=user_id);
create policy own_sync_insert on public.veyra_sync for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_sync_update on public.veyra_sync for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_sync_delete on public.veyra_sync for delete to authenticated using ((select auth.uid())=user_id);
