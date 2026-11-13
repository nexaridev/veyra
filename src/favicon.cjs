// Icons are fetched in the page's own session. The privileged UI receives PNG only.
async function pageIcon(wc, urls, pageURL, nativeImage) {
 const page=new URL(pageURL);
 for(const raw of urls.slice(0,4))try{
  const url=new URL(raw,pageURL);if(url.origin!==page.origin||!['http:','https:'].includes(url.protocol)||url.username||url.password)continue;
  const response=await wc.session.fetch(url.href,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok||Number(response.headers.get('content-length'))>262144)continue;
  const reader=response.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144)throw Error('Icon too large');chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
  const image=nativeImage.createFromBuffer(Buffer.concat(chunks));if(image.isEmpty())continue;
  return image.resize({width:32,height:32}).toDataURL();
 }catch{}
 return '';
}
async function siteIcon(ses,pageURL,nativeImage){
 try{
  const page=new URL(pageURL);if(!['http:','https:'].includes(page.protocol))return '';
  for(const suffix of ['/favicon.ico','/favicon.png'])try{
   const url=new URL(suffix,page.origin+'/');
   const response=await ses.fetch(url.href,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(4000)});
   if(!response.ok||Number(response.headers.get('content-length'))>262144)continue;
   const reader=response.body.getReader();let size=0;const chunks=[];
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144)throw Error('Icon too large');chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
   const image=nativeImage.createFromBuffer(Buffer.concat(chunks));if(!image.isEmpty())return image.resize({width:32,height:32}).toDataURL();
  }catch{}
 }catch{}
 return '';
}
module.exports={pageIcon,siteIcon};
