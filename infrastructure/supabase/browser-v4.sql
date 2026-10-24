alter table veyra_private.widgets drop constraint widgets_template_check;
alter table veyra_private.widgets add constraint widgets_template_check check(octet_length(template::text)<=220000);
create function veyra_private.valid_avatar(value text) returns boolean language plpgsql immutable set search_path=pg_catalog as $$
declare bytes bytea;w bigint;h bigint;
begin
 if value='' then return true;end if;
 if value is null or length(value)>90000 or value!~'^data:image/png;base64,[A-Za-z0-9+/]+=*$' then return false;end if;
 bytes:=decode(substr(value,23),'base64');
 if length(bytes)<33 or encode(substr(bytes,1,8),'hex')<>'89504e470d0a1a0a' or encode(substr(bytes,13,4),'hex')<>'49484452' then return false;end if;
 w:=get_byte(bytes,16)::bigint*16777216+get_byte(bytes,17)::bigint*65536+get_byte(bytes,18)*256+get_byte(bytes,19);
 h:=get_byte(bytes,20)::bigint*16777216+get_byte(bytes,21)::bigint*65536+get_byte(bytes,22)*256+get_byte(bytes,23);
 return w between 1 and 192 and h between 1 and 192;
exception when others then return false;
end $$;
revoke all on function veyra_private.valid_avatar(text) from public,anon,authenticated;
create or replace function veyra_private.browser_api(gateway_key text,operation text,data jsonb,client_ip text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare auth jsonb; owner_id uuid; current_hash text; result jsonb; item_id uuid; t jsonb; n int;
begin
 if gateway_key is null or length(gateway_key)<>64 or not exists(select 1 from veyra_private.config where gateway_hash=encode(extensions.digest(gateway_key,'sha256'),'hex')) then return jsonb_build_object('status',403,'error','Forbidden');end if;
 if data is null or jsonb_typeof(data)<>'object' or octet_length(data::text)>250000 or client_ip is null or length(client_ip)>128 then return jsonb_build_object('status',400,'error','Invalid request');end if;
 if operation in ('widget-list','widget-get') then
  insert into veyra_private.rate_limits(key,started_at,attempts) values('catalog:'||client_ip,now(),1)
  on conflict(key) do update set started_at=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then now() else veyra_private.rate_limits.started_at end,attempts=case when veyra_private.rate_limits.started_at<now()-interval '10 minutes' then 1 else veyra_private.rate_limits.attempts+1 end returning attempts into n;
  if n>120 then return jsonb_build_object('status',429,'error','Too many requests');end if;
  -- Public reading requires no account. Ownership is checked only for authenticated viewers.
  if coalesce(data->>'token','')<>'' then auth:=veyra_private.account_api(gateway_key,'me',data,client_ip);if auth->>'status'='200' then owner_id:=(auth->'user'->>'id')::uuid;end if;end if;
  if operation='widget-get' then
   begin item_id:=(data->>'id')::uuid;exception when invalid_text_representation then return jsonb_build_object('status',400,'error','Invalid id');end;
   select jsonb_build_object('id',id,'title',title,'description',description,'template',template) into result from veyra_private.widgets where id=item_id;
   if result is null then return jsonb_build_object('status',404,'error','Widget not found');end if;
   return jsonb_build_object('status',200,'widget',result);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'title',w.title,'description',w.description,'template',case when w.template->>'kind'='custom' then jsonb_build_object('kind','custom','style',w.template->>'style') else w.template end,'created_at',w.created_at,'owned',coalesce(w.user_id=owner_id,false)) order by w.created_at desc),'[]'::jsonb) into result from (select * from veyra_private.widgets order by created_at desc limit 100) w;
  return jsonb_build_object('status',200,'widgets',result);
 end if;
 auth:=veyra_private.account_api(gateway_key,'me',data,client_ip);
 if auth->>'status'<>'200' then return auth;end if;
 -- account_api keeps the account advisory lock and revalidates revocation after acquiring it.
 owner_id:=(auth->'user'->>'id')::uuid;current_hash:=encode(extensions.digest(data->>'token','sha256'),'hex');
 update veyra_private.sessions set last_seen=now() where token_hash=current_hash;
 if operation='profile-save' then
  if length(coalesce(data->>'display_name',''))>60 or length(coalesce(data->>'device_name',''))>80 or coalesce(data->>'platform','') not in ('','windows','android','macos','linux') then return jsonb_build_object('status',400,'error','Invalid profile');end if;
  if data?'avatar' and not veyra_private.valid_avatar(data->>'avatar') then return jsonb_build_object('status',400,'error','Invalid avatar');end if;
  update veyra_private.accounts set display_name=trim(coalesce(data->>'display_name','')),avatar=case when data?'avatar' then data->>'avatar' else avatar end where id=owner_id;
  update veyra_private.sessions set device_name=trim(coalesce(data->>'device_name','')),platform=coalesce(data->>'platform','') where token_hash=current_hash;
 end if;
 if operation in ('profile','profile-save') then
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'device_name',s.device_name,'platform',s.platform,'created_at',s.created_at,'last_seen',s.last_seen,'expires_at',s.expires_at,'current',s.token_hash=current_hash) order by s.last_seen desc),'[]'::jsonb) into result from veyra_private.sessions s where user_id=owner_id and expires_at>now();
  return jsonb_build_object('status',200,'display_name',(select display_name from veyra_private.accounts where id=owner_id),'avatar',(select avatar from veyra_private.accounts where id=owner_id),'devices',result);
 end if;
 if operation in ('session-revoke','widget-delete') then
  begin item_id:=(data->>'id')::uuid;exception when invalid_text_representation then return jsonb_build_object('status',400,'error','Invalid id');end;
  if item_id is null then return jsonb_build_object('status',400,'error','Invalid id');end if;
  if operation='session-revoke' then delete from veyra_private.sessions where id=item_id and user_id=owner_id;else delete from veyra_private.widgets where id=item_id and user_id=owner_id;end if;
  return jsonb_build_object('status',200,'ok',true);
 end if;
 if operation='widget-publish' then
  t:=data->'template';
  if t is null or jsonb_typeof(t)<>'object' or octet_length(t::text)>220000 or coalesce(t->>'kind','') not in ('clock','calendar','notes','focus','recent','custom') or coalesce(t->>'style','') not in ('plain','glass','accent') or exists(select 1 from jsonb_object_keys(t) k where k not in ('kind','style','wide','hour12','package')) or (t?'wide' and jsonb_typeof(t->'wide')<>'boolean') or (t?'hour12' and jsonb_typeof(t->'hour12')<>'boolean') or length(trim(coalesce(data->>'title',''))) not between 1 and 60 or length(coalesce(data->>'description',''))>240 then return jsonb_build_object('status',400,'error','Invalid widget template');end if;
  if t->>'kind'='custom' then
   if coalesce(t->'package'->>'format','')<>'veyra-widget' or coalesce(t->'package'->>'version','')<>'1' or coalesce(t->'package'->'permissions','null'::jsonb)<>'[]'::jsonb or jsonb_typeof(t->'package'->'design'->'elements') is distinct from 'array' or jsonb_array_length(t->'package'->'design'->'elements')>60 or length(coalesce(t->'package'->>'html',''))>30000 or length(coalesce(t->'package'->>'css',''))>20000 or length(coalesce(t->'package'->>'js',''))>20000 then return jsonb_build_object('status',400,'error','Invalid widget package');end if;
  elsif t?'package' then return jsonb_build_object('status',400,'error','Invalid widget package');end if;
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
 select case when operation in ('profile','profile-save','session-revoke','widget-list','widget-get','widget-publish','widget-delete') then veyra_private.browser_api(gateway_key,operation,data,client_ip)
 when operation in ('mfa-status','mfa-begin','mfa-confirm','mfa-disable','mfa-recovery') then veyra_private.security_api(gateway_key,operation,data,client_ip)
 when operation in ('mail-claim','mail-ack') then veyra_private.mail_api(gateway_key,operation,data) else veyra_private.account_api(gateway_key,operation,data,client_ip) end
$$;
revoke all on function public.veyra_account_api(text,text,jsonb,text) from public,authenticated;
grant execute on function public.veyra_account_api(text,text,jsonb,text) to anon;
