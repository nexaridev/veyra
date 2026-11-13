const path=require('node:path');
if(process.platform!=='darwin'){
 console.error('Build the macOS application on macOS.');
 process.exit(1);
}
require('./build-game.cjs');
(async()=>{
 const {packager}=await import('@electron/packager');
 const result=await packager({
  dir:path.join(__dirname,'..'),name:'Veyra',platform:'darwin',arch:'universal',
  electronVersion:'45.0.0',out:path.join(__dirname,'..','dist-v1.0.11-mac'),overwrite:true,
  appBundleId:'dev.nexaridev.veyra',appCategoryType:'public.app-category.productivity',
  asar:true,extraResource:[path.join(__dirname,'../vendor/uBlock0.chromium')],buildVersion:'1.0.11.0',prune:true,
  ignore:[/^\/RESUME-TODO\.md$/,/^\/old-readme(?:\/|$)/,/^\/dist(?:-[^/]+)?(?:\/|$)/,
   /^\/vendor(?:\/|$)/,/^\/scripts(?:\/|$)/,/^\/android(?:\/|$)/,
   /^\/infrastructure(?:\/|$)/,/^\/installer(?:\/|$)/,/^\/(?:tests|work|outputs)(?:\/|$)/]
 });
 console.log(result.join('\n'));
})().catch(error=>{console.error(error);process.exit(1)});
