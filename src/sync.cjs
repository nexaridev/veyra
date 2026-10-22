const crypto=require('node:crypto');
const {promisify}=require('node:util');
const derive=promisify(crypto.pbkdf2);
const config=require('./cloud-config.json');
async function seal(data,passphrase){
 if(typeof passphrase!=='string'||passphrase.length<16||passphrase.length>1024)throw Error('Фраза синхронизации: от 16 до 1024 символов.');
 const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),key=await derive(passphrase,salt,600000,32,'sha256');
 try{const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const bytes=Buffer.concat([cipher.update(JSON.stringify(data),'utf8'),cipher.final(),cipher.getAuthTag()]);return {v:1,salt:salt.toString('base64'),iv:iv.toString('base64'),data:bytes.toString('base64')}}finally{key.fill(0)}
}
async function unseal(payload,passphrase){
 if(payload?.v!==1||typeof payload.data!=='string'||payload.data.length>2000000||typeof passphrase!=='string'||passphrase.length>1024)throw Error('Некорректная копия.');
 const salt=Buffer.from(payload.salt||'','base64'),iv=Buffer.from(payload.iv||'','base64'),bytes=Buffer.from(payload.data,'base64');if(salt.length!==16||iv.length!==12||bytes.length<16)throw Error('Некорректная копия.');
 const key=await derive(passphrase,salt,600000,32,'sha256');
 try{const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(bytes.subarray(-16));return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(0,-16)),decipher.final()]).toString('utf8'))}finally{key.fill(0)}
}
class SyncClient{
 constructor(){this.auth=null;this.busy=false;this.store=null}
 configureStore(file,safeStorage){
  const fs=require('node:fs');this.store={file,safeStorage};
  try{if(safeStorage.isEncryptionAvailable()){const value=JSON.parse(safeStorage.decryptString(fs.readFileSync(file)));if(/^[a-f0-9]{64}$/.test(value.access_token)&&typeof value.user?.email==='string')this.auth=value}}catch{}
 }
 persist(){if(!this.store)return;const fs=require('node:fs'),{file,safeStorage}=this.store;try{if(this.auth&&safeStorage.isEncryptionAvailable()){fs.writeFileSync(file+'.tmp',safeStorage.encryptString(JSON.stringify(this.auth)));fs.renameSync(file+'.tmp',file)}else fs.rmSync(file,{force:true})}catch{try{fs.rmSync(file,{force:true})}catch{}}}
 accept(result){if(result?.access_token){this.auth={access_token:result.access_token,user:result.user};this.persist()}return {confirmation:!result?.access_token}}
 status(){return {signedIn:!!this.auth,email:this.auth?.user?.email||'',busy:this.busy}}
 async request(route,body={},authenticated=false){
  if(authenticated&&!this.auth?.access_token)throw Error('Сначала войди в аккаунт.');
  const response=await fetch(config.apiURL+'/api/v1/'+route,{method:'POST',headers:{'Content-Type':'application/json',...(authenticated?{Authorization:'Bearer '+this.auth.access_token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(40000),redirect:'error'});
  if(!response.ok){if(authenticated&&response.status===401){this.auth=null;this.persist()}const error=await response.json().catch(()=>({}));throw Error(String(error.error||'Запрос не выполнен: '+response.status).slice(0,300))}
  return response.status===204?null:response.json().catch(()=>null);
 }
 async login(email,password,signup=false){if(typeof email!=='string'||email.length>254||typeof password!=='string'||password.length<12||Buffer.byteLength(password)>72)throw Error('Пароль: минимум 12 символов, максимум 72 байта UTF-8.');return this.accept(await this.request(signup?'signup':'login',{email,password}))}
 async verify(email,code){return this.accept(await this.request('verify',{email,code}))}
 async resetRequest(email){return this.request('reset-request',{email})}
 async reset(email,code,password){return this.accept(await this.request('reset',{email,code,password}))}
 async changePassword(currentPassword,password){await this.request('password',{currentPassword,password},true);this.auth=null;this.persist();return true}
 async deleteAccount(currentPassword){await this.request('delete',{currentPassword},true);this.auth=null;this.persist();return true}
 async rows(){return (await this.request('sync-list',{},true)).rows}
 async upload(deviceID,platform,data,passphrase){const payload=await seal(data,passphrase);return this.request('sync-put',{device_id:deviceID,platform,payload},true)}
 async logout(all=false){try{if(this.auth)await this.request(all?'logout-all':'logout',{},true)}finally{this.auth=null;this.persist()}}
}
module.exports={SyncClient,seal,unseal};
