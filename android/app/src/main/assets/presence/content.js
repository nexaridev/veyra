browser.runtime.sendNativeMessage('veyra_presence',{}).then(enabled=>{
 if(!enabled)return;const w=window.wrappedJSObject,d=w.document;let fullscreen=null;
 const fn=f=>exportFunction(f,w);const get=(o,k,f)=>{try{Object.defineProperty(o,k,{configurable:true,get:fn(f)})}catch{}};
 get(d,'hidden',()=>false);get(d,'visibilityState',()=> 'visible');d.hasFocus=fn(()=>true);
 get(d,'fullscreenElement',()=>fullscreen);get(d,'webkitFullscreenElement',()=>fullscreen);get(d,'fullscreenEnabled',()=>true);
 const signal=()=>d.dispatchEvent(new w.Event('fullscreenchange'));
 w.Element.prototype.requestFullscreen=fn(function(){fullscreen=this;signal();return w.Promise.resolve()});
 d.exitFullscreen=fn(()=>{fullscreen=null;signal();return w.Promise.resolve()});
 for(const name of ['blur','visibilitychange'])window.addEventListener(name,e=>e.stopImmediatePropagation(),true);
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&fullscreen)d.exitFullscreen()},true);
}).catch(()=>{});
