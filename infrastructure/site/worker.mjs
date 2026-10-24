import {page,stylesheet} from './pages.mjs';
import {windowsManifest,installerURL,androidURL} from './downloads.mjs';
import {accountAPI,drainMail} from './account.mjs';
const securityHeaders={'Strict-Transport-Security':'max-age=31536000','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'self'; style-src-attr 'none'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
export default {scheduled(event,env,ctx){ctx.waitUntil(drainMail(env))},async fetch(request,env,ctx){
 const response=await route(request,env,ctx),headers=new Headers(response.headers);
 for(const [name,value] of Object.entries(securityHeaders))headers.set(name,value);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}};
async function route(request,env,ctx){
 if(new URL(request.url).pathname.startsWith('/api/v1/'))return accountAPI(request,env,ctx);

 const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300'};
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
 const path=new URL(request.url).pathname;
 if(path==='/downloads/windows.json')return new Response(request.method==='HEAD'?null:JSON.stringify(windowsManifest),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 if(path==='/download/windows'||path==='/download/android')return new Response(null,{status:302,headers:{Location:path==='/download/windows'?installerURL:androidURL,'Cache-Control':'no-cache'}});
 if(path==='/health')return new Response(request.method==='HEAD'?null:JSON.stringify({service:'veyra-site',status:'ok',release:'1.0.1',android:'0.6.6'}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
 if(path==='/assets/site.css')return new Response(request.method==='HEAD'?null:stylesheet,{headers:{'Content-Type':'text/css; charset=utf-8','Cache-Control':'public, max-age=300'}});
 if(path!=='/'&&path!=='/privacy')return new Response(request.method==='HEAD'?null:'Not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 const rendered=page(request,path);return new Response(request.method==='HEAD'?null:rendered.html,{headers:{...headers,'Content-Language':rendered.language,Vary:'Accept-Language'}});
}
