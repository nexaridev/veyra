const fs = require('node:fs');
const path = require('node:path');
const {FiltersEngine, Request} = require('@ghostery/adblocker');
const lists = [
  ['easylist', 'https://easylist.to/easylist/easylist.txt'],
  ['easyprivacy', 'https://easylist.to/easylist/easyprivacy.txt']
];
class PrivacyEngine {
  constructor(userData, settings, changed = () => {}) {
    this.userData = userData; this.settings = settings; this.changed = changed;
    this.engine = null; this.updated = null; this.updating = false; this.error = null;
    this.load();
  }
  load() {
    const bundle = path.join(__dirname, 'assets', 'filters');
    let directory = bundle;
    const cache = path.join(this.userData, 'filters');
    if (lists.every(([name]) => fs.existsSync(path.join(cache, name+'.txt')))) directory=cache;
    try {
      const text = lists.map(([name]) => fs.readFileSync(path.join(directory,name+'.txt'),'utf8')).join('\n');
      this.engine = FiltersEngine.parse(text, {loadCosmeticFilters:false, enableCompression:true});
      this.updated = fs.statSync(path.join(directory,'easyprivacy.txt')).mtime.toISOString();
    } catch(error) {this.error='Не удалось загрузить списки блокировки.';}
  }
  status() {
    return {ready:!!this.engine, updated:this.updated, updating:this.updating, error:this.error,
      sources:lists.map(([,url])=>url), networkOnly:true};
  }
  async update() {
    if (this.updating) return;
    this.updating=true;this.error=null;this.changed();
    try {
      const content = await Promise.all(lists.map(async ([,url])=>{
        const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
        if(!response.ok)throw Error('HTTP '+response.status);
        const text=await response.text();
        if(text.length<10000||text.length>15000000||!text.includes('[Adblock'))throw Error('Invalid filter list');
        return text;
      }));
      const next=FiltersEngine.parse(content.join('\n'),{loadCosmeticFilters:false,enableCompression:true});
      const cache=path.join(this.userData,'filters');fs.mkdirSync(cache,{recursive:true});
      for(let i=0;i<lists.length;i++){
        const file=path.join(cache,lists[i][0]+'.txt');fs.writeFileSync(file+'.tmp',content[i]);fs.renameSync(file+'.tmp',file);
      }
      this.engine=next;this.updated=new Date().toISOString();
    }catch(error){this.error='Обновление списков не удалось. Используются прежние списки.';}
    finally{this.updating=false;this.changed();}
  }
  request(details, sourceUrl) {
    return Request.fromRawDetails({url:details.url,sourceUrl:sourceUrl||details.referrer||'',type:details.resourceType||'other'});
  }
  excepted(url) {
    try{return this.settings().siteExceptions.includes(new URL(url).origin);}catch{return false;}
  }
  blocks(details, sourceUrl) {
    return !!(this.engine && this.settings().trackers && details.resourceType!=='mainFrame' &&
      !this.excepted(sourceUrl) && this.engine.match(this.request(details,sourceUrl)).match);
  }
  thirdParty(details, sourceUrl) {
    if(details.resourceType==='mainFrame'||!sourceUrl||this.excepted(sourceUrl))return false;
    try{return this.request(details,sourceUrl).isThirdParty;}catch{return false;}
  }
}
module.exports={PrivacyEngine};
