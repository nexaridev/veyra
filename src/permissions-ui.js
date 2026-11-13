function renderSitePermission(){
 const dialog=document.getElementById('site-permission'),request=state.permission;
 if(!request){if(dialog.open)dialog.close();dialog.dataset.request='';return;}
 if(dialog.dataset.request===request.id)return;dialog.dataset.request=request.id;
 document.getElementById('permission-origin').textContent=request.origin;
 document.getElementById('permission-title').textContent=request.stage==='devices'?ws('Выбери устройства','Choose devices'):ws('Запрос разрешения','Permission request');
 const body=document.getElementById('permission-body');body.replaceChildren();
 if(request.stage==='devices'){for(const kind of ['audio','video'])if(request[kind]){
  const label=document.createElement('label');label.className='field';label.textContent=kind==='audio'?ws('Микрофон','Microphone'):ws('Камера','Camera');
  const select=document.createElement('select');select.id='permission-'+kind;
  request.devices.filter(d=>d.kind===(kind==='audio'?'audioinput':'videoinput')).forEach((device,index)=>{const option=document.createElement('option');option.value=device.id;option.textContent=device.label||label.textContent+' '+(index+1);option.selected=request.current?.[kind]===device.id;select.append(option)});label.append(select);body.append(label);
 }}else{
  const names=request.permission==='media'?request.mediaTypes.map(t=>t==='audio'?ws('Микрофон','Microphone'):ws('Камера','Camera')):[tr(({notifications:'Уведомления',geolocation:'Геолокация','clipboard-read':'Чтение буфера обмена','display-capture':'Демонстрация экрана',pointerLock:'Захват указателя'})[request.permission]||request.permission)];
  const text=document.createElement('p');text.textContent=ws('Сайт запрашивает доступ: ','The site requests access: ')+names.join(', ');body.append(text);
  if(request.permission==='media'){const note=document.createElement('p');note.className='note';note.textContent=ws('После разрешения можно выбрать устройство.','After granting access you can choose a device.');body.append(note);}
 }
 document.getElementById('permission-remember').checked=false;
 document.getElementById('permission-accept').textContent=request.stage==='devices'?ws('Использовать устройства','Use devices'):ws('Разрешить','Allow');
 if(!dialog.open)dialog.showModal();document.getElementById('permission-deny').focus();
}
function answerSitePermission(allow){
 if(!state.permission)return;const payload={id:state.permission.id,allow,remember:document.getElementById('permission-remember').checked};
 for(const kind of ['audio','video']){const select=document.getElementById('permission-'+kind);if(select)payload[kind]=select.value;}
 void command('permission-response',payload);
}
document.getElementById('permission-deny').onclick=()=>answerSitePermission(false);
document.getElementById('permission-accept').onclick=()=>answerSitePermission(true);
document.getElementById('site-permission').addEventListener('cancel',event=>{event.preventDefault();answerSitePermission(false)});
function renderScreenShare(){
 const dialog=document.getElementById('screen-share-dialog'),request=state?.screenSharePrompt;
 if(!request){if(dialog.open)dialog.close();dialog.dataset.request='';return}
 if(dialog.dataset.request===request.id)return;dialog.dataset.request=request.id;document.getElementById('screen-share-title').textContent=tr('Choose what to share');document.getElementById('screen-share-origin').textContent=request.origin;dialog.querySelectorAll('.note')[1].textContent=tr('The selected screen or window is shared with this site until you stop sharing.');document.getElementById('screen-share-cancel').textContent=tr('Отмена');
 const audioOption=document.getElementById('screen-share-audio-option'),audioInput=document.getElementById('screen-share-audio');audioOption.hidden=!request.audioAvailable;audioInput.checked=false;audioOption.lastChild.textContent=tr('Share system audio');
 const list=document.getElementById('screen-share-sources');list.replaceChildren();
 for(const source of request.sources||[]){const button=document.createElement('button');button.className='screen-share-source';button.type='button';button.addEventListener('click',()=>command('screen-share-response',{id:request.id,source:source.id,audio:audioInput.checked}));const image=document.createElement('img');image.alt='';image.src=source.thumbnail;const name=document.createElement('span');name.textContent=source.name;button.append(image,name);list.append(button)}
 if(!dialog.open)dialog.showModal();document.getElementById('screen-share-cancel').focus();
}
document.getElementById('screen-share-cancel').onclick=()=>{if(state?.screenSharePrompt)command('screen-share-response',{id:state.screenSharePrompt.id,source:null})};
document.getElementById('screen-share-dialog').addEventListener('cancel',event=>{event.preventDefault();if(state?.screenSharePrompt)command('screen-share-response',{id:state.screenSharePrompt.id,source:null})});
