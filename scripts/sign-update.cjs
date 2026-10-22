// Private key lives outside this repository. Usage: node scripts/sign-update.cjs manifest.json key.pem output.json
const fs=require('node:fs'),crypto=require('node:crypto');
const [input,key,output]=process.argv.slice(2);if(!input||!key||!output)throw Error('Provide manifest, private key and output paths.');
const payload=JSON.stringify(JSON.parse(fs.readFileSync(input,'utf8')));
fs.writeFileSync(output,JSON.stringify({payload,signature:crypto.sign(null,Buffer.from(payload),fs.readFileSync(key)).toString('base64')},null,2)+'\n');
