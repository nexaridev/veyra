import assert from 'node:assert/strict';
import {accountAPI} from '../infrastructure/site/account.mjs';
const env={ACCOUNT_GATEWAY_SECRET:'a'.repeat(64),SUPABASE_PUBLISHABLE_KEY:'public-test-placeholder'},originalFetch=globalThis.fetch;
let forwarded=null;
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://ekqwcwedmdpiogxskrac.supabase.co/rest/v1/rpc/veyra_account_api');forwarded=JSON.parse(options.body);return Response.json({status:200,id:'test'})};
const request=(body,extra={})=>new Request('https://veyra.veyra-nexaridev.workers.dev/api/v1/widget-publish',{method:'POST',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
const template={kind:'custom',style:'plain',package:{format:'veyra-widget',version:1,title:'Test',permissions:[],design:{elements:[]},html:'<button>Test</button>',js:'document.body.dataset.ok="yes"'}};
try{
 let response=await accountAPI(request({token:'b'.repeat(64),template,title:'Test'},{Authorization:'Bearer '+'c'.repeat(64)}),env,{});assert.equal(response.status,200);assert.equal(forwarded.data.token,'c'.repeat(64));assert.equal(forwarded.data.template.package.format,'veyra-widget');assert.deepEqual(forwarded.data.template.package.permissions,{network:[],storage:false});
 forwarded=null;response=await accountAPI(request({template:{...template,package:{...template.package,permissions:{network:['api.example.org'],storage:true}}}}),env,{});assert.equal(response.status,200);assert.deepEqual(forwarded.data.template.package.permissions,{network:['https://api.example.org'],storage:true});
 forwarded=null;response=await accountAPI(request({template:{...template,package:{...template.package,permissions:['cookies']}}}),env,{});assert.equal(response.status,400);assert.equal(forwarded,null);
 response=await accountAPI(request({template},{Origin:'https://other.invalid'}),env,{});assert.equal(response.status,403);
 response=await accountAPI(request({token:'b'.repeat(64),template}),env,{});assert.equal(response.status,200);assert.equal(forwarded.data.token,'','No body token authority');
 console.log('PASS offline gateway package normalization, permission rejection, Origin control and header-only token authority');
}finally{globalThis.fetch=originalFetch}
