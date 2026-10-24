const {app,webContents,BrowserWindow}=require('electron');
const path=require('node:path');
const {ElectronChromeExtensions}=require('electron-chrome-extensions');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const types={mainFrame:'main_frame',subFrame:'sub_frame',xhr:'xmlhttprequest',cspReport:'csp_report',ping:'ping',webSocket:'websocket'};
class UBlock {
 constructor(options){this.options=options;this.hosts=new Map();this.error=null;this.updated=null;this.updating=false;this.installQueue=Promise.resolve();}
 async install(ses){
  const existing=this.hosts.get(ses);if(existing?.ready)return true;if(existing?.pending)return existing.pending;
  const controller=existing?.controller||new ElectronChromeExtensions({session:ses,license:'GPL-3.0',createTab:details=>{if(details.url?.startsWith('chrome-extension:')){const child=this.open(ses,details.url);return [child.webContents,child]}const tab=this.options.newTab(details.url||'veyra://newtab');if(!tab.view)throw Error('Unsupported extension tab');return [tab.view.webContents,this.options.window()]},selectTab:wc=>{const t=this.options.tabs().find(t=>t.view?.webContents===wc);if(t&&!this.selecting&&t.id!==this.options.selected?.())this.options.select(t.id)},removeTab:wc=>{const t=this.options.tabs().find(t=>t.view?.webContents===wc);if(t)this.options.close(t.id)},requestPermissions:()=>false});
  const host=existing||{controller,extension:null,ready:false,pending:null};this.hosts.set(ses,host);
  host.pending=this.installQueue.then(async()=>{try{host.extension=await ses.extensions.loadExtension(app.isPackaged?path.join(process.resourcesPath,'uBlock0.chromium'):path.join(__dirname,'../vendor/uBlock0.chromium'));
   const deadline=Date.now()+30000;while(Date.now()<deadline){const bg=this.background(host,ses);if(bg){try{host.ready=await bg.executeJavaScript("import('./js/background.js').then(m=>m.default.readyToFilter===true)");if(host.ready){await bg.executeJavaScript("import('./js/background.js').then(m=>m.default.changeUserSettings('autoUpdate',"+JSON.stringify(this.options.settings().autoUpdateFilters)+"))");this.updated=new Date().toISOString();this.options.changed();return true}}catch{}}await wait(100)}throw Error('uBlock Origin initialization timed out');
  }catch(error){this.error=error.message;this.options.changed();return false}}).finally(()=>{host.pending=null});this.installQueue=host.pending.catch(()=>false);return host.pending;
 }
 background(host,ses){return host?.extension?webContents.getAllWebContents().find(w=>!w.isDestroyed()&&w.session===ses&&w.getType()==='backgroundPage'&&w.getURL()===`chrome-extension://${host.extension.id}/background.html`):null}
 async dispatch(ses,event,details,sourceURL){
  if(!this.options.settings().trackers||this.options.settings().siteExceptions.includes(this.origin(sourceURL)))return {};
  const pair=this.hosts.has(ses)?[ses,this.hosts.get(ses)]:this.hosts.entries().next().value;if(!pair)return {};const [hostSession,host]=pair;if(!host.ready)return {};const bg=this.background(host,hostSession);if(!bg)return {};
  const frame=details.frame;const d={requestId:String(details.id),url:details.url,method:details.method,type:types[details.resourceType]||details.resourceType||'other',tabId:details.webContentsId??-1,frameId:frame?.parent?frame.routingId:0,parentFrameId:frame?.parent?(frame.parent.parent?frame.parent.routingId:0):-1,timeStamp:details.timestamp||Date.now(),initiator:this.origin(sourceURL),originUrl:sourceURL||'',documentUrl:sourceURL||'',statusCode:details.statusCode,statusLine:details.statusLine,fromCache:!!details.fromCache,error:details.error,redirectUrl:details.redirectURL};
  for(const name of ['requestHeaders','responseHeaders'])if(details[name])d[name]=Object.entries(details[name]).flatMap(([name,values])=>(Array.isArray(values)?values:[values]).map(value=>({name,value:String(value)})));
  let timer;try{return await Promise.race([bg.executeJavaScript(`globalThis.__veyraNet?.dispatch(${JSON.stringify(event)},${JSON.stringify(d)})||{}`),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('uBlock transport timed out')),3000)})])}catch(error){this.error=error.message;return {}}finally{clearTimeout(timer)}
 }
 origin(value){try{return new URL(value).origin}catch{return ''}}
 addTab(wc,win){const host=this.hosts.get(wc.session);if(!host)return;host.tabs??=new Set();if(host.tabs.has(wc.id))return;host.tabs.add(wc.id);wc.once('destroyed',()=>host.tabs.delete(wc.id));host.controller.addTab(wc,win)}
 selectTab(wc){if(this.selecting||wc.isDestroyed())return;const host=this.hosts.get(wc.session);if(!host)return;this.selecting=true;try{host.controller.selectTab(wc)}finally{this.selecting=false}}
 status(){return {name:'uBlock Origin',version:'1.75.0',ready:[...this.hosts.values()].some(x=>x.ready),updating:this.updating,updated:this.updated,error:this.error,networkOnly:false,temporaryNetworkOnly:true,sources:['https://github.com/gorhill/uBlock']}}
 async update(){this.updating=true;this.options.changed();try{for(const [ses,host]of this.hosts){const bg=this.background(host,ses);if(bg)await bg.executeJavaScript("import('./js/assets.js').then(m=>m.default.updateStart({delay:0}))")}this.updated=new Date().toISOString()}finally{this.updating=false;this.options.changed()}}
 async configure(){for(const [ses,host]of this.hosts){const bg=this.background(host,ses);if(host.ready&&bg)await bg.executeJavaScript("import('./js/background.js').then(m=>m.default.changeUserSettings('autoUpdate',"+JSON.stringify(this.options.settings().autoUpdateFilters)+"))")}}
 menu(wc,params){return this.hosts.get(wc.session)?.controller.getContextMenuItems(wc,params)||[]}
 async setEnabled(enabled){if(enabled){await Promise.all([...this.hosts.keys()].map(s=>this.install(s)))}else{for(const [ses,host]of this.hosts){if(host.extension)ses.extensions.removeExtension(host.extension.id);host.ready=false;host.extension=null;host.pending=null}}}
 open(ses,target){const host=this.hosts.get(ses)||this.hosts.values().next().value;if(!host?.extension)throw Error('uBlock Origin unavailable');const win=new BrowserWindow({parent:this.options.window(),width:1080,height:760,backgroundColor:'#17171b',autoHideMenuBar:true,webPreferences:{session:[...this.hosts].find(([,x])=>x===host)[0],sandbox:true,contextIsolation:true,nodeIntegration:false}});win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(`chrome-extension://${host.extension.id}/`))e.preventDefault()});const url=target||`chrome-extension://${host.extension.id}/dashboard.html`;if(!url.startsWith(`chrome-extension://${host.extension.id}/`)){win.close();throw Error('Invalid extension URL')}win.loadURL(url);return win}
}
module.exports={UBlock};
