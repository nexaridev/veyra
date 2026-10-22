// Icons are fetched in the page's own session. The privileged UI receives PNG only.
async function pageIcon(wc, urls, pageURL, nativeImage) {
 const page=new URL(pageURL);
 for(const raw of urls.slice(0,4))try{
  const url=new URL(raw,pageURL);if(url.origin!==page.origin||!['http:','https:'].includes(url.protocol))continue;
  const response=await wc.session.fetch(url.href,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok||Number(response.headers.get('content-length'))>262144)continue;
  const reader=response.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144)throw Error('Icon too large');chunks.push(Buffer.from(value))}}finally{await reader.cancel()}
  const image=nativeImage.createFromBuffer(Buffer.concat(chunks));if(image.isEmpty())continue;
  return image.resize({width:32,height:32}).toDataURL();
 }catch{}
 return '';
}
module.exports={pageIcon};
