const {ipcRenderer} = require('electron');
if(!ipcRenderer.sendSync('veyra:native-compat')){
// Isolated handlers; clipboard bridge exposes text-only writes, never reads.
if(process.isMainFrame){
  let lastOffer=0,dirty=false;
  document.addEventListener('input',event=>{
    if(event.isTrusted && !dirty){dirty=true;ipcRenderer.send('veyra:page-dirty');}
  },true);
  document.addEventListener('submit',event=>{
    if(location.protocol!=='https:'||Date.now()-lastOffer<3000)return;
    const form=event.target;
    if(!(form instanceof HTMLFormElement))return;
    const passwords=[...form.querySelectorAll('input[type="password"]')].filter(x=>!x.disabled&&x.value);
    if(passwords.length!==1||passwords[0].autocomplete==='new-password')return;
    const fields=[...form.querySelectorAll('input')];
    const username=fields.find(x=>x.autocomplete==='username')||fields.find(x=>x.type==='email')||fields.find(x=>x.type==='text');
    const action=new URL(form.action||location.href,location.href);
    if(action.protocol!=='https:'||action.origin!==location.origin)return;
    lastOffer=Date.now();
    ipcRenderer.send('veyra:password-candidate',{username:(username?.value||'').slice(0,512),password:passwords[0].value.slice(0,4096)});
  },true);
}

// Runs inside the isolated preload; never exposes privileged APIs to a website.
function installDarkMode(config,webFrame){
 if(!config.enabled||!/^https?:$/.test(location.protocol))return;
 const brightness=config.brightness/100,contrast=config.contrast/100;
 const earlyStyle=webFrame.insertCSS('html{color-scheme:dark;background-color:#121418}body{visibility:hidden!important}');
 let timer,observer;const seen=new WeakMap();
 function rgb(value){const n=value.match(/[\d.]+/g)?.map(Number);return n&&n.length>=3&&!(n.length===4&&n[3]===0)?n:null}
 const lum=c=>(c[0]*.2126+c[1]*.7152+c[2]*.0722)/255;
 function color(c,text){const l=lum(c);const target=text?Math.min(.97,Math.max(.60,(.78+(l-.5)*.18)*brightness*contrast)):Math.min(.27,Math.max(.025,(.09+(1-l)*.09)*brightness/contrast));return `rgb(${c.slice(0,3).map(v=>Math.round(Math.min(255,Math.max(0,(target*255+(v-c.slice(0,3).reduce((a,b)=>a+b,0)/3)*.16))))).join(',')})`}
 function nativeDark(){const body=document.body;if(!body)return false;for(const el of [body,document.documentElement]){const c=rgb(getComputedStyle(el).backgroundColor);if(c&&lum(c)<.32&&el===body)return true}return false}
 function paint(root){let count=0;const nodes=[root,...root.querySelectorAll('*')];for(const el of nodes){if(++count>6000)break;if(!(el instanceof HTMLElement)||el.closest('img,video,canvas,svg,picture,iframe,object,embed,[data-veyra-dark-ignore]')||['SCRIPT','STYLE','LINK','META'].includes(el.tagName))continue;
 const s=getComputedStyle(el),finger=[s.backgroundColor,s.color,s.borderTopColor].join('|');if(seen.get(el)===finger)continue;
 const bg=rgb(s.backgroundColor),fg=rgb(s.color),border=rgb(s.borderTopColor);
 if(bg&&lum(bg)>.32&&s.backgroundImage==='none')el.style.setProperty('background-color',color(bg,false),'important');
 if(fg&&lum(fg)<.65)el.style.setProperty('color',color(fg,true),'important');
 if(border&&s.borderTopStyle!=='none')el.style.setProperty('border-color',color(border,false),'important');
 const after=getComputedStyle(el);seen.set(el,[after.backgroundColor,after.color,after.borderTopColor].join('|'));
 }}
 async function start(){try{if(nativeDark())return;paint(document.documentElement);observer=new MutationObserver(records=>{clearTimeout(timer);timer=setTimeout(()=>{for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)if(n instanceof HTMLElement)paint(n);else{}else if(r.target instanceof HTMLElement)paint(r.target)}},40)});observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}finally{webFrame.removeInsertedCSS(await earlyStyle)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}

try{installDarkMode(ipcRenderer.sendSync('veyra:dark-config'),require('electron').webFrame)}catch{}

if(process.isMainFrame&&location.protocol==='https:'){
 const {contextBridge}=require('electron');let lastGesture=0;
 for(const name of ['pointerdown','keydown','click'])document.addEventListener(name,event=>{if(event.isTrusted)lastGesture=Date.now()},true);
 const write=async text=>{if(Date.now()-lastGesture>5000)throw new Error('Clipboard requires a user gesture');return ipcRenderer.invoke('veyra:clipboard-write',String(text))};
 const config=ipcRenderer.sendSync('veyra:dark-config');
 contextBridge.exposeInMainWorld('__veyraTextClipboard',Object.freeze({write}));
 contextBridge.executeInMainWorld({func:()=>{if(navigator.clipboard){navigator.clipboard.writeText=async text=>{await window.__veyraTextClipboard.write(String(text))};const original=navigator.clipboard.write.bind(navigator.clipboard);navigator.clipboard.write=async items=>{if(items.length===1&&items[0].types.length===1&&items[0].types.includes('text/plain')){const blob=await items[0].getType('text/plain');await navigator.clipboard.writeText(await blob.text());return}return original(items)}}}});
 if(config.clipboardMode==='ask')document.addEventListener('copy',event=>{if(!event.isTrusted)return;event.preventDefault();queueMicrotask(()=>{const text=event.clipboardData?.getData('text/plain')||String(getSelection()||'');if(text)void write(text).catch(()=>{})})},true);
}

// Suppress unsolicited WebAuthn prompts; deliberate passkey actions keep native WebAuthn.
if(/^https?:$/.test(location.protocol))require('electron').contextBridge.executeInMainWorld({func:()=>{
 if(!navigator.credentials)return;
 const nativeGet=navigator.credentials.get.bind(navigator.credentials);
 navigator.credentials.get=function(options){if(options?.publicKey&&(options.mediation==='conditional'||!navigator.userActivation?.isActive))return Promise.reject(new DOMException('Automatic passkey prompts are disabled. Choose passkey sign-in explicitly.','NotAllowedError'));return nativeGet(options)};
 if(window.PublicKeyCredential&&typeof PublicKeyCredential.isConditionalMediationAvailable==='function')PublicKeyCredential.isConditionalMediationAvailable=async()=>false;
}});

if(/^https?:$/.test(location.protocol)){
 const {contextBridge}=require('electron');
 contextBridge.exposeInMainWorld('__veyraSiteDialogs',Object.freeze({show:(type,message,defaultText)=>ipcRenderer.sendSync('veyra:site-dialog',{type,message:String(message??''),defaultText:String(defaultText??'')})}));
 contextBridge.executeInMainWorld({func:()=>{window.alert=message=>{window.__veyraSiteDialogs.show('alert',message)};window.confirm=message=>window.__veyraSiteDialogs.show('confirm',message)===true;window.prompt=(message,value='')=>window.__veyraSiteDialogs.show('prompt',message,value)}});
}

// Optional per-tab compatibility mode; no privileged page bridge.
if(/^https?:$/.test(location.protocol)&&ipcRenderer.sendSync('veyra:presence-config')){
 require('electron').contextBridge.executeInMainWorld({func:()=>{
  const define=(o,k,get)=>{try{Object.defineProperty(o,k,{configurable:true,get})}catch{}};
  define(document,'hidden',()=>false);define(document,'visibilityState',()=> 'visible');
  document.hasFocus=()=>true;
  let fullscreen=null;define(document,'fullscreenElement',()=>fullscreen);
  define(document,'webkitFullscreenElement',()=>fullscreen);
  define(document,'fullscreenEnabled',()=>true);
  const signal=()=>document.dispatchEvent(new Event('fullscreenchange'));
  Element.prototype.requestFullscreen=function(){fullscreen=this;signal();return Promise.resolve()};Element.prototype.webkitRequestFullscreen=Element.prototype.requestFullscreen;
  document.exitFullscreen=()=>{fullscreen=null;signal();return Promise.resolve()};document.webkitExitFullscreen=document.exitFullscreen;window.addEventListener('keydown',e=>{if(e.key==='Escape'&&fullscreen)document.exitFullscreen()},true);
  for(const name of ['blur','visibilitychange'])window.addEventListener(name,e=>e.stopImmediatePropagation(),true);
 }});
}

}
