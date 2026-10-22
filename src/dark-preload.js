// Runs inside the isolated preload; never exposes privileged APIs to a website.
function installDarkMode(config,webFrame){
 if(!config.enabled||!/^https?:$/.test(location.protocol))return;
 const brightness=config.brightness/100,contrast=config.contrast/100;
 const earlyStyle=webFrame.insertCSS('html{color-scheme:dark;background-color:#121418}body{visibility:hidden!important}');
 let timer,observer;const seen=new WeakMap();
 function rgb(value){const n=value.match(/[\d.]+/g)?.map(Number);return n&&n.length>=3&&!(n.length===4&&n[3]===0)?n:null}
 const lum=c=>(c[0]*.2126+c[1]*.7152+c[2]*.0722)/255;
 function color(c,text){const l=lum(c);const target=text?Math.min(.97,Math.max(.60,(.78+(l-.5)*.18)*brightness*contrast)):Math.min(.27,Math.max(.025,(.09+(1-l)*.09)*brightness/contrast));return `rgb(${c.slice(0,3).map(v=>Math.round(Math.min(255,Math.max(0,(target*255+(v-c.slice(0,3).reduce((a,b)=>a+b,0)/3)*.16))))).join(',')})`}
 function nativeDark(){const body=document.body;if(!body)return false;for(const el of [body,document.documentElement]){const c=rgb(getComputedStyle(el).backgroundColor);if(c&&lum(c)<.32&&el===body)return true}return false}
 function paint(root){let count=0;const nodes=[root,...root.querySelectorAll('*')];for(const el of nodes){if(++count>6000)break;if(!(el instanceof HTMLElement)||el.closest('img,video,canvas,svg,picture,iframe,object,embed,[data-veyra-dark-ignore]')||['SCRIPT','STYLE','LINK','META'].includes(el.tagName))continue;
 const s=getComputedStyle(el),finger=[s.backgroundColor,s.color,s.borderTopColor].join('|');if(seen.get(el)===finger)continue;
 const bg=rgb(s.backgroundColor),fg=rgb(s.color),border=rgb(s.borderTopColor);
 if(bg&&lum(bg)>.32&&s.backgroundImage==='none')el.style.setProperty('background-color',color(bg,false),'important');
 if(fg&&lum(fg)<.65)el.style.setProperty('color',color(fg,true),'important');
 if(border&&s.borderTopStyle!=='none')el.style.setProperty('border-color',color(border,false),'important');
 const after=getComputedStyle(el);seen.set(el,[after.backgroundColor,after.color,after.borderTopColor].join('|'));
 }}
 async function start(){try{if(nativeDark())return;paint(document.documentElement);observer=new MutationObserver(records=>{clearTimeout(timer);timer=setTimeout(()=>{for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)if(n instanceof HTMLElement)paint(n);else{}else if(r.target instanceof HTMLElement)paint(r.target)}},40)});observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']})}finally{webFrame.removeInsertedCSS(await earlyStyle)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
