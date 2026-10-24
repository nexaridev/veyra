'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{fileURLToPath,pathToFileURL}=require('node:url');
const inside=(file,root)=>{const rel=path.relative(root,file);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel))};
class LocalHTML{
 constructor({session,net,blocked=[]}){this.session=session;this.net=net;this.blocked=blocked.map(p=>{try{return fs.realpathSync(p)}catch{return path.resolve(p)}});this.sessions=new Map();this.roots=new WeakMap();}
 file(value){if(typeof value!=='string'||value.length>32768||/[\x00-\x1f]/.test(value))return null;try{let file;if(/^file:/i.test(value)){const u=new URL(value);if(u.hostname)return null;file=fileURLToPath(u)}else{if(!path.isAbsolute(value))return null;file=value}if(file.startsWith('\\\\'))return null;file=fs.realpathSync(file);if(this.blocked.some(root=>inside(file,root))||!fs.statSync(file).isFile())return null;return file}catch{return null}}
 url(value){const file=this.file(value);if(!file||!/[.]html?$/i.test(file))return null;const url=pathToFileURL(file);if(/^file:/i.test(value)){const original=new URL(value);url.hash=original.hash;url.search=original.search}return url.href;}
 allowed(ses,url){const file=this.file(url),root=this.roots.get(ses);return !!file&&!!root&&inside(file,root);}
 sessionFor(url){const file=this.file(url);if(!file)throw Error('Не удалось открыть HTML-файл.');const root=path.dirname(file);if(this.sessions.has(root))return this.sessions.get(root);const ses=this.session.fromPartition('persist:veyra-local-'+crypto.createHash('sha256').update(root).digest('hex'));this.roots.set(ses,root);ses.setPermissionRequestHandler((wc,p,cb)=>cb(false));ses.setPermissionCheckHandler(()=>false);ses.setDevicePermissionHandler(()=>false);ses.protocol.handle('file',request=>{if(!this.allowed(ses,request.url))return new Response('Forbidden',{status:403});return this.net.fetch(request.url,{bypassCustomProtocolHandlers:true})});this.sessions.set(root,ses);return ses;}
}
module.exports={LocalHTML,inside};
