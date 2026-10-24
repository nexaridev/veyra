'use strict';
// Chromium decides popup disposition. Explicit window sizing is also honored;
// noopener/noreferrer alone must not turn an ordinary link into a popup.
function separateWindow(details,allWindows=false){
 if(allWindows||details.disposition==='new-window')return true;
 const features=new Map(String(details.features||'').toLowerCase().split(',').map(part=>{const [name,...value]=part.trim().split('=');return [name.trim(),value.join('=').trim()]}));
 if(features.has('popup')&&!['0','no','false'].includes(features.get('popup')))return true;
 return ['width','height','left','top','screenx','screeny'].some(key=>features.has(key));
}
module.exports={separateWindow};
