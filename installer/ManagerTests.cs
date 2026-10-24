using System;using System.IO;using System.Linq;using System.Diagnostics;using System.Security.Cryptography;using System.Text;using System.Threading;using System.Threading.Tasks;using System.Web.Script.Serialization;using Org.BouncyCastle.Crypto.Parameters;using Org.BouncyCastle.Crypto.Signers;
namespace Veyra.Setup {
 internal static class ManagerTests {
  static int checks;
  static void Check(bool condition,string message){if(!condition)throw new Exception(message);checks++;}
  static async Task Reject(Func<Task> action,string message){bool failed=false;try{await action();}catch{failed=true;}Check(failed,message);}
  static string Hash(byte[] bytes){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();}
  static string Signed(byte[] zip,object manager,Ed25519PrivateKeyParameters key){var json=new JavaScriptSerializer();string payload=json.Serialize(new{schema=1,version="0.7.0",windows=new{url="https://github.com/nexaridev/veyra/releases/download/v0.7.0/fixture.zip",size=zip.Length,sha256=Hash(zip)},installer=manager});byte[] data=Encoding.UTF8.GetBytes(payload);var signer=new Ed25519Signer();signer.Init(true,key);signer.BlockUpdate(data,0,data.Length);return json.Serialize(new{payload=payload,signature=Convert.ToBase64String(signer.GenerateSignature())});}
  static object Artifact(byte[] bytes,string version="1.3.1",string url="https://github.com/nexaridev/veyra/releases/download/installer-v1.3.1/VeyraSetup.exe"){return new{version=version,url=url,size=bytes.Length,sha256=Hash(bytes)};}
  internal static async Task Run(string root,byte[] zip,byte[] pub,Ed25519PrivateKeyParameters key){
   string own=System.Reflection.Assembly.GetExecutingAssembly().Location;byte[] candidate=File.ReadAllBytes(own);
   string browserSource=Path.Combine(root,"browser-fixture.cs"),browserExe=Path.Combine(root,"browser-fixture.exe");File.WriteAllText(browserSource,"using System.Reflection;[assembly:AssemblyProduct(\"Veyra\")][assembly:AssemblyFileVersion(\"0.7.0.0\")]class B{static void Main(){}}");
   string compiler=Path.Combine(System.Runtime.InteropServices.RuntimeEnvironment.GetRuntimeDirectory(),"csc.exe");using(var build=Process.Start(new ProcessStartInfo(compiler,"/nologo /target:winexe /out:\""+browserExe+"\" \""+browserSource+"\""){UseShellExecute=false,CreateNoWindow=true})){Check(build.WaitForExit(15000)&&build.ExitCode==0,"Browser fixture compilation failed");}
   using(var memory=new MemoryStream()){memory.Write(zip,0,zip.Length);using(var archive=new System.IO.Compression.ZipArchive(memory,System.IO.Compression.ZipArchiveMode.Update,true)){archive.GetEntry("Veyra-win32-x64/Veyra.exe").Delete();var entry=archive.CreateEntry("Veyra-win32-x64/Veyra.exe");using(var output=entry.Open())using(var input=File.OpenRead(browserExe))input.CopyTo(output);}zip=memory.ToArray();}
   string envelope=Signed(zip,Artifact(candidate),key);Release release=Manifest.VerifyWithKey(envelope,pub);
   Check(ManagerUpdates.Needed(release,new Version(1,2,0)),"An update of tools alone must be offered");Check(!ManagerUpdates.Needed(release,new Version(1,3,1,0)),"Equal tool versions must not cause a loop");Check(!ManagerUpdates.Needed(release,new Version(1,4,0)),"Tool downgrade offered");
   await Reject(()=>Task.Run(()=>Manifest.VerifyWithKey(Signed(zip,Artifact(candidate,url:"https://evil.invalid/VeyraSetup.exe"),key),pub)),"Untrusted tool address accepted");
   await Reject(()=>Task.Run(()=>Manifest.VerifyWithKey(Signed(zip,Artifact(candidate,version:"bad"),key),pub)),"Invalid tool version accepted");
   await Reject(()=>Task.Run(()=>Manifest.VerifyWithKey(Signed(zip,new{version="1.3.1",url="https://github.com/nexaridev/veyra/releases/download/installer-v1.3.1/VeyraSetup.exe",size=30000001,sha256=Hash(candidate)},key),pub)),"Oversized tool accepted");
   var local=ManagerUpdates.LocalSetup(Path.Combine(root,"local-launch"));Check(local.File!=own&&File.ReadAllBytes(local.File).SequenceEqual(candidate),"Launcher setup was not staged outside its running executable");
   string cache=Path.Combine(root,"manager-cache");var progress=new TestProgress();PreparedManager prepared;
   using(var network=new Network(new FakeHttp{Zip=candidate},text=>Manifest.VerifyWithKey(text,pub)))prepared=await ManagerUpdates.Download(network,release,progress,CancellationToken.None,cache,new Version(1,2,0));
   var start=ManagerUpdates.StartInfo(prepared,Process.GetCurrentProcess().Id,new Options{Desktop=false,StartMenu=true});Check(!start.UseShellExecute&&start.Arguments.Contains("--upgrade")&&start.Arguments.Contains("--desktop=0")&&start.Arguments.Contains("--start-menu=1"),"Unsafe handoff or lost shortcut choices");
   File.WriteAllText(prepared.File,"modified test fixture");await Reject(()=>Task.Run(()=>ManagerUpdates.StartInfo(prepared,1,new Options())),"A modified verified candidate was accepted");File.WriteAllBytes(prepared.File,candidate);
   byte[] corrupt=(byte[])candidate.Clone();corrupt[corrupt.Length/2]^=1;
   using(var network=new Network(new FakeHttp{Zip=corrupt}))await Reject(()=>ManagerUpdates.Download(network,release,progress,CancellationToken.None,cache,new Version(1,2,0)),"Corrupted tool accepted");
   var other=Manifest.VerifyWithKey(Signed(zip,Artifact(candidate,version:"1.4.0"),key),pub);
   using(var network=new Network(new FakeHttp{Zip=candidate}))await Reject(()=>ManagerUpdates.Download(network,other,progress,CancellationToken.None,cache,new Version(1,2,0)),"Executable version mismatch accepted");
   using(var cts=new CancellationTokenSource())using(var network=new Network(new FakeHttp{Zip=candidate})){cts.Cancel();await Reject(()=>ManagerUpdates.Download(network,release,progress,cts.Token,cache,new Version(1,2,0)),"Cancellation ignored");}Check(Directory.GetDirectories(cache).Length==1,"Failed tool downloads left cache files");
   Check(!ManagerUpdates.WaitForParent(Process.GetCurrentProcess().Id,1),"Self wait accepted");
   using(var caller=Process.Start(new ProcessStartInfo(own,"--wait-probe"){UseShellExecute=false,CreateNoWindow=true})){Check(!ManagerUpdates.WaitForParent(caller.Id,1),"A running caller was not awaited");Check(ManagerUpdates.WaitForParent(caller.Id,5000),"Caller exit was not detected");}
   // This is an isolated installation; no real browser profile or registration is modified.
   var layout=new Layout(Path.Combine(root,"whole-package"));string old=Environment.GetEnvironmentVariable("VEYRA_QA_OLD_MANAGER")??own;
   using(var network=new Network(new FakeHttp{Zip=zip}))await new Installer(layout,new TestIntegration(),old).Install(network,new Options(),progress,CancellationToken.None,release);Integration.CopyManagers(layout);
   if(old!=own)Check(ManagerUpdates.MinimumInstalled(layout,new Version(1,3,1))<new Version(1,3,1),"Old installed tool versions were ignored");
   string sentinel=Path.Combine(root,"untouched-profile");File.WriteAllText(sentinel,"keep");
   byte[] previousSetup=File.ReadAllBytes(layout.SetupExe);var failed=new TestIntegration{Fail=true};using(var network=new Network(new FakeHttp{Zip=new byte[0]}))await Reject(()=>new Installer(layout,failed,prepared.File,null,text=>Manifest.VerifyWithKey(text,pub)).Install(network,new Options(),progress,CancellationToken.None,release,true),"A failed tool commit was accepted");Check(failed.Restored&&File.ReadAllBytes(layout.SetupExe).SequenceEqual(previousSetup)&&File.ReadAllBytes(layout.Exe).SequenceEqual(File.ReadAllBytes(browserExe)),"Tool-only rollback changed the installed browser or setup");
   var handler=new FakeHttp{Zip=new byte[0]};using(var network=new Network(handler))await new Installer(layout,new TestIntegration(),prepared.File,null,text=>Manifest.VerifyWithKey(text,pub)).Install(network,new Options(),progress,CancellationToken.None,release,true);Integration.CopyManagers(layout);
   Check(handler.Calls==0,"An unchanged browser was downloaded again for a tools-only update");Check(File.ReadAllBytes(layout.Exe).SequenceEqual(File.ReadAllBytes(browserExe)),"The browser changed during a tools-only update");
   foreach(string name in new[]{"VeyraSetup.exe","VeyraLauncher.exe","Delete Veyra.exe"})Check(File.ReadAllBytes(Path.Combine(layout.Root,name)).SequenceEqual(candidate),"Whole package replacement failed: "+name);
   if(old!=own)await Reject(()=>Task.Run(()=>ManagerUpdates.RejectDowngrade(layout,old)),"Installed tools could be downgraded");
   Check(File.ReadAllText(sentinel)=="keep","Profile changed");Check(ManagerUpdates.MinimumInstalled(layout,new Version(1,3,1))==new Version(1,3,1),"Updated tools still require repair");
   Console.WriteLine("PASS: "+checks+" whole-package update checks, including legacy replacement, version checks, tamper rejection, cancellation and caller exit");
  }
 }
}


