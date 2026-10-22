const fs=require('node:fs'),path=require('node:path');
function configureProfile(app){
 const current=app.getPath('userData'),base=app.getPath('appData');
 // Test harnesses provide an isolated path. Production always uses the same directory.
 const customDevelopment=!app.isPackaged&&path.dirname(path.resolve(current)).toLowerCase()!==path.resolve(base).toLowerCase();
 const directory=process.env.VEYRA_QA_PROFILE||(customDevelopment?current:path.join(base,'Veyra'));
 fs.mkdirSync(directory,{recursive:true});app.setPath('userData',directory);app.setPath('sessionData',directory);return directory;
}
async function flushSessions(sessions){await Promise.all([...sessions].filter(([mode])=>mode!=='temporary').map(async([,ses])=>{ses.flushStorageData();await ses.cookies.flushStore()}))}
module.exports={configureProfile,flushSessions};
