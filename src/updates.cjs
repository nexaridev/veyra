const crypto=require('node:crypto'),fs=require('node:fs');
const config=require('./release-config.json');
const allowedURL=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&url.hostname==='github.com'&&url.pathname.startsWith('/nexaridev/veyra/releases/download/')}catch{return false}};
function verifyManifest(envelope,publicKey=config.publicKey){
 if(typeof envelope?.payload!=='string'||envelope.payload.length>65536||typeof envelope.signature!=='string'||!crypto.verify(null,Buffer.from(envelope.payload),publicKey,Buffer.from(envelope.signature,'base64')))throw Error('Подпись обновления недействительна.');
 const manifest=JSON.parse(envelope.payload);if(manifest.schema!==1||!/^\d+\.\d+\.\d+$/.test(manifest.version)||!allowedURL(manifest.windows?.url)||!/^[a-f0-9]{64}$/.test(manifest.windows.sha256)||!Number.isSafeInteger(manifest.windows.size)||manifest.windows.size<1||manifest.windows.size>600000000)throw Error('Некорректное обновление.');return manifest;
}
async function check(){const response=await fetch(config.manifestURL,{signal:AbortSignal.timeout(15000)});if(response.status===404)throw Error('Подписанное обновление пока не опубликовано.');if(!response.ok)throw Error('Сервер обновлений: '+response.status);const text=await response.text();if(text.length>100000)throw Error('Некорректный ответ.');return verifyManifest(JSON.parse(text))}
async function download(manifest,target){
 // Verify again at the operation boundary; callers retain the signed envelope.
 const artifact=manifest.windows;if(!allowedURL(artifact.url))throw Error('Недопустимый адрес.');
 const response=await fetch(artifact.url,{signal:AbortSignal.timeout(600000)});if(!response.ok||!response.body)throw Error('Не удалось загрузить обновление.');
 const part=target+'.'+crypto.randomUUID()+'.part',hash=crypto.createHash('sha256');let size=0;const file=await fs.promises.open(part,'wx');
 try{for await(const chunk of response.body){size+=chunk.length;if(size>artifact.size)throw Error('Размер обновления не совпал.');hash.update(chunk);let offset=0;while(offset<chunk.length){const written=await file.write(chunk,offset,chunk.length-offset);offset+=written.bytesWritten;}}await file.close();if(size!==artifact.size||hash.digest('hex')!==artifact.sha256)throw Error('Контрольная сумма обновления не совпала.');fs.renameSync(part,target)}catch(error){await file.close().catch(()=>{});try{fs.unlinkSync(part)}catch{}throw error}
}
module.exports={verifyManifest,check,download};
