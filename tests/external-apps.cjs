const assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),{ExternalApplications,externalURL}=require('../src/external-apps.cjs');
for(const value of ['javascript:alert(1)','file:///a','shell:AppsFolder','ms-msdt:/id','powershell:command','roblox-player:abc\n','roblox-player:abc%00','roblox-player:"bad"'])assert.equal(externalURL(value),null,value);
const uri='roblox-player:1+launchmode:play+gameinfo:fixture';assert.equal(externalURL(uri).url,uri);
function fixture({temporary=false,name='Roblox Player'}={}){const wc=new EventEmitter();wc.getURL=()=>wc.url;wc.url='https://www.roblox.com/games/1';wc.isDestroyed=()=>false;const settings={externalAppPermissions:{}},launched=[];let saves=0;const m=new ExternalApplications({settings:()=>settings,save:()=>saves++,changed:()=>{},active:()=>true,available:()=>true,temporary:()=>temporary,application:()=>name,launch:async url=>{launched.push(url)},failed:()=>assert.fail('launch failure'),show:()=>()=>{}});m.bind(wc);return {m,wc,settings,launched,get saves(){return saves}};}
(async()=>{
 let f=fixture(),promise=f.m.request(f.wc,uri,f.wc.url),p=f.m.snapshot();assert(p.found);assert(!JSON.stringify(p).includes('gameinfo'));assert.equal(f.launched.length,0);
 assert.equal(f.m.respond({id:'wrong',allow:true}),false);f.m.respond({id:p.id,allow:false});assert.equal(await promise,false);assert.equal(f.launched.length,0);
 f=fixture();promise=f.m.request(f.wc,uri,f.wc.url);p=f.m.snapshot();f.m.respond({id:p.id,allow:true,remember:true});assert.equal(await promise,true);assert.deepEqual(f.launched,[uri]);assert.equal(f.settings.externalAppPermissions['https://www.roblox.com']['roblox-player'],true);
 f.m.cooldowns.delete(f.wc);assert.equal(await f.m.request(f.wc,uri,f.wc.url),true);assert.equal(f.launched.length,2);f.m.reset('https://www.roblox.com');assert.deepEqual(f.settings.externalAppPermissions,{});
 f=fixture();assert.equal(await f.m.request(f.wc,uri,'https://evil.example'),false);assert.equal(f.m.snapshot(),null);
 promise=f.m.request(f.wc,uri,f.wc.url);f.wc.emit('did-start-navigation',{},'https://www.roblox.com/other',false,true);assert.equal(await promise,false);assert.equal(f.launched.length,0);
 f=fixture();promise=f.m.request(f.wc,uri,f.wc.url);p=f.m.snapshot();f.wc.url='https://evil.example';assert.equal(f.m.respond({id:p.id,allow:true}),false);assert.equal(await promise,false);
 for(const options of [{temporary:true},{name:''}]){f=fixture(options);promise=f.m.request(f.wc,uri,f.wc.url);p=f.m.snapshot();assert.equal(p.canRemember,!options.temporary);f.m.respond({id:p.id,allow:true,remember:true});await promise;assert.deepEqual(f.settings.externalAppPermissions,{});assert.equal(f.launched.length,options.name===''?0:1);}
 f=fixture();f.wc.url='http://www.roblox.com/';promise=f.m.request(f.wc,uri,f.wc.url);assert.equal(f.m.snapshot().canRemember,false);f.m.cancel();await promise;
 console.log('PASS external applications: explicit consent, token redaction, exact origin grants, reset, cooldown, navigation cancellation, private/HTTP and missing handlers');
})().catch(e=>{console.error(e);process.exitCode=1});
