const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {extensionIdFromManifest,recoverOversizedExtensionStorage}=require('../src/extension-storage.cjs');

const root=fs.mkdtempSync(path.join(os.tmpdir(),'veyra-extension-storage-'));
try{
 const manifestPath=path.join(root,'manifest.json');
 const key='MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjcKp9ASbCHAKKeGDWmVlBQYIOyThLQ2uvt4SsxE+PBrk0n05WrevhdnIn4FuSg6yvQmZ3olX/4G0VwZO6KrD8C4Evu8vXA4BITdOYFQvXbgQLvvVRYlRgaLtHWVfhNKAw0pA9qoglY3tUZhBAzhPUirDTXMOPc1REnnnJSigseg8DGzjAKKAn5sQ99xKPr36Ua6jNSKajWW7ZdOUJnoGTId0ksjg+iSZYFV17ykZt9WWVhNQux2Z9KQHyYRjPwtXrl5LNP9R1Ti2rP/NVNUALen8uJ7ZIobkBTyqEXtM4nSd0AEk97ppymoKs9tsKOKB9BQEktPiZG+7YKmNVEdM6wIDAQAB';
 fs.writeFileSync(manifestPath,JSON.stringify({name:'uBlock Origin',key}));
 const id=extensionIdFromManifest(manifestPath);assert.equal(id,'leegbhpgolikohbhgpkmmogmjhcncjbl');
 const userData=path.join(root,'profile'),large=path.join(userData,'Partitions','veyra','Local Extension Settings',id),small=path.join(userData,'Partitions','veyra-google-native','Local Extension Settings',id);
 fs.mkdirSync(large,{recursive:true});fs.mkdirSync(small,{recursive:true});
 fs.writeFileSync(path.join(large,'store.ldb'),'preserve-uBlock-state');fs.writeFileSync(path.join(small,'store.ldb'),'small');
 fs.mkdirSync(path.join(userData,'Partitions','veyra','Network'),{recursive:true});fs.writeFileSync(path.join(userData,'Partitions','veyra','Network','Cookies'),'keep-cookies');
 const recovered=recoverOversizedExtensionStorage({userData,manifestPath,limitBytes:8,now:Date.UTC(2026,0,2)});
 assert.equal(recovered.length,1);assert.equal(recovered[0].partition,'veyra');
 assert.equal(fs.readFileSync(path.join(recovered[0].backup,'store.ldb'),'utf8'),'preserve-uBlock-state');
 assert.equal(fs.existsSync(large),false);assert.equal(fs.readFileSync(path.join(small,'store.ldb'),'utf8'),'small');
 assert.equal(fs.readFileSync(path.join(userData,'Partitions','veyra','Network','Cookies'),'utf8'),'keep-cookies');
 console.log('PASS: oversized uBlock storage is preserved in recovery and site cookies remain untouched');
}finally{fs.rmSync(root,{recursive:true,force:true})}
