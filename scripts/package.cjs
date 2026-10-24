require('./build-game.cjs');
﻿const path=require('node:path');
(async()=>{
  const {packager}=await import('@electron/packager');
  const result=await packager({
    dir:path.join(__dirname,'..'),
    name:'Veyra',
    platform:'win32',
    arch:'x64',
    electronVersion:'45.0.0',
    out:path.join(__dirname,'..','dist-v0.8.0'),
    overwrite:true,
    icon:path.join(__dirname,'..','src','assets','app.ico'),
    asar:true,extraResource:[path.join(__dirname,'../vendor/uBlock0.chromium')],buildVersion:'0.8.0.0',
    prune:true,
    ignore:[/^\/RESUME-TODO\.md$/,
      /^\/dist(?:-[^/]+)?(?:\/|$)/,
      /^\/vendor(?:\/|$)/,
      /^\/scripts(?:\/|$)/,
      /^\/android(?:\/|$)/,
      /^\/infrastructure(?:\/|$)/,
      /^\/installer(?:\/|$)/,
      /^\/(?:tests|work|outputs)(?:\/|$)/
    ],
    win32metadata:{
      CompanyName:'Veyra',
      FileDescription:'Veyra Browser',
      ProductName:'Veyra'
    }
  });
  console.log(result.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
