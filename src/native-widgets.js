// Only exact built-in templates use the app renderer. User HTML/JS stays in the
// existing sandboxed guest; no submitted script or markup runs in this document.
const nativeWidgetRecords=new Map();
const nativeWidgetTemplates=new Map(),nativeWidgetFormatters=new Map();
function nativeWidgetTemplate(p){
 if(!p?.design||!Array.isArray(p.design.elements))return null;if(!p.html&&!p.css&&!p.js)return {kind:'visual',template:null};if(p.design.elements.length)return null;
 for(const kind of ['analog','day']){
  const key=kind+':'+language();
  if(!nativeWidgetTemplates.has(key))nativeWidgetTemplates.set(key,studioPreset(kind));
  const template=nativeWidgetTemplates.get(key),stripLabel=s=>s.replace(/ aria-label="[^"]*"/,'');
  if(p.js===template.js&&p.css===template.css&&stripLabel(p.html)===stripLabel(template.html))return {kind,template};
 }
 return null;
}
function mountNativeWidget(host,p){
 try{p=VeyraWidgetPackage.normalize(p)}catch{return false}const match=nativeWidgetTemplate(p);if(!match)return false;
 host.classList.add('native-widget');const stage=document.createElement('div'),content=document.createElement('div'),d=p.design,c=match.kind==='visual'?{x:0,y:0,w:d.width,h:d.height}:d.codeFrame||{x:0,y:0,w:d.width,h:d.height};
 stage.className='native-widget-stage';content.className='native-widget-content';
 Object.assign(stage.style,{width:d.width+'px',height:d.height+'px',background:d.background,borderRadius:d.radius+'px'});
 Object.assign(content.style,{left:c.x+'px',top:c.y+'px',width:d.width+'px',height:d.height+'px',transform:`scale(${c.w/d.width},${c.h/d.height})`});
 if(match.kind==='visual')for(const e of p.design.elements){
  const node=document.createElement(e.type==='image'?'img':e.type==='button'?'button':'div');node.dataset.element=e.id;
  Object.assign(node.style,{position:'absolute',boxSizing:'border-box',overflow:'hidden',left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px',color:e.color,background:e.background,fontSize:e.size+'px',fontWeight:e.weight,borderRadius:e.radius+'px',textAlign:e.align,whiteSpace:'pre-wrap',lineHeight:'1.2',fontFamily:'inherit'});
  if(e.type==='image'){node.alt=e.text;node.src=e.image;node.style.objectFit='cover'}else{node.textContent=e.text;if(e.type==='clock')node.dataset.clock='';if(e.type==='button'){node.type='button';node.style.border='0';node.style.cursor='pointer'}else node.style.pointerEvents='none'}
  content.append(node);
 }else content.innerHTML=match.template.html;
 stage.append(content);host.replaceChildren(stage);
 if(match.kind==='day'){
  Object.assign(content.querySelector('#weekday').style,{position:'absolute',left:'24px',top:'22px',fontSize:'17px',fontWeight:'600',color:'#ca573d'});
  Object.assign(content.querySelector('#day').style,{position:'absolute',left:'20px',top:'49px',fontSize:'122px',fontWeight:'300',letterSpacing:'-7px',color:'#292927'});
  Object.assign(content.querySelector('#month').style,{position:'absolute',left:'24px',bottom:'24px',fontSize:'17px',color:'#77736a'});
 }
 if(match.kind==='visual')for(const e of p.design.elements.filter(e=>e.action==='toggle')){const node=content.querySelector('[data-element="'+e.id+'"]');node.onclick=()=>{node.textContent=node.textContent===e.text?e.alternate:e.text}}
 const fit=()=>stage.style.transform=`scale(${Math.min(host.clientWidth/d.width,host.clientHeight/d.height)})`;
 const observer=new ResizeObserver(fit);observer.observe(host);fit();
 const locale=language();if(!nativeWidgetFormatters.has(locale))nativeWidgetFormatters.set(locale,{weekday:new Intl.DateTimeFormat(locale,{weekday:'long'}),month:new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}),time:new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit'})});
 const record={host,content,kind:match.kind,dateKey:'',formatters:nativeWidgetFormatters.get(locale)};
 nativeWidgetRecords.set(host,record);updateNativeWidgets();
 widgetDisposers.push(()=>{observer.disconnect();nativeWidgetRecords.delete(host)});return true;
}
function updateNativeWidgets(){
 const now=new Date();
 for(const {host,content,kind,formatters} of nativeWidgetRecords.values()){
  if(!host.isConnected)continue;
  if(kind==='analog'){
   const s=now.getSeconds(),m=now.getMinutes()+s/60,h=now.getHours()%12+m/60;
   for(const [id,angle]of [['hour',h*30],['minute',m*6],['second',s*6]])content.querySelector('#'+id).setAttribute('transform',`rotate(${angle} 130 130)`);
  }else if(kind==='visual'){for(const clock of content.querySelectorAll('[data-clock]')){const text=formatters.time.format(now);if(clock.textContent!==text)clock.textContent=text;}
  }else{
   const record=nativeWidgetRecords.get(host),key=now.toDateString();if(record.dateKey===key)continue;record.dateKey=key;
   content.querySelector('#weekday').textContent=formatters.weekday.format(now);content.querySelector('#day').textContent=now.getDate();content.querySelector('#month').textContent=formatters.month.format(now);
  }
 }
}
