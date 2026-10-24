const {contextBridge,ipcRenderer,webUtils}=require('electron');
let opened=false;
const openedListeners=new Set();
ipcRenderer.on('veyra:opened',()=>{
  opened=true;
  for(const listener of openedListeners)listener();
});
contextBridge.exposeInMainWorld('veyra',Object.freeze({
  filePath:file=>webUtils.getPathForFile(file),
  command:(action,payload)=>ipcRenderer.invoke('veyra:command',action,payload),
  onFindResult:fn=>ipcRenderer.on('veyra:find-result',(_,value)=>fn(value)),
  onState:fn=>ipcRenderer.on('veyra:state',(_,value)=>fn(value)),
  onOpened:fn=>{openedListeners.add(fn);if(opened)fn();},
  onAddress:fn=>ipcRenderer.on('veyra:address',()=>fn()),
  onToast:fn=>ipcRenderer.on('veyra:toast',(_,value)=>fn(value))
}));
