function buildPageMenu(wc, p, {open, back, forward, copyText, translate = x => x}) {
 const items=[];const add=(label,click,enabled=true)=>items.push({label:translate(label),click,enabled});
 const web=u=>{try{return ['http:','https:'].includes(new URL(u).protocol)}catch{return false}};
 if(web(p.linkURL)){
  add('Открыть в новой вкладке',()=>open(p.linkURL));
  add('Копировать адрес ссылки',()=>copyText(p.linkURL));
  add('Сохранить ссылку как…',()=>wc.downloadURL(p.linkURL));
 }
 if(p.mediaType==='image'){
  add('Копировать изображение',()=>wc.copyImageAt(p.x,p.y));
  if(web(p.srcURL)){add('Открыть изображение в новой вкладке',()=>open(p.srcURL));add('Сохранить изображение как…',()=>wc.downloadURL(p.srcURL));add('Копировать адрес изображения',()=>copyText(p.srcURL));}
 }
 if(['video','audio'].includes(p.mediaType)&&web(p.srcURL))add('Сохранить медиа как…',()=>wc.downloadURL(p.srcURL));
 if(items.length)items.push({type:'separator'});
 if(p.isEditable){
  add('Отменить',()=>wc.undo(),!!p.editFlags?.canUndo);add('Повторить',()=>wc.redo(),!!p.editFlags?.canRedo);
  add('Вырезать',()=>wc.cut(),!!p.editFlags?.canCut);add('Копировать',()=>wc.copy(),!!p.editFlags?.canCopy);add('Вставить',()=>wc.paste(),!!p.editFlags?.canPaste);add('Выделить всё',()=>wc.selectAll());
 }else if(p.selectionText)add('Копировать',()=>wc.copy());
 else{add('Назад',back);add('Вперёд',forward);add('Обновить',()=>wc.reload());}
 return items;
}
module.exports={buildPageMenu};
