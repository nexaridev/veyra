'use strict';
const {randomUUID}=require('node:crypto');
const blocked=new Set(['http','https','ftp','file','filesystem','data','javascript','vbscript','about','blob','view-source','chrome','chrome-extension','devtools','veyra','shell','smb','cmd','command','powershell','pwsh','wscript','cscript','mshta','ms-msdt','search','search-ms','ms-settings','ms-appinstaller','mhtml']);
function externalURL(value){
 if(typeof value!=='string'||value.length>32768||/[\u0000-\u001f\u007f]/.test(value))return null;
 try{const parsed=new URL(value.trim()),scheme=parsed.protocol.slice(0,-1).toLowerCase();if(!/^[a-z][a-z0-9+.-]{1,63}$/.test(scheme)||blocked.has(scheme)||parsed.username||parsed.password)return null;
  const url=parsed.href;if(/[\s"<>`\\]/.test(url)||/%00/i.test(url))return null;return {url,scheme};
 }catch{return null;}
}
function site(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.origin:''}catch{return '';}}
class ExternalApplications{
 constructor(options){this.options=options;this.pending=null;this.cooldowns=new WeakMap();}
 snapshot(){return this.pending?.public||null;}
 bind(wc){wc.on('did-start-navigation',(_,url,inPlace,main)=>{if(main&&!inPlace&&!externalURL(url)&&this.pending?.wc===wc)this.cancel();});wc.once('destroyed',()=>{if(this.pending?.wc===wc)this.cancel();});}
 cancel(){this.pending?.finish(false);}
 async request(wc,value,sourceURL){
  const link=externalURL(value);if(!link||!wc||wc.isDestroyed()||!this.options.active(wc)||!this.options.available()||this.pending)return false;
  const documentURL=wc.getURL(),origin=site(sourceURL||documentURL);if(!origin||origin!==site(documentURL))return false;
  if(Date.now()-(this.cooldowns.get(wc)||0)<800)return false;
  let name='';try{name=String(this.options.application(link.scheme+'://')||'').slice(0,160)}catch{}
  const canRemember=origin.startsWith('https:')&&!this.options.temporary(wc),saved=this.options.settings().externalAppPermissions;
  if(canRemember&&name&&saved?.[origin]?.[link.scheme]===true){this.cooldowns.set(wc,Date.now());try{await this.options.launch(link.url);return true}catch{this.options.failed();return false;}}
  return new Promise(resolve=>{
   const id=randomUUID();let restore=()=>{};
   const finish=async allow=>{if(this.pending?.public.id!==id)return;clearTimeout(timer);this.pending=null;this.cooldowns.set(wc,Date.now());this.options.changed();restore();
    if(allow){try{await this.options.launch(link.url);resolve(true);return}catch{this.options.failed();}}resolve(false);
   };
   this.pending={wc,documentURL,url:link.url,public:{id,origin,scheme:link.scheme,application:name,found:!!name,canRemember},finish};
   const timer=setTimeout(()=>finish(false),60000);this.options.changed();restore=this.options.show(wc)||restore;
  });
 }
 respond(payload){
  const p=this.pending;if(!p||p.public.id!==payload?.id)return false;
  if(p.wc.isDestroyed()||p.wc.getURL()!==p.documentURL||!this.options.active(p.wc)){p.finish(false);return false;}
  // Handler discovery can fail on Windows even when shell.openExternal can
  // resolve the protocol (for example via the app picker). A user-confirmed
  // one-time attempt is safe; only persist permissions for identified apps.
  const allow=payload.allow===true;
  if(allow&&payload.remember===true&&p.public.canRemember){const settings=this.options.settings(),entries=settings.externalAppPermissions||{};
   if(Object.keys(entries).length<200||entries[p.public.origin]){const values=entries[p.public.origin]||{};if(Object.keys(values).length<32||values[p.public.scheme]){entries[p.public.origin]={...values,[p.public.scheme]:true};settings.externalAppPermissions=entries;this.options.save();}}
  }
  void p.finish(allow);return true;
 }
 reset(origin){this.cancel();const settings=this.options.settings();if(typeof origin==='string')delete settings.externalAppPermissions[origin];else settings.externalAppPermissions={};this.options.save();this.options.changed();}
}
module.exports={ExternalApplications,externalURL};
