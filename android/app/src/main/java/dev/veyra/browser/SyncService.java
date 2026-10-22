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
 private static final String BASE="https://veyra.veyra-nexaridev.workers.dev/api/v1/",KEY_ALIAS="veyra-account-session";
 private final android.content.SharedPreferences storage;private volatile JSONObject auth;
 SyncService(android.content.Context context){storage=context.getSharedPreferences("veyra_account",android.content.Context.MODE_PRIVATE);try{String encoded=storage.getString("session",null);if(encoded!=null){JSONObject box=new JSONObject(encoded);Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,sessionKey(),new GCMParameterSpec(128,bytes(box.getString("iv"))));JSONObject value=new JSONObject(new String(cipher.doFinal(bytes(box.getString("data"))),StandardCharsets.UTF_8));if(value.optString("access_token").matches("[a-f0-9]{64}")&&value.optJSONObject("user")!=null)auth=value;}}catch(Exception ignored){storage.edit().clear().apply();}}
 private javax.crypto.SecretKey sessionKey()throws Exception{java.security.KeyStore store=java.security.KeyStore.getInstance("AndroidKeyStore");store.load(null);if(store.containsAlias(KEY_ALIAS))return (javax.crypto.SecretKey)store.getKey(KEY_ALIAS,null);KeyGenerator generator=KeyGenerator.getInstance("AES","AndroidKeyStore");generator.init(new android.security.keystore.KeyGenParameterSpec.Builder(KEY_ALIAS,android.security.keystore.KeyProperties.PURPOSE_ENCRYPT|android.security.keystore.KeyProperties.PURPOSE_DECRYPT).setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE).build());return generator.generateKey();}
 private void persist(){try{if(auth==null){storage.edit().clear().apply();return;}Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,sessionKey());JSONObject box=new JSONObject().put("iv",b64(cipher.getIV())).put("data",b64(cipher.doFinal(auth.toString().getBytes(StandardCharsets.UTF_8))));storage.edit().putString("session",box.toString()).apply();}catch(Exception ignored){storage.edit().clear().apply();}}
 private boolean accept(JSONObject value)throws Exception{if(value.has("access_token")){auth=new JSONObject().put("access_token",value.getString("access_token")).put("user",value.getJSONObject("user"));persist();return true;}return false;}
 boolean signedIn(){return auth!=null;}
 String email(){JSONObject current=auth;return current==null?"":current.optJSONObject("user").optString("email");}
 JSONObject request(String operation,JSONObject body,boolean signed)throws Exception{
  JSONObject current=auth;if(signed&&current==null)throw new IOException("Sign in first");
  javax.net.ssl.HttpsURLConnection c=(javax.net.ssl.HttpsURLConnection)new URL(BASE+operation).openConnection();
  c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(40000);c.setRequestMethod("POST");c.setRequestProperty("Content-Type","application/json");
  if(signed)c.setRequestProperty("Authorization","Bearer "+current.getString("access_token"));
  try{c.setDoOutput(true);try(OutputStream out=c.getOutputStream()){out.write(body.toString().getBytes(StandardCharsets.UTF_8));}
   int status=c.getResponseCode();InputStream stream=status>=200&&status<300?c.getInputStream():c.getErrorStream();ByteArrayOutputStream out=new ByteArrayOutputStream();if(stream!=null)try(InputStream in=stream){byte[] buffer=new byte[8192];int count;while((count=in.read(buffer))!=-1){if(out.size()+count>24000000)throw new IOException("Response too large");out.write(buffer,0,count);}}
   String text=out.toString("UTF-8");if(status<200||status>=300){if(signed&&status==401){auth=null;persist();}String message="Request failed: "+status;try{message=new JSONObject(text).optString("error",message);}catch(Exception ignored){}throw new IOException(message);}
   return text.isEmpty()?new JSONObject():new JSONObject(text);
  }finally{c.disconnect();}
 }
 static void checkPassword(String password)throws IOException{if(password.length()<12||password.getBytes(StandardCharsets.UTF_8).length>72)throw new IOException("Password: 12+ characters, up to 72 UTF-8 bytes");}
 boolean login(String email,String password,boolean signup)throws Exception{checkPassword(password);return accept(request(signup?"signup":"login",new JSONObject().put("email",email).put("password",password),false));}
 void verify(String email,String code)throws Exception{accept(request("verify",new JSONObject().put("email",email).put("code",code),false));}
 void resetRequest(String email)throws Exception{request("reset-request",new JSONObject().put("email",email),false);}
 void reset(String email,String code,String password)throws Exception{checkPassword(password);accept(request("reset",new JSONObject().put("email",email).put("code",code).put("password",password),false));}
 void changePassword(String current,String password)throws Exception{checkPassword(password);request("password",new JSONObject().put("currentPassword",current).put("password",password),true);auth=null;persist();}
 void deleteAccount(String password)throws Exception{request("delete",new JSONObject().put("currentPassword",password),true);auth=null;persist();}
 void logout(boolean all)throws Exception{try{if(auth!=null)request(all?"logout-all":"logout",new JSONObject(),true);}finally{auth=null;persist();}}
 static byte[] random(int length){byte[] bytes=new byte[length];new SecureRandom().nextBytes(bytes);return bytes;}
 static String b64(byte[] bytes){return Base64.encodeToString(bytes,Base64.NO_WRAP);}
 static byte[] bytes(String value){return Base64.decode(value,Base64.NO_WRAP);}
 static byte[] derive(String phrase,byte[] salt)throws Exception{PBEKeySpec spec=new PBEKeySpec(phrase.toCharArray(),salt,600000,256);try{return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();}finally{spec.clearPassword();}}
 static JSONObject seal(JSONObject value,String phrase)throws Exception{if(phrase.length()<16||phrase.length()>1024)throw new IOException("Use 16–1024 characters");byte[] salt=random(16),iv=random(12),key=derive(phrase,salt);try{Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));return new JSONObject().put("v",1).put("salt",b64(salt)).put("iv",b64(iv)).put("data",b64(cipher.doFinal(value.toString().getBytes(StandardCharsets.UTF_8))));}finally{java.util.Arrays.fill(key,(byte)0);}}
 static JSONObject unseal(JSONObject value,String phrase)throws Exception{if(value.optInt("v")!=1||value.getString("data").length()>2000000||phrase.length()>1024)throw new IOException("Invalid backup");byte[] salt=bytes(value.getString("salt")),iv=bytes(value.getString("iv"));if(salt.length!=16||iv.length!=12)throw new IOException("Invalid backup");byte[] key=derive(phrase,salt);try{Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));return new JSONObject(new String(cipher.doFinal(bytes(value.getString("data"))),StandardCharsets.UTF_8));}finally{java.util.Arrays.fill(key,(byte)0);}}
 void push(String device,JSONArray bookmarks,String phrase)throws Exception{JSONObject value=new JSONObject().put("v",1).put("bookmarks",bookmarks);request("sync-put",new JSONObject().put("device_id",device).put("platform","android").put("payload",seal(value,phrase)),true);}
 JSONArray pull(String phrase)throws Exception{JSONArray rows=request("sync-list",new JSONObject(),true).getJSONArray("rows"),merged=new JSONArray();for(int i=0;i<rows.length();i++){JSONObject value=unseal(rows.getJSONObject(i).getJSONObject("payload"),phrase);if(value.optInt("v")!=1)throw new IOException("Invalid backup");JSONArray list=value.getJSONArray("bookmarks");for(int j=0;j<Math.min(3000,list.length());j++)merged.put(list.get(j));}return merged;}
}
