const {ipcRenderer} = require('electron');
const nativeCompatibility=ipcRenderer.sendSync('veyra:native-compat');
// A site gets device labels only after the user grants native media access.
// The initial stream stays private to this wrapper until device selection ends.
if(process.isMainFrame&&!nativeCompatibility){
 const {contextBridge}=require('electron');
 contextBridge.exposeInMainWorld('__veyraMediaPicker',Object.freeze({choose:payload=>ipcRenderer.invoke('veyra:media-pick',payload)}));
 contextBridge.executeInMainWorld({func:()=>{
  if(!navigator.mediaDevices?.getUserMedia)return;const native=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia=async constraints=>{
   if(!constraints||!constraints.audio&&!constraints.video||constraints.video?.mandatory?.chromeMediaSource||constraints.audio?.mandatory?.chromeMediaSource)return native(constraints);
   let stream;try{
    stream=await native(constraints);const devices=await navigator.mediaDevices.enumerateDevices(),audio=!!constraints.audio,video=!!constraints.video;
    const current={audio:stream.getAudioTracks()[0]?.getSettings().deviceId,video:stream.getVideoTracks()[0]?.getSettings().deviceId};
    const selected=await window.__veyraMediaPicker.choose({audio,video,current,devices:devices.map(d=>({kind:d.kind,deviceId:d.deviceId,label:d.label}))});
    if(!selected)throw new DOMException('Device selection cancelled','NotAllowedError');
    if((!audio||selected.audio===current.audio)&&(!video||selected.video===current.video))return stream;
    const chosen={...constraints};for(const kind of ['audio','video'])if(selected[kind])chosen[kind]={...(typeof constraints[kind]==='object'?constraints[kind]:{}),deviceId:{exact:selected[kind]}};
    for(const track of stream.getTracks())track.stop();stream=null;return await native(chosen);
   }catch(error){for(const track of stream?.getTracks()||[])track.stop();throw error;}
  };
 }});
}
if(!nativeCompatibility){
// Keep native scrollbars readable on dark browser themes without recoloring page content.
try{const config=ipcRenderer.sendSync('veyra:dark-config');if(config.scrollbars)require('electron').webFrame.insertCSS('@media(prefers-color-scheme:dark){html{scrollbar-color:#716b7d #17151d!important;scrollbar-width:thin!important}*::-webkit-scrollbar{width:11px!important;height:11px!important}*::-webkit-scrollbar-track,*::-webkit-scrollbar-corner{background:#17151d!important}*::-webkit-scrollbar-thumb{background:#5c5667!important;border:2px solid #17151d!important;border-radius:8px!important}*::-webkit-scrollbar-thumb:hover{background:#81798f!important}}')}catch{}
// Isolated handlers; clipboard bridge exposes text-only writes, never reads.
if(process.isMainFrame){
  if(location.protocol==='https:'){
   let pending=ipcRenderer.sendSync('veyra:form-restore'),timer=0,observer=null,restored=false,formDirty=false;
   const sensitive=/(?:pass(?:word)?|otp|one.?time|token|secret|credit.?card|card.?number|cvv|cvc|security.?code|payment|billing|pin)/i;
   const controls=()=>[...document.querySelectorAll('input,textarea,[contenteditable="true"]')].filter(el=>{
    if(el.disabled||el.readOnly||el.type==='hidden'||el.type==='password'||el.type==='file'||el.type==='checkbox'||el.type==='radio'||el.type==='submit'||el.type==='button'||el.type==='reset')return false;
    if(el instanceof HTMLInputElement&&!['text','search','email','url','tel'].includes(el.type))return false;
    if(el.isContentEditable&&el.parentElement?.closest('[contenteditable="true"]'))return false;
    return !sensitive.test([el.id,el.getAttribute('name'),el.getAttribute('autocomplete'),el.getAttribute('aria-label')].filter(Boolean).join(' '));
   });
   const valueOf=el=>el.isContentEditable?el.innerText:el.value;
   const setValue=(el,value)=>{if(el.isContentEditable)el.innerText=value;else{const setter=Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value')?.set;if(setter)setter.call(el,value);else el.value=value;}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
   const apply=()=>{
    if(restored||!pending||pending.url!==location.href)return;
    const elements=controls();let resolved=0;
    for(const field of pending.fields){const el=elements[field.index];if(!el||field.id&&field.id!==el.id||field.name&&field.name!==el.getAttribute('name'))continue;resolved++;if(el.matches(':focus')||valueOf(el))continue;setValue(el,field.value);}
    if(resolved>=pending.fields.length){restored=true;observer?.disconnect();observer=null;clearTimeout(timer);pending=null;}
   };
   const capture=()=>{
    if(location.protocol!=='https:')return;
    const fields=controls().slice(0,128).map((el,index)=>({index,kind:el.isContentEditable?'editable':el instanceof HTMLTextAreaElement?'textarea':'input',type:el.type||'',id:el.id||'',name:el.getAttribute('name')||'',autocomplete:el.getAttribute('autocomplete')||'',value:String(valueOf(el)||'').slice(0,4096)}));
    ipcRenderer.send('veyra:form-state',{fields});formDirty=false;
   };
   if(pending){
    const begin=()=>{observer=new MutationObserver(apply);observer.observe(document.documentElement,{subtree:true,childList:true});timer=setTimeout(()=>{observer?.disconnect();observer=null;pending=null;},8000);apply();};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
   }
   let saveTimer=0;document.addEventListener('input',event=>{const target=event.target instanceof Element?(event.target.closest('[contenteditable="true"]')||event.target):null;if(!event.isTrusted||!controls().includes(target))return;formDirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(capture,300);},true);
   window.addEventListener('pagehide',()=>{clearTimeout(saveTimer);if(formDirty)capture();},{once:true});
  }
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
  const read=async()=>{if(Date.now()-lastGesture>5000)throw new Error('Clipboard requires a user gesture');return ipcRenderer.invoke('veyra:clipboard-read')};
 const config=ipcRenderer.sendSync('veyra:dark-config');
  contextBridge.exposeInMainWorld('__veyraTextClipboard',Object.freeze({write,read}));
  contextBridge.executeInMainWorld({func:()=>{if(navigator.clipboard){navigator.clipboard.writeText=async text=>{await window.__veyraTextClipboard.write(String(text))};navigator.clipboard.readText=async()=>{try{return await window.__veyraTextClipboard.read()}catch{throw new DOMException('Clipboard text was not approved','NotAllowedError')}};navigator.clipboard.read=async()=>{const text=await navigator.clipboard.readText();return [new ClipboardItem({'text/plain':new Blob([text],{type:'text/plain'})})]};const original=navigator.clipboard.write.bind(navigator.clipboard);navigator.clipboard.write=async items=>{if(items.length===1&&items[0].types.length===1&&items[0].types.includes('text/plain')){const blob=await items[0].getType('text/plain');await navigator.clipboard.writeText(await blob.text());return}return original(items)}}}});
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

// User-controlled site compatibility. This changes only the page-facing DOM APIs;
// the browser window itself enters fullscreen only after an explicit user choice.
if(/^https?:$/.test(location.protocol)){
 const {contextBridge}=require('electron');let config=ipcRenderer.sendSync('veyra:compatibility-config');window.addEventListener('veyra:request-real-fullscreen',()=>ipcRenderer.send('veyra:real-fullscreen-request'),true);
 const apply=next=>contextBridge.executeInMainWorld({func:settings=>{
  const d=document,w=window,ElementCtor=w.Element,VideoCtor=w.HTMLVideoElement;
  if(!w.__veyraCompat){
   const names=['requestFullscreen','webkitRequestFullscreen','mozRequestFullScreen','msRequestFullscreen'];
   w.__veyraCompat={fakeFsEl:null,base:{fullscreenEnabled:Object.getOwnPropertyDescriptor(d,'fullscreenEnabled'),webkitFullscreenEnabled:Object.getOwnPropertyDescriptor(d,'webkitFullscreenEnabled'),fullscreenElement:Object.getOwnPropertyDescriptor(d,'fullscreenElement'),webkitFullscreenElement:Object.getOwnPropertyDescriptor(d,'webkitFullscreenElement'),webkitCurrentFullScreenElement:Object.getOwnPropertyDescriptor(d,'webkitCurrentFullScreenElement'),hidden:Object.getOwnPropertyDescriptor(d,'hidden'),visibilityState:Object.getOwnPropertyDescriptor(d,'visibilityState'),hasFocus:d.hasFocus,requests:names.map(n=>Object.getOwnPropertyDescriptor(ElementCtor.prototype,n)),webkitVideo:Object.getOwnPropertyDescriptor(VideoCtor?.prototype||{},'webkitEnterFullscreen'),exit:Object.getOwnPropertyDescriptor(d,'exitFullscreen')},listeners:false};
  }
  const state=w.__veyraCompat,define=(obj,key,descriptor)=>{try{Object.defineProperty(obj,key,descriptor)}catch{}};
  const dispatch=(target,type)=>{try{target?.dispatchEvent(new w.Event(type,{bubbles:true}))}catch{}};
  const change=target=>{dispatch(d,'fullscreenchange');dispatch(d,'webkitfullscreenchange');dispatch(target,'fullscreenchange')};
  const restore=(obj,key,desc)=>{try{if(desc)Object.defineProperty(obj,key,desc);else delete obj[key]}catch{}};
  if(settings.fakeFullscreen){
   for(const key of ['fullscreenEnabled','webkitFullscreenEnabled'])define(d,key,{configurable:true,get:()=>true});
   for(const key of ['fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement'])define(d,key,{configurable:true,get:()=>state.fakeFsEl});
   const askReal=()=>{if(settings.realFullscreen)w.dispatchEvent(new w.Event('veyra:request-real-fullscreen'))};
   const enter=function(){state.fakeFsEl=this;queueMicrotask(()=>setTimeout(()=>change(this),0));askReal();return Promise.resolve()};
   const enterLegacy=function(){state.fakeFsEl=this;queueMicrotask(()=>setTimeout(()=>change(this),0));askReal()};
   for(const key of ['requestFullscreen'])define(ElementCtor.prototype,key,{configurable:true,writable:true,value:enter});
   for(const key of ['webkitRequestFullscreen','mozRequestFullScreen','msRequestFullscreen'])define(ElementCtor.prototype,key,{configurable:true,writable:true,value:enterLegacy});
   if(VideoCtor)define(VideoCtor.prototype,'webkitEnterFullscreen',{configurable:true,writable:true,value:function(){state.fakeFsEl=this;queueMicrotask(()=>setTimeout(()=>{change(this);dispatch(this,'webkitbeginfullscreen')},0));askReal()}});
   const exit=()=>{const old=state.fakeFsEl;state.fakeFsEl=null;queueMicrotask(()=>setTimeout(()=>change(old),0));return Promise.resolve()};
   define(d,'exitFullscreen',{configurable:true,writable:true,value:exit});define(d,'webkitExitFullscreen',{configurable:true,writable:true,value:exit});
  }else{
   for(const [key,desc] of Object.entries({fullscreenEnabled:state.base.fullscreenEnabled,webkitFullscreenEnabled:state.base.webkitFullscreenEnabled,fullscreenElement:state.base.fullscreenElement,webkitFullscreenElement:state.base.webkitFullscreenElement,webkitCurrentFullScreenElement:state.base.webkitCurrentFullScreenElement,exitFullscreen:state.base.exit}))restore(d,key,desc);
   for(let i=0;i<state.base.requests.length;i++)restore(ElementCtor.prototype,['requestFullscreen','webkitRequestFullscreen','mozRequestFullScreen','msRequestFullscreen'][i],state.base.requests[i]);
   if(VideoCtor)restore(VideoCtor.prototype,'webkitEnterFullscreen',state.base.webkitVideo);state.fakeFsEl=null;
  }
  if(settings.hideFocus){
   define(d,'hidden',{configurable:true,get:()=>false});define(d,'visibilityState',{configurable:true,get:()=> 'visible'});define(d,'hasFocus',{configurable:true,writable:true,value:()=>true});
   if(!state.listeners){state.listeners=true;w.addEventListener('blur',()=>setTimeout(()=>{if(w.__veyraCompat?.settings?.hideFocus){dispatch(w,'focus');dispatch(d,'visibilitychange')}},50),true);d.addEventListener('visibilitychange',e=>{if(w.__veyraCompat?.settings?.hideFocus)e.stopImmediatePropagation()},true)}
  }else{restore(d,'hidden',state.base.hidden);restore(d,'visibilityState',state.base.visibilityState);restore(d,'hasFocus',state.base.hasFocus?{configurable:true,writable:true,value:state.base.hasFocus}:null)}
  state.settings={...settings};
 },args:[next]});
 apply(config);ipcRenderer.on('veyra:compatibility-settings',(_,next)=>{config=next;apply(config)});
}

}
