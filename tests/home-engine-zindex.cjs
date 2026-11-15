const {app}=require('electron'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),profile=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'veyra-home-layer-'));
fs.writeFileSync(path.join(profile,'profile.json'),JSON.stringify({settings:{autoUpdateFilters:false,eco:false}}));app.setPath('userData',profile);
const file=path.join(root,'src/main.cjs'),instance=new Module(file,module);instance.filename=file;instance.paths=Module._nodeModulePaths(path.dirname(file));
instance._compile(fs.readFileSync(file,'utf8').replace("win.once('ready-to-show',openWindow);",'').replace("webPreferences:{preload:path.join(__dirname,'preload.cjs')","webPreferences:{offscreen:true,backgroundThrottling:false,preload:path.join(__dirname,'preload.cjs')")+'\nmodule.exports={getWindow:()=>win};',file);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));async function until(fn){for(let i=0;i<500;i++){if(await fn())return;await delay(20)}throw Error('Timed out')}
const timeout=setTimeout(()=>app.exit(1),20000);
app.whenReady().then(async()=>{try{
 await until(()=>instance.exports.getWindow());const win=instance.exports.getWindow();await until(()=>!win.webContents.isLoading());
 const ui=script=>win.webContents.executeJavaScript(script,true);await ui("window.veyra.command('navigate','veyra://newtab')");
 await until(()=>ui('!!document.querySelector("#home-engine-toggle")'));
 await ui("const input=document.querySelector('#home-query');input.value='search layering';input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#home-engine-toggle').click()");
 await until(()=>ui("!document.querySelector('#home-engine-menu').hidden&&!document.querySelector('#home-suggestions').hidden"));
 const target=await ui("(()=>{const menu=document.querySelector('#home-engine-menu'),r=menu.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+18);return {hit:hit?.closest('#home-engine-menu')?.id||'',engineItems:menu.querySelectorAll('button').length,suggestionsVisible:!document.querySelector('#home-suggestions').hidden}})()");
 assert.equal(target.engineItems,2);assert.equal(target.suggestionsVisible,true);assert.equal(target.hit,'home-engine-menu','Search engine menu must stay above simultaneously open suggestions');
 console.log('PASS: Google/DuckDuckGo selector is hit-testable above open search suggestions');clearTimeout(timeout);app.exit(0);
}catch(error){console.error(error.stack);clearTimeout(timeout);app.exit(1)}});
