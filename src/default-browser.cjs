const {execFile}=require('node:child_process');const {promisify}=require('node:util');const run=promisify(execFile);
async function register(app){
 if(process.platform!=='win32'||!app.isPackaged)throw Error('Для выбора браузером по умолчанию запусти собранную Veyra.exe.');
 const exe=process.execPath;if(exe.includes('"'))throw Error('Некорректный путь приложения.');
 const root='HKCU\\Software\\Clients\\StartMenuInternet\\Veyra';
 const add=(key,name,value)=>run('reg.exe',['add',key,...(name?['/v',name]:['/ve']),'/t','REG_SZ','/d',value,'/f'],{windowsHide:true});
 await add(root,'','Veyra');await add(root+'\\DefaultIcon','',exe+',0');await add(root+'\\shell\\open\\command','',`"${exe}"`);
 await add(root+'\\Capabilities','ApplicationName','Veyra');await add(root+'\\Capabilities','ApplicationDescription','Veyra Browser');await add(root+'\\Capabilities','ApplicationIcon',exe+',0');
 const prog='HKCU\\Software\\Classes\\VeyraURL';await add(prog,'','Veyra Web Address');await add(prog,'URL Protocol','');await add(prog+'\\DefaultIcon','',exe+',0');await add(prog+'\\shell\\open\\command','',`"${exe}" "%1"`);
 for(const scheme of ['http','https'])await add(root+'\\Capabilities\\URLAssociations',scheme,'VeyraURL');
 await add('HKCU\\Software\\RegisteredApplications','Veyra','Software\\Clients\\StartMenuInternet\\Veyra\\Capabilities');
}
async function isDefault(app,platform=process.platform,query=run){
 if(platform!=='win32')return app.isDefaultProtocolClient('http')&&app.isDefaultProtocolClient('https');
 const values=await Promise.all(['http','https'].map(async scheme=>{try{const result=await query('reg.exe',['query','HKCU\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\'+scheme+'\\UserChoice','/v','ProgId'],{windowsHide:true,timeout:3000,encoding:'utf8'});return result.stdout.match(/\bProgId\s+REG_SZ\s+([^\r\n]+)/i)?.[1].trim()||null;}catch{return null;}}));
 if(values.every(value=>value!==null))return values.every(value=>value.toLowerCase()==='veyraurl');
 return app.isDefaultProtocolClient('http')&&app.isDefaultProtocolClient('https');
}
async function registerHTML(app){
 if(process.platform!=='win32'||!app.isPackaged)return;
 const exe=process.execPath;if(exe.includes('"'))return;
 const classes='HKCU\\Software\\Classes',client='HKCU\\Software\\Clients\\StartMenuInternet\\Veyra',cap=client+'\\Capabilities';
 const add=(key,name,value,type='REG_SZ')=>run('reg.exe',['add',key,...(name?['/v',name]:['/ve']),'/t',type,'/d',value,'/f'],{windowsHide:true,timeout:5000});
 await add(client,'','Veyra');await add(client+'\\DefaultIcon','',exe+',0');await add(client+'\\shell\\open\\command','',`"${exe}"`);
 await add(cap,'ApplicationName','Veyra');await add(cap,'ApplicationDescription','Veyra Browser');await add(cap,'ApplicationIcon',exe+',0');
 const groups={VeyraHTML:['.html','.htm','.xhtml','.xht','.shtml'],VeyraSVG:['.svg'],VeyraXML:['.xml'],VeyraText:['.txt','.json','.css','.js','.mjs','.csv','.md'],VeyraPDF:['.pdf'],VeyraImage:['.avif','.png','.jpg','.jpeg','.gif','.webp','.bmp','.ico']};
 for(const [prog,extensions] of Object.entries(groups)){
  await add(classes+'\\'+prog,'',({VeyraHTML:'Veyra HTML Document',VeyraSVG:'Veyra SVG Image',VeyraXML:'Veyra XML Document',VeyraText:'Veyra Text Document',VeyraPDF:'Veyra PDF Document',VeyraImage:'Veyra Image'}[prog]));
  await add(classes+'\\'+prog+'\\DefaultIcon','',exe+',0');await add(classes+'\\'+prog+'\\shell\\open\\command','',`"${exe}" "%1"`);
  for(const ext of extensions){
   await add(cap+'\\FileAssociations',ext,prog);
   await add(classes+'\\'+ext+'\\OpenWithProgids',prog,'','REG_NONE');
  }
 }
 await add('HKCU\\Software\\RegisteredApplications','Veyra','Software\\Clients\\StartMenuInternet\\Veyra\\Capabilities');
}
module.exports={register,isDefault,registerHTML};
