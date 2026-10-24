-- Custom Veyra accounts. No dependency on Supabase Auth.
alter table veyra_private.accounts add column avatar text not null default '' check(octet_length(avatar)<=90000);
create table veyra_private.mfa(
 user_id uuid primary key references veyra_private.accounts(id) on delete cascade,
 secret bytea, enabled_at timestamptz, last_step bigint not null default -1,
 pending bytea, pending_until timestamptz,
 recovery_hashes text[] not null default '{}'
);
alter table veyra_private.mfa enable row level security;
revoke all on veyra_private.mfa from public,anon,authenticated;

create function veyra_private.base32(value bytea) returns text language plpgsql immutable strict set search_path=pg_catalog as $$
declare alphabet text:='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; bits int:=0; buffer int:=0; result text:=''; i int;
begin
 for i in 0..length(value)-1 loop
  buffer:=(buffer<<8)|get_byte(value,i);bits:=bits+8;
  while bits>=5 loop bits:=bits-5;result:=result||substr(alphabet,((buffer>>bits)&31)+1,1);end loop;
  buffer:=buffer&((1<<bits)-1);
 end loop;
 if bits>0 then result:=result||substr(alphabet,((buffer<<(5-bits))&31)+1,1);end if;
 return result;
end $$;
create function veyra_private.totp(value bytea,step bigint) returns text language plpgsql immutable strict set search_path=pg_catalog as $$
declare hash bytea;offset_value int;number_value bigint;
begin
 hash:=extensions.hmac(int8send(step),value,'sha1');offset_value:=get_byte(hash,19)&15;
 number_value:=(get_byte(hash,offset_value)&127)::bigint*16777216+get_byte(hash,offset_value+1)::bigint*65536+get_byte(hash,offset_value+2)*256+get_byte(hash,offset_value+3);
 return lpad((number_value%1000000)::text,6,'0');
end $$;
revoke all on function veyra_private.base32(bytea),veyra_private.totp(bytea,bigint) from public,anon,authenticated;

-- Caller must hold the existing per-account advisory lock. A code is consumed
-- atomically with the action, including recovery codes and the TOTP time step.
create function veyra_private.mfa_check(gateway_key text,owner_id uuid,code text,enrollment boolean default false) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare factor veyra_private.mfa%rowtype;secret_value bytea;current_step bigint:=floor(extract(epoch from clock_timestamp())/30);step bigint;attempt_count int;code_hash text;
begin
 select * into factor from veyra_private.mfa where user_id=owner_id for update;
 if not enrollment and factor.enabled_at is null then return jsonb_build_object('status',200);end if;
 if coalesce(code,'')='' then return jsonb_build_object('status',200,'mfa_required',true);end if;
 insert into veyra_private.rate_limits(key,started_at,attempts) values('mfa:'||owner_id::text,now(),1)
 on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into attempt_count;
 if attempt_count>10 then return jsonb_build_object('status',429,'error','mfa_rate_limited');end if;
 if enrollment then
  if factor.pending is null or factor.pending_until<now() then return jsonb_build_object('status',400,'error','mfa_enrollment_expired');end if;
  secret_value:=extensions.pgp_sym_decrypt_bytea(factor.pending,gateway_key||':totp:v1');
 else
  code_hash:=encode(extensions.hmac(owner_id::text||':'||upper(replace(code,'-','')),gateway_key||':recovery:v1','sha256'),'hex');
  if code_hash=any(factor.recovery_hashes) then
   update veyra_private.mfa set recovery_hashes=array_remove(recovery_hashes,code_hash) where user_id=owner_id;
   return jsonb_build_object('status',200,'recovery_used',true);
  end if;
  secret_value:=extensions.pgp_sym_decrypt_bytea(factor.secret,gateway_key||':totp:v1');
 end if;
 if code~'^[0-9]{6}$' then
  for step in current_step-1..current_step+1 loop
   if step>factor.last_step and veyra_private.totp(secret_value,step)=code then
    update veyra_private.mfa set last_step=step where user_id=owner_id;
    return jsonb_build_object('status',200);
   end if;
  end loop;
 end if;
 return jsonb_build_object('status',400,'error','mfa_invalid_code');
end $$;
revoke all on function veyra_private.mfa_check(text,uuid,text,boolean) from public,anon,authenticated;

