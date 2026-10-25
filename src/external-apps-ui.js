function renderExternalApp(){
 const dialog=document.getElementById('external-app-dialog'),request=state.externalAppRequest;
 if(!request){if(dialog.open)dialog.close();dialog.dataset.id='';return;}if(dialog.dataset.id===request.id)return;dialog.dataset.id=request.id;
 document.getElementById('external-app-origin').textContent=request.origin;
 document.getElementById('external-app-title').textContent=tr(request.found?'Открыть внешнее приложение?':'Приложение не найдено');
 document.getElementById('external-app-name').textContent=request.application||request.scheme;
 document.getElementById('external-app-scheme').textContent=request.scheme+':';
 document.getElementById('external-app-description').textContent=tr(request.found?'Этот сайт хочет открыть приложение на компьютере.':'Не удалось определить приложение для этой ссылки. Можно попробовать открыть её через Windows.');
 document.getElementById('external-app-remember-label').hidden=!request.canRemember||!request.found;
 document.getElementById('external-app-remember').checked=false;document.getElementById('external-app-open').disabled=false;document.getElementById('external-app-open').textContent=tr(request.found?'Открыть приложение':'Попробовать открыть');
 if(!dialog.open)dialog.showModal();document.getElementById('external-app-cancel').focus();
}
function answerExternalApp(allow){if(state.externalAppRequest)void command('external-app-response',{id:state.externalAppRequest.id,allow,remember:document.getElementById('external-app-remember').checked});}
document.getElementById('external-app-open').onclick=()=>answerExternalApp(true);
document.getElementById('external-app-cancel').onclick=()=>answerExternalApp(false);
document.getElementById('external-app-dialog').addEventListener('cancel',event=>{event.preventDefault();answerExternalApp(false)});
function externalApplicationsSettings(){
 const entries=Object.entries(state.settings.externalAppPermissions||{}).filter(([,values])=>values&&typeof values==='object');
 return `<details class="card external-app-settings"><summary>${esc(tr('Внешние приложения'))}</summary><div class="external-app-content"><p class="note">${esc(tr('Разрешения на открытие приложений сохраняются отдельно для каждого сайта.'))}</p>${entries.length?entries.map(([origin,values])=>`<div class="external-app-rule"><div><strong>${esc(origin)}</strong><small>${esc(Object.keys(values).filter(key=>values[key]===true).join(', '))}</small></div><button class="secondary" data-reset-external-app="${esc(origin)}">${esc(tr('Сбросить'))}</button></div>`).join(''):`<p class="note">${esc(tr('Сохранённых разрешений нет.'))}</p>`}${entries.length?`<button class="secondary" data-action="external-apps-reset">${esc(tr('Сбросить все разрешения приложений'))}</button>`:''}</div></details>`;
}
document.addEventListener('click',async event=>{const button=event.target.closest('[data-reset-external-app]');if(button){await command('external-apps-reset',button.dataset.resetExternalApp);contentKey='';renderContent();}});
