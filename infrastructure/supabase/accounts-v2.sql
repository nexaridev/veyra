-- Veyra owns accounts and sessions. Supabase supplies PostgreSQL/PostgREST only.
-- No browser client has access to these tables. The server gateway requires a
-- separate 256-bit secret before any privileged work and authenticates its own
-- opaque sessions. SECURITY DEFINER is intentional at this narrow boundary.
create schema if not exists veyra_private;
revoke all on schema veyra_private from public,anon,authenticated;
create table veyra_private.config(id boolean primary key default true check(id), gateway_hash text not null);
create table veyra_private.accounts(
 id uuid primary key default gen_random_uuid(), email text unique not null,
 password_hash text not null, verified boolean not null default false,
 created_at timestamptz not null default now()
);
create table veyra_private.sessions(
 token_hash text primary key, user_id uuid not null references veyra_private.accounts(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index on veyra_private.sessions(user_id);
create table veyra_private.codes(
 email text not null, purpose text not null check(purpose in ('verify','reset')),
 code_hash text not null, attempts int not null default 0, expires_at timestamptz not null,
 issued_at timestamptz not null default now(), primary key(email,purpose)
);
create table veyra_private.rate_limits(key text primary key, started_at timestamptz not null, attempts int not null);
create table veyra_private.bookmarks(
 user_id uuid not null references veyra_private.accounts(id) on delete cascade,
 device_id uuid not null, platform text not null check(platform in ('windows','android')),
 payload jsonb not null check(octet_length(payload::text)<=2097152),
 updated_at timestamptz not null default now(), primary key(user_id,device_id)
);
alter table veyra_private.accounts enable row level security;
alter table veyra_private.sessions enable row level security;
alter table veyra_private.codes enable row level security;
alter table veyra_private.config enable row level security;
alter table veyra_private.rate_limits enable row level security;
alter table veyra_private.bookmarks enable row level security;
revoke all on all tables in schema veyra_private from public,anon,authenticated;

create function veyra_private.account_api(gateway_key text, operation text, data jsonb, client_ip text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare
 account veyra_private.accounts%rowtype; code_record veyra_private.codes%rowtype;
 email_value text; password_value text; token_value text; owner_id uuid;
 code_value text; purpose_value text; rate_key text; rate_count int; random_bytes bytea;
 result jsonb; device uuid;
begin
 if length(gateway_key)<>64 or not exists(select 1 from veyra_private.config where gateway_hash=encode(extensions.digest(gateway_key,'sha256'),'hex')) then
  return jsonb_build_object('status',403,'error','Forbidden');
 end if;
 if operation not in ('signup','verify','login','reset-request','reset','logout','logout-all','me','delete','password','sync-list','sync-put','sync-delete') then return jsonb_build_object('status',404,'error','Not found'); end if;
 if jsonb_typeof(data)<>'object' or octet_length(data::text)>2200000 or length(client_ip)>128 then return jsonb_build_object('status',400,'error','Invalid request'); end if;
 -- All rate keys are derived by the trusted Cloudflare gateway, never a client.
 rate_key:=case when operation in ('signup','reset-request') then 'mail:' else 'request:' end||client_ip;
 insert into veyra_private.rate_limits(key,started_at,attempts) values(rate_key,now(),1)
 on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,
 attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into rate_count;
 if rate_count>(case when operation in ('signup','reset-request') then 5 else 120 end) then return jsonb_build_object('status',429,'error','Слишком много запросов. Попробуй через 10 минут.');end if;
 email_value:=lower(trim(coalesce(data->>'email',''))); password_value:=coalesce(data->>'password','');
 if operation in ('signup','verify','login','reset-request','reset') then
  if length(email_value)>254 or email_value !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$' then return jsonb_build_object('status',400,'error','Проверь email.');end if;
  -- Serialize credential checks, password changes and session issuance for one account.
  perform pg_advisory_xact_lock(hashtextextended('account:'||email_value,0));
  select * into account from veyra_private.accounts where email=email_value;
 end if;
 if operation in ('signup','login','reset','password') then
  if length(password_value)<12 or octet_length(password_value)>72 then return jsonb_build_object('status',400,'error','Пароль: минимум 12 символов, максимум 72 байта UTF-8.');end if;
 end if;
 if operation in ('signup','reset-request') then
  purpose_value:=case when operation='signup' then 'verify' else 'reset' end;
  -- Apply the same cooldown to every syntactically valid email, including
  -- unknown and already-verified accounts, so retries cannot enumerate users.
  rate_key:='mailcool:'||purpose_value||':'||email_value;
  insert into veyra_private.rate_limits(key,started_at,attempts) values(rate_key,now(),1)
  on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '60 seconds' then now() else veyra_private.rate_limits.started_at end,
  attempts=case when veyra_private.rate_limits.started_at<now()-interval '60 seconds' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into rate_count;
  if rate_count>1 then return jsonb_build_object('status',429,'error','Повторный код можно запросить через минуту.');end if;
  -- Keep the free mail quota bounded for the entire deployment.
  insert into veyra_private.rate_limits(key,started_at,attempts) values('mail-daily',date_trunc('day',now()),1)
  on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<date_trunc('day',now()) then date_trunc('day',now()) else veyra_private.rate_limits.started_at end,
  attempts=case when veyra_private.rate_limits.started_at<date_trunc('day',now()) then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into rate_count;
  if rate_count>150 then return jsonb_build_object('status',429,'error','Дневной лимит писем исчерпан. Попробуй завтра.');end if;
  if operation='signup' then
   if account.verified then return jsonb_build_object('status',200,'message','Если подтверждение необходимо, код будет отправлен.');end if;
   insert into veyra_private.accounts(email,password_hash) values(email_value,extensions.crypt(password_value,extensions.gen_salt('bf',12)))
   on conflict(email) do update set password_hash=excluded.password_hash where not veyra_private.accounts.verified;
  elsif account.id is null or not account.verified then return jsonb_build_object('status',200,'message','Если аккаунт существует, код будет отправлен.');end if;
  random_bytes:=extensions.gen_random_bytes(4);
  code_value:=lpad(((get_byte(random_bytes,0)::bigint*16777216+get_byte(random_bytes,1)::bigint*65536+get_byte(random_bytes,2)*256+get_byte(random_bytes,3))%100000000)::text,8,'0');
  insert into veyra_private.codes(email,purpose,code_hash,expires_at) values(email_value,purpose_value,encode(extensions.hmac(email_value||':'||purpose_value||':'||code_value,gateway_key,'sha256'),'hex'),now()+interval '10 minutes')
  on conflict(email,purpose) do update set code_hash=excluded.code_hash,attempts=0,expires_at=excluded.expires_at,issued_at=now();
  return jsonb_build_object('status',200,'mail',jsonb_build_object('email',email_value,'code',code_value,'purpose',purpose_value),'message','Код отправлен.');
 end if;
 if operation in ('verify','reset') then
  purpose_value:=case when operation='verify' then 'verify' else 'reset' end;
  update veyra_private.codes set attempts=attempts+1 where email=email_value and purpose=purpose_value and expires_at>now() and attempts<5 returning * into code_record;
  if not found or length(coalesce(data->>'code',''))<>8 or code_record.code_hash<>encode(extensions.hmac(email_value||':'||purpose_value||':'||(data->>'code'),gateway_key,'sha256'),'hex') then return jsonb_build_object('status',400,'error','Неверный или просроченный код.');end if;
  delete from veyra_private.codes where email=email_value and purpose=purpose_value;
  if operation='verify' then update veyra_private.accounts set verified=true where email=email_value returning * into account;
  else update veyra_private.accounts set password_hash=extensions.crypt(password_value,extensions.gen_salt('bf',12)) where email=email_value returning * into account;delete from veyra_private.sessions where user_id=account.id;delete from veyra_private.codes where email=email_value;end if;
 end if;
 if operation='login' then
  rate_key:='login:'||email_value;insert into veyra_private.rate_limits(key,started_at,attempts) values(rate_key,now(),1)
  on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into rate_count;
  if rate_count>20 then return jsonb_build_object('status',429,'error','Слишком много попыток входа.');end if;
  -- Use the same bcrypt work factor for unknown accounts.
  if account.id is null then perform extensions.crypt(password_value,'$2a$12$abcdefghijklmnopqrstuu');return jsonb_build_object('status',401,'error','Неверный email или пароль.');end if;
  if account.password_hash<>extensions.crypt(password_value,account.password_hash) or not account.verified then return jsonb_build_object('status',401,'error','Неверный email или пароль.');end if;
 end if;
 if operation in ('login','verify','reset') then
  delete from veyra_private.sessions where expires_at<now();
  delete from veyra_private.sessions where token_hash in(select token_hash from veyra_private.sessions where user_id=account.id order by created_at desc offset 9);
  token_value:=encode(extensions.gen_random_bytes(32),'hex');insert into veyra_private.sessions(token_hash,user_id,expires_at) values(encode(extensions.digest(token_value,'sha256'),'hex'),account.id,now()+interval '30 days');
  return jsonb_build_object('status',200,'access_token',token_value,'user',jsonb_build_object('id',account.id,'email',account.email),'expires_in',2592000);
 end if;
 token_value:=data->>'token';if length(coalesce(token_value,''))<>64 then return jsonb_build_object('status',401,'error','Войди в аккаунт.');end if;
 select user_id into owner_id from veyra_private.sessions where token_hash=encode(extensions.digest(token_value,'sha256'),'hex') and expires_at>now();
 if owner_id is null then return jsonb_build_object('status',401,'error','Сессия завершена. Войди снова.');end if;
 -- Resolve the stable account key, lock it, then revalidate the session. A
 -- token revoked while this request waited must not authorize another action.
 select email into email_value from veyra_private.accounts where id=owner_id;
 perform pg_advisory_xact_lock(hashtextextended('account:'||email_value,0));
 select user_id into owner_id from veyra_private.sessions where token_hash=encode(extensions.digest(token_value,'sha256'),'hex') and expires_at>now();
 if owner_id is null then return jsonb_build_object('status',401,'error','Сессия завершена. Войди снова.');end if;
 if operation='me' then select jsonb_build_object('id',id,'email',email) into result from veyra_private.accounts where id=owner_id;return jsonb_build_object('status',200,'user',result);end if;
 if operation='logout' then delete from veyra_private.sessions where token_hash=encode(extensions.digest(token_value,'sha256'),'hex');return jsonb_build_object('status',200,'ok',true);end if;
 if operation='logout-all' then delete from veyra_private.sessions where user_id=owner_id;return jsonb_build_object('status',200,'ok',true);end if;
 if operation in ('delete','password') then
  select * into account from veyra_private.accounts where id=owner_id;
  if octet_length(coalesce(data->>'currentPassword',''))>72 or account.password_hash<>extensions.crypt(coalesce(data->>'currentPassword',''),account.password_hash) then return jsonb_build_object('status',401,'error','Неверный текущий пароль.');end if;
  if operation='delete' then delete from veyra_private.codes where email=account.email;delete from veyra_private.accounts where id=owner_id;
  else update veyra_private.accounts set password_hash=extensions.crypt(password_value,extensions.gen_salt('bf',12)) where id=owner_id;delete from veyra_private.sessions where user_id=owner_id;delete from veyra_private.codes where email=account.email;end if;
  return jsonb_build_object('status',200,'ok',true);
 end if;
 if operation='sync-list' then select coalesce(jsonb_agg(jsonb_build_object('device_id',device_id,'platform',platform,'payload',payload,'updated_at',updated_at) order by updated_at desc),'[]'::jsonb) into result from veyra_private.bookmarks where user_id=owner_id;return jsonb_build_object('status',200,'rows',result);end if;
 begin device:=(data->>'device_id')::uuid;exception when invalid_text_representation then return jsonb_build_object('status',400,'error','Invalid device');end;
 if device is null then return jsonb_build_object('status',400,'error','Invalid device');end if;
 if operation='sync-delete' then delete from veyra_private.bookmarks where user_id=owner_id and device_id=device;return jsonb_build_object('status',200,'ok',true);end if;
 if operation='sync-put' then
  if data->>'platform' not in ('windows','android') or jsonb_typeof(data->'payload')<>'object' or octet_length((data->'payload')::text)>2097152 then return jsonb_build_object('status',400,'error','Invalid encrypted payload');end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
  if (select count(*) from veyra_private.bookmarks where user_id=owner_id)>=10 and not exists(select 1 from veyra_private.bookmarks where user_id=owner_id and device_id=device) then return jsonb_build_object('status',409,'error','Лимит: 10 устройств.');end if;
  insert into veyra_private.bookmarks(user_id,device_id,platform,payload) values(owner_id,device,data->>'platform',data->'payload') on conflict(user_id,device_id) do update set payload=excluded.payload,platform=excluded.platform,updated_at=now();return jsonb_build_object('status',200,'ok',true);
 end if;
 return jsonb_build_object('status',404,'error','Not found');
end $$;
revoke all on function veyra_private.account_api(text,text,jsonb,text) from public,anon,authenticated;
grant usage on schema veyra_private to anon;
grant execute on function veyra_private.account_api(text,text,jsonb,text) to anon;
create function public.veyra_account_api(gateway_key text,operation text,data jsonb,client_ip text)
returns jsonb language sql security invoker set search_path=pg_catalog as $$select veyra_private.account_api(gateway_key,operation,data,client_ip)$$;
revoke all on function public.veyra_account_api(text,text,jsonb,text) from public,authenticated;
grant execute on function public.veyra_account_api(text,text,jsonb,text) to anon;
