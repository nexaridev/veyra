'use strict';
const {protocol,session}=require('electron');
const {randomUUID,createHash}=require('node:crypto');
const packages=require('./widget-package.js');
protocol.registerSchemesAsPrivileged([
 {scheme:'veyra-widget',privileges:{standard:true,secure:true}},
 {scheme:'veyra-widget-host',privileges:{standard:true,secure:true}}
]);
const documents=new Map(),sessions=new Map(),sessionRecords=new WeakMap(),PREVIEW='veyra-widget-runtime';
const hash=value=>createHash('sha256').update(value).digest('hex').slice(0,40);
const policy=(permissions,storage)=>`default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src ${permissions.network.length?permissions.network.join(' '):"'none'"}; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';${storage?'':' manifest-src \'none\';'}`;
const permissionsPolicy="camera=(), microphone=(), geolocation=(), clipboard-read=(), clipboard-write=(), display-capture=(), fullscreen=(), payment=(), usb=(), serial=(), speaker-selection=()";
function tokenFor(url){try{return new URL(url).pathname.split('/').filter(Boolean).at(-1)||''}catch{return ''}}
function validFrame(url,entry,kind){try{const u=new URL(url);return u.protocol===(kind==='host'?'veyra-widget-host:':'veyra-widget:')&&u.hostname===entry.originId&&tokenFor(url)===entry.token&&(kind==='host'?u.pathname==='/'+entry.token:u.pathname==='/'+entry.token+'/')}catch{return false}}
function createSession(partition,options){
 let record=sessions.get(partition);if(record){record.network=new Set(options.network);record.storage=options.storage;record.preview=options.preview;return record}
 const ses=session.fromPartition(partition,{cache:false});record=sessionRecords.get(ses);
 if(record){record.network=new Set(options.network);record.storage=options.storage;record.preview=options.preview;sessions.set(partition,record);return record}
 record={ses,network:new Set(options.network),storage:options.storage,partition,preview:options.preview,guests:new Set()};sessionRecords.set(ses,record);sessions.set(partition,record);
 ses.setPermissionCheckHandler(()=>false);ses.setPermissionRequestHandler((wc,p,cb)=>cb(false));ses.setDevicePermissionHandler?.(()=>false);ses.on('will-download',event=>event.preventDefault());
 ses.webRequest.onBeforeRequest((details,callback)=>{
  let u;try{u=new URL(details.url)}catch{return callback({cancel:true})}
  const token=tokenFor(details.url),entry=documents.get(token);
  if(entry&&entry.partition===partition&&(validFrame(details.url,entry,'host')||validFrame(details.url,entry,'widget')))return callback({cancel:false});
  const allowed=u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&details.resourceType==='xhr'&&record.network.has(u.origin);
  callback({cancel:!allowed});
 });
 ses.webRequest.onBeforeSendHeaders((details,callback)=>{const requestHeaders={...details.requestHeaders};for(const key of Object.keys(requestHeaders))if(['cookie','cookie2','proxy-authorization'].includes(key.toLowerCase()))delete requestHeaders[key];callback({requestHeaders})});
 ses.webRequest.onHeadersReceived((details,callback)=>{const responseHeaders={...details.responseHeaders};for(const key of Object.keys(responseHeaders))if(/^set-cookie2?$/i.test(key))delete responseHeaders[key];callback({responseHeaders})});
 ses.protocol.handle('veyra-widget-host',request=>{
  const token=tokenFor(request.url),entry=documents.get(token);if(request.method!=='GET'||!entry||entry.partition!==partition||!validFrame(request.url,entry,'host'))return new Response('',{status:404});
  const sandbox=entry.permissions.storage?'allow-scripts allow-same-origin':'allow-scripts';
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';frame-src veyra-widget:;object-src 'none';base-uri 'none';form-action 'none'"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe sandbox="${sandbox}" referrerpolicy="no-referrer" src="veyra-widget://${entry.originId}/${entry.token}/"></iframe></body></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none';style-src 'unsafe-inline';frame-src veyra-widget:;object-src 'none';base-uri 'none';form-action 'none'",'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Permissions-Policy':permissionsPolicy}});
 });
 ses.protocol.handle('veyra-widget',request=>{
  const token=tokenFor(request.url),entry=documents.get(token);if(request.method!=='GET'||!entry||entry.partition!==partition||!validFrame(request.url,entry,'widget'))return new Response('',{status:404});
  return new Response(entry.html,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':entry.csp,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Permissions-Policy':permissionsPolicy}});
 });
 return record;
}
async function register(){
 const record=createSession(PREVIEW,{network:[],storage:false,preview:true});
 await record.ses.setProxy({mode:'fixed_servers',proxyRules:'socks5://127.0.0.1:9',proxyBypassRules:'<-loopback>'});
}
function attach(host){
 host.on('will-attach-webview',(event,preferences,params)=>{
  const record=sessions.get(params.partition),token=tokenFor(params.src),entry=documents.get(token);
  if(!record||!entry||entry.partition!==params.partition||!validFrame(params.src,entry,'host')){event.preventDefault();return}
  delete preferences.preload;Object.assign(preferences,{partition:params.partition,nodeIntegration:false,nodeIntegrationInSubFrames:false,nodeIntegrationInWorker:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,plugins:false,spellcheck:false,disableDialogs:true});
 });
 host.on('did-attach-webview',(event,guest)=>{
  const record=[...sessions.values()].find(r=>r.ses===guest.session);if(!record){guest.close();return}
  guest.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');guest.setAudioMuted(true);guest.setWindowOpenHandler(()=>({action:'deny'}));
  record.guests.add(guest);guest.once('destroyed',()=>record.guests.delete(guest));
  guest.on('will-navigate',event=>{const allowed=[...documents.values()].some(entry=>entry.partition===record.partition&&(validFrame(event.url,entry,'host')||validFrame(event.url,entry,'widget')));if(!allowed)event.preventDefault()});
  guest.on('will-frame-navigate',(event,details)=>{const url=typeof details==='string'?details:details?.url||event.url;const allowed=[...documents.values()].some(entry=>entry.partition===record.partition&&(validFrame(url,entry,'host')||validFrame(url,entry,'widget')));if(!allowed)event.preventDefault()});
 });
}
function openPreview(value,locale){return open(value,locale,null)}
function openInstalled(value,locale,widgetId){if(typeof widgetId!=='string'||! /^[a-zA-Z0-9-]{1,64}$/.test(widgetId))throw Error('Invalid widget identity');return open(value,locale,widgetId)}
async function open(value,locale,widgetId){
 const p=packages.normalize(value),id=widgetId?hash(widgetId):randomUUID(),token=randomUUID(),permissions=widgetId?p.permissions:{network:[],storage:false};
 if(widgetId&&!permissions.storage)await clear(widgetId);
 const partition=widgetId&&permissions.storage?'persist:veyra-widget-'+id:widgetId?'veyra-widget-'+id:PREVIEW;
 let record=sessions.get(partition);if(!record)record=createSession(partition,{network:permissions.network,storage:permissions.storage,preview:!widgetId});else{record.network=new Set(permissions.network);record.storage=permissions.storage}
 if(!widgetId){
  // Preview documents always use the dedicated no-network session.
  if(partition!==PREVIEW)throw Error('Invalid widget preview partition');
 }
 const csp=policy(permissions,permissions.storage),html=packages.documentHTML(p,locale).replace("connect-src 'none'",`connect-src ${permissions.network.length?permissions.network.join(' '):"'none'"}`);
 const early=`for(const k of ['RTCPeerConnection','webkitRTCPeerConnection'])try{Object.defineProperty(window,k,{value:undefined,configurable:false})}catch{}`;
 const secured=html.replace('<script>const stage=',`<script>${early}const stage=`);
 const entry={token,originId:id,partition,permissions,csp,html:secured,expires:Date.now()+60*60*1000};documents.set(token,entry);
 for(const [key,item] of documents)if(item.expires<Date.now())documents.delete(key);while(documents.size>48)documents.delete(documents.keys().next().value);
 return {url:`veyra-widget-host://${id}/${token}`,partition};
}
function release(value){try{const u=new URL(typeof value==='string'?value:value?.url);if(u.protocol!=='veyra-widget-host:'||u.pathname.length<2)return false;return documents.delete(tokenFor(u.href))}catch{return false}}
async function clear(widgetId){if(typeof widgetId!=='string'||! /^[a-zA-Z0-9-]{1,64}$/.test(widgetId))return false;const id=hash(widgetId);for(const partition of ['veyra-widget-'+id,'persist:veyra-widget-'+id]){let record=sessions.get(partition),ses=record?.ses;if(record){record.network.clear();record.storage=false;for(const guest of record.guests)try{guest.close()}catch{}record.guests.clear()}else if(partition.startsWith('persist:'))ses=session.fromPartition(partition,{cache:false});if(ses){await ses.clearStorageData();await ses.clearCache();await ses.closeAllConnections()}sessions.delete(partition)}for(const [token,entry]of documents)if(entry.originId===id)documents.delete(token);return true}
async function revoke(widgetId,clearStorage=false){if(typeof widgetId!=='string'||! /^[a-zA-Z0-9-]{1,64}$/.test(widgetId))return false;const id=hash(widgetId);for(const partition of ['veyra-widget-'+id,'persist:veyra-widget-'+id]){const record=sessions.get(partition);if(!record)continue;record.network.clear();record.storage=false;for(const guest of record.guests)try{guest.close()}catch{}record.guests.clear();if(clearStorage){await record.ses.clearStorageData();await record.ses.clearCache();await record.ses.closeAllConnections();sessions.delete(partition)}}if(clearStorage)await clear(widgetId);return true}
module.exports={register,attach,openPreview,openInstalled,release,clear,revoke,stats:()=>({documents:documents.size,sessions:sessions.size}),PARTITION:PREVIEW};
