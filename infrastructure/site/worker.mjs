import {page} from './pages.mjs';
import {windowsManifest,installerURL,androidURL} from './downloads.mjs';
import {accountAPI,drainMail} from './account.mjs';
export default {scheduled(event,env,ctx){ctx.waitUntil(drainMail(env))},fetch(request,env,ctx){
 if(new URL(request.url).pathname.startsWith('/api/v1/'))return accountAPI(request,env,ctx);

 const headers={'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'public, max-age=300'};
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 const path=new URL(request.url).pathname;
 if(path==='/downloads/windows.json')return new Response(request.method==='HEAD'?null:JSON.stringify(windowsManifest),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 if(path==='/download/windows'||path==='/download/android')return new Response(null,{status:302,headers:{Location:path==='/download/windows'?installerURL:androidURL,'Cache-Control':'no-cache'}});
 if(path==='/health')return Response.json({service:'veyra-site',status:'ok',release:'candidate'});
 if(path!=='/'&&path!=='/privacy')return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 const rendered=page(request,path);return new Response(request.method==='HEAD'?null:rendered.html,{headers:{...headers,'Content-Language':rendered.language,Vary:'Accept-Language'}});
}};
