'use strict';
const tracking=new Set(['fbclid','gclid','dclid','msclkid','yclid','ttclid','twclid','mc_cid','mc_eid','igshid','_openstat']);
function cleanLink(value){
 const url=new URL(value);if(!['http:','https:'].includes(url.protocol))throw Error('Сначала открой сайт.');
 const raw=String(value),hash=raw.indexOf('#'),end=hash<0?raw.length:hash,query=raw.indexOf('?');
 if(query<0||query>end)return {url:raw,removed:0};
 const parts=raw.slice(query+1,end).split('&'),decode=part=>{try{return decodeURIComponent(part.split('=')[0].replace(/\+/g,' ')).toLowerCase()}catch{return '';}};
 if(parts.some(part=>['signature','sig','oauth_signature','x-amz-signature','x-goog-signature'].includes(decode(part))))return {url:raw,removed:0};
 let removed=0;const kept=parts.filter(part=>{const key=decode(part),drop=key.startsWith('utm_')||tracking.has(key);if(drop)removed++;return !drop;});
 return {url:removed?raw.slice(0,query)+(kept.length?'?'+kept.join('&'):'')+raw.slice(end):raw,removed};
}
module.exports={cleanLink};
