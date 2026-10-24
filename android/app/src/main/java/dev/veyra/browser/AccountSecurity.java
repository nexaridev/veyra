package dev.veyra.browser;

import android.app.Activity;
import android.content.*;
import android.graphics.*;
import android.widget.*;
import org.json.*;

final class AccountSecurity {
 static EditText codeInput(MainActivity a,LinearLayout body){
  EditText input=a.syncInput(body,a.t("Код 2ФА, если включена","2FA code, if enabled","Код 2ФА, якщо ввімкнено"),false);
  input.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
  input.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(32)});
  return input;
 }
 interface Work {JSONObject run()throws Exception;}
 static void run(MainActivity a,LinearLayout body,Work work,java.util.function.Consumer<JSONObject> success){
  if(Boolean.TRUE.equals(body.getTag()))return;body.setTag(true);
  new Thread(()->{try{JSONObject result=work.run();a.runOnUiThread(()->{body.setTag(false);if(body.isAttachedToWindow())success.accept(result);});}catch(Exception error){a.runOnUiThread(()->{body.setTag(false);if(body.isAttachedToWindow())a.message(a.accountError(error));});}},"Veyra account security").start();
 }
 static void show(MainActivity a){
  LinearLayout body=a.openSheet(a.t("Двухфакторная защита","Two-factor authentication","Двофакторний захист"));
  run(a,body,()->a.sync.request("mfa-status",new JSONObject(),true),status->{
   body.addView(a.label(status.optBoolean("enabled")?a.t("Защита включена","Protection enabled","Захист увімкнено"):a.t("Защита не включена","Protection not enabled","Захист не ввімкнено"),18,a.text));
   body.addView(a.label(a.t("Код из приложения нужен для входа, восстановления и изменения безопасности.","An app code is required for sign-in, recovery and security changes.","Код із застосунку потрібен для входу, відновлення та змін безпеки."),14,a.muted));
   if(status.optBoolean("enabled"))body.addView(a.label(a.t("Резервных кодов осталось: ","Recovery codes remaining: ","Резервних кодів залишилось: ")+status.optInt("recovery_remaining"),14,a.muted));
   EditText password=a.syncInput(body,a.t("Текущий пароль","Current password","Поточний пароль"),true);
   if(!status.optBoolean("enabled")){
    a.action(body,a.t("Подключить приложение","Connect authenticator","Підключити застосунок"),"",()->{
     String current=password.getText().toString();
     run(a,body,()->a.sync.request("mfa-begin",new JSONObject().put("currentPassword",current),true),result->{
      password.setText("");LinearLayout setup=a.openSheet(a.t("Подключение 2ФА","Set up 2FA","Налаштування 2ФА"));
      setup.addView(a.label(a.t("Добавь ключ в приложение-аутентификатор. SHA1, 6 цифр, 30 секунд. Настройка действует 10 минут.","Add this key to an authenticator app. SHA1, 6 digits, 30 seconds. Setup expires in 10 minutes.","Додай ключ до автентифікатора. SHA1, 6 цифр, 30 секунд. Налаштування діє 10 хвилин."),14,a.muted));
      TextView key=a.label(result.optString("secret"),17,a.accent);key.setTextIsSelectable(true);setup.addView(key);
      a.action(setup,a.t("Открыть приложение","Open authenticator","Відкрити застосунок"),"",()->{try{String uri="otpauth://totp/"+android.net.Uri.encode("Veyra:"+a.sync.email())+"?secret="+result.optString("secret")+"&issuer=Veyra&algorithm=SHA1&digits=6&period=30";a.startActivity(new Intent(Intent.ACTION_VIEW,android.net.Uri.parse(uri)));}catch(Exception error){a.message(a.t("Введи ключ в приложении вручную","Enter the key manually in your app","Введи ключ у застосунку вручну"));}});
      EditText code=codeInput(a,setup);
      setup.addView(a.label(a.t("После включения другие устройства выйдут из аккаунта. Сохрани резервные коды на следующем экране.","Other devices will be signed out. Save recovery codes on the next screen.","Інші пристрої вийдуть з акаунта. Збережи резервні коди на наступному екрані."),14,a.muted));
      a.action(setup,a.t("Проверить и включить","Verify and enable","Перевірити та ввімкнути"),"",()->{String digits=code.getText().toString().trim();run(a,setup,()->a.sync.request("mfa-confirm",new JSONObject().put("currentPassword",current).put("mfa_code",digits),true),done->recovery(a,done.optJSONArray("recovery_codes")));});
     });
    });
   }else{
    EditText code=codeInput(a,body);
    for(boolean disable:new boolean[]{false,true})a.action(body,disable?a.t("Отключить 2ФА","Disable 2FA","Вимкнути 2ФА"):a.t("Новые резервные коды","New recovery codes","Нові резервні коди"),"",()->{
     String current=password.getText().toString(),digits=code.getText().toString().trim();
     Runnable execute=()->run(a,body,()->a.sync.request(disable?"mfa-disable":"mfa-recovery",new JSONObject().put("currentPassword",current).put("mfa_code",digits),true),result->{password.setText("");code.setText("");if(disable)show(a);else recovery(a,result.optJSONArray("recovery_codes"));});
     if(disable){LinearLayout confirm=a.openSheet(a.t("Отключить защиту?","Disable protection?","Вимкнути захист?"));confirm.addView(a.label(a.t("Для входа останется только пароль. Резервные коды перестанут работать.","Only your password will protect sign-in. Recovery codes will stop working.","Для входу залишиться лише пароль. Резервні коди припинять працювати."),14,a.muted));a.action(confirm,a.t("Отключить","Disable","Вимкнути"),"",()->run(a,confirm,()->a.sync.request("mfa-disable",new JSONObject().put("currentPassword",current).put("mfa_code",digits),true),result->show(a)));}else execute.run();
    });
   }
  });
 }
 static void recovery(MainActivity a,JSONArray codes){
  LinearLayout body=a.openSheet(a.t("Сохрани резервные коды","Save recovery codes","Збережи резервні коди"));
  body.addView(a.label(a.t("Каждый код работает один раз. Они показаны только сейчас. Храни отдельно от телефона. Новые коды заменяют старые.","Each code works once. These are shown only now. Keep them away from your phone. New codes replace old ones.","Кожен код працює один раз. Їх показано лише зараз. Зберігай окремо від телефона. Нові коди замінюють старі."),14,a.muted));
  StringBuilder text=new StringBuilder();if(codes!=null)for(int i=0;i<codes.length();i++)text.append(codes.optString(i)).append('\n');TextView list=a.label(text.toString(),17,a.text);list.setTypeface(Typeface.MONOSPACE);list.setTextIsSelectable(true);body.addView(list);
  a.action(body,a.t("Скопировать коды","Copy codes","Копіювати коди"),a.t("Буфер обмена может быть доступен другим приложениям","Other apps may access your clipboard","Інші застосунки можуть мати доступ до буфера"),()->{android.content.ClipboardManager clipboard=(android.content.ClipboardManager)a.getSystemService(Context.CLIPBOARD_SERVICE);android.content.ClipData clip=android.content.ClipData.newPlainText("Veyra recovery codes",text.toString());if(android.os.Build.VERSION.SDK_INT>=33){android.os.PersistableBundle extras=new android.os.PersistableBundle();extras.putBoolean("android.content.extra.IS_SENSITIVE",true);clip.getDescription().setExtras(extras);}clipboard.setPrimaryClip(clip);});
  a.action(body,a.t("Я сохранил коды","I saved the codes","Я зберіг коди"),"",()->show(a));
 }
 static void pickAvatar(MainActivity a,java.util.function.Consumer<String> callback){a.avatarReceiver=callback;Intent intent=new Intent(Intent.ACTION_GET_CONTENT);intent.setType("image/*");intent.addCategory(Intent.CATEGORY_OPENABLE);intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/png","image/jpeg","image/webp"});try{a.startActivityForResult(intent,73);}catch(Exception error){a.avatarReceiver=null;a.message(a.t("Не удалось открыть выбор файла","Could not open file picker","Не вдалося відкрити вибір файлу"));}}
 static void avatarResult(MainActivity a,int result,Intent data){java.util.function.Consumer<String> callback=a.avatarReceiver;a.avatarReceiver=null;if(callback==null||result!=Activity.RESULT_OK||data==null||data.getData()==null)return;android.net.Uri uri=data.getData();new Thread(()->{try(java.io.InputStream input=a.getContentResolver().openInputStream(uri)){
  if(input==null)throw new java.io.IOException();java.io.ByteArrayOutputStream bytes=new java.io.ByteArrayOutputStream();byte[] buffer=new byte[8192];int n,total=0;while((n=input.read(buffer))!=-1){total+=n;if(total>10000000)throw new java.io.IOException();bytes.write(buffer,0,n);}byte[] raw=bytes.toByteArray();BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(raw,0,raw.length,bounds);if(bounds.outWidth<=0||bounds.outHeight<=0||(long)bounds.outWidth*bounds.outHeight>40000000)throw new java.io.IOException();BitmapFactory.Options options=new BitmapFactory.Options();while(Math.max(bounds.outWidth,bounds.outHeight)/Math.max(1,options.inSampleSize)>512)options.inSampleSize=Math.max(1,options.inSampleSize)*2;Bitmap image=BitmapFactory.decodeByteArray(raw,0,raw.length,options);if(image==null)throw new java.io.IOException();int edge=Math.min(image.getWidth(),image.getHeight());Bitmap crop=Bitmap.createBitmap(image,(image.getWidth()-edge)/2,(image.getHeight()-edge)/2,edge,edge);Bitmap small=Bitmap.createScaledBitmap(crop,128,128,true);java.io.ByteArrayOutputStream output=new java.io.ByteArrayOutputStream();small.compress(Bitmap.CompressFormat.PNG,100,output);if(output.size()>65000)throw new java.io.IOException();String encoded="data:image/png;base64,"+android.util.Base64.encodeToString(output.toByteArray(),android.util.Base64.NO_WRAP);if(image!=crop)image.recycle();if(crop!=small)crop.recycle();small.recycle();a.runOnUiThread(()->callback.accept(encoded));
 }catch(Exception error){a.runOnUiThread(()->a.message(a.t("Не удалось прочитать изображение","Could not read image","Не вдалося прочитати зображення")));}},"Veyra avatar").start();}
}
