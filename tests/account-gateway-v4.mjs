import assert from 'node:assert/strict';
import {accountAPI} from '../infrastructure/site/account.mjs';
const env={ACCOUNT_GATEWAY_SECRET:'a'.repeat(64),SUPABASE_PUBLISHABLE_KEY:'public-test-placeholder'},originalFetch=globalThis.fetch;
let forwarded=null,upstream={status:200,id:'test'};
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://ekqwcwedmdpiogxskrac.supabase.co/rest/v1/rpc/veyra_account_api');forwarded=JSON.parse(options.body);return Response.json(upstream)};
const request=(body,extra={},operation='widget-publish')=>new Request('https://veyra.veyra-nexaridev.workers.dev/api/v1/'+operation,{method:'POST',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
const template={kind:'custom',style:'plain',package:{format:'veyra-widget',version:1,title:'Test',permissions:[],design:{elements:[]},html:'<button>Test</button>',js:'document.body.dataset.ok="yes"'}};
try{
 let response=await accountAPI(request({token:'b'.repeat(64),template,title:'Test'},{Authorization:'Bearer '+'c'.repeat(64)}),env,{});assert.equal(response.status,200);assert.equal(forwarded.data.token,'c'.repeat(64));assert.equal(forwarded.data.template.package.format,'veyra-widget');assert.deepEqual(forwarded.data.template.package.permissions,{network:[],storage:false});
 forwarded=null;response=await accountAPI(request({template:{...template,package:{...template.package,permissions:{network:['api.example.org'],storage:true}}}}),env,{});assert.equal(response.status,200);assert.deepEqual(forwarded.data.template.package.permissions,{network:['https://api.example.org'],storage:true});
 forwarded=null;response=await accountAPI(request({template:{...template,package:{...template.package,permissions:['cookies']}}}),env,{});assert.equal(response.status,400);assert.equal(forwarded,null);
 response=await accountAPI(request({template},{Origin:'https://other.invalid'}),env,{});assert.equal(response.status,403);
 response=await accountAPI(request({token:'b'.repeat(64),template}),env,{});assert.equal(response.status,200);assert.equal(forwarded.data.token,'','No body token authority');
 upstream={status:200,access_token:'d'.repeat(64),user:{email:'site@example.invalid'}};
 response=await accountAPI(request({email:'site@example.invalid',password:'not-a-real-password'},{'X-Veyra-Web-Session':'1'},'login'),env,{});
 assert.equal(response.status,200);assert.match(response.headers.get('Set-Cookie')||'',/__Host-veyra_session=d{64};.*HttpOnly; SameSite=Strict/);assert.equal((await response.json()).access_token,undefined,'Web login token must not be exposed to JavaScript');
 const cookie=response.headers.get('Set-Cookie').split(';')[0];
 upstream={status:200,mfa_required:true};
 response=await accountAPI(request({currentPassword:'password'},{'X-Veyra-Web-Session':'1',Cookie:cookie},'password'),env,{});assert.equal(response.status,200);assert.equal(response.headers.get('Set-Cookie'),null,'An MFA challenge must not clear the active web session');
 upstream={status:200,email:'site@example.invalid'};
 response=await accountAPI(request({}, {'X-Veyra-Web-Session':'1',Cookie:cookie},'profile'),env,{});assert.equal(response.status,200);assert.equal(forwarded.data.token,'d'.repeat(64),'HttpOnly session cookie must authenticate same-origin web requests');
 response=await accountAPI(request({}, {},'profile'),env,{});assert.equal(forwarded.data.token,'','Native API requests must not inherit web cookies');
 console.log('PASS gateway package normalization, Origin control, header token isolation, HttpOnly web sessions and cookie scope');
}finally{globalThis.fetch=originalFetch}
