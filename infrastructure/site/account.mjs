import './widget-package.mjs';
const ORIGIN='https://veyra.veyra-nexaridev.workers.dev';
const operations=new Set(['signup','verify','login','reset-request','reset','logout','logout-all','me','delete','password','sync-list','sync-put','sync-delete','profile','profile-save','session-revoke','widget-list','widget-get','widget-publish','widget-delete','mfa-status','mfa-begin','mfa-confirm','mfa-disable','mfa-recovery']);
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
async function readBody(request){
 if(!request.body)return {};let size=0;const chunks=[],reader=request.body.getReader();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2200000)throw Error('Too large');chunks.push(value)}}finally{await reader.cancel()}
 const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length}const data=JSON.parse(new TextDecoder().decode(buffer));if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Invalid body');return data;
}
export async function accountAPI(request,env,ctx){
 const url=new URL(request.url),operation=url.pathname.slice('/api/v1/'.length);
 if(request.method!=='POST'||!operations.has(operation))return reply({error:'Not found'},404);
 const origin=request.headers.get('Origin');if(origin&&origin!==ORIGIN)return reply({error:'Forbidden origin'},403);
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return reply({error:'Use application/json'},415);
 if(!env.ACCOUNT_GATEWAY_SECRET||!env.SUPABASE_PUBLISHABLE_KEY)return reply({error:'Account service unavailable'},503);
 if(['signup','reset-request'].includes(operation)&&!env.BREVO_API_KEY)return reply({error:'Отправка писем ещё не настроена.'},503);
 let body;try{body=await readBody(request)}catch{return reply({error:'Некорректный или слишком большой запрос.'},400)}
 if(operation==='widget-publish'&&body.template?.kind==='custom')try{body.template={kind:'custom',style:'plain',package:globalThis.VeyraWidgetPackage.normalize(body.template.package)}}catch{return reply({error:'Invalid widget package'},400)}
 const authorization=request.headers.get('Authorization')||'';const token=/^Bearer ([a-f0-9]{64})$/.exec(authorization)?.[1]||'';
 const data={...body,token};
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const ipHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.ACCOUNT_GATEWAY_SECRET+':'+ip)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 try{
  const response=await fetch('https://ekqwcwedmdpiogxskrac.supabase.co/rest/v1/rpc/veyra_account_api',{method:'POST',headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({gateway_key:env.ACCOUNT_GATEWAY_SECRET,operation,data,client_ip:ipHash}),signal:AbortSignal.timeout(20000),redirect:'manual'});
  if(!response.ok)return reply({error:'Сервис временно недоступен.'},503);
  const result=await response.json();const status=Number(result.status)||500;
  if(status>=400){delete result.status;delete result.mail;return reply(result,status)}
  delete result.mail;
  if(['signup','reset-request'].includes(operation))ctx.waitUntil(drainMail(env).catch(()=>console.error('mail_outbox_delivery_failed')));
  delete result.status;
  if(['signup','reset-request'].includes(operation))return reply({confirmation:true,message:'Если действие доступно для этого адреса, код отправлен. Проверь почту и папку «Спам».'},status);
  return reply(result,status);
 }catch{return reply({error:'Сервис временно недоступен. Попробуй ещё раз.'},503)}
}

async function mailRPC(env,operation,data={}){
 const response=await fetch('https://ekqwcwedmdpiogxskrac.supabase.co/rest/v1/rpc/veyra_account_api',{method:'POST',headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({gateway_key:env.ACCOUNT_GATEWAY_SECRET,operation,data,client_ip:'scheduled-mail'}),signal:AbortSignal.timeout(10000),redirect:'manual'});
 if(!response.ok)throw Error('Mail queue unavailable');const result=await response.json();if(result.status!==200)throw Error('Mail queue unavailable');return result;
}
export async function drainMail(env){
 if(!env.BREVO_API_KEY)return;
 const result=await mailRPC(env,'mail-claim');
 await Promise.allSettled((result.messages||[]).map(async item=>{
  const mail=item.mail,purpose=mail.purpose==='reset'?'восстановления пароля':'подтверждения email';
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:'Veyra',email:'mihasiky84@gmail.com'},to:[{email:mail.email}],subject:'Veyra — код '+purpose,textContent:'Код '+purpose+' Veyra: '+mail.code+'\n\nДействует 10 минут. Никому не сообщай этот код. Если ты не запрашивал его, проигнорируй письмо.'}),signal:AbortSignal.timeout(12000),redirect:'manual'});
  if(response.ok)await mailRPC(env,'mail-ack',{id:item.id,claim:item.claim});else console.error('mail_delivery_retry',response.status);
 }));
}
