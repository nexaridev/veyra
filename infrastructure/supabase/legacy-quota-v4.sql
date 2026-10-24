-- Retain existing legacy backups and reads while bounding future allocations.
create function veyra_private.legacy_sync_quota() returns trigger
language plpgsql security definer set search_path=pg_catalog as $$
begin
 if tg_op='UPDATE' and new.user_id is distinct from old.user_id then raise exception 'Backup owner cannot change';end if;
 perform pg_advisory_xact_lock(hashtextextended('legacy-sync:'||new.user_id::text,0));
 if not exists(select 1 from public.veyra_sync where user_id=new.user_id and device_id=new.device_id) and (select count(*) from public.veyra_sync where user_id=new.user_id)>=10 then raise exception 'Maximum 10 backup devices';end if;
 return new;
end $$;
revoke all on function veyra_private.legacy_sync_quota() from public,anon,authenticated;
create trigger legacy_sync_quota before insert or update on public.veyra_sync for each row execute function veyra_private.legacy_sync_quota();
