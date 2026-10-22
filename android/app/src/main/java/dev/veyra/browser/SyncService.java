package dev.veyra.browser;
import org.json.*;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.*;
import javax.crypto.spec.*;
import android.util.Base64;

final class SyncService {
 private final String base,key;private JSONObject auth;
 SyncService(String url,String publishable){base=url;key=publishable;}
 boolean signedIn(){return auth!=null;}
 String email(){return auth==null?"":auth.optJSONObject("user").optString("email");}
 Object request(String path,String method,JSONObject body,boolean signed)throws Exception{
  if(signed&&auth==null)throw new IOException("Sign in first");
  javax.net.ssl.HttpsURLConnection c=(javax.net.ssl.HttpsURLConnection)new URL(base+path).openConnection();
  c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(20000);c.setRequestMethod(method);c.setRequestProperty("apikey",key);c.setRequestProperty("Content-Type","application/json");
  if(signed)c.setRequestProperty("Authorization","Bearer "+auth.getString("access_token"));
  if(path.startsWith("/rest/")&&method.equals("POST"))c.setRequestProperty("Prefer","resolution=merge-duplicates,return=minimal");
  try{if(body!=null){c.setDoOutput(true);try(OutputStream out=c.getOutputStream()){out.write(body.toString().getBytes(StandardCharsets.UTF_8));}}
   int status=c.getResponseCode();InputStream stream=status>=200&&status<300?c.getInputStream():c.getErrorStream();ByteArrayOutputStream out=new ByteArrayOutputStream();if(stream!=null)try(InputStream in=stream){byte[] buffer=new byte[8192];int count;while((count=in.read(buffer))!=-1){if(out.size()+count>24000000)throw new IOException("Response too large");out.write(buffer,0,count);}}
   String text=out.toString("UTF-8");if(status<200||status>=300){String message="Request failed: "+status;try{JSONObject e=new JSONObject(text);message=e.optString("msg",e.optString("message",e.optString("error_description",message)));}catch(Exception ignored){}throw new IOException(message);}
   return text.isEmpty()?null:new JSONTokener(text).nextValue();
  }finally{c.disconnect();}
 }
 boolean login(String email,String password,boolean signup)throws Exception{JSONObject result=(JSONObject)request(signup?"/auth/v1/signup":"/auth/v1/token?grant_type=password","POST",new JSONObject().put("email",email).put("password",password),false);if(result.has("access_token"))auth=result;return auth!=null;}
 void logout()throws Exception{try{if(auth!=null)request("/auth/v1/logout","POST",new JSONObject(),true);}finally{auth=null;}}
 static byte[] random(int length){byte[] bytes=new byte[length];new SecureRandom().nextBytes(bytes);return bytes;}
 static String b64(byte[] bytes){return Base64.encodeToString(bytes,Base64.NO_WRAP);}
 static byte[] bytes(String value){return Base64.decode(value,Base64.NO_WRAP);}
 static byte[] derive(String phrase,byte[] salt)throws Exception{PBEKeySpec spec=new PBEKeySpec(phrase.toCharArray(),salt,600000,256);try{return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();}finally{spec.clearPassword();}}
 static JSONObject seal(JSONObject value,String phrase)throws Exception{if(phrase.length()<16||phrase.length()>1024)throw new IOException("Use 16–1024 characters");byte[] salt=random(16),iv=random(12),key=derive(phrase,salt);try{Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));return new JSONObject().put("v",1).put("salt",b64(salt)).put("iv",b64(iv)).put("data",b64(cipher.doFinal(value.toString().getBytes(StandardCharsets.UTF_8))));}finally{java.util.Arrays.fill(key,(byte)0);}}
 static JSONObject unseal(JSONObject value,String phrase)throws Exception{if(value.optInt("v")!=1||value.getString("data").length()>2000000||phrase.length()>1024)throw new IOException("Invalid backup");byte[] salt=bytes(value.getString("salt")),iv=bytes(value.getString("iv"));if(salt.length!=16||iv.length!=12)throw new IOException("Invalid backup");byte[] key=derive(phrase,salt);try{Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));return new JSONObject(new String(cipher.doFinal(bytes(value.getString("data"))),StandardCharsets.UTF_8));}finally{java.util.Arrays.fill(key,(byte)0);}}
 void push(String device,JSONArray bookmarks,String phrase)throws Exception{JSONObject value=new JSONObject().put("v",1).put("bookmarks",bookmarks);request("/rest/v1/veyra_sync?on_conflict=user_id,device_id","POST",new JSONObject().put("user_id",auth.getJSONObject("user").getString("id")).put("device_id",device).put("platform","android").put("payload",seal(value,phrase)).put("updated_at",java.time.Instant.now().toString()),true);}
 JSONArray pull(String phrase)throws Exception{JSONArray rows=(JSONArray)request("/rest/v1/veyra_sync?user_id=eq."+auth.getJSONObject("user").getString("id")+"&select=payload&order=updated_at.desc&limit=20","GET",null,true),merged=new JSONArray();for(int i=0;i<rows.length();i++){JSONObject value=unseal(rows.getJSONObject(i).getJSONObject("payload"),phrase);if(value.optInt("v")!=1)throw new IOException("Invalid backup");JSONArray list=value.getJSONArray("bookmarks");for(int j=0;j<Math.min(3000,list.length());j++)merged.put(list.get(j));}return merged;}
}
