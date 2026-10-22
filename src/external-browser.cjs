const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const definitions=[
 {id:'chrome',name:'Chrome',relative:'Google/Chrome/Application/chrome.exe',chromium:true},
 {id:'edge',name:'Edge',relative:'Microsoft/Edge/Application/msedge.exe',chromium:true},
 {id:'firefox',name:'Firefox',relative:'Mozilla Firefox/firefox.exe',chromium:false},
 {id:'brave',name:'Brave',relative:'BraveSoftware/Brave-Browser/Application/brave.exe',chromium:true}
];
function installedBrowsers(){
 const roots=[process.env.ProgramFiles,process.env['ProgramFiles(x86)'],process.env.LOCALAPPDATA].filter(Boolean);
 return definitions.flatMap(browser=>{
  const executable=roots.map(root=>path.join(root,browser.relative)).find(file=>fs.existsSync(file));
  return executable?[{...browser,executable}]:[];
 });
}
function launchPlan(browser,userData,url){
 const target=new URL(url);
 if(!['https:','http:'].includes(target.protocol)||target.username||target.password||target.href.length>8192)throw Error('Этот адрес не поддерживается.');
 if(!definitions.some(item=>item.id===browser.id))throw Error('Браузер не найден.');
 const args=browser.chromium?
  ['--user-data-dir='+path.join(userData,'service-profiles',browser.id),'--no-first-run','--no-default-browser-check','--new-window',target.href]:
  ['-new-window',target.href];
 return {executable:browser.executable,args};
}
async function openExternal(userData,url,browserId='auto'){
 const browsers=installedBrowsers();
 const browser=browserId==='auto'?browsers[0]:browsers.find(item=>item.id===browserId);
 if(!browser)throw Error('Браузер не найден. Установи Chrome, Edge или Firefox.');
 const plan=launchPlan(browser,userData,url);
 await new Promise((resolve,reject)=>{
  const child=spawn(plan.executable,plan.args,{detached:true,stdio:'ignore',shell:false,windowsHide:false});
  child.once('error',()=>reject(Error('Не удалось открыть браузер.')));
  child.once('spawn',()=>{child.unref();resolve()});
 });
 return {browser:browser.name,separateProfile:browser.chromium};
}
function googleServiceTarget(url,previous){
 try{
  const u=new URL(url);
  if(u.hostname==='accounts.google.com'){
   const next=u.searchParams.get('continue');
   if(next){const candidate=new URL(next);if(candidate.protocol==='https:'&&(/(^|\.)google\.com$/.test(candidate.hostname)||/(^|\.)youtube\.com$/.test(candidate.hostname)))return candidate.href;}
   if(previous&&new URL(previous).protocol==='https:'&&new URL(previous).hostname!=='accounts.google.com')return previous;
   return 'https://www.google.com/';
  }
  return ['https:','http:'].includes(u.protocol)?u.href:'https://www.google.com/';
 }catch{return 'https://www.google.com/';}
}
module.exports={installedBrowsers,launchPlan,openExternal,googleServiceTarget};
