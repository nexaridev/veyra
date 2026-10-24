begin;
do $$
declare
 key_value text:=repeat('a',64); token_value text:=repeat('b',64); owner_id uuid:=extensions.gen_random_uuid(); item uuid; r jsonb;
begin
 update veyra_private.config set gateway_hash=encode(extensions.digest(key_value,'sha256'),'hex');
 insert into veyra_private.accounts(id,email,password_hash,verified,display_name) values(owner_id,'widget-author-qa-'||owner_id||'@example.invalid',extensions.crypt('temporary-test-password',extensions.gen_salt('bf',4)),true,'Author <svg>');
 insert into veyra_private.sessions(token_hash,user_id,expires_at) values(encode(extensions.digest(token_value,'sha256'),'hex'),owner_id,now()+interval '1 day');
 r:=veyra_private.browser_api(key_value,'widget-publish',jsonb_build_object('token',token_value,'title','Author test','description','Temporary rollback fixture','public_author','profile','author_name','Impersonated','template',jsonb_build_object('kind','clock','style','plain')),'author-qa');
 assert r->>'status'='200','Publishing succeeds';item:=(r->>'id')::uuid;
 assert (select author_name='Author <svg>' from veyra_private.widgets where id=item),'Snapshot comes from own profile, not caller author';
 r:=veyra_private.browser_api(key_value,'widget-get',jsonb_build_object('id',item),'author-qa');assert r#>>'{widget,author,name}'='Author <svg>','Anonymous detail has public author';assert not (r->'widget')?'user_id' and not (r->'widget')?'email','No private identity';
 r:=veyra_private.browser_api(key_value,'widget-list','{}','author-qa');assert exists(select 1 from jsonb_array_elements(r->'widgets') w where w->>'id'=item::text and w#>>'{author,name}'='Author <svg>'),'Catalogue has author';
 r:=veyra_private.browser_api(key_value,'widget-publish',jsonb_build_object('token',token_value,'title','Legacy client test','template',jsonb_build_object('kind','clock','style','plain')),'author-qa');assert r->>'status'='200','Legacy client remains compatible';assert (select author_name='Veyra user' from veyra_private.widgets where id=(r->>'id')::uuid),'No profile name disclosure without confirmation';
 assert not has_table_privilege('anon','veyra_private.widgets','SELECT'),'No direct public table access';
end $$;
rollback;
