const {app}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'veyra-presence-'));
fs.writeFileSync(path.join(profile,'profile.json'),JSON.stringify({settings:{autoUpdateFilters:false,eco:false,hideFocus:false,fakeFullscreen:false}}));
app.setPath('userData',profile);
const file=path.join(root,'src/main.cjs');
const instance=new Module(file,module);
instance.filename=file;
instance.paths=Module._nodeModulePaths(path.dirname(file));
const source=fs.readFileSync(file,'utf8')
 .replace("win.once('ready-to-show',openWindow);",'')
 .replace("webPreferences:{preload:path.join(__dirname,'preload.cjs')","webPreferences:{offscreen:true,backgroundThrottling:false,preload:path.join(__dirname,'preload.cjs')");
instance._compile(source+'\nmodule.exports={getWindow:()=>win,getDB:()=>db,getTabs:()=>tabs,sessionFor};',file);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn){for(let i=0;i<600;i++){if(await fn())return;await delay(30)}throw Error('Timed out')}
const timer=setTimeout(()=>app.exit(1),60000);

app.whenReady().then(async()=>{
 try{
  await until(()=>instance.exports.getWindow());
  const win=instance.exports.getWindow();
  await until(()=>!win.webContents.isLoading());
  const ui=script=>win.webContents.executeJavaScript(script,true);
  const cmd=(action,payload)=>ui('window.veyra.command('+JSON.stringify(action)+','+JSON.stringify(payload)+')');
  const session=instance.exports.sessionFor('private');
  session.protocol.handle('https',()=>new Response('<!doctype html><body>Presence fixture</body>',{headers:{'content-type':'text/html'}}));
  await cmd('navigate','https://presence.veyra.test');
  await until(()=>{const tab=instance.exports.getTabs().find(item=>item.url==='https://presence.veyra.test/');return !!tab?.view&&!tab.view.webContents.isLoading()});
  const tab=instance.exports.getTabs().find(item=>item.url==='https://presence.veyra.test/');
  const wc=tab.view.webContents;
  const nativeDescriptors=await wc.executeJavaScript("JSON.stringify(['hidden','visibilityState','hasFocus','fullscreenEnabled','fullscreenElement','exitFullscreen'].map(key=>{const x=Object.getOwnPropertyDescriptor(document,key);return x?{value:typeof x.value==='function'?x.value.toString():x.value,get:x.get?.toString(),set:x.set?.toString(),enumerable:x.enumerable,configurable:x.configurable,writable:x.writable}:null}))");
  assert.equal(await wc.executeJavaScript('document.fullscreenElement===null'),true);
  await cmd('compatibility-settings',{domains:['google.com','youtube.com'],hideFocus:true,fakeFullscreen:true,realFullscreen:false});
  await until(()=>wc.executeJavaScript("Object.hasOwn(document,'hasFocus')===true&&Object.hasOwn(document,'fullscreenEnabled')===true"));
  assert.equal(await wc.executeJavaScript('document.hasFocus()'),true);
  const enabledDescriptors=await wc.executeJavaScript("JSON.stringify(['hidden','visibilityState','hasFocus','fullscreenEnabled','fullscreenElement','exitFullscreen'].map(key=>{const x=Object.getOwnPropertyDescriptor(document,key);return x?{value:typeof x.value==='function'?x.value.toString():x.value,get:x.get?.toString(),set:x.set?.toString(),enumerable:x.enumerable,configurable:x.configurable,writable:x.writable}:null}))");
  assert.notEqual(enabledDescriptors,nativeDescriptors,'Enabled compatibility mode should install its configured hooks');
  await wc.executeJavaScript('document.documentElement.requestFullscreen()');
  assert.equal(await wc.executeJavaScript('document.fullscreenElement===document.documentElement'),true);
  assert.equal(win.isFullScreen(),false);
  await wc.executeJavaScript('document.exitFullscreen()');
  assert.equal(await wc.executeJavaScript('document.fullscreenElement===null'),true);

  await wc.executeJavaScript('window.__compatLiveMarker=crypto.randomUUID()');
  const marker=await wc.executeJavaScript('window.__compatLiveMarker');
  const webContentsId=wc.id;
  const loadedURL=wc.getURL();
  await cmd('compatibility-settings',{domains:['google.com','youtube.com'],hideFocus:false,fakeFullscreen:false,realFullscreen:false});
  await until(()=>wc.executeJavaScript("Object.hasOwn(document,'hasFocus')===false&&Object.hasOwn(document,'fullscreenEnabled')===false"));
  const disabledDescriptors=await wc.executeJavaScript("JSON.stringify(['hidden','visibilityState','hasFocus','fullscreenEnabled','fullscreenElement','exitFullscreen'].map(key=>{const x=Object.getOwnPropertyDescriptor(document,key);return x?{value:typeof x.value==='function'?x.value.toString():x.value,get:x.get?.toString(),set:x.set?.toString(),enumerable:x.enumerable,configurable:x.configurable,writable:x.writable}:null}))");
  assert.equal(disabledDescriptors,nativeDescriptors,'Disabled compatibility mode must restore native own-property descriptors exactly');
  const disabledConfig={hideFocus:false,fakeFullscreen:false,realFullscreen:false};
  wc.send('veyra:compatibility-settings',disabledConfig);
  wc.send('veyra:compatibility-settings',disabledConfig);
  await delay(100);
  assert.equal(await wc.executeJavaScript("Object.hasOwn(document,'hasFocus')"),false);
  assert.equal(await wc.executeJavaScript('window.__compatLiveMarker'),marker);
  assert.equal(wc.id,webContentsId);
  assert.equal(wc.getURL(),loadedURL);
  await cmd('compatibility-settings',{domains:['google.com','youtube.com'],hideFocus:true,fakeFullscreen:true,realFullscreen:false});
  await until(()=>wc.executeJavaScript("Object.hasOwn(document,'hasFocus')===true&&Object.hasOwn(document,'fullscreenEnabled')===true"));
  const enabledConfig={hideFocus:true,fakeFullscreen:true,realFullscreen:false};
  wc.send('veyra:compatibility-settings',enabledConfig);
  wc.send('veyra:compatibility-settings',enabledConfig);
  await delay(100);
  assert.equal(await wc.executeJavaScript("Object.hasOwn(document,'hasFocus')"),true);
  assert.equal(await wc.executeJavaScript('window.__compatLiveMarker'),marker);
  assert.equal(wc.id,webContentsId);
  assert.equal(wc.getURL(),loadedURL);
  await wc.executeJavaScript('window.__compatLiveMarker=undefined');
  await cmd('keep-awake');
  assert(tab.keepAwake);
  await cmd('new');
  await cmd('navigate','https://presence-new-tab.veyra.test');
  await until(()=>instance.exports.getTabs().some(item=>item.url==='https://presence-new-tab.veyra.test/'&&item.view&&!item.view.webContents.isLoading()));
  const restored=instance.exports.getTabs().find(item=>item.url==='https://presence-new-tab.veyra.test/');
  assert.equal(await restored.view.webContents.executeJavaScript("Object.hasOwn(document,'hasFocus')"),true);
  assert.equal(await restored.view.webContents.executeJavaScript("Object.hasOwn(document,'fullscreenEnabled')"),true);
  console.log('PASS: focus/fullscreen settings both directions on one live WebContents; disabled own descriptors match baseline; duplicate apply is idempotent; marker and URL persist; no navigation or reload');
  console.log('PASS: a new tab starts with the persistent current compatibility settings');
  console.log('PASS: virtual fullscreen request/exit leaves the browser window unchanged');
  clearTimeout(timer);
  app.exit(0);
 }catch(error){console.error(error.stack);clearTimeout(timer);app.exit(1)}
});
