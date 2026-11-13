const {app,BrowserWindow,WebContentsView,session,ipcMain,Menu,nativeTheme,shell,safeStorage,powerMonitor,dialog,nativeImage,clipboard,net,desktopCapturer}=require('electron');
const fs=require('node:fs');
const widgetRuntime=require('./widget-runtime.cjs');
const path=require('node:path');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {PasswordVault}=require('./vault.cjs');
const {SyncClient,unseal}=require('./sync.cjs');const sync=new SyncClient();let checkedUpdate=null,updateDownloading=false;
const {PrivacyEngine}=require('./privacy.cjs');
const I18n=require('./locales.js');
const SessionState=require('./session-state.cjs');
const external=require('./external-browser.cjs');
const {ExternalApplications,externalURL}=require('./external-apps.cjs');
const appearance=require('./appearance.cjs');
const {DiscordPresence}=require('./discord.cjs');let discord;
const googleHost=url=>{try{const host=new URL(url).hostname;return db.settings.compatibilityDomains.some(d=>host===d||host.endsWith('.'+d))}catch{return false}};
function applySitePolicy(wc,url){
 const context=contexts.get(wc.id);if(!context||wc.isDestroyed()||!web(url))return;
 context.policyURL=url;context.compatibility=googleHost(url);
 const ua=context.compatibility?app.userAgentFallback:sessionFor(context.mode).getUserAgent().replace(/\sElectron\/[^\s]+/g,'').replace(/\sveyra\/[^\s]+/gi,'');
 if(wc.getUserAgent()!==ua)wc.setUserAgent(ua);
}
function compatibleRequest(details,source){return googleHost(details.resourceType==='mainFrame'?details.url:contexts.get(details.webContentsId)?.policyURL||source||details.initiator||details.url)}
function darkConfig(url){let host;try{host=new URL(url).hostname}catch{return {enabled:false,scrollbars:false}}return {...{enabled:db.settings.autoDark,brightness:100,contrast:100},...db.settings.darkSites[host],scrollbars:db.settings.theme==='dark'||db.settings.theme==='system'&&nativeTheme.shouldUseDarkColors}}
async function applyDark(wc,url){
 const compatible=googleHost(url),dark=!compatible&&darkConfig(url).enabled,network=!compatible&&(db.settings.networkDownMbps>0||db.settings.networkUpMbps>0);
 if(!dark&&!network){if(wc.debugger.isAttached())try{wc.debugger.detach()}catch{}return}
 try{if(!wc.debugger.isAttached())wc.debugger.attach('1.3');await wc.debugger.sendCommand('Emulation.setEmulatedMedia',{features:dark?[{name:'prefers-color-scheme',value:'dark'}]:[]});await wc.debugger.sendCommand('Network.enable');await wc.debugger.sendCommand('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:network&&db.settings.networkDownMbps?db.settings.networkDownMbps*125000:-1,uploadThroughput:network&&db.settings.networkUpMbps?db.settings.networkUpMbps*125000:-1});}catch(error){toast('Не удалось применить настройки сети и оформления.')}
}
app.setName('Veyra');const windowsNotifications=require('./windows-notifications.cjs');windowsNotifications.configure(app);
const {configureProfile,flushSessions}=require('./profile.cjs');const sharedProfile=configureProfile(app);
const hasInstanceLock=!app.isPackaged||app.requestSingleInstanceLock();if(!hasInstanceLock)app.exit(0);
const {recoverOversizedExtensionStorage}=require('./extension-storage.cjs');
const uBlockStorageRecovery=hasInstanceLock&&app.isPackaged?recoverOversizedExtensionStorage({userData:sharedProfile,manifestPath:path.join(process.resourcesPath,'uBlock0.chromium','manifest.json')}):[];
const localHTML=new (require('./local-html.cjs').LocalHTML)({session,net,blocked:[app.getAppPath(),path.join(__dirname,'..'),app.getPath('userData'),app.getPath('appData'),...(process.env.LOCALAPPDATA?[process.env.LOCALAPPDATA]:[])]});
const launchURL=value=>/^https?:\/\//i.test(value)?value:localHTML.url(value);
const pendingExternalURLs=[];
app.on('second-instance',(_,argv)=>{const url=argv.map(launchURL).find(Boolean);if(url){if(win)newTab(url);else pendingExternalURLs.push(url);}if(win&&!win.isDestroyed()){if(win.isMinimized())win.restore();win.show();win.focus()}});
let storageFlushRunning=false,storageFlushReady=false,exitConfirmed=false,appDialog=null;
const UI=pathToFileURL(path.join(__dirname,'index.html')).href;
const defaults={homeWidgets:[{id:'clock',kind:'clock',style:'plain'}],sidebarWidth:56,sidebarOrder:['bookmarks','history','passwords','privacy','performance','keep-awake','fake-presence'],sidebarHidden:[],networkDownMbps:0,networkUpMbps:0,externalAppPermissions:{},popupWindows:false,discordShowDomain:false,discordShowTime:true,discordInterval:60,compatibilityDomains:['google.com','youtube.com'],hideFocus:true,fakeFullscreen:true,realFullscreen:false,autoDark:false,darkSites:{},shortcuts:[],discordEnabled:false,discordAppId:'1562807114227777606',clipboardMode:'auto',colorTheme:'violet',customAccent:'#bc9ffa',wallpaper:'aurora',wallpaperDim:45,bookmarksBar:false,restoreSession:false,externalBrowser:'auto',language:'en',theme:'dark',search:'duckduckgo',trackers:true,dnt:true,thirdPartyCookies:true,httpsFirst:true,webrtc:true,autoUpdateFilters:true,siteExceptions:[],httpExceptions:[],permissions:{},ramTargetMB:2048,autoRestartHighMemory:true,highMemoryLimitMB:6144,maxBackgroundTabs:6,sleepMinutes:15,eco:true,hardwareAcceleration:true,keybindings:{switchRecent:'Alt+Backquote',newTab:'Ctrl+KeyT',closeTab:'Ctrl+KeyW',focusAddress:'Ctrl+KeyL',restoreClosed:'Ctrl+Shift+KeyT',nextTab:'Ctrl+Tab',previousTab:'Ctrl+Shift+Tab',find:'Ctrl+KeyF',downloads:'Ctrl+KeyJ',bookmarks:'Ctrl+KeyD',history:'Ctrl+KeyH',devtools:'F12',openHTML:'Ctrl+KeyO',newPrivate:'Ctrl+Shift+KeyN',tabOverview:'Ctrl+Shift+KeyA',zoomIn:'Ctrl+Shift+Equal',zoomOut:'Ctrl+Minus',zoomReset:'Ctrl+Digit0',print:'Ctrl+KeyP',reload:'Ctrl+KeyR',back:'Alt+ArrowLeft',forward:'Alt+ArrowRight',fullscreen:'F11',closePanel:'Escape',muteOthers:'Ctrl+Shift+KeyM'}};
let ublock;let win,profile,privacy,vault,selected,panel=null,seq=0,blocked=0,closing=false,pendingCredential=null,sitePermissions,externalApps,keybindingCapture=false;
let db={schema:2,settings:{...defaults},bookmarks:[],history:[]};
const directDownloads=new Map();const recentlyClosed=[];let wallpaperData='',wallpaperVersion=0;
const tabs=[],downloads=[],sessions=new Map(),contexts=new Map(),popups=new Set();let recentTabIds=[],restoreQueue=[],restoreQueueTimer=null;
const savedFormState=new Map();
let defaultPromptVisible=true,screenSharePrompt=null;
let performanceState={memoryMB:0,privateMB:0,processCount:0,cpu:0,liveTabs:0,sleepingTabs:0},runtimeAcceleration=true,highMemorySamples=0,memoryRestarting=false;
const earlyProfile=path.join(app.getPath('userData'),'profile.json');
let engineLanguage='en';try{const saved=JSON.parse(fs.readFileSync(earlyProfile,'utf8')).settings?.language;if(I18n.languages.includes(saved))engineLanguage=saved}catch{}
app.commandLine.appendSwitch('lang',engineLanguage);
try{if(JSON.parse(fs.readFileSync(earlyProfile,'utf8')).settings?.hardwareAcceleration===false){app.disableHardwareAcceleration();runtimeAcceleration=false;}}catch{}
function web(url){try{return ['http:','https:'].includes(new URL(url).protocol)}catch{return false}}
function secure(url){try{return new URL(url).protocol==='https:'}catch{return false}}
function local(url){try{return ['localhost','127.0.0.1','[::1]'].includes(new URL(url).hostname)}catch{return false}}
function origin(url){try{return new URL(url).origin}catch{return ''}}
function address(value){
 const s=String(value||'').trim();if(!s)return 'veyra://newtab';
 if(/^veyra:\/\/(newtab|settings|history|bookmarks|passwords|diagnostics|google|themes|shortcuts|compatibility|discord|dark|downloads|performance|privacy|sync|offline|widgets|widget-studio|sidebar)$/.test(s))return s;
 if(/^file:/i.test(s)||path.isAbsolute(s))return localHTML.url(s);
 if(/^https?:\/\//i.test(s)){try{return new URL(s).href}catch{return null}}
 if(/^[a-z][a-z\d+.-]*:/i.test(s)&&!/^localhost:\d+/i.test(s)&&!/^[\w.-]+:\d+/.test(s))return null;
 if(!/\s/.test(s)&&/^(localhost(?::\d+)?|(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?|(?:[\p{L}\d-]+\.)+[\p{L}\d-]{2,}(?::\d+)?)(?:[/?#].*)?$/u.test(s)){
  try{return new URL((/^(localhost|127\.)/.test(s)?'http://':'https://')+s).href}catch{return null}
 }
 return (db.settings.search==='google'?'https://www.google.com/search?q=':'https://duckduckgo.com/?q=')+encodeURIComponent(s);
}
const tr=message=>I18n.translate(String(message),db.settings.language);
function toast(message){if(win&&!win.isDestroyed())win.webContents.send('veyra:toast',tr(message))}
function canEncryptFormState(){if(!safeStorage.isEncryptionAvailable())return false;if(process.platform==='linux'&&typeof safeStorage.getSelectedStorageBackend==='function')return ['gnome_libsecret','kwallet5','kwallet6'].includes(safeStorage.getSelectedStorageBackend());return true}
function save(){if(db.settings.restoreSession){const eligible=tabs.filter(t=>t.mode!=='temporary'&&web(t.url)&&!t.googleBlocked);db.lastSession=SessionState.serialize(eligible,selected);if(canEncryptFormState()){const forms=[];for(const t of eligible){const state=savedFormState.get(t.sessionId);if(state&&state.url===SessionState.normalizePageURL(t.url))forms.push(state)}if(forms.length){try{db.lastSession.formsEncrypted=safeStorage.encryptString(JSON.stringify(forms)).toString('base64')}catch{}}}}else{delete db.lastSession;savedFormState.clear()}try{fs.writeFileSync(profile+'.tmp',JSON.stringify(db,null,2));fs.renameSync(profile+'.tmp',profile)}catch(error){toast('Не удалось сохранить профиль: '+error.message)}}
function active(){return tabs.find(t=>t.id===selected)}
function snapshot(){return {
 tabs:tabs.map(({id,url,title,favicon,loading,error,mode,sleeping,dirty,pinned,keepAwake,fakePresence,blocked,googleBlocked,reader,zoomLevel,muted,audible,navEntries,navIndex})=>({id,url,title,favicon,loading,error,mode,sleeping,dirty,pinned,keepAwake,fakePresence,blocked,googleBlocked,reader,zoomLevel,muted,audible,compatibility:googleHost(url),canGoBack:navIndex>0,canGoForward:navIndex<navEntries.length-1})),selected,panel,blocked,defaultPromptVisible,
 gameBest:active()?.mode==='temporary'?0:(db.gameBest||0),sync:sync.status(),discordStatus:discord?.status,closedTabs:recentlyClosed.length,wallpaperVersion,browsers:external.installedBrowsers().map(({id,name,chromium})=>({id,name,chromium})),fullscreen:!!win?.isFullScreen(),settings:db.settings,bookmarks:db.bookmarks,history:db.history.slice(0,500),recentSearches:active()?.mode==='temporary'?[]:(db.recentSearches||[]),
 downloads:downloads.map(({id,name,status,received,total,limitMbps,mode})=>({id,name,status,received,total,limitMbps,mode})),
 vault:vault?.status(),pendingCredential:pendingCredential?{origin:pendingCredential.origin,username:pendingCredential.username}:null,
 appDialog:appDialog?appDialog.public:null,clipboardPrompt:clipboardPrompt?{id:clipboardPrompt.id,origin:clipboardPrompt.origin,preview:clipboardPrompt.preview,length:clipboardPrompt.length}:null,clipboardReadPrompt:clipboardReadPrompt?{id:clipboardReadPrompt.id,origin:clipboardReadPrompt.origin}:null,permission:sitePermissions?.snapshot()||null,screenSharePrompt:screenSharePrompt?{id:screenSharePrompt.id,origin:screenSharePrompt.origin,audioAvailable:screenSharePrompt.audioAvailable,sources:screenSharePrompt.sources}:null,externalAppRequest:externalApps?.snapshot()||null,
 filters:privacy?.status(),performance:performanceState,runtimeAcceleration,version:require('../package.json').displayVersion||app.getVersion()
}}
function emit(){discord?.protectContext();if(win&&!win.isDestroyed()&&!closing)win.webContents.send('veyra:state',snapshot())}
function broadcastCompatibility(){const value={hideFocus:db.settings.hideFocus===true,fakeFullscreen:db.settings.fakeFullscreen===true,realFullscreen:db.settings.realFullscreen===true};for(const {wc} of contexts.values()){if(wc.isDestroyed())continue;try{const frames=[],visit=frame=>{if(!frame)return;frames.push(frame);for(const child of frame.frames||[])visit(child)};visit(wc.mainFrame);if(frames.length)for(const frame of frames)frame.send('veyra:compatibility-settings',value);else wc.send('veyra:compatibility-settings',value)}catch{try{wc.send('veyra:compatibility-settings',value)}catch{}}}}
function layout(){
 if(!win||win.isDestroyed())return;const [w,h]=win.getContentSize(),top=win.isFullScreen()?0:94+(db.settings.bookmarksBar?32:0)+(defaultPromptVisible?44:0),left=win.isFullScreen()?0:db.settings.sidebarWidth;
 const side=panel?Math.min(380,Math.floor(w*.47)):0;
 for(const t of tabs)if(t.view&&!t.view.webContents.isDestroyed()){
  t.view.setVisible(t.id===selected&&(web(t.url)||t.url.startsWith('file:')||t.url==='about:blank')&&!t.error&&!t.googleBlocked&&!t.reader&&!clipboardPrompt&&!clipboardReadPrompt&&!screenSharePrompt&&!appDialog&&!sitePermissions?.pending&&!externalApps?.pending);
  t.view.setBounds({x:left,y:top,width:Math.max(100,w-left-side),height:Math.max(100,h-top)});
 }
}
function setPanel(value){panel=panel===value?null:value;layout();emit();win?.webContents.focus()}
function permitted(wc,url,p,details){if(p==='clipboard-read')return false;if(p==='clipboard-sanitized-write')return secure(url)&&db.settings.clipboardMode==='auto';if(p==='fullscreen')return !!contexts.get(wc?.id)&&(db.settings.fakeFullscreen||db.settings.realFullscreen);return sitePermissions.check(wc,p,url,details)}
function askPermission(wc,p,callback,details){
 if(externalApps?.pending)return callback(false);
 if(p==='clipboard-read')return callback(false);if(p==='clipboard-sanitized-write')return callback(!!wc&&secure(wc.getURL())&&db.settings.clipboardMode==='auto');
 if(p==='fullscreen'){
  const url=details?.requestingUrl||wc?.getURL()||'',page=contexts.get(wc?.id),requestOrigin=origin(url);
  if(!page||!requestOrigin||!web(url))return callback(false);
  if(db.settings.fakeFullscreen)return callback(true);
  if(!db.settings.realFullscreen)return callback(false);
  requestAppDialog({type:'confirm',title:'Разрешить полноэкранный режим?',origin:requestOrigin,message:'Сайт запрашивает настоящий полноэкранный режим. Разрешить его для этого запроса?'},wc).then(result=>callback(result===true));
  return;
 }
 return sitePermissions.request(wc,p,callback,details);
}
async function requestDisplaySource(wc,request){
 const context=contexts.get(wc?.id),frame=request?.frame,url=frame?.url||'';
 if(!context||context.tab?.id!==selected||!web(url)||!secure(url)||origin(url)!==origin(wc.getURL())||frame!==wc.mainFrame||!request.userGesture||screenSharePrompt)return null;
 let sources;try{sources=await desktopCapturer.getSources({types:['screen','window'],thumbnailSize:{width:160,height:90},fetchWindowIcons:false})}catch{return null}
 if(wc.isDestroyed()||context.tab?.id!==selected||origin(wc.getURL())!==origin(url))return null;
 sources=sources.slice(0,16);if(!sources.length)return null;
 return new Promise(resolve=>{
  const id=crypto.randomUUID();let timer;const cancel=()=>finish(null);const finish=value=>{if(screenSharePrompt?.id!==id)return;clearTimeout(timer);wc.removeListener('did-start-navigation',cancel);wc.removeListener('destroyed',cancel);const selectedSource=sources.find(s=>s.id===value?.id)||null;screenSharePrompt=null;layout();emit();resolve(selectedSource?{source:selectedSource,audio:process.platform==='win32'&&request.audioRequested&&value.audio===true}:null);if(!wc.isDestroyed())wc.focus()};
  screenSharePrompt={id,origin:origin(url),audioAvailable:process.platform==='win32'&&request.audioRequested===true,sources:sources.map(s=>({id:s.id,name:s.name.slice(0,180),thumbnail:s.thumbnail.toDataURL()})),finish};wc.once('did-start-navigation',cancel);wc.once('destroyed',cancel);timer=setTimeout(cancel,60000);layout();emit();win?.webContents.focus();
 });
}
function sessionFor(mode){
 if(sessions.has(mode))return sessions.get(mode);
 const ses=session.fromPartition(mode==='temporary'?'veyra-temporary':mode==='google'?'persist:veyra-google-native':'persist:veyra');
 if(mode!=='google')ses.setUserAgent(ses.getUserAgent().replace(/\sElectron\/[^\s]+/g,'').replace(/\sveyra\/[^\s]+/gi,''));
 ses.setPermissionCheckHandler((wc,p,requestingOrigin,details)=>permitted(wc,requestingOrigin||wc?.getURL(),p,details));
 ses.setPermissionRequestHandler(askPermission);
 ses.setDisplayMediaRequestHandler(async(request,callback)=>{const wc=request.frame?.hostWebContents;if(!wc||request.audioRequested&&!request.videoRequested){callback(null);return}const choice=await requestDisplaySource(wc,request);if(!choice||wc.isDestroyed()||contexts.get(wc.id)?.tab?.id!==selected){callback(null);return}callback({video:choice.source,...(choice.audio?{audio:'loopback'}:{})});});
 ses.setDevicePermissionHandler(()=>false);
 const topURL=d=>{const context=contexts.get(d.webContentsId);return context?.wc&&!context.wc.isDestroyed()?context.wc.getURL():d.referrer||''};
 const filterPage=d=>contexts.has(d.webContentsId);
 const headerObject=list=>{const out=Object.create(null);for(const h of list||[])if(typeof h.name==='string'&&typeof h.value==='string'&&!/[\r\n]/.test(h.name+h.value)){if(out[h.name])out[h.name].push(h.value);else out[h.name]=[h.value]}return out};
 ses.webRequest.onBeforeRequest(async(d,cb)=>{
  if(d.resourceType==='mainFrame'&&db.settings.httpsFirst&&d.url.startsWith('http:')&&!local(d.url)&&!db.settings.httpExceptions.includes(origin(d.url))){const c=contexts.get(d.webContentsId);if(c?.tab)c.tab.httpFallback=d.url;return cb({redirectURL:'https:'+d.url.slice(5)})}
  const result=filterPage(d)?await ublock.dispatch(ses,'onBeforeRequest',d,topURL(d)):{};
  if(mode==='temporary'&&result.redirectUrl?.startsWith('chrome-extension:')){result.cancel=true;delete result.redirectUrl}if(result.cancel||result.redirectUrl){blocked++;const t=contexts.get(d.webContentsId)?.tab;if(t)t.blocked++;scheduleEmit()}
  cb({cancel:result.cancel===true,...(typeof result.redirectUrl==='string'&&/^(https?:|chrome-extension:)/.test(result.redirectUrl)?{redirectURL:result.redirectUrl}:{})});
 });
 ses.webRequest.onBeforeSendHeaders(async(d,cb)=>{
  let headers={...d.requestHeaders};const source=topURL(d),compatible=compatibleRequest(d,source);
  if(compatible){for(const k of Object.keys(headers))if(['dnt','sec-gpc'].includes(k.toLowerCase()))delete headers[k];}
  if(!compatible&&db.settings.dnt){headers.DNT='1';headers['Sec-GPC']='1'}
  if(!compatible&&db.settings.thirdPartyCookies&&privacy.thirdParty(d,source))for(const k of Object.keys(headers))if(k.toLowerCase()==='cookie')delete headers[k];
  const result=filterPage(d)?await ublock.dispatch(ses,'onBeforeSendHeaders',{...d,requestHeaders:headers},source):{};
  if(Array.isArray(result.requestHeaders))headers=Object.fromEntries(Object.entries(headerObject(result.requestHeaders)).map(([k,v])=>[k,v.join('; ')]));
  if(d.resourceType==='mainFrame'){const context=contexts.get(d.webContentsId);if(context?.tab)context.tab.requestHeaders=Object.fromEntries(Object.entries(headers).filter(([k])=>/^(user-agent|sec-ch-ua.*|accept-language|dnt|sec-gpc)$/i.test(k)))}
  cb({cancel:result.cancel===true,requestHeaders:headers});
 });
 ses.webRequest.onHeadersReceived(async(d,cb)=>{
  const result=filterPage(d)?await ublock.dispatch(ses,'onHeadersReceived',d,topURL(d)):{};
  const headers=Array.isArray(result.responseHeaders)?headerObject(result.responseHeaders):{...d.responseHeaders};
  if(!compatibleRequest(d,topURL(d))&&db.settings.thirdPartyCookies&&privacy.thirdParty(d,topURL(d)))for(const k of Object.keys(headers))if(k.toLowerCase()==='set-cookie')delete headers[k];
  cb({cancel:result.cancel===true,responseHeaders:headers});
 });
 for(const [native,event]of [['onSendHeaders','onSendHeaders'],['onResponseStarted','onResponseStarted'],['onBeforeRedirect','onBeforeRedirect'],['onCompleted','onCompleted'],['onErrorOccurred','onErrorOccurred']])ses.webRequest[native](d=>{if(filterPage(d))void ublock.dispatch(ses,event,d,topURL(d))});
 ses.on('will-download',(_,item,downloadWC)=>{
  const request=directDownloads.get(downloadWC?.id),direct=!!request&&Date.now()-request.time<10000&&item.getURLChain().includes(request.url);if(direct)directDownloads.delete(downloadWC.id);
  const d={id:crypto.randomUUID(),name:item.getFilename(),received:0,total:item.getTotalBytes(),status:'progress',mode,direct,compatible:googleHost(contexts.get(downloadWC?.id)?.policyURL||downloadWC?.getURL()||''),limitMbps:googleHost(contexts.get(downloadWC?.id)?.policyURL||downloadWC?.getURL()||'')||direct?0:db.settings.networkDownMbps};downloads.unshift(d);item.setSaveDialogOptions({title:tr('Сохранить файл')});
  item.on('updated',()=>{d.received=item.getReceivedBytes();d.total=item.getTotalBytes();scheduleEmit()});
  item.once('done',(_,status)=>{d.status=status;d.path=item.getSavePath();emit();if(status==='completed')toast('Загружено: '+d.name)});emit();
 });
 sessions.set(mode,ses);return ses;
}
async function refreshSiteIcon(url,mode='private'){
 try{return await require('./favicon.cjs').siteIcon(sessionFor(mode),url,nativeImage)}catch{return ''}
}
async function hydrateShortcutIcons(){
 for(const item of db.settings.shortcuts||[]){
  if(item.image||item.favicon||!web(item.url))continue;
  const favicon=await refreshSiteIcon(item.url);
  if(favicon&&!item.image){item.favicon=favicon;save();emit()}
 }
}
let emitTimer;
function scheduleEmit(){if(!emitTimer)emitTimer=setTimeout(()=>{emitTimer=null;emit()},150)}
function applyWebRTC(wc){if(typeof wc.setWebRTCIPHandlingPolicy==='function')wc.setWebRTCIPHandlingPolicy(db.settings.webrtc?'disable_non_proxied_udp':'default')}
function attachPage(wc,mode,tab=null,initialURL=''){
 const attachedView=tab?.view;sitePermissions.bind(wc);externalApps.bind(wc);
 wc.on('before-input-event',(event,input)=>shortcuts(event,input,wc));
 contexts.set(wc.id,{wc,mode,tab});applySitePolicy(wc,initialURL||tab?.url||wc.getURL());applyWebRTC(wc);tab?.view?.setBackgroundColor('#121418');wc.on('did-start-navigation',(_,url,inPlace,main)=>{if(main&&!inPlace&&web(url)){applySitePolicy(wc,url);void applyDark(wc,url)}});
 wc.on('destroyed',()=>{contexts.delete(wc.id);if(tab&&tabs.includes(tab)&&tab.view===attachedView){if(win&&!win.isDestroyed())win.contentView.removeChildView(attachedView);tab.view=null;tab.dirty=false;if(!closing)void closeTab(tab.id)}});
 const guard=(e,url)=>{if(url.startsWith('file:')){if(mode==='local'&&localHTML.url(url)&&localHTML.allowed(wc.session,url))return;e.preventDefault();return;}if(externalURL(url)){e.preventDefault();void externalApps.request(wc,url,wc.getURL());return;}if(web(url))applySitePolicy(wc,url);if(!web(url)){e.preventDefault();toast('Поддерживаются HTTP и HTTPS ссылки.');return}if(tab&&!tab.openerTabId&&tab.mode!=='temporary'&&googleHost(url)!==(tab.mode==='google')){e.preventDefault();void navigate(tab,url,tab.pendingNavigation?'replace':'push')}};
 wc.on('will-frame-navigate',event=>{
  if(event.url.startsWith('file:')&&mode==='local'&&localHTML.allowed(wc.session,event.url))return;
  if(web(event.url)||/^(about|data|blob|javascript|chrome-extension):/i.test(event.url))return;event.preventDefault();if(!externalURL(event.url))return;
  let frame=event.initiator||event.frame,source='';for(let depth=0;frame&&depth<16;depth++,frame=frame.parent){if(web(frame.url)){source=frame.url;break;}if(!['about:blank','about:srcdoc',''].includes(frame.url))break;}
  if(!source&&event.isMainFrame!==false)source=wc.getURL();if(source)void externalApps.request(wc,event.url,source);
 });
 wc.on('will-navigate',guard);wc.on('will-redirect',guard);
 wc.setWindowOpenHandler(details=>{
  const {url}=details;if(url.startsWith('file:')&&mode==='local'&&localHTML.allowed(wc.session,url)&&localHTML.url(url)){newTab(url,'local');return {action:'deny'};}
  if(externalURL(url)){void externalApps.request(wc,url,details.referrer?.url||wc.getURL());return {action:'deny'};}
  if(popups.size+tabs.filter(t=>t.openerTabId).length>=8){toast('Достигнут предел открытых дополнительных окон.');return {action:'deny'}}
  if(!web(url)&&url!=='about:blank')return {action:'deny'};
  if(!require('./popup-policy.cjs').separateWindow(details,db.settings.popupWindows))return {action:'allow',overrideBrowserWindowOptions:{webPreferences:{disableDialogs:true,session:wc.session,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}},createWindow:options=>{
   const openerId=tab?.id||selected,t=newTab('veyra://newtab',mode);t.openerTabId=openerId;t.url=url;t.loading=true;makeView(t,options);
   if(!options.webContents)void t.view.webContents.loadURL(url);
   layout();emit();return t.view.webContents;
  }};
  return {action:'allow',overrideBrowserWindowOptions:{width:1000,height:760,parent:win,autoHideMenuBar:true,backgroundColor:'#141419',webPreferences:{disableDialogs:true,session:wc.session,preload:path.join(__dirname,'page-preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}}};
 });
 wc.on('did-create-window',(child,details)=>{
  popups.add(child);attachPage(child.webContents,mode,null,details.url);child.setMenu(null);
  const title=()=>{if(!child.isDestroyed())child.setTitle('Veyra · '+(origin(child.webContents.getURL())||'Окно входа')+' · '+tr(googleHost(child.webContents.getURL())?'Совместимость сайта':'Защита сайта'))};
  child.webContents.on('page-title-updated',e=>{e.preventDefault();title()});child.webContents.on('did-navigate',title);
  child.on('closed',()=>popups.delete(child));
 });
 if(tab){
  wc.on('close',()=>{if(!closing&&tab.openerTabId&&tabs.includes(tab)){tab.dirty=false;void closeTab(tab.id)}});
  wc.on('did-start-loading',()=>{tab.loading=true;tab.error=null;emit()});
  wc.on('did-stop-loading',()=>{tab.loading=false;emit()});
  wc.on('did-navigate',(_,url)=>{if(url==='about:blank')return;applySitePolicy(wc,url);if(web(tab.url)&&new URL(tab.url).hostname!=='accounts.google.com')tab.serviceURL=tab.url;commitNavigation(tab,url,wc);tab.url=url;tab.error=null;tab.dirty=false;tab.reader=null;tab.googleBlocked=isGoogleRejected(url);layout();emit()});
  wc.on('media-started-playing',()=>{tab.audible=true;emit()});wc.on('media-paused',()=>{tab.audible=wc.isCurrentlyAudible();emit()});
  wc.on('found-in-page',(_,result)=>{tab.findResult=result;win.webContents.send('veyra:find-result',{matches:result.matches,active:result.activeMatchOrdinal})});
  wc.on('did-navigate-in-page',(_,url,main)=>{if(main){commitNavigation(tab,url,wc);tab.url=url;emit()}});
  wc.on('page-title-updated',(_,title)=>{tab.title=title||'Без названия';emit()});
  wc.on('did-start-navigation',(_,url,inPlace,main)=>{if(main&&!inPlace){tab.favicon='';tab.iconRequest=(tab.iconRequest||0)+1}});
  wc.on('page-favicon-updated',async(_,urls)=>{
   const pageURL=wc.getURL(),request=tab.iconRequest=(tab.iconRequest||0)+1;
   if(!web(pageURL))return;
   const image=await require('./favicon.cjs').pageIcon(wc,urls,pageURL,nativeImage);
   if(!wc.isDestroyed()&&wc.getURL()===pageURL&&request===tab.iconRequest){tab.favicon=image;let changed=false;for(const item of db.settings.shortcuts)if(!item.image&&origin(item.url)===origin(pageURL)&&image&&item.favicon!==image){item.favicon=image;changed=true}if(changed)save();emit()}
  });
  wc.on('did-finish-load',()=>{
   if(!web(tab.url))return;tab.title=wc.getTitle()||new URL(tab.url).hostname;
   if(!tab.favicon){const iconRequest=tab.iconRequest;void refreshSiteIcon(tab.url,mode).then(image=>{if(image&&!wc.isDestroyed()&&wc.getURL()===tab.url&&tab.iconRequest===iconRequest){tab.favicon=image;for(const item of db.settings.shortcuts)if(!item.image&&origin(item.url)===origin(tab.url))item.favicon=image;save();emit()}})}
   if(mode!=='temporary'){db.history=db.history.filter(x=>x.url!==tab.url);db.history.unshift({url:tab.url,title:tab.title,time:Date.now()});db.history=db.history.slice(0,1000);save()}emit();
  });
  wc.on('did-fail-load',(_,code,description,url,main)=>{if(main&&code!==-3){tab.loading=false;tab.error=description;layout();emit()}});
  wc.on('render-process-gone',()=>{if(!closing&&tabs.includes(tab)){tab.loading=false;tab.error='Процесс вкладки остановился. Обнови страницу.';layout();emit()}});
 }
 wc.on('context-menu',(_,p)=>{
  const {buildPageMenu}=require('./context-menu.cjs');
  const items=buildPageMenu(wc,p,{open:url=>newTab(url,mode),back:()=>tab?back():wc.navigationHistory.goBack(),forward:()=>tab?forward():wc.navigationHistory.goForward(),copyText:text=>clipboard.writeText(text),openExternal:url=>{void externalApps.request(wc,url,p.frameURL||wc.getURL())},download:url=>{directDownloads.set(wc.id,{url,time:Date.now()});wc.downloadURL(url)},translate:tr});
  const extensionItems=ublock?.menu(wc,p)||[];if(extensionItems.length)items.push({type:'separator'},...extensionItems);Menu.buildFromTemplate(items).popup({window:BrowserWindow.fromWebContents(wc)||win});
 });
}
function makeView(t,options={}){
 // Keep Chromium's background timer/animation throttling enabled for every tab.
 // "Keep awake" only prevents Veyra's tab-sleep lifecycle from discarding the page;
 // disabling Chromium throttling here lets hidden pages run unbounded background work.
 t.view=new WebContentsView({...(options.webContents?{webContents:options.webContents}:{}),webPreferences:{...options.webPreferences,disableDialogs:true,session:t.mode==='local'?localHTML.sessionFor(t.url):sessionFor(t.mode),preload:t.mode==='local'?undefined:path.join(__dirname,'page-preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,spellcheck:true,backgroundThrottling:true}});
 win.contentView.addChildView(t.view);attachPage(t.view.webContents,t.mode,t);ublock?.addTab(t.view.webContents,win);t.view.webContents.setZoomLevel(t.zoomLevel||0);t.view.webContents.setAudioMuted(!!t.muted);t.sleeping=false;layout();
}
function removeView(t){const v=t.view;t.view=null;if(!v)return;if(win&&!win.isDestroyed())win.contentView.removeChildView(v);const wc=v.webContents;if(wc&&!wc.isDestroyed())wc.close()}
async function navigate(t,input,historyMode='push'){
 if(!t)return;const url=address(input);if(!url){toast('Этот адрес не поддерживается.');return}
 if(t.sessionId&&t.url!==url)savedFormState.delete(t.sessionId);
 recordNavigation(t,url,historyMode);t.pendingNavigation=true;
 if(url.startsWith('file:')&&t.mode!=='local'){removeView(t);t.mode='local'}
 if(url.startsWith('file:')&&t.view&&!localHTML.allowed(t.view.webContents.session,url)){removeView(t)}
 if(web(url)&&!t.openerTabId&&t.mode!=='temporary'){const mode=googleHost(url)?'google':'private';if(mode!==t.mode){removeView(t);t.mode=mode}}
 const generation=++t.generation;t.reader=null;t.googleBlocked=false;if(web(url)&&new URL(url).hostname!=='accounts.google.com')t.serviceURL=url;t.url=url;t.error=null;t.loading=false;t.lastActive=Date.now();panel=null;
 if(url.startsWith('veyra:')){t.favicon='';t.iconRequest=(t.iconRequest||0)+1;t.pendingNavigation=false;removeView(t);t.sleeping=false;t.title=({'veyra://widget-studio':'Конструктор виджетов','veyra://widgets':'Виджеты','veyra://sidebar':'Боковая панель','veyra://offline':'Veyra Pulse','veyra://sync':'Синхронизация','veyra://themes':'Темы и обои','veyra://shortcuts':'Ярлыки главной','veyra://compatibility':'Список совместимости','veyra://discord':'Discord Rich Presence','veyra://dark':'Auto Dark Mode','veyra://downloads':'Загрузки','veyra://performance':'Производительность','veyra://privacy':'Приватность','veyra://newtab':'Новая вкладка','veyra://history':'История','veyra://bookmarks':'Закладки','veyra://settings':'Настройки','veyra://passwords':'Пароли','veyra://diagnostics':'Диагностика','veyra://google':'Google'})[url];save();layout();emit();return}
 t.title=new URL(url).hostname;t.loading=true;emit();
 try{if(!t.view)makeView(t);if(db.settings.trackers&&t.mode!=='local'){await ublock.install(sessionFor(t.mode==='temporary'?'private':t.mode));if(!tabs.includes(t)||t.generation!==generation||!t.view)return;ublock.addTab(t.view.webContents,win);}if(!tabs.includes(t)||t.generation!==generation)return;layout();if(!t.view.webContents.getURL())await t.view.webContents.loadURL('about:blank');if(!tabs.includes(t)||t.generation!==generation||!t.view)return;t.loading=true;if(t.mode!=='local'){applySitePolicy(t.view.webContents,url);await applyDark(t.view.webContents,url);}await t.view.webContents.loadURL(url)}
 catch(error){if(tabs.includes(t)&&t.generation===generation){t.loading=false;t.error=error.message;layout();emit()}}
}
function newTab(url='veyra://newtab',mode='private',restoreOptions={}){
 externalApps?.cancel();appDialog?.finish(null);clipboardPrompt?.finish(false);clipboardReadPrompt?.finish(null);
 if(!['private','google','temporary','local'].includes(mode))mode='private';
  const t={id:++seq,sessionId:typeof restoreOptions.sessionId==='string'?restoreOptions.sessionId:crypto.randomUUID(),mode,url:'veyra://newtab',title:tr('Новая вкладка'),loading:false,error:null,generation:0,lastActive:Date.now(),sleeping:false,restoreQueuedActive:restoreOptions.restoreQueuedActive===true,dirty:false,pinned:restoreOptions.pinned===true,keepAwake:false,fakePresence:true,blocked:0,googleBlocked:false,reader:null,zoomLevel:Math.max(-3,Math.min(3,Number(restoreOptions.zoomLevel)||0)),muted:restoreOptions.muted===true,audible:false,navEntries:[],navIndex:-1,pendingNavigation:false,traversing:false};
 const previousSelected=selected;if(active())active().lastActive=++tabUseCounter;t.lastActive=++tabUseCounter;tabs.push(t);selected=t.id;markRecentTab(t.id,previousSelected);
 if(restoreOptions.sleeping===true&&web(url)){t.url=url;t.title=new URL(url).hostname;t.sleeping=true;t.pinned=restoreOptions.pinned===true;t.zoomLevel=Math.max(-3,Math.min(3,Number(restoreOptions.zoomLevel)||0));t.muted=restoreOptions.muted===true;t.navEntries=[{url}];t.navIndex=0;layout();emit();return t;}
 void navigate(t,url);layout();emit();return t;
}
let tabUseCounter=Date.now();
function markRecentTab(id,previousId=selected){recentTabIds=[id,previousId,...recentTabIds].filter((value,index,list)=>value!=null&&list.indexOf(value)===index&&tabs.some(t=>t.id===value)).slice(0,50)}
function switchRecentTab(){const t=recentTabIds.map(id=>tabs.find(x=>x.id===id)).find(x=>x&&x.id!==selected)||tabs.filter(x=>x.id!==selected).sort((a,b)=>b.lastActive-a.lastActive)[0];if(t)choose(t.id)}
function choose(id){externalApps?.cancel();appDialog?.finish(null);clipboardPrompt?.finish(false);screenSharePrompt?.finish(null);const t=tabs.find(t=>t.id===id);if(!t)return;const previousSelected=selected;if(active())active().lastActive=++tabUseCounter;selected=id;t.lastActive=++tabUseCounter;markRecentTab(id,previousSelected);if(t.restoreQueuedActive){t.restoreQueuedActive=false;restoreQueue=restoreQueue.filter(value=>value!==id)}if(t.sleeping)void navigate(t,t.url);layout();save();emit();t.view?.webContents.focus();if(t.view)ublock?.selectTab(t.view.webContents);scheduleRestoredTabs()}
async function closeTab(id){const candidate=tabs.find(t=>t.id===id);if(candidate?.dirty&&!await requestAppDialog({type:'confirm',title:'Несохранённые данные',message:'Закрыть вкладку с введёнными данными?'}))return;const i=tabs.findIndex(t=>t.id===id);if(i<0)return;const [t]=tabs.splice(i,1);restoreQueue=restoreQueue.filter(value=>value!==id);recentTabIds=recentTabIds.filter(value=>value!==id);savedFormState.delete(t.sessionId);clearTimeout(t.formSaveTimer);if(t.mode!=='temporary'){recentlyClosed.unshift({url:t.url,mode:t.mode,pinned:t.pinned,zoomLevel:t.zoomLevel||0,muted:!!t.muted});recentlyClosed.splice(20)}t.generation++;removeView(t);if(!tabs.length)newTab();else if(selected===id)choose(tabs.find(x=>x.id===t.openerTabId)?.id||tabs[Math.min(i,tabs.length-1)].id);layout();save();emit();scheduleRestoredTabs()}
function sleepTab(t,manual=false){
 const protectedRecents=tabs.slice().sort((a,b)=>b.lastActive-a.lastActive).slice(0,2);
 if(!t||t.openerTabId||t.keepAwake||protectedRecents.includes(t)||t.id===selected||!t.view||!web(t.url)||t.pinned||t.dirty||t.loading||t.view.webContents.isCurrentlyAudible()||downloads.some(d=>d.status==='progress'&&d.mode===t.mode))return false;
 removeView(t);t.sleeping=true;t.loading=false;save();emit();return true;
}
function recordNavigation(t,url,mode='push'){
 if(mode==='traverse')return;
 if(mode==='replace'||t.navEntries[t.navIndex]?.url===url){if(t.navIndex>=0)t.navEntries[t.navIndex]={url};return}
 t.navEntries.splice(t.navIndex+1);t.navEntries.push({url});if(t.navEntries.length>150)t.navEntries.shift();t.navIndex=t.navEntries.length-1;
}
function commitNavigation(t,url,wc){const nativeIndex=wc.navigationHistory.getActiveIndex();const entry=t.navEntries[t.navIndex];if(t.pendingNavigation||t.traversing||(entry?.webContentsId===wc.id&&entry?.nativeIndex===nativeIndex))recordNavigation(t,url,'replace');else recordNavigation(t,url);if(t.navIndex>=0)t.navEntries[t.navIndex]={url,webContentsId:wc.id,nativeIndex};t.pendingNavigation=false;t.traversing=false;}
function travel(step){const t=active(),index=t?.navIndex+step;if(!t||index<0||index>=t.navEntries.length)return;const entry=t.navEntries[index],wc=t.view?.webContents;t.navIndex=index;
 if(wc&&entry.webContentsId===wc.id&&Number.isInteger(entry.nativeIndex)&&entry.nativeIndex<wc.navigationHistory.length()&&wc.navigationHistory.getEntryAtIndex(entry.nativeIndex)?.url===entry.url){t.traversing=true;panel=null;wc.navigationHistory.goToIndex(entry.nativeIndex);emit()}else void navigate(t,entry.url,'traverse');
}
function back(){travel(-1)}
function forward(){travel(1)}
function reload(){const t=active();if(t&&web(t.url))void navigate(t,t.url)}
function bookmark(){const t=active();if(!t||!web(t.url))return;const i=db.bookmarks.findIndex(x=>x.url===t.url);if(i<0)db.bookmarks.unshift({id:crypto.randomUUID(),url:t.url,title:t.title,folder:'Избранное',time:Date.now()});else db.bookmarks.splice(i,1);save();emit()}
async function openHTML(){const result=await dialog.showOpenDialog(win,{title:tr('Открыть файл'),properties:['openFile','multiSelections'],filters:[{name:tr('Веб-файлы и документы'),extensions:['html','htm','xhtml','svg','xml','txt','json','pdf','png','jpg','jpeg','gif','webp','avif','bmp','ico','css','js','mjs','csv','md']},{name:tr('Все файлы'),extensions:['*']}]});if(!result.canceled)for(const file of result.filePaths){const url=localHTML.url(file);if(url)newTab(url,'local');else toast('Не удалось открыть этот тип файла.')}}
function shortcuts(e,input,target=active()?.view?.webContents){
 if(input.type!=='keyDown'||input.isAutoRepeat||keybindingCapture)return;const raw=String(input.key||'').toLowerCase(),code=String(input.code||'');const k=/^Key[A-Z]$/.test(code)?code.slice(3).toLowerCase():/^Digit[0-9]$/.test(code)?code.slice(5):({left:'arrowleft',right:'arrowright'}[raw]||raw),ctrl=(input.control||input.meta)&&!input.alt;let handled=true;
 const custom=Object.entries(db.settings.keybindings||defaults.keybindings).find(([_,combo])=>keybindingMatches(input,combo))?.[0];
 const rawBackquote=input.alt&&!input.control&&!input.meta&&!input.shift&&(['Backquote'].includes(code)||['`','~'].includes(raw));
 if(custom==='switchRecent'||(rawBackquote&&(db.settings.keybindings?.switchRecent||defaults.keybindings.switchRecent)==='Alt+Backquote'))switchRecentTab();
 else if(custom==='newTab'){newTab();win.webContents.focus()}
 else if(custom==='closeTab')closeTab(selected);
 else if(custom==='focusAddress'){win.webContents.focus();win.webContents.send('veyra:address')}
 else if(custom==='restoreClosed')restoreClosed();
 else if(custom==='nextTab'||custom==='previousTab'){if(tabs.length>1){const i=tabs.findIndex(t=>t.id===selected),step=custom==='previousTab'?-1:1;choose(tabs[(i+step+tabs.length)%tabs.length].id)}}
 else if(custom==='openHTML')void openHTML();else if(custom==='newPrivate')newTab('veyra://newtab','temporary');else if(custom==='tabOverview')setPanel('tabs');
 else if(custom==='zoomIn')changeZoom(1);else if(custom==='zoomOut')changeZoom(-1);else if(custom==='zoomReset')changeZoom(0,true);
 else if(custom==='print')active()?.view?.webContents.print();else if(custom==='reload')reload();else if(custom==='back')back();else if(custom==='forward')forward();
 else if(custom==='fullscreen'){const host=target&&BrowserWindow.fromWebContents(target)||win;if(host&&!host.isDestroyed())host.setFullScreen(!host.isFullScreen())}
 else if(custom==='closePanel'&&panel){panel=null;active()?.view?.webContents.stopFindInPage('clearSelection');layout();emit()}
 else if(custom==='muteOthers'){const mute=tabs.some(t=>t.id!==selected&&!t.muted);for(const t of tabs)if(t.id!==selected){t.muted=mute;t.view?.webContents.setAudioMuted(mute)}save();emit()}
 else if(custom==='find')setPanel('find');else if(custom==='downloads')setPanel('downloads');else if(custom==='bookmarks')setPanel('bookmarks');else if(custom==='history')setPanel('history');
 else if(custom==='devtools'){if(target&&!target.isDestroyed()){if(target.isDevToolsOpened())target.closeDevTools();else target.openDevTools({mode:'detach'});}}
 else if(ctrl&&input.shift&&k==='i'||ctrl&&input.shift&&k==='j'){if(target&&!target.isDestroyed()){if(target.isDevToolsOpened())target.closeDevTools();else target.openDevTools({mode:'detach'});}}
 else handled=false;if(handled)e.preventDefault();
}
function keybindingMatches(input,combo){if(typeof combo!=='string')return false;const parts=combo.split('+'),code=parts.pop(),mods=new Set(parts),ctrl=!!(input.control||input.meta);return input.code===code&&ctrl===mods.has('Ctrl')&&!!input.alt===mods.has('Alt')&&!!input.shift===mods.has('Shift')&&(!mods.has('Meta')||!!input.meta)}
async function diagnose(){
 const t=active(),wc=t?.view?.webContents;if(!wc||!web(t.url))throw Error('Сначала открой сайт.');
 const script=`(async()=>{
  const result={origin:location.origin,userAgent:navigator.userAgent,platform:navigator.platform,languages:navigator.languages,cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory||null,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,screen:{width:screen.width,height:screen.height,dpr:devicePixelRatio},viewport:{width:innerWidth,height:innerHeight},hidden:document.hidden,focus:document.hasFocus(),secureContext:isSecureContext};
  try{result.clientHints=await navigator.userAgentData?.getHighEntropyValues(['architecture','bitness','model','platformVersion','fullVersionList']);}catch(e){result.clientHintsError=e.name}
  try{const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl');const ext=gl?.getExtension('WEBGL_debug_renderer_info');result.webgl=gl?{vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}:null;}catch(e){result.webglError=e.name}
  try{result.worker=await new Promise(resolve=>{const blob=new Blob(['postMessage({userAgent:navigator.userAgent,platform:navigator.platform,cores:navigator.hardwareConcurrency,languages:navigator.languages})'],{type:'text/javascript'});const url=URL.createObjectURL(blob);let worker;const finish=value=>{clearTimeout(timer);worker?.terminate();URL.revokeObjectURL(url);resolve(value)};const timer=setTimeout(()=>finish({error:'timeout or site CSP'}),1500);try{worker=new Worker(url);worker.onmessage=e=>finish(e.data);worker.onerror=()=>finish({error:'Blocked by site CSP or worker policy'});}catch(e){finish({error:e.name})}});}catch(e){result.worker={error:e.name}}
  try{const canvas=document.createElement('canvas');canvas.width=240;canvas.height=60;const ctx=canvas.getContext('2d');ctx.font='17px Arial';ctx.fillStyle='#5c3cba';ctx.fillText('Veyra fingerprint diagnostic',8,32);const bytes=new TextEncoder().encode(canvas.toDataURL());result.canvasHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}catch(e){result.canvasError=e.name}
  try{const frame=document.createElement('iframe');frame.hidden=true;frame.src='about:blank';document.documentElement.appendChild(frame);const n=frame.contentWindow.navigator;result.iframe={userAgent:n.userAgent,platform:n.platform,cores:n.hardwareConcurrency,languages:[...n.languages]};frame.remove();}catch(e){result.iframe={error:e.name}}
  result.serviceWorker={available:'serviceWorker' in navigator,note:'Service workers are not installed or modified by this diagnostic.'};
  return result;
 })()`;
 const observed=await wc.executeJavaScript(script);return {mode:t.mode,siteCompatibility:googleHost(t.url),headers:t.requestHeaders||{},page:observed,protections:{networkFilters:privacy.status().ready,thirdPartyCookies:db.settings.thirdPartyCookies&&!googleHost(t.url),dnt:db.settings.dnt&&!googleHost(t.url),webrtc:db.settings.webrtc,canvasProtected:false,audioProtected:false,fontsProtected:false,ipHidden:false},note:'Диагностика выполняется на странице; её JavaScript может менять результаты. Это не сертификат анонимности.'};
}
function candidateExpired(){if(pendingCredential&&Date.now()-pendingCredential.created>120000)pendingCredential=null}
ipcMain.on('veyra:page-dirty',e=>{const c=contexts.get(e.sender.id);if(c?.tab&&e.senderFrame===e.sender.mainFrame)c.tab.dirty=true});
ipcMain.on('veyra:form-state',(e,payload)=>{
 const context=contexts.get(e.sender.id),frame=e.senderFrame,tab=context?.tab;
 if(!db.settings.restoreSession||!tab||tab.mode==='temporary'||frame!==e.sender.mainFrame||!secure(frame.url)||origin(frame.url)!==origin(e.sender.getURL()))return;
 const state=SessionState.normalizeForms(frame.url,payload?.fields);if(!state)return;
 savedFormState.set(tab.sessionId,{sessionId:tab.sessionId,...state});
 clearTimeout(tab.formSaveTimer);tab.formSaveTimer=setTimeout(()=>{if(tabs.includes(tab))save()},350);
});
ipcMain.on('veyra:form-restore',e=>{
 const context=contexts.get(e.sender.id),frame=e.senderFrame,tab=context?.tab;
 if(!db.settings.restoreSession||!tab||tab.mode==='temporary'||frame!==e.sender.mainFrame||!secure(frame.url)||origin(frame.url)!==origin(e.sender.getURL())){e.returnValue=null;return;}
 const state=savedFormState.get(tab.sessionId),url=SessionState.normalizePageURL(frame.url);
 e.returnValue=state&&state.url===url?{url:state.url,fields:state.fields}:null;
});
ipcMain.on('veyra:password-candidate',(e,payload)=>{
 const c=contexts.get(e.sender.id);if(!c||c.mode==='temporary'||e.senderFrame!==e.sender.mainFrame||!secure(e.senderFrame.url)||origin(e.senderFrame.url)!==origin(e.sender.getURL()))return;
 if(typeof payload?.username!=='string'||payload.username.length>512||typeof payload?.password!=='string'||!payload.password||payload.password.length>4096)return;
 pendingCredential={origin:origin(e.senderFrame.url),username:payload.username,password:payload.password,created:Date.now()};panel='passwords';layout();emit();
});
function requestAppDialog(value,wc=null){return new Promise(resolve=>{
 if(appDialog||clipboardPrompt||clipboardReadPrompt||externalApps?.pending)return resolve(null);const id=crypto.randomUUID();let timer;
 const cancel=()=>finish(null);const finish=result=>{if(appDialog?.public.id!==id)return;clearTimeout(timer);if(wc){wc.removeListener('did-start-navigation',cancel);wc.removeListener('destroyed',cancel)}appDialog=null;layout();emit();resolve(result)};
 appDialog={public:{id,...value},finish};if(wc){wc.once('did-start-navigation',cancel);wc.once('destroyed',cancel)}timer=setTimeout(cancel,60000);layout();emit();win?.webContents.focus();
})}
ipcMain.on('veyra:site-dialog',(e,p)=>{
 const wc=e.sender,c=contexts.get(wc.id),frame=e.senderFrame;
 if(!c||frame!==wc.mainFrame||(c.tab&&c.tab.id!==selected)||!web(frame?.url)||!['alert','confirm','prompt'].includes(p?.type)){e.returnValue=null;return}
 requestAppDialog({type:p.type,title:'Сообщение сайта',origin:origin(frame.url),message:String(p.message||'').slice(0,12000),defaultText:String(p.defaultText||'').slice(0,2000)},wc).then(value=>{e.returnValue=value});
});
function assertTrusted(e){if(!win||e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame||e.senderFrame.url!==UI)throw Error('Untrusted caller')}
ipcMain.handle('veyra:media-pick',(e,payload)=>{if(!contexts.has(e.sender.id)||e.senderFrame!==e.sender.mainFrame)return null;return sitePermissions.choose(e.sender,payload)});
ipcMain.on('veyra:native-compat',e=>{const ctx=contexts.get(e.sender.id),url=e.senderFrame?.url||e.sender.getURL();e.returnValue=!!ctx&&googleHost(ctx.policyURL||url)});
ipcMain.on('veyra:compatibility-config',e=>{e.returnValue={hideFocus:db.settings.hideFocus===true,fakeFullscreen:db.settings.fakeFullscreen===true,realFullscreen:db.settings.realFullscreen===true}});
ipcMain.on('veyra:real-fullscreen-request',e=>{const context=contexts.get(e.sender.id),wc=e.sender;if(!context||!db.settings.realFullscreen||!db.settings.fakeFullscreen||!web(wc.getURL()))return;requestAppDialog({type:'confirm',title:'Разрешить полноэкранный режим?',origin:origin(wc.getURL()),message:'Сайт запрашивает настоящий полноэкранный режим окна.'},wc).then(allow=>{if(allow&&win&&!win.isDestroyed()&&context.tab?.id===selected)win.setFullScreen(true)})});
ipcMain.on('veyra:dark-config',e=>{e.returnValue={...(contexts.has(e.sender.id)?darkConfig(contexts.get(e.sender.id)?.policyURL||e.senderFrame?.url||e.sender.getURL()):{enabled:false}),clipboardMode:db.settings.clipboardMode}});
let clipboardBusy=false,clipboardPrompt=null,clipboardReadPrompt=null;
function requestClipboard(wc,text,url){if(externalApps?.pending)return Promise.resolve(false);return new Promise(resolve=>{const id=crypto.randomUUID();const cancel=()=>finish(false);let timer;const finish=allow=>{if(clipboardPrompt?.id!==id)return;clearTimeout(timer);wc.removeListener('did-start-navigation',cancel);wc.removeListener('destroyed',cancel);clipboardPrompt=null;layout();emit();resolve(!!allow);if(!wc.isDestroyed())wc.focus()};clipboardPrompt={id,origin:origin(url),preview:text.slice(0,12000),length:text.length,finish};wc.once('did-start-navigation',cancel);wc.once('destroyed',cancel);timer=setTimeout(cancel,45000);layout();emit();win.webContents.focus()})}

ipcMain.handle('veyra:clipboard-write',async(e,text)=>{const wc=e.sender,frame=e.senderFrame,url=frame?.url;if(!contexts.has(wc.id)||(contexts.get(wc.id).tab&&contexts.get(wc.id).tab.id!==selected)||frame!==wc.mainFrame||!secure(url)||origin(url)!==origin(wc.getURL())||typeof text!=='string'||text.length>1000000||clipboardBusy)throw Error('Clipboard write unavailable');const initial=url;clipboardBusy=true;try{if(db.settings.clipboardMode==='ask'){if(!await requestClipboard(wc,text,url))throw Error('Clipboard write declined')}if(wc.isDestroyed()||frame.url!==initial)throw Error('Page changed');clipboard.writeText(text);return true}finally{clipboardBusy=false}});
function requestClipboardRead(wc,url){if(appDialog||clipboardPrompt||clipboardReadPrompt||externalApps?.pending)return Promise.resolve(null);return new Promise(resolve=>{const id=crypto.randomUUID();let timer;const cancel=()=>finish(null);const finish=text=>{if(clipboardReadPrompt?.id!==id)return;clearTimeout(timer);wc.removeListener('did-start-navigation',cancel);wc.removeListener('destroyed',cancel);clipboardReadPrompt=null;layout();emit();resolve(typeof text==='string'?text:null);if(!wc.isDestroyed())wc.focus()};clipboardReadPrompt={id,origin:origin(url),finish};wc.once('did-start-navigation',cancel);wc.once('destroyed',cancel);timer=setTimeout(cancel,60000);layout();emit();win?.webContents.focus()})}
ipcMain.handle('veyra:clipboard-read',async e=>{const wc=e.sender,frame=e.senderFrame,url=frame?.url,ctx=contexts.get(wc.id);if(!ctx||frame!==wc.mainFrame||(ctx.tab&&ctx.tab.id!==selected)||!secure(url)||origin(url)!==origin(wc.getURL()))throw Error('Clipboard read unavailable');const text=await requestClipboardRead(wc,url);if(typeof text!=='string')throw Error('Clipboard read declined');return text});
ipcMain.handle('veyra:command',async(e,action,payload)=>{
 try{
 assertTrusted(e);candidateExpired();
 switch(action){
 case 'state':return snapshot();
 case 'open-html':await openHTML();return true;
 case 'open-local-files':if(Array.isArray(payload))for(const value of payload.slice(0,12)){const url=localHTML.url(value);if(url)newTab(url,'local')}return true;
 case 'game-record':if(active()?.mode!=='temporary'&&Number.isSafeInteger(payload)&&payload>0&&payload<=1000000000){db.gameBest=Math.max(db.gameBest||0,payload);save()}return true;
 case 'external-app-response':return externalApps.respond(payload);
 case 'external-apps-reset':externalApps.reset(typeof payload==='string'?payload:undefined);toast('Разрешения приложений сброшены.');return true;
 case 'copy-clean-link':{const result=require('./clean-link.cjs').cleanLink(active()?.url);clipboard.writeText(result.url);toast(result.removed?'Чистая ссылка скопирована.':'Ссылка скопирована.');return result;}
 case 'app-dialog-response':if(appDialog?.public.id===payload?.id)appDialog.finish(payload.allow===true?(appDialog.public.type==='prompt'?String(payload.text||'').slice(0,10000):true):null);return true;
 case 'dismiss-default-prompt':defaultPromptVisible=false;layout();emit();return true;
 case 'default-browser':await require('./default-browser.cjs').register(app);await shell.openExternal('ms-settings:defaultapps?registeredAppUser=Veyra');return true;
 case 'update-check':{const manifest=await require('./updates.cjs').check();checkedUpdate=manifest;const installed=require('../package.json').version.split('.').map(x=>parseInt(x,10)),next=manifest.version.split('.').map(x=>parseInt(x,10));let newer=false;for(let i=0;i<3;i++){if(next[i]!==installed[i]){newer=next[i]>installed[i];break}}return {version:manifest.displayVersion||manifest.version,newer}}
 case 'update-download':{if(!checkedUpdate||updateDownloading)throw Error('Сначала проверь обновления.');updateDownloading=true;try{const result=await dialog.showSaveDialog(win,{title:tr('Сохранить обновление'),defaultPath:'Veyra-'+checkedUpdate.version+'-Windows.zip',filters:[{name:'ZIP',extensions:['zip']}]});if(result.canceled||!result.filePath)return false;await require('./updates.cjs').download(checkedUpdate,result.filePath);shell.showItemInFolder(result.filePath);return true}finally{updateDownloading=false}}

 case 'widget-list':return sync.request('widget-list',{},!!sync.auth);
 case 'widget-get':return sync.request('widget-get',{id:payload?.id},!!sync.auth);
 case 'widget-preview':return widgetRuntime.openPreview(payload,db.settings.language);
 case 'widget-open':{const widget=(db.settings.homeWidgets||[]).find(w=>w.id===payload);if(!widget||widget.kind!=='custom'||!widget.package)throw Error('Widget is not installed');return widgetRuntime.openInstalled(widget.package,db.settings.language,widget.id)}
 case 'widget-release':return widgetRuntime.release(payload);
 case 'widget-draft-get':return db.widgetDraft||null;
 case 'widget-draft-save':db.widgetDraft=require('./widget-package.js').normalize(payload);save();return true;
 case 'widget-import':{const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Veyra Widget',extensions:['veyrawidget','json']}]});if(result.canceled)return null;const file=result.filePaths[0];if(fs.statSync(file).size>180000)throw Error('Файл виджета слишком большой.');return require('./widget-package.js').normalize(JSON.parse(fs.readFileSync(file,'utf8')))}
 case 'widget-export':{const value=require('./widget-package.js').normalize(payload);const result=await dialog.showSaveDialog(win,{defaultPath:'widget.veyrawidget',filters:[{name:'Veyra Widget',extensions:['veyrawidget']}]});if(result.canceled)return false;fs.writeFileSync(result.filePath,JSON.stringify(value),'utf8');return true}
 case 'widget-publish':{const template=require('./widgets.js').template(payload?.template);return sync.request('widget-publish',{title:String(payload?.title||'').slice(0,60),description:String(payload?.description||'').slice(0,240),public_author:payload?.public_author==='profile'?'profile':'',template},true)}
 case 'widget-delete':return sync.request('widget-delete',{id:payload?.id},true);
 case 'account-profile':return sync.request('profile',{},true);
 case 'account-recovery-save':{if(!Array.isArray(payload)||payload.length!==10||payload.some(x=>typeof x!=='string'||!/^([A-F0-9]{5}-){3}[A-F0-9]{5}$/.test(x)))throw Error('Invalid recovery codes');const result=await dialog.showSaveDialog(win,{defaultPath:'Veyra-recovery-codes.txt',filters:[{name:'Text',extensions:['txt']}]});if(result.canceled)return false;fs.writeFileSync(result.filePath,'Veyra recovery codes\n\n'+payload.join('\n')+'\n','utf8');return true}
 case 'account-profile-save':return sync.request('profile-save',{display_name:payload?.display_name,device_name:payload?.device_name,...(typeof payload?.avatar==='string'?{avatar:payload.avatar}:{}),platform:'windows'},true);
 case 'account-avatar-pick':{const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:tr('Изображение'),extensions:['png','jpg','jpeg','webp']}]});if(result.canceled)return null;const file=result.filePaths[0];if(fs.statSync(file).size>10000000)throw Error('Изображение слишком большое.');const image=nativeImage.createFromPath(file);if(image.isEmpty())throw Error('Не удалось прочитать изображение.');const size=image.getSize(),edge=Math.min(size.width,size.height);const cropped=image.crop({x:Math.floor((size.width-edge)/2),y:Math.floor((size.height-edge)/2),width:edge,height:edge});let png=cropped.resize({width:128,height:128}).toPNG();if(png.length>65000)png=cropped.resize({width:96,height:96}).toPNG();if(png.length>65000)throw Error('Изображение слишком большое.');return 'data:image/png;base64,'+png.toString('base64')}
 case 'account-mfa':{if(!['mfa-status','mfa-begin','mfa-confirm','mfa-disable','mfa-recovery'].includes(payload?.operation))throw Error('Invalid operation');const result=await sync.request(payload.operation,{currentPassword:payload.currentPassword,mfa_code:payload.mfa_code},true);if(result?.secret){const uri='otpauth://totp/'+encodeURIComponent('Veyra:'+result.email)+'?secret='+result.secret+'&issuer=Veyra&algorithm=SHA1&digits=6&period=30';result.qr=await require('qrcode').toDataURL(uri,{width:240,margin:3,errorCorrectionLevel:'M'})}return result}
 case 'account-session-revoke':return sync.request('session-revoke',{id:payload?.id},true);
 case 'sync-copy-delete':return sync.request('sync-delete',{device_id:payload?.device_id},true);
 case 'sync-copies':return (await sync.rows()).map(({device_id,platform,updated_at})=>({device_id,platform,updated_at}));
 case 'sync-login':case 'sync-signup':{const result=await sync.login(payload?.email,payload?.password,action==='sync-signup',payload?.mfa_code);emit();return result}
 case 'sync-verify':{const result=await sync.verify(payload?.email,payload?.code,payload?.password,payload?.mfa_code);emit();return result}
 case 'sync-reset-request':return sync.resetRequest(payload?.email);
 case 'sync-reset':{const result=await sync.reset(payload?.email,payload?.code,payload?.password,payload?.mfa_code);emit();return result}
 case 'sync-password':{const result=await sync.changePassword(payload?.currentPassword,payload?.password,payload?.mfa_code);emit();return result}
 case 'sync-delete':if(!await requestAppDialog({type:'confirm',title:'Удалить аккаунт?',message:'Аккаунт и облачные копии закладок будут удалены без возможности восстановления.'}))return false;const result=await sync.deleteAccount(payload?.currentPassword,payload?.mfa_code);emit();return result;
 case 'sync-logout-all':await sync.logout(true);emit();return true;
 case 'sync-logout':await sync.logout();emit();return true;
 case 'sync-push':{
  if(sync.busy)throw Error('Синхронизация уже выполняется.');sync.busy=true;emit();
  try{const file=path.join(sharedProfile,'sync-device-id');let id;try{id=fs.readFileSync(file,'utf8')}catch{}if(!/^[0-9a-f-]{36}$/.test(id||'')){id=crypto.randomUUID();fs.writeFileSync(file,id)}
   await sync.upload(id,'windows',{v:1,bookmarks:db.bookmarks.map(({url,title})=>({url,title}))},payload?.passphrase);return true;
  }finally{sync.busy=false;emit()}
 }
 case 'sync-pull':{
  if(sync.busy)throw Error('Синхронизация уже выполняется.');sync.busy=true;emit();
  try{const rows=await sync.rows();const merged=new Map(db.bookmarks.map(b=>[b.url,b]));for(const row of rows){const data=await unseal(row.payload,payload?.passphrase);if(data?.v!==1||!Array.isArray(data.bookmarks))throw Error('Неверный формат копии.');for(const b of data.bookmarks.slice(0,3000)){if(typeof b?.url!=='string'||b.url.length>8192||!web(b.url))continue;if(!merged.has(b.url)&&merged.size<3000)merged.set(b.url,{id:crypto.randomUUID(),url:new URL(b.url).href,title:String(b.title||b.url).slice(0,200),folder:'Избранное',time:Date.now()})}}db.bookmarks=[...merged.values()];save();return {count:rows.length};
  }finally{sync.busy=false;emit()}
 }

 case 'clipboard-response':if(clipboardPrompt?.id===payload?.id)clipboardPrompt.finish(payload.allow===true);break;
  case 'clipboard-read-response':if(clipboardReadPrompt?.id===payload?.id)clipboardReadPrompt.finish(payload.allow===true&&typeof payload.text==='string'&&payload.text.length<=100000?payload.text:null);break;
 case 'open-profile':await shell.openPath(sharedProfile);break;
 case 'compatibility-save':{if(!Array.isArray(payload)||payload.length>100)throw Error('Некорректный список доменов.');const values=payload.map(x=>String(x).trim().toLowerCase()).filter(Boolean);if(values.some(x=>!/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(x)))throw Error('Укажи домены без https:// и пути.');db.settings.compatibilityDomains=[...new Set(values)];save();emit();toast('Настройки сохранены.');break}
 case 'compatibility-settings':{const rows=payload?.domains;if(!Array.isArray(rows)||rows.length>100)throw Error('Некорректный список доменов.');const values=rows.map(x=>String(x).trim().toLowerCase()).filter(Boolean);if(values.some(x=>!/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(x)))throw Error('Укажи домены без https:// и пути.');db.settings.compatibilityDomains=[...new Set(values)];for(const key of ['hideFocus','fakeFullscreen','realFullscreen'])if(typeof payload[key]==='boolean')db.settings[key]=payload[key];save();broadcastCompatibility();emit();toast('Настройки сохранены.');break}
 case 'dark-settings':{if(typeof payload?.global==='boolean')db.settings.autoDark=payload.global;const host=web(active()?.url)?new URL(active().url).hostname:null;if(host&&payload?.site){db.settings.darkSites[host]={enabled:!!payload.site.enabled,brightness:Math.max(60,Math.min(130,Number(payload.site.brightness)||100)),contrast:Math.max(70,Math.min(140,Number(payload.site.contrast)||100))}}save();if(active()?.view)void navigate(active(),active().url);emit();break}
 case 'discord-settings':{if(typeof payload?.showDomain==='boolean')db.settings.discordShowDomain=payload.showDomain;if(typeof payload?.showTime==='boolean')db.settings.discordShowTime=payload.showTime;if(Number.isFinite(Number(payload?.interval)))db.settings.discordInterval=Math.max(15,Math.min(3600,Math.round(Number(payload.interval))));db.settings.discordEnabled=!!payload?.enabled;db.settings.discordAppId=/^\d{17,22}$/.test(payload?.appId||'')?payload.appId:'';save();discord.configure(db.settings.discordEnabled,db.settings.discordAppId,{showDomain:db.settings.discordShowDomain,showTime:db.settings.discordShowTime,interval:db.settings.discordInterval});emit();break}
 case 'shortcut-save':{if(!payload||typeof payload.title!=='string'||!web(payload.url))throw Error('Укажи название и адрес сайта.');const id=db.settings.shortcuts.some(x=>x.id===payload.id)?payload.id:crypto.randomUUID();const prev=db.settings.shortcuts.find(x=>x.id===id),page=active(),sameOrigin=page&&web(page.url)&&origin(page.url)===origin(payload.url);const row={id,title:payload.title.trim().slice(0,60),url:new URL(payload.url).href,image:prev?.image||'',favicon:prev?.favicon||(sameOrigin?page.favicon||'':'')};db.settings.shortcuts=db.settings.shortcuts.filter(x=>x.id!==id);if(db.settings.shortcuts.length>=12)throw Error('Можно добавить до 12 ярлыков.');db.settings.shortcuts.push(row);save();emit();if(!row.favicon&&!row.image)void refreshSiteIcon(row.url).then(image=>{if(image&&db.settings.shortcuts.includes(row)){row.favicon=image;save();emit()}});break}
 case 'shortcut-delete':db.settings.shortcuts=db.settings.shortcuts.filter(x=>x.id!==payload);save();emit();break;
 case 'shortcut-image':{const row=db.settings.shortcuts.find(x=>x.id===payload);if(!row)return;const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Изображения',extensions:['png','jpg','jpeg','webp']}]});if(result.canceled)return;const file=result.filePaths[0];if(fs.statSync(file).size>10*1024*1024)throw Error('Изображение слишком большое.');const img=nativeImage.createFromPath(file);if(img.isEmpty())throw Error('Не удалось прочитать изображение.');if(img.getSize().width*img.getSize().height>40_000_000)throw Error('Изображение слишком большое.');row.image=img.resize({width:128,height:128,quality:'best'}).toDataURL();save();emit();break}

 case 'wallpaper-data':return wallpaperData;
 case 'restore-closed':restoreClosed();break;
 case 'duplicate-tab':duplicateTab(Number(payload)||selected);break;
 case 'tab-menu':tabMenu(Number(payload));break;
 case 'move-tab':moveTab(payload);break;
 case 'mute-tab':{const t=tabs.find(t=>t.id===Number(payload));if(t){t.muted=!t.muted;t.view?.webContents.setAudioMuted(t.muted);save();emit()}break}
 case 'mute-others':{const mute=tabs.some(t=>t.id!==selected&&!t.muted);for(const t of tabs)if(t.id!==selected){t.muted=mute;t.view?.webContents.setAudioMuted(mute)}save();emit();break}
 case 'home':void navigate(active(),'veyra://newtab');break;
 case 'zoom-in':changeZoom(1);break;case 'zoom-out':changeZoom(-1);break;case 'zoom-reset':changeZoom(0,true);break;
 case 'reader':await toggleReader();break;
 case 'save-pdf':await savePDF();break;
 case 'print-page':active()?.view?.webContents.print();break;
 case 'open-google':{const services={youtube:'https://www.youtube.com/',gmail:'https://mail.google.com/',drive:'https://drive.google.com/',account:'https://myaccount.google.com/',search:'https://www.google.com/'};if(!services[payload])throw Error('Этот адрес не поддерживается.');return await external.openExternal(app.getPath('userData'),services[payload],db.settings.externalBrowser)}
 case 'open-external':{const t=active();if(!t||!web(t.url))throw Error('Сначала открой сайт.');return await external.openExternal(app.getPath('userData'),external.googleServiceTarget(t.url,t.serviceURL),db.settings.externalBrowser)}
 case 'appearance':setAppearance(payload);break;
 case 'wallpaper-pick':await pickWallpaper();break;
 case 'wallpaper-remove':{const file=appearance.wallpaperPath(app.getPath('userData'));if(fs.existsSync(file))fs.unlinkSync(file);wallpaperData='';wallpaperVersion++;db.settings.wallpaper='none';save();emit();break}

 case 'search':{const q=typeof payload==='string'?payload.trim():'';if(!q||q.length>200)break;const dest=address(q);if(active()?.mode!=='temporary'&&dest&&/^(https:\/\/www.google.com\/search\?q=|https:\/\/duckduckgo.com\/\?q=)/.test(dest)){db.recentSearches=[{query:q,time:Date.now()},...(db.recentSearches||[]).filter(x=>x.query!==q)].slice(0,50);save()}void navigate(active(),q);break}
 case 'search-history-clear':db.recentSearches=[];save();emit();break;
 case 'navigate':if(typeof payload==='string'&&payload.length<8192){const q=payload.trim(),dest=address(q);if(q.length<=200&&!/^https?:/i.test(q)&&active()?.mode!=='temporary'&&dest&&/^(https:\/\/www.google.com\/search\?q=|https:\/\/duckduckgo.com\/\?q=)/.test(dest)){db.recentSearches=[{query:q,time:Date.now()},...(db.recentSearches||[]).filter(x=>x.query!==q)].slice(0,50);save()}void navigate(active(),payload)}break;
 case 'support-server':newTab('https://discord.gg/29m8etyA9R');break;
 case 'new':newTab();break;
 case 'google-mode':newTab('veyra://google');break;
 case 'temporary':newTab('veyra://newtab','temporary');break;
 case 'select':choose(Number(payload));break;case 'close-tab':closeTab(Number(payload));break;
 case 'pin-tab':togglePin(Number(payload));break;
 case 'keep-awake':{const t=active();if(t){t.keepAwake=!t.keepAwake;emit();}break;}
 case 'fake-presence':{const t=active();if(t){t.fakePresence=!t.fakePresence;if(web(t.url))await navigate(t,t.url);emit();}break;}
 case 'sleep-tab':if(!sleepTab(tabs.find(t=>t.id===Number(payload)),true))toast('Вкладка активна, закреплена, воспроизводит звук, загружается или содержит введённые данные.');break;
 case 'back':back();break;case 'forward':forward();break;case 'reload':reload();break;case 'stop':active()?.view?.webContents.stop();break;case 'bookmark':bookmark();break;
 case 'bookmark-save':{
  if(!payload||typeof payload.url!=='string'||!web(payload.url)||payload.url.length>8192)throw Error('Проверь адрес закладки.');
  const existing=db.bookmarks.find(x=>x.id===payload.id);
  const entry={id:existing?.id||crypto.randomUUID(),url:new URL(payload.url).href,title:String(payload.title||new URL(payload.url).hostname).slice(0,200),folder:String(payload.folder||'Избранное').slice(0,60),time:existing?.time||Date.now()};
  db.bookmarks=db.bookmarks.filter(x=>x.id!==entry.id);db.bookmarks.unshift(entry);save();emit();break;
 }
 case 'bookmark-export':{
  const result=await dialog.showSaveDialog(win,{title:tr('Экспорт закладок'),defaultPath:'Veyra-bookmarks.json',filters:[{name:'JSON',extensions:['json']}]});
  if(!result.canceled&&result.filePath){fs.writeFileSync(result.filePath,JSON.stringify({version:1,bookmarks:db.bookmarks},null,2));toast('Закладки экспортированы.')}break;
 }
 case 'bookmark-import':{
  const result=await dialog.showOpenDialog(win,{title:tr('Импорт закладок Veyra'),properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});
  if(result.canceled||!result.filePaths[0])break;
  const file=result.filePaths[0];if(fs.statSync(file).size>2*1024*1024)throw Error('Файл слишком большой. Максимум 2 МБ.');
  let data;try{data=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw Error('Нужен JSON-файл закладок Veyra.');}
  const rows=Array.isArray(data)?data:data.bookmarks;if(!Array.isArray(rows))throw Error('В файле нет списка закладок.');
  let added=0;for(const row of rows.slice(0,3000)){if(typeof row?.url!=='string'||!web(row.url)||row.url.length>8192||db.bookmarks.some(b=>b.url===row.url))continue;db.bookmarks.push({id:crypto.randomUUID(),url:row.url,title:String(row.title||new URL(row.url).hostname).slice(0,200),folder:String(row.folder||'Импорт').slice(0,60),time:Date.now()});added++;}
  save();emit();toast('Добавлено закладок: '+added);break;
 }
 case 'remove-bookmark':db.bookmarks=db.bookmarks.filter(x=>x.id!==payload);save();emit();break;
 case 'panel':if(['privacy','menu','downloads','find','bookmarks','history','passwords','performance','customize','tabs','help','dark','shortcuts','discord','compatibility',null].includes(payload))setPanel(payload);break;
 case 'language':if(!I18n.languages.includes(payload))throw Error('Этот язык не поддерживается.');db.settings.language=payload;save();emit();break;
 case 'widgets-save':{const previous=db.settings.homeWidgets||[],next=require('./widgets.js').normalize(payload),nextById=new Map(next.map(w=>[w.id,w])),packageApi=require('./widget-package.js');for(const w of previous)if(w.kind==='custom'){const updated=nextById.get(w.id);if(!updated)await widgetRuntime.clear(w.id);else{const oldPermissions=packageApi.permissions(w.package?.permissions),newPermissions=packageApi.permissions(updated.package?.permissions);if(JSON.stringify(oldPermissions)!==JSON.stringify(newPermissions))await widgetRuntime.revoke(w.id,oldPermissions.storage&&!newPermissions.storage)}}db.settings.homeWidgets=next;save();emit();break}
 case 'sidebar-save':{const keys=['bookmarks','history','passwords','privacy','performance','keep-awake','fake-presence'];if(!Array.isArray(payload?.order)||payload.order.length!==keys.length||new Set(payload.order).size!==keys.length||payload.order.some(x=>!keys.includes(x)))throw Error('Invalid sidebar');db.settings.sidebarOrder=payload.order;db.settings.sidebarHidden=Array.isArray(payload.hidden)?payload.hidden.filter(x=>keys.includes(x)):[];db.settings.sidebarWidth=Math.max(48,Math.min(88,Number(payload.width)||56));save();layout();emit();break}
 case 'keybinding-capture':keybindingCapture=payload===true;return true;
 case 'keybinding-set':{const action=payload?.action,combination=payload?.combination;if(!Object.hasOwn(defaults.keybindings,action)||typeof combination!=='string'||combination.length>80||! /^(?:(?:Ctrl|Alt|Shift|Meta)\+){0,3}(?:Key[A-Z]|Digit[0-9]|F(?:[1-9]|1[0-2])|Backquote|Tab|Space|Escape|Arrow(?:Left|Right|Up|Down)|Minus|Equal|BracketLeft|BracketRight)$/.test(combination))throw Error('Некорректное сочетание клавиш.');if(Object.entries(db.settings.keybindings).some(([name,value])=>name!==action&&value===combination))throw Error('Это сочетание уже назначено.');db.settings.keybindings={...defaults.keybindings,...db.settings.keybindings,[action]:combination};keybindingCapture=false;save();emit();break}
 case 'keybindings-reset':db.settings.keybindings={...defaults.keybindings};keybindingCapture=false;save();emit();break;
 case 'settings':{
  const accelerationChanged=typeof payload?.hardwareAcceleration==='boolean'&&payload.hardwareAcceleration!==db.settings.hardwareAcceleration;
  const s={...db.settings};if(['auto','ask'].includes(payload?.clipboardMode))s.clipboardMode=payload.clipboardMode;for(const k of ['bookmarksBar','restoreSession','popupWindows'])if(typeof payload?.[k]==='boolean')s[k]=payload[k];if(I18n.languages.includes(payload?.language))s.language=payload.language;if(['dark','light','system'].includes(payload?.theme))s.theme=payload.theme;if(['duckduckgo','google'].includes(payload?.search))s.search=payload.search;
  for(const k of ['trackers','dnt','thirdPartyCookies','httpsFirst','webrtc','autoUpdateFilters','eco','hardwareAcceleration','autoRestartHighMemory'])if(typeof payload?.[k]==='boolean')s[k]=payload[k];
  for(const [k,min,max] of [['ramTargetMB',512,16384],['highMemoryLimitMB',2048,32768],['maxBackgroundTabs',1,30],['sleepMinutes',1,120],['networkDownMbps',0,1000],['networkUpMbps',0,1000]])if(Number.isFinite(Number(payload?.[k])))s[k]=Math.max(min,Math.min(max,Number(payload[k])));
  db.settings=s;for(const d of downloads)if(d.status==='progress')d.limitMbps=d.compatible||d.direct?0:s.networkDownMbps;if(typeof payload?.trackers==='boolean')await ublock.setEnabled(s.trackers);if(typeof payload?.autoUpdateFilters==='boolean')await ublock.configure();nativeTheme.themeSource=s.theme;save();await Promise.all([...contexts.values()].filter(({wc})=>!wc.isDestroyed()).map(async({wc})=>{applyWebRTC(wc);await applyDark(wc,wc.getURL())}));layout();emit();toast(accelerationChanged?'Аппаратное ускорение изменится после перезапуска.':'Настройки сохранены.');break;
 }
 case 'site-exception':{const o=origin(active()?.url);if(!o||o==='null')return;db.settings.siteExceptions=db.settings.siteExceptions.includes(o)?db.settings.siteExceptions.filter(x=>x!==o):[...db.settings.siteExceptions,o];save();emit();toast('Исключение изменено. Обнови страницу.');break}
 case 'allow-http':{const t=active();if(t?.httpFallback){db.settings.httpExceptions.push(origin(t.httpFallback));save();void navigate(t,t.httpFallback)}break}
 case 'clear-history':recentlyClosed.length=0;db.history=[];save();emit();break;
 case 'clear-data':for(const ses of sessions.values()){await ses.clearStorageData();await ses.clearCache();await ses.closeAllConnections()}pendingCredential=null;toast('Cookie, хранилища и кэш профилей очищены.');emit();break;
 case 'clear-site':{const o=origin(active()?.url);if(!o||o==='null')throw Error('Сначала открой сайт.');await sessionFor(active().mode).clearStorageData({origin:o});toast('Хранилища сайта очищены. Обнови страницу.');break}
 case 'permission-response':return sitePermissions.respond(payload);
 case 'screen-share-response':if(screenSharePrompt?.id===payload?.id)screenSharePrompt.finish({id:typeof payload.source==='string'?payload.source:null,audio:payload.audio===true});return true;
 case 'permissions-reset':sitePermissions.reset();db.settings.permissions={};save();emit();toast('Разрешения сайтов сброшены.');break;
 case 'ublock-settings':{const ses=sessionFor(active()?.mode==='google'?'google':'private');await ublock.install(ses);const child=ublock.open(ses);popups.add(child);child.on('closed',()=>popups.delete(child));break}
 case 'update-filters':await privacy.update();return privacy.status();
 case 'find':{const wc=active()?.view?.webContents;if(wc){if(payload)wc.findInPage(String(payload).slice(0,300));else wc.stopFindInPage('clearSelection')}break}
 case 'diagnose':return diagnose();
 case 'reveal':{const d=downloads.find(x=>x.id===payload);if(d?.status==='completed'&&d.path)shell.showItemInFolder(d.path);break}
 case 'vault-create':return await vault.unlock(payload,true);
 case 'vault-unlock':return await vault.unlock(payload,false);
 case 'vault-lock':vault.lock();break;
 case 'vault-list':return vault.list();
 case 'vault-cards-list':return vault.listCards();
 case 'vault-card-save':vault.saveCard(payload);return vault.listCards();
 case 'vault-card-delete':vault.remove(payload);return vault.listCards();
 case 'vault-save':vault.save(payload);return vault.list();
 case 'vault-delete':vault.remove(payload);return vault.list();
 case 'vault-generate':return vault.generate(payload);
 case 'vault-save-candidate':if(!pendingCredential)throw Error('Предложение сохранения истекло.');vault.save(pendingCredential);pendingCredential=null;emit();return vault.list();
 case 'vault-dismiss':pendingCredential=null;emit();break;
 case 'vault-fill':{
  const entry=vault.get(payload),t=active(),wc=t?.view?.webContents;
  if(!wc||!secure(wc.getURL())||origin(wc.getURL())!==entry.origin)throw Error('Открой HTTPS-страницу '+entry.origin+' в текущей вкладке.');
  if(t.mode==='temporary')throw Error('Заполнение отключено во временном профиле.');
  const script=`(()=>{if(location.origin!==${JSON.stringify(entry.origin)})return false;const p=[...document.querySelectorAll('input[type=password]')].find(x=>!x.disabled&&!x.readOnly&&x.autocomplete!=='new-password'&&x.getClientRects().length);if(!p)return false;const f=p.form; if(f){const a=new URL(f.action||location.href,location.href);if(a.origin!==location.origin||a.protocol!=='https:')return false;}const scope=f||document;const u=[...scope.querySelectorAll('input')].find(x=>!x.disabled&&x.getClientRects().length&&(x.autocomplete==='username'||x.type==='email'))||[...scope.querySelectorAll('input[type=text]')].find(x=>!x.disabled&&x.getClientRects().length);const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;const set=(x,v)=>{setter.call(x,v);x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));};if(u)set(u,${JSON.stringify(entry.username)});set(p,${JSON.stringify(entry.password)});return true;})()`;
  const frame=wc.mainFrame;
  const ok=await frame.executeJavaScript(script,true);if(!ok)throw Error('Подходящая форма входа не найдена. Заполнение не выполнено.');toast('Поля заполнены. Проверь страницу и войди самостоятельно.');break;
 }
 case 'vault-fill-card':{
  const card=vault.getCard(payload),t=active(),wc=t?.view?.webContents;
  if(!wc||!secure(wc.getURL()))throw Error('Открой защищённую HTTPS-страницу и нажми заполнить ещё раз.');
  if(t.mode==='temporary')throw Error('Заполнение отключено во временном профиле.');
  const values={holder:card.holder,number:card.number,month:String(card.month).padStart(2,'0'),year:String(card.year)};
  const script=`(()=>{if(location.protocol!=='https:')return false;const visible=e=>!e.disabled&&!e.readOnly&&e.getClientRects().length>0;const find=(selector)=>[...document.querySelectorAll(selector)].find(visible);const set=(e,v)=>{if(!e)return false;const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true};let n=find('input[autocomplete="cc-number"]')||find('input[name*="cardnumber" i],input[id*="cardnumber" i],input[name*="card_number" i]');if(!n)return false;set(n,${JSON.stringify(values.number)});const h=find('input[autocomplete="cc-name"]')||find('input[name*="cardholder" i],input[id*="cardholder" i]');if(h)set(h,${JSON.stringify(values.holder)});const m=find('input[autocomplete="cc-exp-month"]')||find('select[autocomplete="cc-exp-month"]');if(m){m.value=${JSON.stringify(values.month)};m.dispatchEvent(new Event('input',{bubbles:true}));m.dispatchEvent(new Event('change',{bubbles:true}))}const y=find('input[autocomplete="cc-exp-year"]')||find('select[autocomplete="cc-exp-year"]');if(y){const v=String(y.value||'').length===2?${JSON.stringify(values.year.slice(-2))}:${JSON.stringify(values.year)};y.value=v;y.dispatchEvent(new Event('input',{bubbles:true}));y.dispatchEvent(new Event('change',{bubbles:true}))}const ex=find('input[autocomplete="cc-exp"]');if(ex)set(ex,${JSON.stringify(values.month+'/'+values.year.slice(-2))});return true})()`;
  const ok=await wc.mainFrame.executeJavaScript(script,true);if(!ok)throw Error('Не нашёл видимое поле номера карты. Данные карты не переданы.');toast('Данные карты заполнены. Проверь их перед оплатой.');break;
 }
 case 'minimize':win.minimize();break;case 'maximize':win.isMaximized()?win.unmaximize():win.maximize();break;case 'close':win.close();break;
 default:throw Error('Unknown action');
 }
 }catch(error){throw Error(I18n.errorMessage(error,db.settings.language));}
});
function performanceTick(){
 if(closing)return;
 const metrics=app.getAppMetrics();performanceState={privateMB:Math.round(metrics.reduce((n,m)=>n+(m.memory?.privateBytes||0),0)/1024),processCount:metrics.length,memoryMB:Math.round(metrics.reduce((n,m)=>n+(m.memory?.workingSetSize||0),0)/1024),cpu:Math.round(metrics.reduce((n,m)=>n+(m.cpu?.percentCPUUsage||0),0)*10)/10,liveTabs:tabs.filter(t=>t.view).length,sleepingTabs:tabs.filter(t=>t.sleeping).length};
 if(db.settings.eco){
  const candidates=tabs.filter(t=>t.id!==selected&&t.view).sort((a,b)=>a.lastActive-b.lastActive);
  for(const t of candidates)if(Date.now()-t.lastActive>db.settings.sleepMinutes*60000)sleepTab(t);
  let background=tabs.filter(t=>t.id!==selected&&t.view).length;
  for(const t of candidates){if(background<=db.settings.maxBackgroundTabs)break;if(sleepTab(t))background--;}
  if(performanceState.memoryMB>db.settings.ramTargetMB){for(const t of candidates)if(t.view)sleepTab(t);}
 }
 const restartReady=db.settings.autoRestartHighMemory===true&&performanceState.memoryMB>=db.settings.highMemoryLimitMB&&tabs.length>0&&!tabs.some(t=>t.dirty||t.view?.webContents.isCurrentlyAudible())&&!downloads.some(d=>d.status==='progress');
 highMemorySamples=restartReady?highMemorySamples+1:0;
 if(highMemorySamples>=3)restartForMemoryPressure();
 candidateExpired();if(panel==='performance')emit();
}
function scheduleRestoredTabs(delay=1800){
 if(restoreQueueTimer||!restoreQueue.length||closing||memoryRestarting)return;
 restoreQueueTimer=setTimeout(()=>{
  restoreQueueTimer=null;if(closing||memoryRestarting)return;
  while(restoreQueue.length){const queued=tabs.find(t=>t.id===restoreQueue[0]);if(queued?.restoreQueuedActive&&queued.sleeping)break;restoreQueue.shift()}
  if(!restoreQueue.length)return;
  if(active()?.loading){scheduleRestoredTabs(1200);return}
  const memoryMB=Math.round(app.getAppMetrics().reduce((sum,item)=>sum+(item.memory?.workingSetSize||0),0)/1024);
  const target=Math.max(512,Number(db.settings.ramTargetMB)||2048),ceiling=Math.min(Number(db.settings.highMemoryLimitMB)||6144,target+768);
  if(memoryMB>=ceiling){scheduleRestoredTabs(5000);return}
  const id=restoreQueue.shift(),tab=tabs.find(t=>t.id===id);if(!tab||!tab.sleeping)return;
  tab.restoreQueuedActive=false;void navigate(tab,tab.url).finally(()=>scheduleRestoredTabs(2200));
 },Math.max(0,delay));restoreQueueTimer.unref?.();
}
function restartForMemoryPressure(){
 if(memoryRestarting||!app.isPackaged||!profile||tabs.some(t=>t.dirty||t.view?.webContents.isCurrentlyAudible())||downloads.some(d=>d.status==='progress'))return;
 if(Date.now()-Number(db.memoryRestartedAt||0)<20*60*1000)return;
 const eligible=tabs.filter(t=>t.mode!=='temporary'&&web(t.url)&&!t.googleBlocked);
 if(!eligible.length)return;
 const session=SessionState.serialize(eligible,selected);for(const row of session.tabs)row.sleeping=true;
 db.memoryRestartSession={createdAt:Date.now(),session};db.memoryRestartedAt=Date.now();save();memoryRestarting=true;
 try{discord?.stop();vault?.lock();externalApps?.cancel();for(const child of popups)if(!child.isDestroyed())child.close();const args=process.argv.slice(1).filter(value=>!launchURL(value));app.relaunch({args});app.exit(0)}catch(error){memoryRestarting=false;delete db.memoryRestartSession;save();console.error('High-memory restart failed:',error)}
}
function isGoogleRejected(url){try{const u=new URL(url);return u.hostname==='accounts.google.com'&&/\/(?:signin\/rejected|v3\/signin\/rejected|o\/oauth2\/.*\/auth\/error)/.test(u.pathname)}catch{return false}}
function restoreClosed(){const saved=recentlyClosed.shift();if(!saved){toast('Нет закрытых вкладок.');return}const t=newTab(saved.url,saved.mode);t.pinned=!!saved.pinned;t.zoomLevel=saved.zoomLevel||0;t.muted=!!saved.muted;t.view?.webContents.setZoomLevel(t.zoomLevel);t.view?.webContents.setAudioMuted(t.muted);sortPinned();save();emit()}
function sortPinned(){const ordered=[...tabs.filter(t=>t.pinned),...tabs.filter(t=>!t.pinned)];tabs.splice(0,tabs.length,...ordered)}
function togglePin(id){const t=tabs.find(t=>t.id===id);if(t){t.pinned=!t.pinned;sortPinned();save();emit()}}
function duplicateTab(id){const source=tabs.find(t=>t.id===id);if(!source)return;const t=newTab(source.url,source.mode);t.zoomLevel=source.zoomLevel||0;t.view?.webContents.setZoomLevel(t.zoomLevel);emit();return t}
function moveTab(payload){const from=tabs.findIndex(t=>t.id===Number(payload?.id)),target=tabs.find(t=>t.id===Number(payload?.before));if(from<0||!target||tabs[from]===target||tabs[from].pinned!==target.pinned)return;const [item]=tabs.splice(from,1);tabs.splice(tabs.indexOf(target),0,item);save();emit()}
function changeZoom(delta,reset=false){const t=active();if(!t?.view||t.googleBlocked){toast('Сначала открой сайт.');return}const level=reset?0:Math.max(-3,Math.min(3,(t.zoomLevel||0)+delta));for(const tab of tabs)if(origin(tab.url)===origin(t.url)){tab.zoomLevel=level;tab.view?.webContents.setZoomLevel(level)}save();emit()}
function tabMenu(id){const t=tabs.find(t=>t.id===id);if(!t)return;Menu.buildFromTemplate([
 {label:tr('Обновить'),click:()=>{if(t.view)t.view.webContents.reload();else void navigate(t,t.url)}},
 {label:tr('Дублировать вкладку'),click:()=>duplicateTab(id)},
 {label:tr(t.pinned?'Открепить вкладку':'Закрепить вкладку'),click:()=>togglePin(id)},
 {label:tr(t.muted?'Включить звук':'Выключить звук'),click:()=>{t.muted=!t.muted;t.view?.webContents.setAudioMuted(t.muted);emit()}},
 {type:'separator'},{label:tr('Восстановить закрытую вкладку'),enabled:recentlyClosed.length>0,click:restoreClosed},
 {label:tr('Закрыть вкладку'),click:()=>closeTab(id)}
 ]).popup({window:win})}
async function toggleReader(){const t=active(),wc=t?.view?.webContents;if(!wc||t.googleBlocked){toast('Сначала открой сайт.');return}if(t.reader){t.reader=null;layout();emit();return}
 const pageURL=t.url;const article=await wc.executeJavaScript(`(()=>{const root=document.querySelector('article')||document.querySelector('main')||document.body;let used=0;const blocks=[];for(const el of root.querySelectorAll('h1,h2,h3,p,li,blockquote')){if(el.closest('nav,header,footer,aside,script,style,form'))continue;const text=el.innerText?.trim();if(!text||text.length<3)continue;used+=text.length;if(used>160000||blocks.length>=200)break;blocks.push({tag:el.tagName.toLowerCase(),text})}return {title:document.title,url:location.href,blocks}})()`);
 if(!tabs.includes(t)||t.url!==pageURL||t.view?.webContents!==wc)return;
 if(!article.blocks.length){toast('На странице не найден текст для чтения.');return}t.reader=article;layout();emit();
}
async function savePDF(){const wc=active()?.view?.webContents;if(!wc||!web(wc.getURL()))throw Error('Сначала открой сайт.');const url=wc.getURL();const result=await dialog.showSaveDialog(win,{title:tr('Сохранить PDF'),defaultPath:'Veyra-page.pdf',filters:[{name:'PDF',extensions:['pdf']}]});if(result.canceled||!result.filePath)return;if(wc.isDestroyed()||wc.getURL()!==url)throw Error('Страница изменилась. Повтори сохранение.');const bytes=await wc.printToPDF({printBackground:true});fs.writeFileSync(result.filePath,bytes);toast('PDF сохранён.')}
function updateWindowIcon(){if(!win||win.isDestroyed())return;const palette={violet:'#bc9ffa',ocean:'#85bdf5',forest:'#8ad4b2',rose:'#efa3c3',amber:'#efc28b'},accent=db.settings.colorTheme==='custom'?db.settings.customAccent:(palette[db.settings.colorTheme]||palette.violet);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path fill="${accent}" d="M32 5 55.4 18.5v27L32 59 8.6 45.5v-27L32 5Z"/><path fill="#211c35" d="m16 28 16-9 16 9-16 9-16-9Z"/><path d="m16 36 16 9 16-9" fill="none" stroke="#211c35" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="m32 19 16 9-16 9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/></svg>`;try{win.setIcon(nativeImage.createFromDataURL('data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)))}catch{}}
function setAppearance(payload){
 if(!payload||typeof payload!=='object')throw Error('Некорректные настройки.');
 if(['dark','light','system'].includes(payload.theme))db.settings.theme=payload.theme;
 if(appearance.themes[payload.colorTheme]||payload.colorTheme==='custom')db.settings.colorTheme=payload.colorTheme;
 if(/^#[0-9a-f]{6}$/i.test(payload.customAccent||''))db.settings.customAccent=payload.customAccent;
 if(appearance.wallpapers.includes(payload.wallpaper)&&(payload.wallpaper!=='custom'||wallpaperData))db.settings.wallpaper=payload.wallpaper;
 if(typeof payload.wallpaperDim==='number'&&Number.isFinite(payload.wallpaperDim))db.settings.wallpaperDim=Math.max(0,Math.min(85,payload.wallpaperDim));
 if(['auto',...external.installedBrowsers().map(b=>b.id)].includes(payload.externalBrowser))db.settings.externalBrowser=payload.externalBrowser;
 nativeTheme.themeSource=db.settings.theme;updateWindowIcon();save();emit();
}
async function pickWallpaper(){const result=await dialog.showOpenDialog(win,{title:tr('Выбрать обои'),properties:['openFile'],filters:[{name:tr('Изображения'),extensions:['png','jpg','jpeg','webp']}]});if(result.canceled||!result.filePaths[0])return;wallpaperData=appearance.importWallpaper(result.filePaths[0],app.getPath('userData'),nativeImage);wallpaperVersion++;db.settings.wallpaper='custom';save();emit()}

function openWindow(){if(!win||win.isDestroyed())return;win.show();win.webContents.send('veyra:opened');}
app.whenReady().then(async()=>{
 void require('./default-browser.cjs').registerHTML(app).catch(()=>{});
 await widgetRuntime.register();
 profile=path.join(app.getPath('userData'),'profile.json');
 try{const stored=JSON.parse(fs.readFileSync(profile,'utf8'));const s=stored.settings||{};db.settings={...defaults};for(const k of Object.keys(defaults))if(typeof s[k]===typeof defaults[k])db.settings[k]=s[k];
  if(!I18n.languages.includes(db.settings.language))db.settings.language='ru';
  if(!['dark','light','system'].includes(db.settings.theme))db.settings.theme='dark';
  if(!Array.isArray(db.settings.siteExceptions))db.settings.siteExceptions=[];if(!Array.isArray(db.settings.httpExceptions))db.settings.httpExceptions=[];
  if(!db.settings.permissions||Array.isArray(db.settings.permissions))db.settings.permissions={};db.settings.keybindings={...defaults.keybindings,...(s.keybindings&&typeof s.keybindings==='object'&&!Array.isArray(s.keybindings)?s.keybindings:{})};
  db.bookmarks=Array.isArray(stored.bookmarks)?stored.bookmarks.filter(x=>web(x.url)).slice(0,3000).map(x=>({...x,id:x.id||crypto.randomUUID(),folder:x.folder||'Избранное'})):[];
  db.gameBest=Number.isSafeInteger(stored.gameBest)&&stored.gameBest>=0&&stored.gameBest<=1000000000?stored.gameBest:0;db.history=Array.isArray(stored.history)?stored.history.filter(x=>web(x.url)).slice(0,1000):[];db.lastSession=stored.lastSession;db.memoryRestartedAt=Number.isFinite(stored.memoryRestartedAt)?stored.memoryRestartedAt:0;db.memoryRestartSession=stored.memoryRestartSession&&Number.isFinite(stored.memoryRestartSession.createdAt)&&Date.now()-stored.memoryRestartSession.createdAt<10*60*1000?stored.memoryRestartSession:null;
  try{if(canEncryptFormState()&&typeof db.lastSession?.formsEncrypted==='string'){const records=JSON.parse(safeStorage.decryptString(Buffer.from(db.lastSession.formsEncrypted,'base64')));const validIds=new Set((Array.isArray(db.lastSession.tabs)?db.lastSession.tabs:[]).map(row=>row?.sessionId).filter(id=>typeof id==='string'));for(const row of records)if(validIds.has(row?.sessionId)){const state=SessionState.normalizeForms(row.url,row.fields);if(state)savedFormState.set(row.sessionId,{sessionId:row.sessionId,...state});}}}catch{savedFormState.clear()}
  try{if(db.lastSession)delete db.lastSession.formsEncrypted}catch{}
  try{if(stored.widgetDraft)db.widgetDraft=require('./widget-package.js').normalize(stored.widgetDraft)}catch{}
 }catch{}
 if(!appearance.themes[db.settings.colorTheme]&&db.settings.colorTheme!=='custom')db.settings.colorTheme='violet';if(!/^#[0-9a-f]{6}$/i.test(db.settings.customAccent))db.settings.customAccent='#bc9ffa';if(!appearance.wallpapers.includes(db.settings.wallpaper))db.settings.wallpaper='aurora';wallpaperData=appearance.readWallpaper(app.getPath('userData'));
 if(!db.settings.externalAppPermissions||typeof db.settings.externalAppPermissions!=='object'||Array.isArray(db.settings.externalAppPermissions))db.settings.externalAppPermissions={};
 if(!Array.isArray(db.settings.compatibilityDomains))db.settings.compatibilityDomains=['google.com','youtube.com'];if(!Array.isArray(db.settings.shortcuts))db.settings.shortcuts=[];if(!db.settings.darkSites||Array.isArray(db.settings.darkSites))db.settings.darkSites={};
 db.settings.discordInterval=Math.max(15,Math.min(3600,Math.round(Number(db.settings.discordInterval)||60)));if(!db.settings.discordAppId)db.settings.discordAppId='1562807114227777606';if(!['auto','ask'].includes(db.settings.clipboardMode))db.settings.clipboardMode='auto';discord=new DiscordPresence(emit,()=>({language:db.settings.language,url:active()?.url,mode:active()?.mode}));discord.configure(db.settings.discordEnabled,db.settings.discordAppId,{showDomain:db.settings.discordShowDomain,showTime:db.settings.discordShowTime,interval:db.settings.discordInterval});
 nativeTheme.themeSource=db.settings.theme;Menu.setApplicationMenu(null);
 ublock=new(require('./ublock.cjs').UBlock)({settings:()=>db.settings,changed:emit,newTab,select:choose,selected:()=>selected,close:closeTab,window:()=>win,tabs:()=>tabs});privacy=new PrivacyEngine(app.getPath('userData'),()=>db.settings,emit,ublock);
 vault=new PasswordVault(path.join(app.getPath('userData'),'passwords.vault'),safeStorage,emit);
 sync.configureStore(path.join(sharedProfile,'account.session'),safeStorage);
 sitePermissions=new(require('./site-permissions.cjs').SitePermissions)({settings:()=>db.settings,save,changed:()=>{layout();emit()},show:()=>{layout();emit();win?.webContents.focus()},notifications:()=>{try{return windowsNotifications.register(app,shell)}catch{return false}}});
 if(Object.values(db.settings.permissions).some(value=>value?.notifications===true)){try{windowsNotifications.register(app,shell)}catch{}}
 externalApps=new ExternalApplications({settings:()=>db.settings,save,changed:()=>{layout();emit()},available:()=>!appDialog&&!clipboardPrompt&&!clipboardReadPrompt&&!sitePermissions?.pending,
 active:wc=>{const c=contexts.get(wc.id);return !!c&&(c.tab?c.tab.id===selected:[...popups].some(child=>!child.isDestroyed()&&child.webContents===wc&&(child.isFocused()||externalApps?.pending?.wc===wc)));},
 temporary:wc=>contexts.get(wc.id)?.mode==='temporary',application:scheme=>app.getApplicationNameForProtocol(scheme),launch:url=>shell.openExternal(url,{activate:true}),failed:()=>toast('Не удалось открыть приложение.'),
 show:()=>{const hidden=[...popups].filter(child=>!child.isDestroyed()&&child.isVisible());hidden.forEach(child=>child.hide());win?.show();win?.webContents.focus();return ()=>{hidden.forEach(child=>{if(!child.isDestroyed())child.show()});};}
 });
 sessionFor('private');
 const defaultStatus=require('./default-browser.cjs').isDefault(app);defaultPromptVisible=false;
 win=new BrowserWindow({width:1380,height:900,show:false,minWidth:850,minHeight:600,frame:false,backgroundColor:'#121117',title:'Veyra',icon:path.join(__dirname,'assets','app.ico'),webPreferences:{backgroundThrottling:false,preload:path.join(__dirname,'preload.cjs'),webviewTag:true,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});updateWindowIcon();
 widgetRuntime.attach(win.webContents);
 win.on('focus',async()=>{if(defaultPromptVisible&&await require('./default-browser.cjs').isDefault(app)){defaultPromptVisible=false;if(!win.isDestroyed()){layout();emit();}}});win.once('ready-to-show',openWindow);
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.on('before-input-event',(event,input)=>shortcuts(event,input,win.webContents));win.webContents.on('did-finish-load',emit);void defaultStatus.then(isDefault=>{if(win&&!win.isDestroyed()){defaultPromptVisible=!isDefault;layout();emit();}});
 for(const event of ['resize','maximize','unmaximize','enter-full-screen','leave-full-screen'])win.on(event,()=>{layout();emit()});
 win.on('close',event=>{externalApps?.cancel();clipboardPrompt?.finish(false);if(!closing&&!exitConfirmed&&!storageFlushRunning&&!storageFlushReady&&tabs.some(t=>t.dirty)){event.preventDefault();if(!appDialog)requestAppDialog({type:'confirm',title:'Несохранённые данные',message:'Закрыть браузер с введёнными данными?'}).then(yes=>{if(yes){exitConfirmed=true;win.close()}});return}if(!storageFlushReady){event.preventDefault();if(!storageFlushRunning){storageFlushRunning=true;save();Promise.race([flushSessions(new Map([...sessions,...localHTML.sessions])),new Promise((_,reject)=>setTimeout(()=>reject(Error('Сохранение сессий заняло слишком много времени.')),5000))]).then(()=>{storageFlushReady=true;win.close()}).catch(error=>{storageFlushRunning=false;toast(error.message)})}return}save();closing=true;discord.stop();vault.lock();pendingCredential=null;externalApps?.cancel();sitePermissions?.reset();for(const child of popups)child.close();for(const t of tabs)removeView(t)});
 powerMonitor.on('lock-screen',()=>vault.lock());powerMonitor.on('suspend',()=>vault.lock());
   win.loadFile(path.join(__dirname,'index.html'));
   if(uBlockStorageRecovery.length)win.webContents.once('did-finish-load',()=>toast('Oversized uBlock data was backed up and reset. Your site cookies and sessions were kept.'));
   const emergencyRestart=db.memoryRestartSession;
   const restoredSession=emergencyRestart?SessionState.restore(emergencyRestart.session,web):db.settings.restoreSession?SessionState.restore(db.lastSession,web):{rows:[],selectedSessionId:null,selectedURL:null};
   const selectedRestoreRow=restoredSession.rows.find(row=>row.sessionId===restoredSession.selectedSessionId)||(restoredSession.selectedURL?restoredSession.rows.find(row=>row.url===restoredSession.selectedURL):null);
   if(restoredSession.rows.length){
    for(const row of restoredSession.rows){
     const deferActive=!emergencyRestart&&!row.sleeping&&row!==selectedRestoreRow;
     const tab=newTab(row.url,row.mode,{sessionId:row.sessionId,sleeping:!!emergencyRestart||row.sleeping||deferActive,restoreQueuedActive:deferActive,pinned:row.pinned,zoomLevel:row.zoomLevel,muted:row.muted});
     if(deferActive)restoreQueue.push(tab.id);
    }
    sortPinned();
    const selectedTab=tabs.find(t=>t.sessionId===restoredSession.selectedSessionId)||(restoredSession.selectedURL?tabs.find(t=>t.url===restoredSession.selectedURL):null);
    if(selectedTab&&!emergencyRestart)choose(selectedTab.id);
   }
   if(!restoredSession.rows.length||emergencyRestart)newTab();
   delete db.memoryRestartSession;
   const startupURL=process.argv.map(launchURL).find(Boolean);if(startupURL)newTab(startupURL);
   for(const url of pendingExternalURLs.splice(0))newTab(url);
   save();void hydrateShortcutIcons();performanceTick();scheduleRestoredTabs(2200);
   setInterval(performanceTick,5000).unref();
   setInterval(()=>{void flushSessions(new Map([...sessions,...localHTML.sessions])).catch(()=>toast('Не удалось сохранить сессии на диск.'))},30000).unref();
});
app.on('window-all-closed',()=>app.quit());
