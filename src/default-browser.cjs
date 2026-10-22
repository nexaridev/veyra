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
module.exports={register};
