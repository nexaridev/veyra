'use strict';

const MAX_TABS=30,MAX_FIELDS=128,MAX_FORM_BYTES=24*1024;
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
function serialize(tabs,selectedId){
 const rows=tabs.filter(t=>t&&t.mode!=='temporary'&&typeof t.url==='string').slice(0,MAX_TABS).map(t=>({sessionId:t.sessionId,url:t.url,mode:t.mode,pinned:!!t.pinned,sleeping:!!t.sleeping,zoomLevel:Number.isFinite(t.zoomLevel)?Math.max(-3,Math.min(3,t.zoomLevel)):0,muted:!!t.muted}));
 const selected=tabs.find(t=>t?.id===selectedId),selectedRow=rows.find(row=>row.sessionId&&row.sessionId===selected?.sessionId);
 return {tabs:rows,selectedSessionId:selectedRow?.sessionId||null,selectedURL:selectedRow?.url||null};
}
function restore(snapshot,isWeb){
 const input=Array.isArray(snapshot?.tabs)?snapshot.tabs:[];
 const usedIds=new Set(),rows=input.filter(row=>row&&typeof row.url==='string'&&typeof isWeb==='function'&&isWeb(row.url)&&['private','google'].includes(row.mode)).slice(0,MAX_TABS).map(row=>{let sessionId=uuid(row.sessionId)&&!usedIds.has(row.sessionId)?row.sessionId:null;if(sessionId)usedIds.add(sessionId);return {sessionId,url:row.url,mode:row.mode,pinned:!!row.pinned,sleeping:row.sleeping===true,zoomLevel:Number.isFinite(row.zoomLevel)?Math.max(-3,Math.min(3,row.zoomLevel)):0,muted:!!row.muted}});
 let selectedSessionId=uuid(snapshot?.selectedSessionId)?snapshot.selectedSessionId:null;
 if(!rows.some(row=>row.sessionId===selectedSessionId))selectedSessionId=null;
 return {rows,selectedSessionId,selectedURL:typeof snapshot?.selectedURL==='string'?snapshot.selectedURL:null};
}
function normalizePageURL(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;return u.href}catch{return null}}
function normalizeForms(url,fields){
 const pageURL=normalizePageURL(url);if(!pageURL||!Array.isArray(fields))return null;
 let bytes=0;const safe=[];
 for(const field of fields.slice(0,MAX_FIELDS)){
  if(!field||!Number.isInteger(field.index)||field.index<0||field.index>=MAX_FIELDS||!['input','textarea','editable'].includes(field.kind)||typeof field.value!=='string')continue;
  const type=field.kind==='input'?String(field.type||'').toLowerCase():field.kind;
  if(field.kind==='input'&&!['text','search','email','url','tel'].includes(type))continue;
  const id=typeof field.id==='string'?field.id.slice(0,160):'',name=typeof field.name==='string'?field.name.slice(0,160):'';
  const hints=[id,name,typeof field.autocomplete==='string'?field.autocomplete.slice(0,100):'',typeof field.placeholder==='string'?field.placeholder.slice(0,100):''].join(' ');
  if(/(?:password|passcode|otp|one[-_ ]?time(?:[-_ ]?code)?|auth(?:entication)?[-_ ]?code|token|secret|cc[-_ ]?(?:number|name|exp|csc|type)|credit.?card|card[-_ ]?(?:number|holder|exp(?:iration)?|cvc|cvv)|cvv|cvc|csc|security.?code|payment|billing|iban|swift|routing|\bpin\b)/i.test(hints))continue;
  const value=field.value.slice(0,4096);bytes+=Buffer.byteLength(value,'utf8');if(bytes>MAX_FORM_BYTES)break;
  safe.push({index:field.index,kind:field.kind,type,id,name,value});
 }
 return safe.length?{url:pageURL,fields:safe}:null;
}
module.exports={serialize,restore,normalizeForms,normalizePageURL,MAX_TABS,MAX_FIELDS,MAX_FORM_BYTES};
