const {app,net,session}=require('electron');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const timeout=setTimeout(()=>{console.error('Timed out waiting for Chromium network interception');app.exit(1)},20000);

app.whenReady().then(async()=>{
 let intercepted=0;
 const server=http.createServer((request,response)=>{response.writeHead(200,{'content-type':'text/plain'});response.end('local fixture')});
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const port=server.address().port;
  session.defaultSession.webRequest.onBeforeRequest({urls:[`http://127.0.0.1:${port}/*`]},(details,callback)=>{intercepted++;callback({})});
  const response=await net.fetch(`http://127.0.0.1:${port}/probe`);
  assert.equal(response.status,200);
  assert.equal(await response.text(),'local fixture');
  assert.equal(intercepted,1,'The request must pass through Chromium webRequest');
  const sync=fs.readFileSync(path.join(root,'src/sync.cjs'),'utf8');
  const updates=fs.readFileSync(path.join(root,'src/updates.cjs'),'utf8');
  assert.match(sync,/require\('electron'\)\.net\.fetch\(/);
  assert.match(updates,/require\('electron'\)\.net\.fetch\(/);
  assert.doesNotMatch(sync,/(^|[^.\w])fetch\(/m);
  assert.doesNotMatch(updates,/(^|[^.\w])fetch\(/m);
  console.log('PASS: electron.net.fetch reaches defaultSession webRequest and is used by sync and update modules');
 }catch(error){console.error(error.stack);clearTimeout(timeout);server.close(()=>app.exit(1));return}
 clearTimeout(timeout);
 server.close(()=>app.exit(0));
});
