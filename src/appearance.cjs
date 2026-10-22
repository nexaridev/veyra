const fs=require('node:fs');
const path=require('node:path');
const themes={violet:'#bc9ffa',ocean:'#85bdf5',forest:'#8ad4b2',rose:'#efa3c3',amber:'#efc28b'};
const wallpapers=['none','aurora','dusk','ocean','forest','custom'];
function wallpaperPath(userData){return path.join(userData,'wallpaper.jpg')}
function importWallpaper(file,userData,nativeImage){
 if(!/\.(png|jpe?g|webp)$/i.test(file)||fs.statSync(file).size>20*1024*1024)throw Error('Выбери PNG, JPEG или WebP размером до 20 МБ.');
 const image=nativeImage.createFromPath(file);if(image.isEmpty())throw Error('Не удалось прочитать изображение.');
 const {width,height}=image.getSize();if(!width||!height||width*height>40_000_000)throw Error('Изображение слишком большое.');
 const scale=Math.min(1,2560/width,1600/height);
 const resized=scale<1?image.resize({width:Math.round(width*scale),height:Math.round(height*scale),quality:'best'}):image;
 const bytes=resized.toJPEG(88);const dest=wallpaperPath(userData);
 fs.writeFileSync(dest+'.tmp',bytes);fs.renameSync(dest+'.tmp',dest);
 return 'data:image/jpeg;base64,'+bytes.toString('base64');
}
function readWallpaper(userData){try{return 'data:image/jpeg;base64,'+fs.readFileSync(wallpaperPath(userData)).toString('base64')}catch{return ''}}
module.exports={themes,wallpapers,wallpaperPath,importWallpaper,readWallpaper};
