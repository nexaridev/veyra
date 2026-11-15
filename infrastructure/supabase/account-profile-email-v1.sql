DO $migration$
DECLARE fn text;
BEGIN
  SELECT pg_get_functiondef('veyra_private.browser_api(text,text,jsonb,text)'::regprocedure) INTO fn;
  IF position('''email'',(select email from veyra_private.accounts where id=owner_id)' in fn)=0 THEN
    fn := replace(fn,
      'return jsonb_build_object(''status'',200,''display_name''',
      'return jsonb_build_object(''status'',200,''email'',(select email from veyra_private.accounts where id=owner_id),''display_name''');
  END IF;
  EXECUTE fn;
END
$migration$;
