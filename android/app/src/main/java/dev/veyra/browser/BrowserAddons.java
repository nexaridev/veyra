package dev.veyra.browser;
import org.mozilla.geckoview.*;
import android.widget.*;
import java.io.*;
final class BrowserAddons {
 final MainActivity a; WebExtension ublock;
 BrowserAddons(MainActivity owner){a=owner;MainActivity.runtime.getWebExtensionController().setPromptDelegate(new WebExtensionController.PromptDelegate(){
  @Override public GeckoResult<WebExtension.PermissionPromptResponse> onInstallPromptRequest(WebExtension extension,String[] permissions,String[] origins,String[] dataCollection){
   GeckoResult<WebExtension.PermissionPromptResponse> result=new GeckoResult<>();
   LinearLayout body=a.openSheet(a.t("Разрешения расширения","Extension permissions","Дозволи розширення"));
   body.addView(a.label(extension.metaData.name,19,a.text));
   body.addView(a.label(a.t("Доступ к сайтам и сетевым запросам нужен для блокировки рекламы.","Site and network access is required to block ads.","Доступ до сайтів і мережевих запитів потрібен для блокування реклами."),14,a.muted));
   body.addView(a.label(permissionSummary(permissions,origins),12,a.muted));
   CheckBox privateMode=new CheckBox(a);privateMode.setText(a.t("Также во временных вкладках","Also in private tabs","Також у тимчасових вкладках"));privateMode.setTextColor(a.text);body.addView(privateMode);final boolean[] answered={false};a.sheet.setOnDismissListener(d->{if(!answered[0]){answered[0]=true;result.complete(new WebExtension.PermissionPromptResponse(false,false,false));}});
   a.action(body,a.t("Установить","Install","Встановити"),"",()->{if(answered[0])return;answered[0]=true;result.complete(new WebExtension.PermissionPromptResponse(true,privateMode.isChecked(),false));a.sheet.dismiss();});
   a.action(body,a.t("Отмена","Cancel","Скасувати"),"",()->a.sheet.dismiss());return result;
  }
 });MainActivity.runtime.getWebExtensionController().list().accept(list->{for(WebExtension e:list)if(e.id.equals("uBlock0@raymondhill.net")){ublock=e;attach(e);}},error->android.util.Log.w("Veyra","Could not list extensions"));}
 String permissionSummary(String[] permissions,String[] origins){StringBuilder text=new StringBuilder();for(String key:permissions){String value;switch(key){
 case "tabs":value=a.t("Просмотр открытых вкладок","View open tabs","Перегляд відкритих вкладок");break;
 case "webRequest":case "webRequestBlocking":value=a.t("Просмотр и блокировка сетевых запросов","View and block network requests","Перегляд і блокування мережевих запитів");break;
 case "storage":case "unlimitedStorage":value=a.t("Хранение настроек и списков фильтрации","Store settings and filter lists","Зберігання налаштувань і списків фільтрації");break;
 case "privacy":value=a.t("Управление настройками приватности","Manage privacy settings","Керування налаштуваннями приватності");break;
 case "contextMenus":case "menus":value=a.t("Пункты в меню страницы","Page context menu entries","Пункти в меню сторінки");break;
 case "alarms":value=a.t("Запланированное обновление фильтров","Schedule filter updates","Заплановане оновлення фільтрів");break;
 default:value=a.t("Разрешение","Permission","Дозвіл")+": "+key;
 }text.append(value).append('\n');}for(String origin:origins)text.append(origin.equals("<all_urls>")?a.t("Доступ ко всем сайтам","Access all websites","Доступ до всіх сайтів"):origin).append('\n');return text.toString();}
 void attach(WebExtension e){e.setTabDelegate(new WebExtension.TabDelegate(){
  @Override public GeckoResult<GeckoSession> onNewTab(WebExtension extension,WebExtension.CreateTabDetails details){MainActivity.Tab tab=a.newTab(false,true);tab.url=details.url;a.home=false;a.showBrowser();tab.session.loadUri(details.url);return GeckoResult.fromValue(tab.session);}
  @Override public void onOpenOptionsPage(WebExtension extension){MainActivity.Tab tab=a.newTab(false,true);a.home=false;a.showBrowser();tab.session.loadUri(extension.metaData.optionsPageUrl);}
 });}
 void show(){LinearLayout body=a.openSheet("uBlock Origin");body.addView(a.label(a.t("Оригинальное расширение Raymond Hill. Подпись Mozilla проверяется движком.","The original extension by Raymond Hill. Mozilla signature verification is enforced by the engine.","Оригінальне розширення Raymond Hill. Підпис Mozilla перевіряється рушієм."),14,a.muted));
 if(ublock!=null){a.action(body,a.t("Установлен","Installed","Встановлено"),ublock.metaData.version,()->{});a.action(body,a.t("Настройки uBlock Origin","uBlock Origin settings","Налаштування uBlock Origin"),"",()->{a.sheet.dismiss();MainActivity.Tab tab=a.newTab(false,true);a.home=false;a.showBrowser();tab.session.loadUri(ublock.metaData.optionsPageUrl);});return;}
 a.action(body,a.t("Установить uBlock Origin","Install uBlock Origin","Встановити uBlock Origin"),a.t("Бесплатно. Разрешения появятся перед установкой.","Free. Review permissions before installation.","Безкоштовно. Дозволи з’являться перед встановленням."),()->{
  try{File file=new File(a.getCacheDir(),"ublock-origin.xpi");try(InputStream in=a.getAssets().open("addons/ublock-origin.xpi");OutputStream out=new FileOutputStream(file)){byte[] bytes=new byte[65536];int n;while((n=in.read(bytes))!=-1)out.write(bytes,0,n);}
   MainActivity.runtime.getWebExtensionController().install(android.net.Uri.fromFile(file).toString(),WebExtensionController.INSTALLATION_METHOD_FROM_FILE).accept(extension->{ublock=extension;attach(extension);file.delete();a.message(a.t("uBlock Origin установлен","uBlock Origin installed","uBlock Origin встановлено"));show();},error->{file.delete();a.message(a.t("Не удалось установить расширение","Could not install extension","Не вдалося встановити розширення"));});
  }catch(IOException error){a.message(a.t("Не удалось прочитать расширение","Could not read extension","Не вдалося прочитати розширення"));}
 });}
}
