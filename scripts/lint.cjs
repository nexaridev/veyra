const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const excluded=new Set(['.git','node_modules','vendor','outputs','old-readme','build','.gradle','coverage']);
const files=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isDirectory()&&(excluded.has(entry.name)||entry.name.startsWith('dist-')))continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())walk(file);
  else if(/\.(?:cjs|mjs|js)$/.test(entry.name))files.push(file);
 }
}
walk(root);
let failures=0;
for(const file of files){
 const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(result.status!==0){failures++;process.stderr.write(path.relative(root,file)+'\n'+(result.stderr||result.stdout));}
}
if(failures){process.stderr.write(`Syntax check failed for ${failures} of ${files.length} JavaScript files.\n`);process.exitCode=1;}
else console.log(`PASS: syntax checked ${files.length} maintained JavaScript files.`);
