using System;using System.IO;using System.Diagnostics;using System.Reflection;using System.Linq;using System.Security.Cryptography;using System.Threading;using System.Threading.Tasks;
namespace Veyra.Setup {
 internal sealed class PreparedManager {public string File,Directory;public Release Artifact;}
 internal static class ManagerUpdates {
  internal static Version Normalize(Version version){return new Version(version.Major,version.Minor,Math.Max(0,version.Build));}
  internal static Version Current {get{return Normalize(Assembly.GetExecutingAssembly().GetName().Version);}}
  internal static bool Needed(Release release,Version current){return release.Manager!=null&&Normalize(new Version(release.Manager.Version))>Normalize(current);}
  internal static Version MinimumInstalled(Layout layout,Version running){
   var minimum=Normalize(running);if(!layout.Owns())return minimum;
   foreach(string name in new[]{"VeyraSetup.exe","VeyraLauncher.exe","Delete Veyra.exe"})try{string file=Path.Combine(layout.Root,name);Paths.NoLinks(file);var info=FileVersionInfo.GetVersionInfo(file);Version v;if(info.ProductName!="Veyra Installer"||!Version.TryParse(info.FileVersion,out v))return new Version(0,0,0);v=Normalize(v);if(v<minimum)minimum=v;}catch{return new Version(0,0,0);}return minimum;
  }
  internal static void RejectDowngrade(Layout layout,string candidate){
   if(!File.Exists(layout.SetupExe))return;Paths.NoLinks(layout.SetupExe);
   var installed=FileVersionInfo.GetVersionInfo(layout.SetupExe);var source=FileVersionInfo.GetVersionInfo(candidate);Version oldVersion,newVersion;
   if(installed.ProductName=="Veyra Installer"&&Version.TryParse(installed.FileVersion,out oldVersion)&&Version.TryParse(source.FileVersion,out newVersion)&&Normalize(oldVersion)>Normalize(newVersion))throw new IOException(L.T("Уже установлен более новый установщик. Запусти его."));
  }
  internal static string CacheRoot {get{return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"VeyraInstaller","Updates");}}
  internal static PreparedManager LocalSetup(string cache=null){
   string source=Assembly.GetExecutingAssembly().Location;Paths.NoLinks(source);string parent=cache??CacheRoot;Paths.NoLinks(parent);Directory.CreateDirectory(parent);
   string work=Paths.Child(parent,Guid.NewGuid().ToString("N"));Directory.CreateDirectory(work);
   var item=new PreparedManager{Directory=work,File=Path.Combine(work,"VeyraSetup.exe"),Artifact=new Release{Version=Current.ToString(),Size=new FileInfo(source).Length}};
   using(var hash=SHA256.Create())using(var file=File.OpenRead(source))item.Artifact.Hash=BitConverter.ToString(hash.ComputeHash(file)).Replace("-","").ToLowerInvariant();
   File.Copy(source,item.File,false);Validate(item);return item;
  }
  internal static void Validate(PreparedManager prepared){
   Paths.NoLinks(prepared.File);var info=new FileInfo(prepared.File);if(info.Length!=prepared.Artifact.Size)throw new IOException(L.T("Проверка SHA-256 не пройдена. Файлы не будут установлены."));
   using(var hash=SHA256.Create())using(var file=File.OpenRead(prepared.File)){if(BitConverter.ToString(hash.ComputeHash(file)).Replace("-","").ToLowerInvariant()!=prepared.Artifact.Hash)throw new IOException(L.T("Проверка SHA-256 не пройдена. Файлы не будут установлены."));}
   var metadata=FileVersionInfo.GetVersionInfo(prepared.File);Version actual;
   if(metadata.ProductName!="Veyra Installer"||!Version.TryParse(metadata.FileVersion,out actual)||Normalize(actual)!=Normalize(new Version(prepared.Artifact.Version)))throw new IOException(L.T("Версия файла установщика не совпадает с обновлением."));
  }
  internal static async Task<PreparedManager> Download(Network network,Release release,IProgress<ProgressInfo> progress,CancellationToken token,string cache=null,Version current=null){
   if(!Needed(release,current??Current))return null;
   string parent=cache??CacheRoot;Paths.NoLinks(parent);Directory.CreateDirectory(parent);
   // Only remove our stale, fixed-name cache files. Never recurse through unknown content.
   foreach(var dir in Directory.EnumerateDirectories(parent)){Guid id;if(!Guid.TryParseExact(Path.GetFileName(dir),"N",out id))continue;try{Paths.NoLinks(dir);if(Directory.GetLastWriteTimeUtc(dir)>DateTime.UtcNow.AddDays(-7))continue;string exe=Path.Combine(dir,"VeyraSetup.exe");Paths.NoLinks(exe);if(File.Exists(exe))File.Delete(exe);if(!Directory.EnumerateFileSystemEntries(dir).Any())Directory.Delete(dir);}catch(IOException){}catch(UnauthorizedAccessException){}}
   string work=Paths.Child(parent,Guid.NewGuid().ToString("N"));Directory.CreateDirectory(work);var prepared=new PreparedManager{Directory=work,File=Path.Combine(work,"VeyraSetup.exe"),Artifact=release.Manager};
   try{progress.Report(new ProgressInfo(L.T("Обновляется установщик, лаунчер и удаление…"),-1));await network.Download(release.Manager,prepared.File,progress,token).ConfigureAwait(false);token.ThrowIfCancellationRequested();Validate(prepared);return prepared;}
   catch{try{File.Delete(prepared.File);Directory.Delete(work);}catch(IOException){}throw;}
  }
  internal static ProcessStartInfo StartInfo(PreparedManager prepared,int parent,Options options){Validate(prepared);return new ProcessStartInfo(prepared.File,"--install --upgrade --parent="+parent+" --desktop="+(options.Desktop?"1":"0")+" --start-menu="+(options.StartMenu?"1":"0")){UseShellExecute=false,WorkingDirectory=prepared.Directory};}
  internal static bool WaitForParent(int pid,int timeout=30000){if(pid<=0||pid==Process.GetCurrentProcess().Id)return false;try{using(var process=Process.GetProcessById(pid))return process.WaitForExit(timeout);}catch(ArgumentException){return true;}}
 }
}

