const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const DEFAULT_LIMIT=512*1024*1024;

function extensionIdFromManifest(manifestPath){
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(typeof manifest.key!=='string'||!manifest.key)return null;
 const digest=crypto.createHash('sha256').update(Buffer.from(manifest.key,'base64')).digest().subarray(0,16);
 let id='';for(const byte of digest)id+=String.fromCharCode(97+(byte>>4),97+(byte&15));
 return id;
}

function directorySize(directory){
 let total=0;const pending=[directory];
 while(pending.length){const current=pending.pop();let entries;try{entries=fs.readdirSync(current,{withFileTypes:true})}catch{continue}
  for(const entry of entries){const full=path.join(current,entry.name);if(entry.isDirectory()){pending.push(full);continue}if(!entry.isFile())continue;try{total+=fs.statSync(full).size}catch{}}
 }
 return total;
}

function recoverOversizedExtensionStorage({userData,manifestPath,limitBytes=DEFAULT_LIMIT,partitions=['veyra','veyra-google-native'],now=Date.now()}){
 const extensionId=extensionIdFromManifest(manifestPath);if(!extensionId)return [];
 const recovered=[];const stamp=new Date(now).toISOString().replace(/[:.]/g,'-');
 for(const partition of partitions){
  const store=path.join(userData,'Partitions',partition,'Local Extension Settings',extensionId);
  if(!fs.existsSync(store))continue;
  const sizeBytes=directorySize(store);if(sizeBytes<=limitBytes)continue;
  const backup=path.join(userData,'Recovery','uBlock',`${stamp}-${partition}-${extensionId}`);
  try{fs.mkdirSync(path.dirname(backup),{recursive:true});fs.renameSync(store,backup);recovered.push({partition,sizeBytes,backup})}catch{}
 }
 return recovered;
}

module.exports={DEFAULT_LIMIT,extensionIdFromManifest,directorySize,recoverOversizedExtensionStorage};
