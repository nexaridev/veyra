import assert from 'node:assert/strict';
import {accountAPI,drainMail} from '../infrastructure/site/account.mjs';
const originalFetch=globalThis.fetch;
const env={ACCOUNT_GATEWAY_SECRET:'a'.repeat(64),SUPABASE_PUBLISHABLE_KEY:'test-public-key',BREVO_API_KEY:'test-mail-key'};
const item={id:'00000000-0000-4000-8000-000000000001',claim:'00000000-0000-4000-8000-000000000002',mail:{email:'test@example.invalid',code:'00000000',purpose:'verify'}};
let ack=0,delivery=503,background=[];
try{
 globalThis.fetch=async(url,options)=>{if(String(url).includes('api.brevo.com'))return new Response('{}',{status:delivery});const body=JSON.parse(options.body);if(body.operation==='mail-claim')return Response.json({status:200,messages:[item]});if(body.operation==='mail-ack'){ack++;assert.deepEqual(body.data,{id:item.id,claim:item.claim});return Response.json({status:200,ok:true})}return Response.json({status:200,message:'Generic account response'})};
 await drainMail(env);assert.equal(ack,0,'Failed delivery must remain in the durable queue');delivery=201;await drainMail(env);assert.equal(ack,1,'Only a successful delivery is acknowledged');
 const response=await accountAPI(new Request('https://veyra.veyra-nexaridev.workers.dev/api/v1/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.invalid',password:'example-only-password'})}),env,{waitUntil:p=>background.push(p)});
 assert.equal(response.status,200);const body=await response.json();assert.equal(body.confirmation,true);assert(!JSON.stringify(body).includes(item.mail.code));await Promise.all(background);
 const refused=await accountAPI(new Request('https://veyra.veyra-nexaridev.workers.dev/api/v1/mail-claim',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),env,{waitUntil(){}});assert.equal(refused.status,404);
 console.log('PASS durable mail retry after provider failure, exact lease ACK, generic public response and inaccessible internal queue route');
}finally{globalThis.fetch=originalFetch}
