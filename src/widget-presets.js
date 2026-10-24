function studioPreset(kind){
 const p=emptyWidget();p.design.elements=[];p.design.width=260;p.design.height=260;p.design.background='#f5f1e9';p.design.radius=28;
 if(kind==='analog'){
  p.title=ws('Аналоговые часы','Analog clock');
  p.html=`<svg viewBox="0 0 260 260" width="260" height="260" aria-label="${esc(p.title)}"><circle cx="130" cy="130" r="112" fill="#fffdf8"/>${Array.from({length:60},(_,i)=>`<path d="M130 ${i%5?25:22}v${i%5?4:12}" transform="rotate(${i*6} 130 130)" stroke="${i%5?'#b7b2a8':'#2a2926'}" stroke-width="${i%5?1:2}"/>`).join('')}<g fill="#2a2926" text-anchor="middle" font-family="system-ui" font-size="20"><text x="130" y="59">12</text><text x="204" y="137">3</text><text x="130" y="217">6</text><text x="56" y="137">9</text></g><path id="hour" d="M130 142V76" stroke="#242423" stroke-width="7" stroke-linecap="round"/><path id="minute" d="M130 145V48" stroke="#242423" stroke-width="5" stroke-linecap="round"/><path id="second" d="M130 150V39" stroke="#d56737" stroke-width="2"/><circle cx="130" cy="130" r="5" fill="#d56737"/></svg>`;
  p.js="function updateHands(){const d=new Date(),s=d.getSeconds(),m=d.getMinutes()+s/60,h=d.getHours()%12+m/60;for(const [id,a] of [['hour',h*30],['minute',m*6],['second',s*6]])document.getElementById(id).setAttribute('transform','rotate('+a+' 130 130)')}updateHands();setInterval(updateHands,1000)";
 }else if(kind==='day'){
  p.title=ws('Календарь на сегодня','Today calendar');p.html='<div id="weekday"></div><div id="day"></div><div id="month"></div>';
  p.css='#weekday{position:absolute;left:24px;top:22px;font-size:17px;font-weight:600;color:#ca573d}#day{position:absolute;left:20px;top:49px;font-size:122px;font-weight:300;letter-spacing:-7px;color:#292927}#month{position:absolute;left:24px;bottom:24px;font-size:17px;color:#77736a}';
  p.js="function updateDay(){const d=new Date(),l=document.documentElement.lang;document.getElementById('weekday').textContent=new Intl.DateTimeFormat(l,{weekday:'long'}).format(d);document.getElementById('day').textContent=d.getDate();document.getElementById('month').textContent=new Intl.DateTimeFormat(l,{month:'long',year:'numeric'}).format(d)}updateDay();setInterval(updateDay,30000)";
 }else{
  p.title=ws('Список дел','Checklist');p.design.width=360;p.design.height=260;p.design.background='#f5e7a8';
  p.design.elements=[{id:crypto.randomUUID(),type:'text',x:24,y:22,w:312,h:36,text:ws('Сегодня','Today'),size:26,color:'#49422e',background:'#00000000',radius:0,weight:600,align:'left'}];
  p.html=`<div class="tasks">${[ws('Самое важное','Most important'),ws('Небольшой перерыв','Take a break'),ws('Что-то для себя','Something for yourself')].map(t=>`<button><span></span>${esc(t)}</button>`).join('')}</div>`;
  p.css='.tasks{position:absolute;top:80px;left:24px;right:24px}.tasks button{display:flex;align-items:center;gap:12px;width:100%;background:none;color:#49422e;border:0;border-bottom:1px solid #49422e22;padding:14px 0;text-align:left;font-size:16px;cursor:pointer}.tasks span{width:18px;height:18px;border:1.5px solid #887642;border-radius:50%}.tasks button.done{text-decoration:line-through;opacity:.6}.tasks button.done span{background:#887642;box-shadow:inset 0 0 0 4px #f5e7a8}';p.js="document.querySelectorAll('.tasks button').forEach(b=>b.onclick=()=>b.classList.toggle('done'))";
 }
 return VeyraWidgetPackage.normalize(p);
}
