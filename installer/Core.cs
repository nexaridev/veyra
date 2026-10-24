using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;

namespace Veyra.Setup {
 internal static class L {
  internal static bool English=ReadLanguage();
  static string LanguageFile {get{return System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"VeyraInstaller","language.txt");}}
  static bool ReadLanguage(){try{return System.IO.File.ReadAllText(LanguageFile).Trim()=="en";}catch{return System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName!="ru";}}
  internal static readonly Dictionary<string,string> Messages=new Dictionary<string,string>{{" МБ"," MB"},{" установлена"," installed"},{". Доступна версия ",". Available version: "},{". Обновить перед запуском?",". Update before opening?"},{". Проверяем обновления…",". Checking for updates…"},{"Veyra не найдена. Установи браузер в стандартную папку или положи лаунчер рядом с Veyra.exe.","Veyra was not found. Install it in the default folder or put the launcher next to Veyra.exe."},{"Veyra удалена","Veyra removed"},{"Veyra установлена. Можно открывать браузер.","Veyra is installed. You can open the browser."},{"Архив повреждён.","The archive is damaged."},{"Архив превышает допустимый размер.","The archive exceeds the size limit."},{"Архив содержит повторяющиеся пути.","The archive contains duplicate paths."},{"Архив содержит ссылки.","The archive contains links."},{"Браузер должен быть закрыт.","Close the browser before continuing."},{"В архиве отсутствуют необходимые файлы Veyra.","Required Veyra files are missing from the archive."},{"Версия обновления не поддерживается этим установщиком.","This installer does not support the update version."},{"Всё готово","All done"},{"Готовим браузер к запуску","Getting Veyra ready"},{"Готово","Done"},{"Завершаем текущую операцию…","Finishing the current operation…"},{"Завершение установки","Finishing installation"},{"Загружено больше данных, чем ожидалось.","More data was downloaded than expected."},{"Загрузка Veyra ","Downloading Veyra "},{"Загрузка отменена или истекло время ожидания.","The download was cancelled or timed out."},{"Закрой Veyra и нажми кнопку ещё раз.","Close Veyra and try again."},{"Закрыть","Close"},{"Запустить Veyra","Open Veyra"},{"Запустить без обновления","Open without updating"},{"Ищем установленную версию…","Looking for an installed version…"},{"Лицензии","Licenses"},{"Лицензии Veyra Installer","Veyra Installer licenses"},{"Личный профиль сохранён.","Your profile has been kept."},{"На ПК: ","Installed: "},{"Найдена Veyra ","Found Veyra "},{"Не удалось завершить операцию. ","Could not complete the operation. "},{"Не удалось запустить Veyra: ","Could not open Veyra: "},{"Не удалось прочитать список обновлений.","Could not read the update list."},{"Не указана контрольная сумма обновления.","The update checksum is missing."},{"Недопустимая папка удаления.","Invalid uninstall folder."},{"Недопустимое имя файла в архиве.","Invalid filename in the archive."},{"Недопустимое число файлов в архиве.","Invalid file count in the archive."},{"Недопустимый адрес сборки.","Invalid build address."},{"Недопустимый путь в архиве.","Invalid archive path."},{"Недопустимый размер сборки.","Invalid build size."},{"Неизвестная структура архива.","Unknown archive structure."},{"Неизвестный формат обновления.","Unknown update format."},{"Некорректная папка архива.","Invalid archive folder."},{"Некорректная подпись обновления.","Invalid update signature."},{"Некорректное перенаправление.","Invalid redirect."},{"Некорректный ответ сервера обновлений.","Invalid update server response."},{"Некорректный размер сборки.","Invalid build size."},{"Некорректный размер файла.","Invalid file size."},{"Некорректный список обновлений.","Invalid update list."},{"Обновить","Update"},{"Отказ от удаления ссылки.","Refusing to delete a link."},{"Отмена","Cancel"},{"Отменить","Cancel"},{"Папка установки не должна содержать ссылки или точки перенаправления.","The installation folder must not contain links or reparse points."},{"Папка установки содержит посторонние файлы. Освободи папку Veyra в LocalAppData\\Programs.","The installation folder contains unrelated files. Clear the Veyra folder in LocalAppData\\Programs."},{"Папка: %LOCALAPPDATA%\\Programs\\Veyra","Folder: %LOCALAPPDATA%\\Programs\\Veyra"},{"Переустановить","Reinstall"},{"Подпись обновления недействительна. Установка остановлена.","The update signature is invalid. Installation stopped."},{"Проверка SHA-256 не пройдена. Файлы не будут установлены.","SHA256 verification failed. The files will not be installed."},{"Проверка обновлений недоступна. Запускаем установленную версию.","Update checking is unavailable. Opening the installed version."},{"Проверка обновления","Checking the update"},{"Профиль, закладки и пароли останутся на этом ПК.","Your profile, bookmarks and passwords will stay on this PC."},{"Размер загрузки не совпадает с подписанным описанием.","Download size does not match the signed manifest."},{"Распаковка файлов","Extracting files"},{"Сборка пока не опубликована. Попробуй позже.","The build has not been published yet. Try again later."},{"Сервер загрузки недоступен (","Download server unavailable ("},{"Сервер перенаправил загрузку на недопустимый адрес.","The server redirected the download to an invalid address."},{"Скачаем и проверим актуальную тестовую сборку.","Download and verify the current preview build."},{"Слишком большой ответ сервера.","The server response is too large."},{"Слишком много перенаправлений загрузки.","Too many download redirects."},{"Удаление Veyra","Uninstall Veyra"},{"Удалить","Uninstall"},{"Удалить Veyra, сохранив профиль","Remove Veyra and keep your profile"},{"Удалить браузер?","Uninstall the browser?"},{"Уже установлена более новая версия Veyra.","A newer Veyra version is already installed."},{"Установить","Install"},{"Установить Veyra","Install Veyra"},{"Установка Veyra","Install Veyra"},{"Установка отменена.","Installation cancelled."},{"Установленная версия больше не найдена.","The installed version could no longer be found."},{"Эта папка не принадлежит установщику Veyra.","This folder is not managed by the Veyra installer."},{"Эта сборка предназначена для 64-разрядной Windows.","This build requires 64-bit Windows."},{"Ярлык в меню «Пуск»","Start menu shortcut"},{"Ярлык на рабочем столе","Desktop shortcut"}};
  internal static string T(string text){if(text==null)return "";string translated;if(English){if(Messages.TryGetValue(text,out translated))return translated;return text;}foreach(var item in Messages)if(item.Value==text)return item.Key;return text;}
  static string SwitchText(string text){foreach(var item in Messages.OrderByDescending(x=>English?x.Key.Length:x.Value.Length))text=text.Replace(English?item.Key:item.Value,English?item.Value:item.Key);return text;}
  internal static void Apply(System.Windows.Forms.Control root){if(!(root is System.Windows.Forms.TextBox))root.Text=SwitchText(root.Text);foreach(System.Windows.Forms.Control child in root.Controls)Apply(child);}
  internal static void AddSwitcher(System.Windows.Forms.Control host,System.Windows.Forms.Form root){var button=new System.Windows.Forms.Button{Text="English / Русский",Location=new System.Drawing.Point(408,25),Size=new System.Drawing.Size(128,30),FlatStyle=System.Windows.Forms.FlatStyle.Flat,BackColor=root.BackColor,ForeColor=root.ForeColor};button.FlatAppearance.BorderSize=0;button.Click+=delegate{English=!English;try{System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(LanguageFile));System.IO.File.WriteAllText(LanguageFile,English?"en":"ru");}catch{}Apply(root);};host.Controls.Add(button);}
 }

 internal sealed class Release {
  public string Version, Url, Hash, Envelope;
  public long Size;
 }
 internal sealed class ProgressInfo {
  public readonly string Text; public readonly int Percent;
  public ProgressInfo(string text,int percent){Text=text;Percent=percent;}
 }
 internal sealed class Options { public bool Desktop=true,StartMenu=true; }
 internal interface IIntegration { void Apply(Layout layout,Options options,string version);void Rollback();void Remove(Layout layout); }
 internal sealed class Layout {
  public readonly string Root;
  public string App {get{return Path.Combine(Root,"app");}}
  public string Exe {get{return Path.Combine(App,"Veyra.exe");}}
  public string Marker {get{return Path.Combine(Root,".veyra-managed");}}
  public string SetupExe {get{return Path.Combine(Root,"VeyraSetup.exe");}}
  public const string Ownership="dev.veyra.browser/installer/1";
  public Layout(string root){Root=Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar);}
  public static Layout Current(){return new Layout(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Programs","Veyra"));}
  public bool Owns(){return File.Exists(Marker)&&File.ReadLines(Marker).FirstOrDefault()==Ownership;}
  public void Prepare(){
   Paths.NoLinks(Root);
   if(Directory.Exists(Root)&&!Owns()&&Directory.EnumerateFileSystemEntries(Root).Any())throw new IOException(L.T("Папка установки содержит посторонние файлы. Освободи папку Veyra в LocalAppData\\Programs."));
   Directory.CreateDirectory(Root);if(!Owns())File.WriteAllText(Marker,Ownership+"\n",Encoding.UTF8);
  }
  public void RequireOwned(){Paths.NoLinks(Root);if(!Owns())throw new IOException(L.T("Эта папка не принадлежит установщику Veyra."));}
 }
 internal static class Paths {
  public static string Child(string parent,string relative){string root=Path.GetFullPath(parent).TrimEnd('\\','/')+Path.DirectorySeparatorChar;string target=Path.GetFullPath(Path.Combine(parent,relative));if(!target.StartsWith(root,StringComparison.OrdinalIgnoreCase))throw new IOException(L.T("Недопустимый путь в архиве."));return target;}
  public static void NoLinks(string path){string full=Path.GetFullPath(path);for(string p=full;!String.IsNullOrEmpty(p);p=Path.GetDirectoryName(p)){if((Directory.Exists(p)||File.Exists(p))&&(File.GetAttributes(p)&FileAttributes.ReparsePoint)!=0)throw new IOException(L.T("Папка установки не должна содержать ссылки или точки перенаправления."));}}
  public static void DeleteTree(string owner,string target){
   Child(owner,Path.GetFileName(target));if(!String.Equals(Path.GetDirectoryName(Path.GetFullPath(target)),Path.GetFullPath(owner).TrimEnd('\\'),StringComparison.OrdinalIgnoreCase))throw new IOException(L.T("Недопустимая папка удаления."));
   NoLinks(target);if(!Directory.Exists(target))return;
   foreach(string p in Directory.EnumerateFileSystemEntries(target)){if((File.GetAttributes(p)&FileAttributes.ReparsePoint)!=0)throw new IOException(L.T("Отказ от удаления ссылки."));if(Directory.Exists(p))DeleteTree(target,p);else File.Delete(p);}Directory.Delete(target);
  }
 }
 internal static class Manifest {
  public const string Feed="https://veyra.veyra-nexaridev.workers.dev/downloads/windows.json";
  // Raw Ed25519 key from src/release-config.json. It is a public verification key.
  public const string PublicKey="znn1FR5Q/oBHL8knaSvyNPTFKnt/q/aCqOYFzPbQpFk=";
  public static Release Verify(string text){return VerifyWithKey(text,Convert.FromBase64String(PublicKey));}
  internal static Release VerifyWithKey(string text,byte[] publicKey){
   if(text==null||text.Length>100000)throw new IOException(L.T("Некорректный ответ сервера обновлений."));
   var json=new JavaScriptSerializer{MaxJsonLength=100000,RecursionLimit=16};Dictionary<string,object> box;
   try{box=json.Deserialize<Dictionary<string,object>>(text);}catch(Exception){throw new IOException(L.T("Не удалось прочитать список обновлений."));}
   string payload=Value(box,"payload"),signature=Value(box,"signature");if(payload.Length>65536||signature.Length>100)throw new IOException(L.T("Некорректная подпись обновления."));
   byte[] bytes=Encoding.UTF8.GetBytes(payload),sig;try{sig=Convert.FromBase64String(signature);}catch(FormatException){throw new IOException(L.T("Некорректная подпись обновления."));}
   var verifier=new Ed25519Signer();verifier.Init(false,new Ed25519PublicKeyParameters(publicKey,0));verifier.BlockUpdate(bytes,0,bytes.Length);
   if(sig.Length!=64||!verifier.VerifySignature(sig))throw new IOException(L.T("Подпись обновления недействительна. Установка остановлена."));
   Dictionary<string,object> data=json.Deserialize<Dictionary<string,object>>(payload);object obj;if(!data.TryGetValue("schema",out obj)||Convert.ToInt32(obj)!=1||!data.TryGetValue("windows",out obj)||!(obj is Dictionary<string,object>))throw new IOException(L.T("Неизвестный формат обновления."));
   var win=(Dictionary<string,object>)obj;string version=Value(data,"version"),url=Value(win,"url"),hash=Value(win,"sha256");Version parsed;
   if(!System.Version.TryParse(version,out parsed)||parsed.Build<0||parsed.Revision>=0||parsed<new Version(0,6,2))throw new IOException(L.T("Версия обновления не поддерживается этим установщиком."));
   if(!System.Text.RegularExpressions.Regex.IsMatch(hash,"^[a-f0-9]{64}$"))throw new IOException(L.T("Не указана контрольная сумма обновления."));
   Uri uri;if(!Uri.TryCreate(url,UriKind.Absolute,out uri)||!Network.InitialArtifact(uri))throw new IOException(L.T("Недопустимый адрес сборки."));
   long size;try{size=Convert.ToInt64(win["size"]);}catch(Exception){throw new IOException(L.T("Некорректный размер сборки."));}if(size<1||size>600000000)throw new IOException(L.T("Недопустимый размер сборки."));
   return new Release{Version=version,Url=url,Hash=hash,Size=size,Envelope=text};
  }
  static string Value(Dictionary<string,object> data,string key){object value;if(data==null||!data.TryGetValue(key,out value)||!(value is string))throw new IOException(L.T("Некорректный список обновлений."));return (string)value;}
 }
 internal sealed class Network:IDisposable {
  readonly HttpClient client;readonly Func<string,Release> verify;
  public Network():this(new HttpClientHandler{AllowAutoRedirect=false,AutomaticDecompression=DecompressionMethods.None}){}
  internal Network(HttpMessageHandler handler,Func<string,Release> verifier=null){verify=verifier??Manifest.Verify;client=new HttpClient(handler);client.Timeout=Timeout.InfiniteTimeSpan;client.DefaultRequestHeaders.UserAgent.ParseAdd("VeyraInstaller/1.0");}
  internal static bool Https(Uri uri){return uri.Scheme=="https"&&uri.Port==443&&uri.UserInfo.Length==0&&uri.Fragment.Length==0;}
  internal static bool InitialArtifact(Uri uri){return Https(uri)&&uri.Host=="github.com"&&uri.AbsolutePath.StartsWith("/nexaridev/veyra/releases/download/",StringComparison.Ordinal)&&uri.Query.Length==0;}
  static bool Allowed(Uri uri){return Https(uri)&&((uri.Host=="veyra.veyra-nexaridev.workers.dev"&&uri.AbsolutePath=="/downloads/windows.json"&&uri.Query.Length==0)||(uri.Host=="github.com"&&uri.AbsolutePath.StartsWith("/nexaridev/veyra/releases/",StringComparison.Ordinal))||uri.Host=="release-assets.githubusercontent.com"||uri.Host=="objects.githubusercontent.com");}
  async Task<HttpResponseMessage> Open(Uri uri,CancellationToken token){
   for(int i=0;i<7;i++){
    if(!Allowed(uri)||uri.AbsoluteUri.Length>16000)throw new IOException(L.T("Сервер перенаправил загрузку на недопустимый адрес."));
    HttpResponseMessage response=await client.GetAsync(uri,HttpCompletionOption.ResponseHeadersRead,token).ConfigureAwait(false);
    int status=(int)response.StatusCode;if(status>=300&&status<400){Uri next=response.Headers.Location;if(next==null){response.Dispose();throw new IOException(L.T("Некорректное перенаправление."));}uri=next.IsAbsoluteUri?next:new Uri(uri,next);response.Dispose();continue;}
    if(!response.IsSuccessStatusCode){response.Dispose();throw new IOException(status==404?L.T("Сборка пока не опубликована. Попробуй позже."):L.T("Сервер загрузки недоступен (")+status+").");}return response;
   }throw new IOException(L.T("Слишком много перенаправлений загрузки."));
  }
  public async Task<Release> Latest(CancellationToken token){using(var response=await Open(new Uri(Manifest.Feed),token).ConfigureAwait(false))using(var stream=await response.Content.ReadAsStreamAsync().ConfigureAwait(false))using(var memory=new MemoryStream()){byte[] buffer=new byte[4096];int count;while((count=await stream.ReadAsync(buffer,0,buffer.Length,token).ConfigureAwait(false))>0){if(memory.Length+count>100000)throw new IOException(L.T("Слишком большой ответ сервера."));memory.Write(buffer,0,count);}return verify(new UTF8Encoding(false,true).GetString(memory.ToArray()));}}
  public async Task Download(Release release,string file,IProgress<ProgressInfo> progress,CancellationToken token){
   using(var response=await Open(new Uri(release.Url),token).ConfigureAwait(false)){
    if(response.Content.Headers.ContentLength.HasValue&&response.Content.Headers.ContentLength.Value!=release.Size)throw new IOException(L.T("Размер загрузки не совпадает с подписанным описанием."));
    using(var stream=await response.Content.ReadAsStreamAsync().ConfigureAwait(false))using(var output=new FileStream(file,FileMode.CreateNew,FileAccess.Write,FileShare.None,65536,true))using(var hash=SHA256.Create()){
     byte[] buffer=new byte[65536];int count;long total=0;int last=-1;
     while((count=await stream.ReadAsync(buffer,0,buffer.Length,token).ConfigureAwait(false))>0){total+=count;if(total>release.Size)throw new IOException(L.T("Загружено больше данных, чем ожидалось."));await output.WriteAsync(buffer,0,count,token).ConfigureAwait(false);hash.TransformBlock(buffer,0,count,null,0);int percent=(int)(total*70/release.Size);if(percent!=last){last=percent;progress.Report(new ProgressInfo(L.T("Загрузка Veyra ")+release.Version+" — "+(total/1048576)+" / "+(release.Size/1048576)+L.T(" МБ"),percent));}}
     hash.TransformFinalBlock(new byte[0],0,0);string actual=BitConverter.ToString(hash.Hash).Replace("-","").ToLowerInvariant();if(total!=release.Size||actual!=release.Hash)throw new IOException(L.T("Проверка SHA-256 не пройдена. Файлы не будут установлены."));
    }
   }
  }
  public void Dispose(){client.Dispose();}
 }
 internal static class Archive {
  public static void Extract(string zip,string stage,IProgress<ProgressInfo> progress,CancellationToken token){
   var seen=new HashSet<string>(StringComparer.OrdinalIgnoreCase);long total=0;
   using(var archive=ZipFile.OpenRead(zip)){
    if(archive.Entries.Count<1||archive.Entries.Count>20000)throw new IOException(L.T("Недопустимое число файлов в архиве."));
    int done=0;foreach(var entry in archive.Entries){
     token.ThrowIfCancellationRequested();string name=entry.FullName.Replace('\\','/');if(!name.StartsWith("Veyra-win32-x64/",StringComparison.Ordinal)||name.IndexOf(':')>=0||name.StartsWith("/"))throw new IOException(L.T("Неизвестная структура архива."));
     string relative=name.Substring("Veyra-win32-x64/".Length).TrimEnd('/');if(relative.Length==0){if(entry.Length!=0)throw new IOException(L.T("Некорректная папка архива."));continue;}
     foreach(string part in relative.Split('/')){string stem=part.Split('.')[0];if(part.Length==0||part=="."||part==".."||part.EndsWith(".")||part.EndsWith(" ")||part.IndexOfAny(Path.GetInvalidFileNameChars())>=0||System.Text.RegularExpressions.Regex.IsMatch(stem,"^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])$",System.Text.RegularExpressions.RegexOptions.IgnoreCase))throw new IOException(L.T("Недопустимое имя файла в архиве."));}
     if(((entry.ExternalAttributes>>16)&0xF000)==0xA000||(entry.ExternalAttributes&0x400)!=0)throw new IOException(L.T("Архив содержит ссылки."));
     string target=Paths.Child(stage,relative.Replace('/',Path.DirectorySeparatorChar));if(!seen.Add(target))throw new IOException(L.T("Архив содержит повторяющиеся пути."));total+=entry.Length;if(total>2200000000||entry.Length>900000000)throw new IOException(L.T("Архив превышает допустимый размер."));
     if(name.EndsWith("/")){if(entry.Length!=0)throw new IOException(L.T("Некорректная папка архива."));Directory.CreateDirectory(target);}else{Directory.CreateDirectory(Path.GetDirectoryName(target));using(var input=entry.Open())using(var output=new FileStream(target,FileMode.CreateNew,FileAccess.Write,FileShare.None)){byte[] buffer=new byte[65536];int count;long written=0;while((count=input.Read(buffer,0,buffer.Length))>0){token.ThrowIfCancellationRequested();written+=count;if(written>entry.Length)throw new IOException(L.T("Некорректный размер файла."));output.Write(buffer,0,count);}if(written!=entry.Length)throw new IOException(L.T("Архив повреждён."));}}
     progress.Report(new ProgressInfo(L.T("Распаковка файлов"),70+(++done*23/archive.Entries.Count)));
    }
   }
   foreach(string name in new[]{"Veyra.exe","resources/app.asar","icudtl.dat","LICENSE"})if(!File.Exists(Paths.Child(stage,name.Replace('/',Path.DirectorySeparatorChar))))throw new IOException(L.T("В архиве отсутствуют необходимые файлы Veyra."));
  }
 }
 internal sealed class Installer {
  readonly Layout layout;readonly IIntegration integration;readonly string ownExe;readonly Action guard;
  public Installer(Layout value,IIntegration desktop,string sourceExe,Action beforeCommit=null){layout=value;integration=desktop;ownExe=sourceExe;guard=beforeCommit??delegate{};}
  public async Task<string> Install(Network network,Options options,IProgress<ProgressInfo> progress,CancellationToken token){
   string work=Path.Combine(Path.GetTempPath(),"VeyraSetup-"+Guid.NewGuid().ToString("N")),stage=null,backup=null;Directory.CreateDirectory(work);
   try{
    progress.Report(new ProgressInfo(L.T("Проверка обновления"),-1));Release release=await network.Latest(token).ConfigureAwait(false);
    if(layout.Owns()){var lines=File.ReadAllLines(layout.Marker);Version installed,current;if(lines.Length>1&&Version.TryParse(lines[1],out installed)&&Version.TryParse(release.Version,out current)&&current<installed)throw new IOException(L.T("Уже установлена более новая версия Veyra."));}
    string zip=Path.Combine(work,"veyra.zip");await network.Download(release,zip,progress,token).ConfigureAwait(false);token.ThrowIfCancellationRequested();
    layout.Prepare();stage=Paths.Child(layout.Root,".stage-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(stage);Archive.Extract(zip,stage,progress,token);token.ThrowIfCancellationRequested();
    guard();progress.Report(new ProgressInfo(L.T("Завершение установки"),95));
    bool moved=false,committed=false;string oldMarker=File.ReadAllText(layout.Marker),manager=layout.SetupExe,oldManager=null;
    try{
     layout.RequireOwned();Paths.NoLinks(layout.App);
     if(Directory.Exists(layout.App)){backup=Paths.Child(layout.Root,".previous-"+Guid.NewGuid().ToString("N"));Directory.Move(layout.App,backup);}
     Directory.Move(stage,layout.App);stage=null;moved=true;
     if(!String.Equals(Path.GetFullPath(ownExe),manager,StringComparison.OrdinalIgnoreCase)){
      if(File.Exists(manager)){oldManager=Paths.Child(layout.Root,".setup-previous-"+Guid.NewGuid().ToString("N"));File.Move(manager,oldManager);}File.Copy(ownExe,manager,false);
     }
     File.WriteAllText(layout.Marker,Layout.Ownership+"\n"+release.Version+"\n",Encoding.UTF8);integration.Apply(layout,options,release.Version);using(var license=System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream("bc-license.txt")){if(license!=null)using(var reader=new StreamReader(license))File.WriteAllText(Path.Combine(layout.Root,"ThirdPartyNotices.txt"),reader.ReadToEnd(),Encoding.UTF8);}File.WriteAllText(Path.Combine(layout.Root,"installed-release.json"),release.Envelope,Encoding.UTF8);committed=true;
    }finally{
     if(!committed){try{integration.Rollback();}catch(Exception){}if(moved)Paths.DeleteTree(layout.Root,layout.App);if(backup!=null&&Directory.Exists(backup)){Directory.Move(backup,layout.App);backup=null;}File.WriteAllText(layout.Marker,oldMarker,Encoding.UTF8);if(oldManager!=null){if(File.Exists(manager))File.Delete(manager);File.Move(oldManager,manager);}else if(!String.Equals(Path.GetFullPath(ownExe),manager,StringComparison.OrdinalIgnoreCase)&&File.Exists(manager))File.Delete(manager);}
     else if(oldManager!=null)try{File.Delete(oldManager);}catch(IOException){}
    }
    if(backup!=null)try{Paths.DeleteTree(layout.Root,backup);backup=null;}catch(IOException){}
    progress.Report(new ProgressInfo("Veyra "+release.Version+L.T(" установлена"),100));return release.Version;
   }finally{
    if(stage!=null)try{Paths.DeleteTree(layout.Root,stage);}catch(IOException){}
    try{Paths.DeleteTree(Path.GetTempPath().TrimEnd('\\'),work);}catch(IOException){}
   }
  }
  public void Uninstall(){layout.RequireOwned();Paths.DeleteTree(layout.Root,layout.App);integration.Remove(layout);foreach(string name in new[]{"installed-release.json","ThirdPartyNotices.txt"}){string file=Path.Combine(layout.Root,name);if(File.Exists(file))File.Delete(file);}foreach(string dir in Directory.EnumerateDirectories(layout.Root)){string name=Path.GetFileName(dir);Guid id;if((name.StartsWith(".stage-")&&Guid.TryParseExact(name.Substring(7),"N",out id))||(name.StartsWith(".previous-")&&Guid.TryParseExact(name.Substring(10),"N",out id)))Paths.DeleteTree(layout.Root,dir);}}
 }
}
