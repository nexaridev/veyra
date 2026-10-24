const assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {SitePermissions}=require('../src/site-permissions.cjs');
class Page extends EventEmitter{constructor(){super();this.url='https://permission.veyra.test/'}getURL(){return this.url}isDestroyed(){return false}}
const settings={permissions:{}},page=new Page(),other=new Page();let changed=0,saves=0,result;
const manager=new SitePermissions({settings:()=>settings,save:()=>saves++,changed:()=>changed++,show:()=>changed++,notifications:()=>true});manager.bind(page);
manager.request(page,'media',value=>result=value,{requestingUrl:page.url,mediaTypes:['audio']});const first=manager.snapshot();assert.deepEqual(first.mediaTypes,['audio']);
assert.equal(manager.respond({id:'stale',allow:true}),false);assert.equal(result,undefined);
manager.respond({id:first.id,allow:true});assert.equal(result,true);assert(manager.check(page,'media',page.url,{mediaType:'audio'}));assert(!manager.check(page,'media',page.url,{mediaType:'video'}));assert(!manager.check(other,'media',other.url,{mediaType:'audio'}));assert.equal(saves,0);
const choice=manager.choose(page,{audio:true,devices:[{kind:'audioinput',deviceId:'one',label:'Microphone'}],current:{audio:'one'}});const picker=manager.snapshot();assert.equal(picker.stage,'devices');assert.equal(manager.respond({id:picker.id,allow:true,audio:'foreign'}),false);manager.respond({id:picker.id,allow:true,audio:'one',remember:true});
choice.then(value=>assert.equal(value.audio,'one'));
page.emit('did-start-navigation',{},'https://other.veyra.test/',false,true);assert(!manager.check(page,'media',page.url,{mediaType:'audio'}));
manager.request(page,'notifications',value=>result=value,{requestingUrl:'https://foreign.test/'});assert.equal(result,false);assert.equal(manager.snapshot(),null);
manager.request(page,'notifications',value=>result=value,{});const notice=manager.snapshot();manager.respond({id:notice.id,allow:true,remember:true});assert.equal(result,true);assert(manager.check(other,'notifications',other.url));
manager.request(page,'media',value=>result=value,{mediaTypes:['video']});const obsolete=manager.snapshot();page.url='https://moved.test/';manager.respond({id:obsolete.id,allow:true});assert.equal(result,false);assert.equal(manager.snapshot(),null);
assert(!manager.check(page,'notifications','http://permission.veyra.test/'));manager.reset();assert(changed>0);console.log('PASS permission origin/ID binding, per-device grants, temporary scope, remembered notifications, valid device IDs and navigation cancellation');
