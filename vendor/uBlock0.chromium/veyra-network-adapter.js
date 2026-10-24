/* Veyra adaptation, GPL-3.0-only. Native Electron WebRequest transport for uBO.
 * Upstream filtering rules and decisions are unchanged. */
(() => {
 const listeners=new Map();
 const matches=(pattern,url)=>{if(pattern==='<all_urls>')return /^(https?|wss?):/.test(url);const m=/^(\*|https?|wss?):\/\/(\*|\*\.[^/]+|[^/]+)(\/.*)$/.exec(pattern);if(!m)return false;try{const u=new URL(url);if(m[1]!=='*'&&u.protocol!==m[1]+':')return false;const host=m[2];if(host!=='*'&&!(host.startsWith('*.')?(u.hostname===host.slice(2)||u.hostname.endsWith(host.slice(1))):u.host===host))return false;const escaped=m[3].replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*');return new RegExp('^'+escaped+'$').test(u.pathname+u.search)}catch{return false}};
 for(const name of ['onBeforeRequest','onBeforeSendHeaders','onSendHeaders','onHeadersReceived','onResponseStarted','onBeforeRedirect','onCompleted','onErrorOccurred']){
  const event=chrome.webRequest[name];if(!event)continue;const entries=[];listeners.set(name,entries);
  event.addListener=(fn,filter)=>{if(!entries.some(x=>x.fn===fn))entries.push({fn,filter})};
  event.removeListener=fn=>{const i=entries.findIndex(x=>x.fn===fn);if(i>=0)entries.splice(i,1)};
  event.hasListener=fn=>entries.some(x=>x.fn===fn);event.hasListeners=()=>entries.length!==0;
 }
 chrome.webRequest.handlerBehaviorChanged=callback=>{callback?.();return Promise.resolve()};
 globalThis.__veyraNet=Object.freeze({dispatch(name,details){let result={};for(const {fn,filter} of listeners.get(name)||[]){if(filter?.types&&!filter.types.includes(details.type))continue;if(filter?.urls&&!filter.urls.some(x=>matches(x,details.url)))continue;try{const value=fn(details);if(value&&typeof value==='object')result={...result,...value};if(result.cancel)break}catch(error){console.error('Veyra uBO listener failed',name,error)}}return result}});
})();
