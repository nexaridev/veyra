const {app,ipcMain,BrowserWindow,dialog}=require('electron');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const output=process.env.VEYRA_QA_OUTPUT;
const profile=process.env.VEYRA_QA_PROFILE;
if(!profile||!output)throw Error('Set VEYRA_QA_PROFILE and VEYRA_QA_OUTPUT');
fs.mkdirSync(profile,{recursive:true});fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(profile,'profile.json'),JSON.stringify({settings:{autoUpdateFilters:false,eco:false},bookmarks:[],history:[]}));
app.setPath('userData',profile);
app.commandLine.appendSwitch('host-resolver-rules','MAP upgrade.veyra.test 127.0.0.1');
const file=path.resolve(__dirname,'../src/main.cjs');const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));
let source=fs.readFileSync(file,'utf8').replace("win.once('ready-to-show',openWindow);",'').replace('width:1380,height:900','show:false,width:1380,height:900').replace('width:1000,height:760','show:false,width:1000,height:760');
source+='\nmodule.exports={newTab,navigate,choose,sleepTab,diagnose,sessionFor,getTabs:()=>tabs,getWindow:()=>win,getVault:()=>vault,getPrivacy:()=>privacy,getDB:()=>db,getPopups:()=>popups};';
mod._compile(source,file);const api=mod.exports;const results=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const deadline=setTimeout(()=>{console.error('FAIL: timeout');app.exit(1)},60000);
async function check(name,fn){await fn();results.push({name,passed:true});console.log('PASS: '+name)}
async function until(fn,ms=18000){const end=Date.now()+ms;while(Date.now()<end){if(await fn())return;await delay(30)}throw Error('Condition timed out')}
app.whenReady().then(async()=>{
 try{
  await until(()=>api.getWindow());const win=api.getWindow();await until(()=>!win.webContents.isLoading());
  win.webContents.setBackgroundThrottling(false);
  await win.webContents.insertCSS('*{animation:none!important;transition:none!important}');
  await delay(250);
  const ui=script=>win.webContents.executeJavaScript(script,true);
  const cmd=(a,p)=>ui('window.veyra.command('+JSON.stringify(a)+','+JSON.stringify(p)+')');
  const fixture=`<!doctype html><html><head><title>Veyra QA fixture</title></head><body><h1>Local fixture</h1><form id="login" action="/submit"><input name="username" autocomplete="username"><input name="password" type="password" autocomplete="current-password"><button>Sign in</button></form><script>window.submitCount=0;document.querySelector('form').addEventListener('submit',e=>{e.preventDefault();window.submitCount++});window.messageReceived='';window.addEventListener('message',e=>window.messageReceived=e.data);</script></body></html>`;
  for(const mode of ['private','google','temporary'])api.sessionFor(mode).protocol.handle('https',()=>new Response(fixture,{headers:{'content-type':'text/html'}}));
  await check('home, SVG logo, toolbar and sidebar render without text icons',async()=>{
   assert(await ui("!!document.querySelector('.wordmark img[src=\"assets/logo.svg\"]')"));
   assert.equal(await ui("document.querySelectorAll('#rail button svg').length"),9);
   assert.equal(await ui("document.querySelectorAll('.toolbar button > .svg-icon').length"),9);
   assert(!(await ui("document.body.innerText.includes('Ⅴ')")));
   fs.writeFileSync(path.join(output,'veyra-home.png'),(await win.webContents.capturePage()).toPNG());
  });
  const tab=api.newTab();await api.navigate(tab,'https://login.veyra.test/');await delay(150);
  await check('protected identity is consistent between page and worker',async()=>{
   const report=await api.diagnose();assert(!report.page.userAgent.includes('Electron/'));
   assert.equal(report.page.userAgent,report.page.worker.userAgent);assert.equal(report.page.cores,report.page.worker.cores);
   assert.equal(await tab.view.webContents.executeJavaScript('typeof window.veyra'),'undefined');
  });
  await check('separate persistent Google and ephemeral temporary profiles',async()=>{
   const a=api.sessionFor('private'),b=api.sessionFor('google'),t=api.sessionFor('temporary');assert.notEqual(a,b);assert(!a.getUserAgent().includes('Electron/'));assert(b.getUserAgent().includes('Electron/'));
   await b.cookies.set({url:'https://login.veyra.test',name:'isolation',value:'google'});assert.equal((await a.cookies.get({name:'isolation'})).length,0);assert.equal((await t.cookies.get({name:'isolation'})).length,0);
   assert.equal(t.isPersistent(),false);
  });
  await check('real filter engine blocks analytics and preserves normal resources',async()=>{
   const p=api.getPrivacy();const result=await p.ublock.dispatch(api.sessionFor('private'),'onBeforeRequest',{id:1,url:'https://www.google-analytics.com/analytics.js',resourceType:'script',webContentsId:-1},'https://example.com');assert(result.cancel||result.redirectUrl);
   const safe=await p.ublock.dispatch(api.sessionFor('private'),'onBeforeRequest',{id:2,url:'https://example.com/app.js',resourceType:'script',webContentsId:-1},'https://example.com');assert(!safe.cancel&&!safe.redirectUrl);
   assert(p.thirdParty({url:'https://tracker.example.net/a',resourceType:'xhr'},'https://example.com'));
  });
  await check('bookmark create, folder, edit and search UI',async()=>{
   await cmd('bookmark-save',{url:'https://example.com',title:'QA bookmark',folder:'Research'});await cmd('panel','bookmarks');await delay(100);
   const saved=api.getDB().bookmarks[0];assert.equal(saved.folder,'Research');
   await cmd('bookmark-save',{...saved,title:'Renamed bookmark'});assert.equal(api.getDB().bookmarks.length,1);
   await ui("const input=document.querySelector('#bookmark-search');input.value='Renamed';input.dispatchEvent(new Event('input',{bubbles:true}));");assert(await ui("document.querySelector('#bookmark-rows').innerText.includes('Renamed bookmark')"));
   fs.writeFileSync(path.join(output,'veyra-bookmarks.png'),(await win.webContents.capturePage()).toPNG());
  });
  const master='Veyra QA master phrase 2026!';
  await check('vault creation, authenticated encryption, no plaintext at rest',async()=>{
   await cmd('panel','passwords');await cmd('vault-create',master);await cmd('vault-save',{origin:'https://login.veyra.test',username:'qa-user@example.test',password:'Only-A-Test-Secret-987!'});
   const disk=fs.readFileSync(path.join(profile,'passwords.vault'),'utf8');assert(!disk.includes('Only-A-Test'));assert(!disk.includes('qa-user'));assert(!disk.includes('login.veyra.test'));
   const list=await cmd('vault-list');assert.equal(list.length,1);assert(!('password' in list[0]));
  });
  await check('manual fill stays on exact HTTPS origin and never submits',async()=>{
   const entry=(await cmd('vault-list'))[0];await cmd('vault-fill',entry.id);
   assert.equal(await tab.view.webContents.executeJavaScript('document.querySelector("input[type=password]").value'),'Only-A-Test-Secret-987!');
   assert.equal(await tab.view.webContents.executeJavaScript('window.submitCount'),0);
   await api.navigate(tab,'https://other.veyra.test/');await assert.rejects(()=>cmd('vault-fill',entry.id));
   await api.navigate(tab,'https://login.veyra.test/');
  });
  await check('lock removes access; wrong master password rejected; reopen succeeds',async()=>{
   await cmd('vault-lock');await assert.rejects(()=>cmd('vault-list'));await assert.rejects(()=>cmd('vault-unlock','incorrect password'));
   await delay(2100);await cmd('vault-unlock',master);assert.equal((await cmd('vault-list')).length,1);
   const generated=await cmd('vault-generate',24);assert.equal(generated.length,24);assert(/[A-Z]/.test(generated)&&/[a-z]/.test(generated)&&/[0-9]/.test(generated));
  });
  await check('submitted credentials offered only from top-level HTTPS page',async()=>{
   await tab.view.webContents.executeJavaScript("document.querySelector('[name=username]').value='second-user';document.querySelector('[type=password]').value='Second-Test-Secret!';document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));");
   await until(async()=>!!(await cmd('state')).pendingCredential);assert.equal((await cmd('state')).pendingCredential.origin,'https://login.veyra.test');
   await cmd('vault-dismiss');
  });
  await check('popup retains opener, postMessage and matching session when enabled',async()=>{api.getDB().settings.popupWindows=true;
   await tab.view.webContents.executeJavaScript("window.open('https://login.veyra.test/popup');true");await until(()=>api.getPopups().size>0);
   const child=[...api.getPopups()][0];await until(()=>!child.webContents.isLoading());assert.equal(child.webContents.session,tab.view.webContents.session);
   assert(await child.webContents.executeJavaScript('!!window.opener'));await child.webContents.executeJavaScript("window.opener.postMessage('qa-popup','https://login.veyra.test')");await until(async()=>await tab.view.webContents.executeJavaScript('window.messageReceived')==='qa-popup');child.close();
  });
  await check('sleep protects active, pinned and edited tabs; waking reloads',async()=>{
   assert.equal(api.sleepTab(tab),false);const other=api.newTab();await api.navigate(other,'https://other.veyra.test/');tab.dirty=true;assert.equal(api.sleepTab(tab),false);tab.dirty=false;tab.pinned=true;assert.equal(api.sleepTab(tab),false);tab.pinned=false;
   assert.equal(api.sleepTab(tab),true);assert.equal(tab.sleeping,true);api.choose(tab.id);await until(()=>!!tab.view&&!tab.loading);assert.equal(tab.sleeping,false);
  });
  await check('temporary visits are excluded from saved history',async()=>{
   const temp=api.newTab('veyra://newtab','temporary');await api.navigate(temp,'https://ephemeral.veyra.test/');await delay(100);assert(!api.getDB().history.some(h=>h.url.includes('ephemeral.veyra.test')));
  });
  await check('real HTTPS requests strip third-party cookies and send privacy headers',async()=>{
   const https=require('node:https');
   const tls=path.resolve(output,'../../work/qa-tls');const seen=[];
   const server=https.createServer({key:fs.readFileSync(path.join(tls,'key.pem')),cert:fs.readFileSync(path.join(tls,'cert.pem'))},(req,res)=>{
    seen.push({url:req.url,headers:req.headers});res.setHeader('Content-Type','text/html');
    if(req.url.startsWith('/cookie'))res.setHeader('Set-Cookie','third_response=qa; SameSite=None; Secure; Path=/');
    res.end('<!doctype html><title>Network QA</title><h1>Network fixture</h1>');
   });
   await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
   const ses=api.sessionFor('private');await ses.protocol.unhandle('https');
   ses.setCertificateVerifyProc((request,callback)=>callback(['127.0.0.1','localhost','upgrade.veyra.test'].includes(request.hostname)?0:-3));
   try{
    const n=api.newTab();await api.navigate(n,'https://localhost:'+port+'/');
    await ses.cookies.set({url:'https://127.0.0.1:'+port,name:'third_existing',value:'qa',secure:true,sameSite:'no_restriction'});
    const fetchThird=suffix=>n.view.webContents.executeJavaScript("fetch('https://127.0.0.1:"+port+"/cookie"+suffix+"',{credentials:'include',mode:'no-cors'}).then(()=>true)");
    await fetchThird('?protected');const protectedRequest=seen.find(x=>x.url==='/cookie?protected');assert(protectedRequest);assert(!protectedRequest.headers.cookie);assert.equal(protectedRequest.headers['sec-gpc'],'1');assert.equal(protectedRequest.headers.dnt,'1');
    assert.equal((await ses.cookies.get({name:'third_response'})).length,0);
    await cmd('settings',{thirdPartyCookies:false});await fetchThird('?allowed');const allowed=seen.find(x=>x.url==='/cookie?allowed');assert(allowed.headers.cookie?.includes('third_existing=qa'));
    await cmd('settings',{thirdPartyCookies:true});
    await api.navigate(n,'http://upgrade.veyra.test:'+port+'/upgrade');assert(n.view.webContents.getURL().startsWith('https://upgrade.veyra.test:'));
   }finally{ses.setCertificateVerifyProc(null);ses.protocol.handle('https',()=>new Response(fixture,{headers:{'content-type':'text/html'}}));server.closeAllConnections();await new Promise(r=>server.close(r));}
  });
  await check('performance controls and settings render',async()=>{
   await cmd('panel','performance');await delay(100);assert(await ui("!!document.querySelector('#performance-form input[name=ramTargetMB]')"));
   fs.writeFileSync(path.join(output,'veyra-performance.png'),(await win.webContents.capturePage()).toPNG());
   await cmd('navigate','veyra://settings');await delay(150);assert(await ui("!!document.querySelector('#settings-form')"));assert.equal(await ui("document.querySelectorAll('#settings-form input[type=checkbox]').length"),9);
  });
  await cmd('navigate','veyra://newtab');await cmd('panel','passwords');await delay(150);
  console.log('LAYOUT '+await ui("JSON.stringify({panel:document.querySelector('#panel').getBoundingClientRect().toJSON(),hidden:document.querySelector('#panel').hidden,display:getComputedStyle(document.querySelector('#panel')).display,body:document.body.scrollWidth,content:document.querySelector('#content').getBoundingClientRect().toJSON()})"));
  fs.writeFileSync(path.join(output,'veyra-passwords.png'),(await win.webContents.capturePage()).toPNG());
  await cmd('vault-lock');fs.writeFileSync(path.join(output,'qa-results.json'),JSON.stringify({results,passed:results.length,googleLoginVerified:false},null,2));clearTimeout(deadline);console.log('ALL '+results.length+' CHECKS PASSED');app.exit(0);
 }catch(error){console.error(error.stack||error);fs.writeFileSync(path.join(output,'qa-results.json'),JSON.stringify({results,error:String(error.stack||error)},null,2));clearTimeout(deadline);app.exit(1)}
});
