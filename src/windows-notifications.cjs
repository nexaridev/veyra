'use strict';
const fs=require('node:fs'),path=require('node:path');
const APP_ID='dev.veyra.browser',CLSID='{03D6B74A-045B-4B72-B5DA-F1B13BCE20A4}';
function configure(app){if(process.platform==='win32'){app.setAppUserModelId(APP_ID);app.setToastActivatorCLSID(CLSID);}}
function register(app,shell){
 if(process.platform!=='win32')return true;
 if(!app.isPackaged||process.env.VEYRA_QA_PROFILE)return true;
 const directory=path.join(app.getPath('appData'),'Microsoft','Windows','Start Menu','Programs','Veyra'),shortcut=path.join(directory,'Veyra.lnk');
 fs.mkdirSync(directory,{recursive:true});const exists=fs.existsSync(shortcut);
 return shell.writeShortcutLink(shortcut,exists?'update':'create',{...(exists?{}:{target:process.execPath,cwd:path.dirname(process.execPath),icon:process.execPath,iconIndex:0,description:'Veyra by Nexaridev'}),appUserModelId:APP_ID,toastActivatorClsid:CLSID});
}
module.exports={configure,register,APP_ID,CLSID};
