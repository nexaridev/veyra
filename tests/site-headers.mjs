import assert from 'node:assert/strict';
import worker from '../infrastructure/site/worker.mjs';
const origin='https://veyra.veyra-nexaridev.workers.dev';
for(const [path,method,status] of [['/','GET',200],['/privacy?lang=ru','GET',200],['/assets/site.css','GET',200],['/health','GET',200],['/downloads/windows.json','GET',200],['/download/windows','GET',302],['/missing','GET',404],['/','POST',405],['/api/v1/profile','GET',404],['/api/v1/profile','POST',403]]){
 const response=await worker.fetch(new Request(origin+path,{method,headers:{Origin:'https://other.invalid'}}),{},{});
 assert.equal(response.status,status,path);
 assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff',path);
 assert.equal(response.headers.get('Strict-Transport-Security'),'max-age=31536000',path);
 assert.ok(!response.headers.get('Content-Security-Policy').includes('unsafe-inline'),path);
 const text=await response.text();
 if(status===200&&(path==='/'||path.startsWith('/privacy'))){assert.ok(text.includes('href="/assets/site.css"'));assert.ok(!/<style|\sstyle=/i.test(text));}
 if(path==='/assets/site.css'){assert.match(response.headers.get('Content-Type'),/^text\/css/);assert.ok(text.includes('.language-switch{margin-left:auto}'));}
 if(path==='/health'){assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(JSON.parse(text).status,'ok');}
 if(path.startsWith('/api/'))assert.equal(response.headers.get('Cache-Control'),'no-store');
}
for(const path of ['/','/privacy','/assets/site.css','/health','/downloads/windows.json','/missing']){
 const response=await worker.fetch(new Request(origin+path,{method:'HEAD'}),{},{});assert.equal(await response.text(),'');
}
console.log('PASS site security headers, strict CSS policy, API errors, routes and HEAD responses');
