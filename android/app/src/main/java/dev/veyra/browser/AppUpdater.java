package dev.veyra.browser;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.function.Consumer;
import java.util.function.Function;
import org.json.JSONArray;
import org.json.JSONObject;

final class AppUpdater {
 private static final String API="https://api.github.com/repos/nexaridev/veyra/releases?per_page=30";
 private final Activity activity;
 private final Consumer<String> message;
 private final Function<String,String> text;
 private final android.content.SharedPreferences prefs;
 private final BroadcastReceiver receiver;
 private String pendingDigest="";

 AppUpdater(Activity activity,android.content.SharedPreferences prefs,Consumer<String> message,Function<String,String> text){
  this.activity=activity;this.prefs=prefs;this.message=message;this.text=text;
  receiver=new BroadcastReceiver(){@Override public void onReceive(Context context,Intent intent){if(DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())){long id=intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID,-1);if(id==prefs.getLong("appUpdateDownloadId",-2))verifyAndInstall(id);}}};
  IntentFilter filter=new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
  androidx.core.content.ContextCompat.registerReceiver(activity,receiver,filter,androidx.core.content.ContextCompat.RECEIVER_NOT_EXPORTED);
 }

 void check(boolean manual){
  long now=System.currentTimeMillis();if(!manual&&now-prefs.getLong("appUpdateCheckedAt",0)<12*60*60*1000L)return;
  new Thread(()->{HttpURLConnection connection=null;try{
   connection=(HttpURLConnection)new URL(API).openConnection();connection.setConnectTimeout(9000);connection.setReadTimeout(12000);connection.setRequestProperty("Accept","application/vnd.github+json");connection.setRequestProperty("User-Agent","Veyra-Android-Updater");
   if(connection.getResponseCode()!=200)throw new IllegalStateException("Release check returned HTTP "+connection.getResponseCode());
   StringBuilder json=new StringBuilder();try(InputStream stream=connection.getInputStream()){byte[] buffer=new byte[8192];int count;while((count=stream.read(buffer))!=-1){if(json.length()+count>1024*1024)throw new IllegalStateException("Release metadata is too large");json.append(new String(buffer,0,count,java.nio.charset.StandardCharsets.UTF_8));}}
   JSONArray releases=new JSONArray(json.toString());JSONObject apk=null;String latest="";for(int r=0;r<releases.length();r++){JSONObject release=releases.optJSONObject(r);JSONArray assets=release==null?null:release.optJSONArray("assets");if(assets==null)continue;for(int i=0;i<assets.length();i++){JSONObject asset=assets.optJSONObject(i);if(asset==null)continue;String name=asset.optString("name");if(!name.matches("Veyra-Android-[0-9]+\\.[0-9]+\\.[0-9]+\\.apk"))continue;String version=name.substring("Veyra-Android-".length(),name.length()-4);if(apk==null||compare(version,latest)>0){apk=asset;latest=version;}}}
   prefs.edit().putLong("appUpdateCheckedAt",System.currentTimeMillis()).apply();if(apk==null)throw new IllegalStateException("No Android APK was found in the recent releases");
   String digest=apk.optString("digest").replaceFirst("^sha256:","");String current=activity.getPackageManager().getPackageInfo(activity.getPackageName(),0).versionName;
   boolean alreadyCurrent=compare(latest,current)<=0;if(digest.length()!=64||!digest.matches("[a-fA-F0-9]{64}")||alreadyCurrent){if(manual){String result=text.apply(alreadyCurrent?"You have the latest version":"The update release has no verified checksum");activity.runOnUiThread(()->message.accept(result));}return;}
   String url=apk.optString("browser_download_url");if(!url.startsWith("https://github.com/nexaridev/veyra/releases/download/"))throw new IllegalStateException("Unexpected update URL");String finalDigest=digest.toLowerCase(Locale.ROOT),finalUrl=url,finalVersion=latest;
   activity.runOnUiThread(()->new AlertDialog.Builder(activity).setTitle(text.apply("Update available")).setMessage(text.apply("Veyra "+finalVersion+" is available. Download and verify it now?")).setNegativeButton(text.apply("Later"),null).setPositiveButton(text.apply("Download"),(dialog,which)->download(finalUrl,finalDigest,finalVersion)).show());
  }catch(Exception error){if(manual)activity.runOnUiThread(()->message.accept(text.apply("Could not check for updates: "+error.getMessage())));}finally{if(connection!=null)connection.disconnect();}} ,"Veyra app update check").start();
 }

 private void download(String url,String digest,String version){try{DownloadManager manager=(DownloadManager)activity.getSystemService(Context.DOWNLOAD_SERVICE);if(manager==null)throw new IllegalStateException("Android Download Manager unavailable");File dir=activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);if(dir==null)throw new IllegalStateException("App download directory unavailable");if(!dir.exists()&&!dir.mkdirs())throw new IllegalStateException("Cannot create update directory");File file=new File(dir,"Veyra-Android-"+version+".apk");if(file.exists()&&!file.delete())throw new IllegalStateException("Cannot replace the previous update file");DownloadManager.Request request=new DownloadManager.Request(Uri.parse(url)).setTitle("Veyra update").setDescription("Downloading and verifying Veyra "+version).setMimeType("application/vnd.android.package-archive").setAllowedOverMetered(true).setAllowedOverRoaming(false).setDestinationInExternalFilesDir(activity,Environment.DIRECTORY_DOWNLOADS,file.getName()).setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);pendingDigest=digest;long id=manager.enqueue(request);prefs.edit().putLong("appUpdateDownloadId",id).putString("appUpdateDigest",digest).putString("appUpdateFile",file.getAbsolutePath()).apply();message.accept(text.apply("Update download started"));}catch(Exception error){message.accept(text.apply("Could not download update: "+error.getMessage()));}}

 private void verifyAndInstall(long id){new Thread(()->{try{DownloadManager manager=(DownloadManager)activity.getSystemService(Context.DOWNLOAD_SERVICE);if(manager==null)throw new IllegalStateException("Android Download Manager unavailable");DownloadManager.Query query=new DownloadManager.Query().setFilterById(id);try(android.database.Cursor cursor=manager.query(query)){if(cursor==null||!cursor.moveToFirst()||cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))!=DownloadManager.STATUS_SUCCESSFUL)throw new IllegalStateException("Android download did not complete");}String path=prefs.getString("appUpdateFile","");File file=new File(path);if(!file.isFile()||file.length()==0)throw new IllegalStateException("Downloaded APK is missing");String expected=prefs.getString("appUpdateDigest",pendingDigest);MessageDigest sha=MessageDigest.getInstance("SHA-256");try(InputStream input=new java.io.FileInputStream(file)){byte[] buffer=new byte[65536];int count;while((count=input.read(buffer))!=-1)sha.update(buffer,0,count);}StringBuilder actual=new StringBuilder();for(byte value:sha.digest())actual.append(String.format(Locale.ROOT,"%02x",value));if(!actual.toString().equalsIgnoreCase(expected))throw new SecurityException("APK checksum mismatch; update discarded");verifyPackageSigner(file);activity.runOnUiThread(()->install(file));}catch(Exception error){activity.runOnUiThread(()->message.accept(text.apply("Update verification failed: "+error.getMessage())));}} ,"Veyra update verification").start();}

 private void verifyPackageSigner(File file)throws Exception{
  android.content.pm.PackageManager manager=activity.getPackageManager();
  android.content.pm.PackageInfo installed,archive;
  if(Build.VERSION.SDK_INT>=28){
   installed=manager.getPackageInfo(activity.getPackageName(),android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES);
   archive=manager.getPackageArchiveInfo(file.getAbsolutePath(),android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES);
  }else{
   installed=manager.getPackageInfo(activity.getPackageName(),android.content.pm.PackageManager.GET_SIGNATURES);
   archive=manager.getPackageArchiveInfo(file.getAbsolutePath(),android.content.pm.PackageManager.GET_SIGNATURES);
  }
  if(archive==null||!activity.getPackageName().equals(archive.packageName))throw new SecurityException("Downloaded APK is not a Veyra package");
  android.content.pm.Signature[] current,downloaded;
  if(Build.VERSION.SDK_INT>=28){current=installed.signingInfo==null?null:installed.signingInfo.getApkContentsSigners();downloaded=archive.signingInfo==null?null:archive.signingInfo.getApkContentsSigners();}
  else{current=installed.signatures;downloaded=archive.signatures;}
  if(current==null||downloaded==null||current.length==0||current.length!=downloaded.length)throw new SecurityException("Could not verify the Android signing certificate");
  java.util.HashSet<String> expected=new java.util.HashSet<>(),actual=new java.util.HashSet<>();
  for(android.content.pm.Signature signature:current)expected.add(certificateHash(signature));
  for(android.content.pm.Signature signature:downloaded)actual.add(certificateHash(signature));
  if(!expected.equals(actual))throw new SecurityException("Android update signing certificate does not match installed Veyra");
 }
 private static String certificateHash(android.content.pm.Signature signature)throws Exception{
  byte[] digest=MessageDigest.getInstance("SHA-256").digest(signature.toByteArray());StringBuilder value=new StringBuilder();
  for(byte item:digest)value.append(String.format(Locale.ROOT,"%02x",item));return value.toString();
 }
 private void install(File file){try{if(Build.VERSION.SDK_INT>=26&&!activity.getPackageManager().canRequestPackageInstalls()){prefs.edit().putString("appUpdateFile",file.getAbsolutePath()).putBoolean("appUpdateNeedsInstall",true).apply();activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+activity.getPackageName())));message.accept(text.apply("Allow Veyra to install updates, then return here"));return;}verifyPackageSigner(file);Uri apk=FileProvider.getUriForFile(activity,activity.getPackageName()+".fileprovider",file);Intent intent=new Intent(Intent.ACTION_VIEW).setDataAndType(apk,"application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_ACTIVITY_NEW_TASK);prefs.edit().putBoolean("appUpdateNeedsInstall",false).remove("appUpdateFile").remove("appUpdateDigest").remove("appUpdateDownloadId").apply();activity.startActivity(intent);}catch(Exception error){message.accept(text.apply("Could not open Android installer: "+error.getMessage()));}}
 void resumeInstallIfReady(){if(!prefs.getBoolean("appUpdateNeedsInstall",false)||Build.VERSION.SDK_INT<26||!activity.getPackageManager().canRequestPackageInstalls())return;String path=prefs.getString("appUpdateFile","");File file=new File(path);prefs.edit().putBoolean("appUpdateNeedsInstall",false).apply();if(file.isFile())install(file);}
 void close(){try{activity.unregisterReceiver(receiver);}catch(IllegalArgumentException ignored){}}
 private static int compare(String a,String b){try{String[] x=a.split("\\."),y=b.split("\\.");for(int i=0;i<3;i++){int p=Integer.parseInt(x[i]),q=Integer.parseInt(y[i]);if(p!=q)return Integer.compare(p,q);}return 0;}catch(Exception ignored){return -1;}}
}
