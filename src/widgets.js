(function(root){
'use strict';
const kinds=['clock','calendar','notes','focus','recent'],styles=['plain','glass','accent'];
function normalize(input){
 if(!Array.isArray(input)||input.length>12)throw Error('Invalid widget collection');
 const ids=new Set();return input.map(x=>{if(!x||!kinds.includes(x.kind)||!styles.includes(x.style)||typeof x.id!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(x.id)||ids.has(x.id))throw Error('Invalid widget');ids.add(x.id);const out={id:x.id,kind:x.kind,style:x.style,wide:!!x.wide,hour12:!!x.hour12,note:typeof x.note==='string'?x.note.slice(0,4000):''};if(x.layout){const {x:lx,y,w,h}=x.layout;if(![lx,y,w,h].every(Number.isFinite))throw Error('Invalid widget layout');out.layout={x:Math.max(0,Math.min(720,lx)),y:Math.max(0,Math.min(2000,y)),w:Math.max(180,Math.min(900,w)),h:Math.max(150,Math.min(800,h))};out.layout.x=Math.min(out.layout.x,900-out.layout.w)}return out});
}
// Community templates contain presentation settings only. Local notes never leave the device.
function template(value){const x=normalize([{...value,id:'template'}])[0];delete x.id;delete x.note;delete x.layout;return x}
const api={kinds,styles,normalize,template};if(typeof module==='object'&&module.exports)module.exports=api;else root.VeyraWidgets=Object.freeze(api);
})(globalThis);