create function veyra_private.security_api(gateway_key text,operation text,data jsonb,client_ip text) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare auth jsonb;owner_id uuid;account veyra_private.accounts%rowtype;factor veyra_private.mfa%rowtype;check_result jsonb;secret_value bytea;plain_codes text[]:='{}';hashes text[]:='{}';code text;i int;
begin
 if gateway_key is null or length(gateway_key)<>64 or not exists(select 1 from veyra_private.config where gateway_hash=encode(extensions.digest(gateway_key,'sha256'),'hex')) then return jsonb_build_object('status',403,'error','Forbidden');end if;
 if operation not in ('mfa-status','mfa-begin','mfa-confirm','mfa-disable','mfa-recovery') or data is null or jsonb_typeof(data)<>'object' or octet_length(data::text)>5000 then return jsonb_build_object('status',400,'error','Invalid request');end if;
 auth:=veyra_private.account_api(gateway_key,'me',data,client_ip);if auth->>'status'<>'200' then return auth;end if;
 owner_id:=(auth->'user'->>'id')::uuid;
 select * into factor from veyra_private.mfa where user_id=owner_id;
 if operation='mfa-status' then return jsonb_build_object('status',200,'enabled',factor.enabled_at is not null,'enabled_at',factor.enabled_at,'recovery_remaining',coalesce(cardinality(factor.recovery_hashes),0));end if;
 -- Also throttle password guessing on a stolen authenticated session.
 insert into veyra_private.rate_limits(key,started_at,attempts) values('mfa-manage:'||owner_id::text,now(),1)
 on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into i;
 if i>20 then return jsonb_build_object('status',429,'error','mfa_rate_limited');end if;
 select * into account from veyra_private.accounts where id=owner_id;
 if octet_length(coalesce(data->>'currentPassword',''))>72 or account.password_hash<>extensions.crypt(coalesce(data->>'currentPassword',''),account.password_hash) then return jsonb_build_object('status',403,'error','Неверный текущий пароль.');end if;
 if operation='mfa-begin' then
  if factor.enabled_at is not null then return jsonb_build_object('status',409,'error','mfa_already_enabled');end if;
  secret_value:=extensions.gen_random_bytes(20);
  insert into veyra_private.mfa(user_id,pending,pending_until) values(owner_id,extensions.pgp_sym_encrypt_bytea(secret_value,gateway_key||':totp:v1','cipher-algo=aes256'),now()+interval '10 minutes')
  on conflict(user_id) do update set pending=excluded.pending,pending_until=excluded.pending_until,last_step=-1;
  return jsonb_build_object('status',200,'secret',veyra_private.base32(secret_value),'email',account.email);
 end if;
 if operation='mfa-confirm' then
  if factor.enabled_at is not null then return jsonb_build_object('status',409,'error','mfa_already_enabled');end if;
  if coalesce(data->>'mfa_code','')='' then return jsonb_build_object('status',400,'error','mfa_invalid_code');end if;
  check_result:=veyra_private.mfa_check(gateway_key,owner_id,data->>'mfa_code',true);
 else
  if factor.enabled_at is null then return jsonb_build_object('status',409,'error','mfa_not_enabled');end if;
  check_result:=veyra_private.mfa_check(gateway_key,owner_id,data->>'mfa_code');
 end if;
 if check_result->>'status'<>'200' or check_result->>'mfa_required'='true' then return case when check_result->>'mfa_required'='true' then jsonb_build_object('status',400,'error','mfa_invalid_code') else check_result end;end if;
 if operation='mfa-disable' then
  delete from veyra_private.mfa where user_id=owner_id;
 else
  for i in 1..10 loop
   code:=upper(encode(extensions.gen_random_bytes(10),'hex'));
   hashes:=array_append(hashes,encode(extensions.hmac(owner_id::text||':'||code,gateway_key||':recovery:v1','sha256'),'hex'));
   plain_codes:=array_append(plain_codes,substr(code,1,5)||'-'||substr(code,6,5)||'-'||substr(code,11,5)||'-'||substr(code,16,5));
  end loop;
  update veyra_private.mfa set secret=case when operation='mfa-confirm' then pending else secret end,enabled_at=coalesce(enabled_at,now()),pending=null,pending_until=null,recovery_hashes=hashes where user_id=owner_id;
 end if;
 -- Existing sessions on other devices predate the second factor and are revoked.
 delete from veyra_private.sessions where user_id=owner_id and token_hash<>encode(extensions.digest(data->>'token','sha256'),'hex');
 return jsonb_build_object('status',200,'ok',true,'recovery_codes',plain_codes);
end $$;
revoke all on function veyra_private.security_api(text,text,jsonb,text) from public,authenticated;
grant execute on function veyra_private.security_api(text,text,jsonb,text) to anon;
