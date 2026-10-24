-- Veyra 0.7.0: owner-bound device controls and declarative community widgets.
alter table veyra_private.sessions add column id uuid not null default gen_random_uuid();
alter table veyra_private.sessions add constraint sessions_public_id_unique unique(id);
alter table veyra_private.sessions add column device_name text not null default '';
alter table veyra_private.sessions add column platform text not null default '';
alter table veyra_private.sessions add column last_seen timestamptz not null default now();
alter table veyra_private.accounts add column display_name text not null default '';
create table veyra_private.widgets(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references veyra_private.accounts(id) on delete cascade,
 title text not null check(length(title) between 1 and 60),
 description text not null default '' check(length(description)<=240),
 template jsonb not null check(octet_length(template::text)<1000),
 created_at timestamptz not null default now()
);
create index widgets_owner on veyra_private.widgets(user_id);
alter table veyra_private.widgets enable row level security;
revoke all on veyra_private.widgets from public,anon,authenticated;
create or replace function veyra_private.browser_api(gateway_key text,operation text,data jsonb,client_ip text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare auth jsonb; owner_id uuid; current_hash text; result jsonb; item_id uuid; t jsonb; n int;
begin
 if gateway_key is null or length(gateway_key)<>64 or not exists(select 1 from veyra_private.config where gateway_hash=encode(extensions.digest(gateway_key,'sha256'),'hex')) then return jsonb_build_object('status',403,'error','Forbidden');end if;
 if data is null or jsonb_typeof(data)<>'object' or octet_length(data::text)>10000 or client_ip is null or length(client_ip)>128 then return jsonb_build_object('status',400,'error','Invalid request');end if;
 if operation='widget-list' then
  insert into veyra_private.rate_limits(key,started_at,attempts) values('catalog:'||client_ip,now(),1)
  on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into n;
  if n>120 then return jsonb_build_object('status',429,'error','Too many requests');end if;
  -- Public reading requires no account. Ownership is checked only for authenticated viewers.
  if coalesce(data->>'token','')<>'' then auth:=veyra_private.account_api(gateway_key,'me',data,client_ip);if auth->>'status'='200' then owner_id:=(auth->'user'->>'id')::uuid;end if;end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'title',w.title,'description',w.description,'template',w.template,'created_at',w.created_at,'owned',coalesce(w.user_id=owner_id,false)) order by w.created_at desc),'[]'::jsonb) into result from (select * from veyra_private.widgets order by created_at desc limit 200) w;
  return jsonb_build_object('status',200,'widgets',result);
 end if;
 auth:=veyra_private.account_api(gateway_key,'me',data,client_ip);
 if auth->>'status'<>'200' then return auth;end if;
 -- account_api keeps the account advisory lock and revalidates revocation after acquiring it.
 owner_id:=(auth->'user'->>'id')::uuid;current_hash:=encode(extensions.digest(data->>'token','sha256'),'hex');
 update veyra_private.sessions set last_seen=now() where token_hash=current_hash;
 if operation='profile-save' then
  if length(coalesce(data->>'display_name',''))>60 or length(coalesce(data->>'device_name',''))>80 or coalesce(data->>'platform','') not in ('','windows','android','macos','linux') then return jsonb_build_object('status',400,'error','Invalid profile');end if;
  update veyra_private.accounts set display_name=trim(coalesce(data->>'display_name','')) where id=owner_id;
  update veyra_private.sessions set device_name=trim(coalesce(data->>'device_name','')),platform=coalesce(data->>'platform','') where token_hash=current_hash;
 end if;
 if operation in ('profile','profile-save') then
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'device_name',s.device_name,'platform',s.platform,'created_at',s.created_at,'last_seen',s.last_seen,'expires_at',s.expires_at,'current',s.token_hash=current_hash) order by s.last_seen desc),'[]'::jsonb) into result from veyra_private.sessions s where user_id=owner_id and expires_at>now();
  return jsonb_build_object('status',200,'display_name',(select display_name from veyra_private.accounts where id=owner_id),'devices',result);
 end if;
 if operation in ('session-revoke','widget-delete') then
  begin item_id:=(data->>'id')::uuid;exception when invalid_text_representation then return jsonb_build_object('status',400,'error','Invalid id');end;
  if item_id is null then return jsonb_build_object('status',400,'error','Invalid id');end if;
  if operation='session-revoke' then delete from veyra_private.sessions where id=item_id and user_id=owner_id;else delete from veyra_private.widgets where id=item_id and user_id=owner_id;end if;
  return jsonb_build_object('status',200,'ok',true);
 end if;
 if operation='widget-publish' then
  t:=data->'template';
  if t is null or jsonb_typeof(t)<>'object' or octet_length(t::text)>1000 or coalesce(t->>'kind','') not in ('clock','calendar','notes','focus','recent') or coalesce(t->>'style','') not in ('plain','glass','accent') or exists(select 1 from jsonb_object_keys(t) k where k not in ('kind','style','wide','hour12')) or (t?'wide' and jsonb_typeof(t->'wide')<>'boolean') or (t?'hour12' and jsonb_typeof(t->'hour12')<>'boolean') or length(trim(coalesce(data->>'title',''))) not between 1 and 60 or length(coalesce(data->>'description',''))>240 then return jsonb_build_object('status',400,'error','Invalid widget template');end if;
  if (select count(*) from veyra_private.widgets where user_id=owner_id)>=20 then return jsonb_build_object('status',409,'error','Maximum 20 publications');end if;
  insert into veyra_private.widgets(user_id,title,description,template) values(owner_id,trim(data->>'title'),coalesce(data->>'description',''),t) returning id into item_id;
  return jsonb_build_object('status',200,'id',item_id);
 end if;
 return jsonb_build_object('status',404,'error','Not found');
end $$;
revoke all on function veyra_private.browser_api(text,text,jsonb,text) from public,authenticated;
grant execute on function veyra_private.browser_api(text,text,jsonb,text) to anon;
create or replace function public.veyra_account_api(gateway_key text,operation text,data jsonb,client_ip text)
returns jsonb language sql security invoker set search_path=pg_catalog as $$
 select case when operation in ('profile','profile-save','session-revoke','widget-list','widget-publish','widget-delete') then veyra_private.browser_api(gateway_key,operation,data,client_ip) else veyra_private.account_api(gateway_key,operation,data,client_ip) end
$$;
revoke all on function public.veyra_account_api(text,text,jsonb,text) from public,authenticated;
grant execute on function public.veyra_account_api(text,text,jsonb,text) to anon;
