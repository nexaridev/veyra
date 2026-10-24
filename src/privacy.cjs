const fs=require('node:fs'),path=require('node:path'),{domainToASCII}=require('node:url');
const psl=require('./public-suffix.cjs');psl.parse(fs.readFileSync(path.join(__dirname,'assets/public-suffix-list.dat'),'utf8'),domainToASCII);
class PrivacyEngine {
 constructor(userData,settings,changed,ublock){this.settings=settings;this.ublock=ublock;}
 get updated(){return this.ublock.updated}
 status(){return this.ublock.status()}
 update(){return this.ublock.update()}
 excepted(url){try{return this.settings().siteExceptions.includes(new URL(url).origin)}catch{return false}}
 thirdParty(details,sourceUrl){if(details.resourceType==='mainFrame'||!sourceUrl||this.excepted(sourceUrl))return false;try{return (()=>{const target=new URL(details.url).hostname,source=new URL(sourceUrl).hostname;return (psl.getDomain(target)||target)!==(psl.getDomain(source)||source)})()}catch{return false}}
}
module.exports={PrivacyEngine};
