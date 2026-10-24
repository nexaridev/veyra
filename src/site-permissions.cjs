'use strict';
const {randomUUID}=require('node:crypto');
const origin=value=>{try{return new URL(value).origin}catch{return ''}};
const secure=value=>{try{return new URL(value).protocol==='https:'}catch{return false}};
class SitePermissions{
 constructor(options){this.options=options;this.grants=new WeakMap();this.choices=new WeakMap();this.pending=null;}
 entry(wc,url){const site=origin(url),temporary=wc&&this.grants.get(wc);return {...this.options.settings().permissions[site],...(temporary?.origin===site?temporary.values:{})};}
 keys(permission,types=[]){return permission==='media'?(types.length?types:['audio','video']).map(t=>t==='audio'?'microphone':'camera'):[permission];}
 check(wc,permission,url,details={}){
  if(!secure(url))return false;const entry=this.entry(wc,url);
  if(permission==='media')return entry.media===true||this.keys(permission,['audio','video'].includes(details.mediaType)?[details.mediaType]:[]).every(k=>entry[k]===true);
  return entry[permission]===true;
 }
 bind(wc){
  wc.on('did-start-navigation',(_,url,inPlace,main)=>{if(main&&!inPlace){this.grants.delete(wc);this.choices.delete(wc);if(this.pending?.wc===wc)this.pending.finish(false)}});
  wc.once('destroyed',()=>{if(this.pending?.wc===wc)this.pending.finish(false)});
 }
 snapshot(){return this.pending?.public||null;}
 request(wc,permission,callback,details={}){
  const url=wc&&!wc.isDestroyed()?wc.getURL():'',site=origin(url);
  if(!wc||wc.isDestroyed()||!secure(url)||!['media','notifications','geolocation','clipboard-read','display-capture','pointerLock'].includes(permission)||origin(details.requestingUrl||url)!==site)return callback(false);
  const types=permission==='media'?(details.mediaTypes||[]).filter(t=>['audio','video'].includes(t)):[],keys=this.keys(permission,types),entry=this.entry(wc,url);
  if(keys.every(k=>entry[k]===true)||permission==='media'&&entry.media===true)return callback(true);
  if(permission==='media'&&entry.media===false||keys.some(k=>entry[k]===false)||this.pending)return callback(false);
  this.open(wc,{origin:site,permission,mediaTypes:types.length?types:permission==='media'?['audio','video']:[],stage:'permission'},allow=>callback(allow),keys);
 }
 open(wc,info,complete,keys=[]){
  const id=randomUUID();let timer;
  const finish=value=>{if(this.pending?.public.id!==id)return;clearTimeout(timer);this.pending=null;complete(value);this.options.changed();};
  this.pending={wc,keys,public:{id,...info},finish};timer=setTimeout(()=>finish(false),60000);this.options.show();
 }
 choose(wc,payload){
  if(!wc||wc.isDestroyed()||!secure(wc.getURL())||this.pending)return Promise.resolve(null);
  const audio=payload?.audio===true,video=payload?.video===true;if(!audio&&!video)return Promise.resolve(null);
  if(audio&&!this.check(wc,'media',wc.getURL(),{mediaType:'audio'})||video&&!this.check(wc,'media',wc.getURL(),{mediaType:'video'}))return Promise.resolve(null);
  const devices=(Array.isArray(payload.devices)?payload.devices:[]).slice(0,64).filter(d=>d&&['audioinput','videoinput'].includes(d.kind)&&typeof d.deviceId==='string'&&d.deviceId.length>0&&d.deviceId.length<=512).map(d=>({kind:d.kind,id:d.deviceId,label:typeof d.label==='string'?d.label.slice(0,160):''}));
  if(audio&&!devices.some(d=>d.kind==='audioinput')||video&&!devices.some(d=>d.kind==='videoinput'))return Promise.resolve(null);
  const site=origin(wc.getURL()),saved=this.choices.get(wc)||this.entry(wc,wc.getURL()).mediaDevices;
  if(saved&&(!audio||devices.some(d=>d.kind==='audioinput'&&d.id===saved.audio))&&(!video||devices.some(d=>d.kind==='videoinput'&&d.id===saved.video)))return Promise.resolve({audio:saved.audio,video:saved.video});
  return new Promise(resolve=>this.open(wc,{origin:site,permission:'media',stage:'devices',audio,video,devices,current:{audio:payload.current?.audio,video:payload.current?.video}},value=>resolve(value||null)));
 }
 respond(payload){
  const request=this.pending;if(!request||payload?.id!==request.public.id)return false;
  if(request.wc.isDestroyed()||origin(request.wc.getURL())!==request.public.origin){request.finish(false);return false;}
  const {public:info,wc}=request,allow=payload.allow===true;
  if(info.stage==='devices'){
   if(!allow){request.finish(null);return true;}const selected={};
   for(const kind of ['audio','video'])if(info[kind]){const id=payload[kind];if(!info.devices.some(d=>d.kind===(kind==='audio'?'audioinput':'videoinput')&&d.id===id))return false;selected[kind]=id;}
   this.choices.set(wc,selected);if(payload.remember===true){const permissions=this.options.settings().permissions;permissions[info.origin]={...permissions[info.origin],mediaDevices:selected};this.options.save();}request.finish(selected);return true;
  }
  if(allow&&info.permission==='notifications'&&!this.options.notifications()){request.finish(false);return true;}
  const values=Object.fromEntries(request.keys.map(k=>[k,allow]));
  if(payload.remember===true){const permissions=this.options.settings().permissions;permissions[info.origin]={...permissions[info.origin],...values};this.options.save();}
  else this.grants.set(wc,{origin:info.origin,values:{...this.entry(wc,wc.getURL()),...values}});
  request.finish(allow);return true;
 }
 reset(){this.pending?.finish(false);this.grants=new WeakMap();this.choices=new WeakMap();}
}
module.exports={SitePermissions};
