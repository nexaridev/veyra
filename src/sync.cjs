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
 constructor(){this.auth=null;this.busy=false}
 status(){return {signedIn:!!this.auth,email:this.auth?.user?.email||'',busy:this.busy}}
 async request(route,method='GET',body,authenticated=false){
  if(authenticated&&!this.auth?.access_token)throw Error('Сначала войди в аккаунт.');
  const response=await fetch(config.supabaseURL+route,{method,headers:{apikey:config.publishableKey,'Content-Type':'application/json',...(authenticated?{Authorization:'Bearer '+this.auth.access_token}:{}),...(method==='POST'&&route.startsWith('/rest/')?{Prefer:'resolution=merge-duplicates,return=minimal'}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000),redirect:'error'});
  if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(String(error.msg||error.message||error.error_description||'Запрос не выполнен: '+response.status).slice(0,300))}
  return response.status===204?null:response.json().catch(()=>null);
 }
 async login(email,password,signup=false){if(typeof email!=='string'||email.length>254||typeof password!=='string'||password.length<8||password.length>1024)throw Error('Проверь email и пароль (минимум 8 символов).');const result=await this.request(signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password','POST',{email,password});if(result.access_token)this.auth=result;return {confirmation:!result.access_token}}
 async rows(){return this.request('/rest/v1/veyra_sync?user_id=eq.'+encodeURIComponent(this.auth?.user?.id||'')+'&select=device_id,platform,payload,updated_at&order=updated_at.desc&limit=20','GET',undefined,true)}
 async upload(deviceID,platform,data,passphrase){const payload=await seal(data,passphrase);return this.request('/rest/v1/veyra_sync?on_conflict=user_id,device_id','POST',{user_id:this.auth?.user?.id,device_id:deviceID,platform,payload,updated_at:new Date().toISOString()},true)}
 async logout(){try{if(this.auth)await this.request('/auth/v1/logout','POST',{},true)}finally{this.auth=null}}
}
module.exports={SyncClient,seal,unseal};
