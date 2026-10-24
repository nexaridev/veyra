'use strict';
const {protocol,session}=require('electron');
const {randomUUID}=require('node:crypto');
const packages=require('./widget-package.js');
protocol.registerSchemesAsPrivileged([{scheme:'veyra-widget',privileges:{standard:true,secure:true}}]);
const documents=new Map();
const CSP="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const PARTITION='veyra-widget-runtime';
let widgetSession;
const validURL=value=>{try{const u=new URL(value);return u.protocol==='veyra-widget:'&&documents.has(u.hostname)&&['/','/host'].includes(u.pathname)&&!u.username&&!u.password}catch{return false}};
async function register(){
 widgetSession=session.fromPartition(PARTITION,{cache:false});
 // HTTP interception alone does not cover WebRTC. A dead, mandatory proxy plus
 // disable_non_proxied_udp below closes its independent network path as well.
 await widgetSession.setProxy({mode:'fixed_servers',proxyRules:'socks5://127.0.0.1:9',proxyBypassRules:'<-loopback>'});
 widgetSession.setPermissionCheckHandler(()=>false);widgetSession.setPermissionRequestHandler((wc,permission,callback)=>callback(false));
 widgetSession.on('will-download',event=>event.preventDefault());
 widgetSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!validURL(details.url)}));
 widgetSession.protocol.handle('veyra-widget',request=>{
 const url=new URL(request.url),entry=documents.get(url.hostname);
 if(request.method!=='GET'||!['/','/host'].includes(url.pathname)||!entry||entry.expires<Date.now())return new Response('',{status:404});
 const host=url.pathname==='/host',policy=host?"default-src 'none'; style-src 'unsafe-inline'; frame-src veyra-widget:; object-src 'none'; base-uri 'none'; form-action 'none'":CSP;
 const html=host?`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe sandbox="allow-scripts" referrerpolicy="no-referrer" src="veyra-widget://${url.hostname}/"></iframe></body></html>`:entry.html;
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':policy,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Permissions-Policy':'camera=(), microphone=(), geolocation=(), clipboard-read=(), clipboard-write=(), display-capture=(), fullscreen=(), payment=(), usb=(), serial=()'}});
});}
function attach(host){
 host.on('will-attach-webview',(event,preferences,params)=>{if(params.partition!==PARTITION||!validURL(params.src)||new URL(params.src).pathname!=='/host'){event.preventDefault();return}delete preferences.preload;Object.assign(preferences,{partition:PARTITION,nodeIntegration:false,nodeIntegrationInSubFrames:false,nodeIntegrationInWorker:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,plugins:false,spellcheck:false,disableDialogs:true});});
 host.on('did-attach-webview',(event,guest)=>{if(guest.session!==widgetSession){guest.close();return}guest.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');guest.setAudioMuted(true);guest.setWindowOpenHandler(()=>({action:'deny'}));guest.on('will-navigate',event=>event.preventDefault());guest.on('will-frame-navigate',event=>{if(event.url&&!validURL(event.url))event.preventDefault()});});
}
function open(value,locale){const html=packages.documentHTML(value,locale);for(const [key,entry] of documents)if(entry.expires<Date.now())documents.delete(key);while(documents.size>=48)documents.delete(documents.keys().next().value);const id=randomUUID();documents.set(id,{html,expires:Date.now()+60*60*1000});return 'veyra-widget://'+id+'/host'}
module.exports={register,attach,open,PARTITION};
