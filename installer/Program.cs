using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly:AssemblyTitle("Veyra Installer")]
[assembly:AssemblyProduct("Veyra Installer")]
[assembly:AssemblyCompany("Nexaridev")]
[assembly:AssemblyVersion("1.0.0.0")]
[assembly:AssemblyFileVersion("1.0.0.0")]

namespace Veyra.Setup {
 internal static class Program {
  [STAThread]static void Main(string[] args){
   AppDomain.CurrentDomain.AssemblyResolve+=delegate(object sender,ResolveEventArgs e){if(new AssemblyName(e.Name).Name!="BouncyCastle.Cryptography")return null;using(var source=Assembly.GetExecutingAssembly().GetManifestResourceStream("bc.gz"))using(var gzip=new GZipStream(source,CompressionMode.Decompress))using(var memory=new MemoryStream()){gzip.CopyTo(memory);return Assembly.Load(memory.ToArray());}};
   System.Net.ServicePointManager.SecurityProtocol=System.Net.SecurityProtocolType.Tls12;
   Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
   bool created;using(var mutex=new Mutex(true,"Local\\VeyraSetup-"+WindowsIdentity.GetCurrent().User.Value,out created)){if(!created)return;Application.Run(new SetupForm(args.Length==1&&args[0]=="--uninstall"));}
  }
 }
 internal sealed class Integration:IIntegration {
  const string RegistryPath="Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Veyra";
  readonly Dictionary<string,byte[]> shortcuts=new Dictionary<string,byte[]>();readonly Dictionary<string,object> oldValues=new Dictionary<string,object>();readonly Dictionary<string,RegistryValueKind> oldKinds=new Dictionary<string,RegistryValueKind>();bool captured,hadKey;
  static string DesktopLink {get{return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"Veyra.lnk");}}
  static string MenuDirectory {get{return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs),"Veyra");}}
  static string MenuLink {get{return Path.Combine(MenuDirectory,"Veyra.lnk");}}
  internal static void MakeShortcut(string path,Layout layout){
   object shell=Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));object link=null;
   try{dynamic host=shell;link=host.CreateShortcut(path);dynamic shortcut=link;shortcut.TargetPath=layout.Exe;shortcut.WorkingDirectory=layout.App;shortcut.Description="Veyra by Nexaridev";shortcut.IconLocation=layout.Exe+",0";shortcut.Save();}finally{if(link!=null)Marshal.FinalReleaseComObject(link);Marshal.FinalReleaseComObject(shell);}
  }
  static bool OurShortcut(string path,Layout layout){if(!File.Exists(path))return false;object shell=Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));object link=null;try{dynamic host=shell;link=host.CreateShortcut(path);dynamic shortcut=link;return String.Equals((string)shortcut.TargetPath,layout.Exe,StringComparison.OrdinalIgnoreCase);}finally{if(link!=null)Marshal.FinalReleaseComObject(link);Marshal.FinalReleaseComObject(shell);}}
  void CaptureShortcut(string path){if(!shortcuts.ContainsKey(path))shortcuts[path]=File.Exists(path)?File.ReadAllBytes(path):null;}
  public void Apply(Layout layout,Options options,string version){
   captured=true;using(var key=Registry.CurrentUser.OpenSubKey(RegistryPath)){hadKey=key!=null;if(key!=null)foreach(string name in key.GetValueNames()){oldValues[name]=key.GetValue(name,null,RegistryValueOptions.DoNotExpandEnvironmentNames);oldKinds[name]=key.GetValueKind(name);}}
   if(options.Desktop){CaptureShortcut(DesktopLink);MakeShortcut(DesktopLink,layout);}
   if(options.StartMenu){Directory.CreateDirectory(MenuDirectory);CaptureShortcut(MenuLink);MakeShortcut(MenuLink,layout);}
   using(var key=Registry.CurrentUser.CreateSubKey(RegistryPath)){
    key.SetValue("DisplayName","Veyra");key.SetValue("DisplayVersion",version);key.SetValue("Publisher","Nexaridev");key.SetValue("InstallLocation",layout.Root);key.SetValue("DisplayIcon",layout.Exe+",0");key.SetValue("UninstallString","\""+layout.SetupExe+"\" --uninstall");key.SetValue("URLInfoAbout","https://veyra.veyra-nexaridev.workers.dev");key.SetValue("InstallDate",DateTime.Today.ToString("yyyyMMdd"));key.SetValue("NoModify",1,RegistryValueKind.DWord);key.SetValue("NoRepair",1,RegistryValueKind.DWord);
   }
  }
  public void Rollback(){if(!captured)return;foreach(var item in shortcuts){if(item.Value==null){if(File.Exists(item.Key))File.Delete(item.Key);}else File.WriteAllBytes(item.Key,item.Value);}using(var key=Registry.CurrentUser.CreateSubKey(RegistryPath)){foreach(string name in key.GetValueNames())key.DeleteValue(name,false);foreach(var item in oldValues)key.SetValue(item.Key,item.Value,oldKinds[item.Key]);}if(!hadKey)Registry.CurrentUser.DeleteSubKey(RegistryPath,false);}
  public void Remove(Layout layout){
   foreach(string path in new[]{DesktopLink,MenuLink})if(OurShortcut(path,layout))File.Delete(path);if(Directory.Exists(MenuDirectory)&&!Directory.EnumerateFileSystemEntries(MenuDirectory).Any())Directory.Delete(MenuDirectory);
   using(var key=Registry.CurrentUser.OpenSubKey(RegistryPath))if(key!=null&&!String.Equals((string)key.GetValue("InstallLocation"),layout.Root,StringComparison.OrdinalIgnoreCase))return;
   Registry.CurrentUser.DeleteSubKey(RegistryPath,false);
   // Remove default-browser registrations only when they still point to this installation.
   const string command="Software\\Classes\\VeyraURL\\shell\\open\\command";using(var key=Registry.CurrentUser.OpenSubKey(command)){string value=key==null?"":(string)key.GetValue("");if(value!=null&&value.StartsWith("\""+layout.Exe+"\"",StringComparison.OrdinalIgnoreCase)){Registry.CurrentUser.DeleteSubKeyTree("Software\\Classes\\VeyraURL",false);Registry.CurrentUser.DeleteSubKeyTree("Software\\Clients\\StartMenuInternet\\Veyra",false);using(var apps=Registry.CurrentUser.OpenSubKey("Software\\RegisteredApplications",true))if(apps!=null)apps.DeleteValue("Veyra",false);}}
  }
 }
 internal sealed class ProgressBarView:Control {
  public int Value=-1;int tick;readonly System.Windows.Forms.Timer timer=new System.Windows.Forms.Timer{Interval=35};
  public ProgressBarView(){DoubleBuffered=true;timer.Tick+=delegate{tick=(tick+5)%600;Invalidate();};timer.Start();}
  protected override void OnPaint(PaintEventArgs e){e.Graphics.Clear(Color.FromArgb(41,35,52));using(var brush=new SolidBrush(Color.FromArgb(181,155,250))){if(Value>=0)e.Graphics.FillRectangle(brush,0,0,Width*Math.Min(100,Value)/100,Height);else e.Graphics.FillRectangle(brush,(tick%(Width+120))-120,0,120,Height);}}
  protected override void Dispose(bool disposing){if(disposing)timer.Dispose();base.Dispose(disposing);}
 }
 internal sealed class Brand:Control {
  public Brand(){DoubleBuffered=true;}
  protected override void OnPaint(PaintEventArgs e){e.Graphics.SmoothingMode=SmoothingMode.AntiAlias;float scale=Math.Min(Width,Height)/64f;e.Graphics.ScaleTransform(scale,scale);using(var brush=new LinearGradientBrush(new Point(0,0),new Point(64,64),Color.FromArgb(219,200,255),Color.FromArgb(128,91,217))){e.Graphics.FillPolygon(brush,new[]{new PointF(32,5),new PointF(55.4f,18.5f),new PointF(55.4f,45.5f),new PointF(32,59),new PointF(8.6f,45.5f),new PointF(8.6f,18.5f)});}using(var ink=new SolidBrush(Color.FromArgb(33,28,53)))e.Graphics.FillPolygon(ink,new[]{new PointF(16,28),new PointF(32,19),new PointF(48,28),new PointF(32,37)});using(var pen=new Pen(Color.FromArgb(33,28,53),5)){pen.LineJoin=LineJoin.Round;e.Graphics.DrawLines(pen,new[]{new PointF(16,36),new PointF(32,45),new PointF(48,36)});}}
 }
 internal sealed class SetupForm:Form {
  readonly Layout layout=Veyra.Setup.Layout.Current();readonly bool uninstall;readonly Button main=new Button(),cancel=new Button();readonly Label title=new Label(),status=new Label(),percent=new Label();readonly CheckBox desktop=new CheckBox(),startMenu=new CheckBox();readonly ProgressBarView bar=new ProgressBarView();CancellationTokenSource cancellation;bool busy,done,closeRequested;
  [DllImport("user32.dll")]static extern bool ReleaseCapture();[DllImport("user32.dll")]static extern IntPtr SendMessage(IntPtr hwnd,int msg,IntPtr wparam,IntPtr lparam);
  static readonly Color Bg=Color.FromArgb(20,17,27),Fg=Color.FromArgb(238,232,248),Muted=Color.FromArgb(161,151,180),Accent=Color.FromArgb(185,159,252);
  public SetupForm(bool remove){
   uninstall=remove;Text=remove?"Удаление Veyra":"Установка Veyra";ClientSize=new Size(650,470);FormBorderStyle=FormBorderStyle.None;StartPosition=FormStartPosition.CenterScreen;BackColor=Bg;ForeColor=Fg;Font=new Font("Segoe UI",10);AutoScaleMode=AutoScaleMode.Dpi;
   var header=new Panel{Location=new Point(0,0),Size=new Size(650,110),BackColor=Bg};Controls.Add(header);header.MouseDown+=delegate(object s,MouseEventArgs e){if(e.Button==MouseButtons.Left){ReleaseCapture();SendMessage(Handle,0xA1,new IntPtr(2),IntPtr.Zero);}};
   header.Controls.Add(new Brand{Location=new Point(30,22),Size=new Size(64,64)});header.Controls.Add(new Label{Text="Veyra",Font=new Font("Segoe UI",24,FontStyle.Bold),ForeColor=Fg,Location=new Point(106,18),AutoSize=true});header.Controls.Add(new Label{Text="by Nexaridev",ForeColor=Muted,Location=new Point(110,65),AutoSize=true});
   var close=new Button{Text="Закрыть",Location=new Point(548,25),Size=new Size(78,30),FlatStyle=FlatStyle.Flat,BackColor=Bg,ForeColor=Muted};close.FlatAppearance.BorderSize=0;close.Click+=delegate{Close();};header.Controls.Add(close);
   title.Text=remove?"Удалить браузер?":"Установить Veyra";title.Font=new Font("Segoe UI",19,FontStyle.Bold);title.SetBounds(36,126,580,39);Controls.Add(title);
   var path=new Label{Text=remove?"Профиль, закладки и пароли останутся на этом ПК.":"Папка: %LOCALAPPDATA%\\Programs\\Veyra",ForeColor=Muted};path.SetBounds(38,175,574,40);Controls.Add(path);
   desktop.Text="Ярлык на рабочем столе";startMenu.Text="Ярлык в меню «Пуск»";desktop.Checked=startMenu.Checked=true;desktop.SetBounds(38,221,540,28);startMenu.SetBounds(38,253,540,28);foreach(var box in new[]{desktop,startMenu}){box.FlatStyle=FlatStyle.Flat;box.ForeColor=Fg;box.Visible=!remove;Controls.Add(box);}
   status.Text=remove?"Браузер должен быть закрыт.":"Скачаем и проверим актуальную тестовую сборку.";status.ForeColor=Muted;status.SetBounds(38,300,520,48);Controls.Add(status);percent.ForeColor=Muted;percent.TextAlign=ContentAlignment.TopRight;percent.SetBounds(558,300,52,28);Controls.Add(percent);bar.SetBounds(38,356,574,5);bar.Value=0;Controls.Add(bar);
   main.Text=remove?"Удалить":"Установить";main.SetBounds(366,395,246,42);main.FlatStyle=FlatStyle.Flat;main.FlatAppearance.BorderSize=0;main.BackColor=Accent;main.ForeColor=Bg;main.Font=new Font("Segoe UI",10,FontStyle.Bold);main.Click+=async delegate{if(done){if(!uninstall){Process.Start(new ProcessStartInfo(layout.Exe){WorkingDirectory=layout.App,UseShellExecute=true});}Close();}else await Run();};Controls.Add(main);
   cancel.Text="Отмена";cancel.SetBounds(38,395,130,42);cancel.FlatStyle=FlatStyle.Flat;cancel.FlatAppearance.BorderColor=Color.FromArgb(63,51,78);cancel.ForeColor=Fg;cancel.Click+=delegate{Close();};Controls.Add(cancel);
   var licenseButton=new Button{Text="Лицензии",Location=new Point(184,400),Size=new Size(106,32),FlatStyle=FlatStyle.Flat,BackColor=Bg,ForeColor=Muted};licenseButton.FlatAppearance.BorderSize=0;licenseButton.Click+=delegate{using(var source=Assembly.GetExecutingAssembly().GetManifestResourceStream("bc-license.txt"))using(var reader=new StreamReader(source))using(var notice=new Form{Text="Лицензии Veyra Installer",Size=new Size(650,450),StartPosition=FormStartPosition.CenterParent,BackColor=Bg}){notice.Controls.Add(new TextBox{Multiline=true,ReadOnly=true,Dock=DockStyle.Fill,ScrollBars=ScrollBars.Vertical,BackColor=Bg,ForeColor=Fg,Font=new Font("Segoe UI",10),Text=reader.ReadToEnd()});notice.ShowDialog(this);}};Controls.Add(licenseButton);
   FormClosing+=delegate(object sender,FormClosingEventArgs e){if(busy){e.Cancel=true;closeRequested=true;if(cancellation!=null)cancellation.Cancel();status.Text="Завершаем текущую операцию…";}};
  }
  static void RequireClosed(){foreach(var p in Process.GetProcessesByName("Veyra")){using(p){try{if(p.SessionId==Process.GetCurrentProcess().SessionId)throw new IOException("Закрой Veyra и нажми кнопку ещё раз.");}catch(InvalidOperationException){}}}}
  async Task Run(){
   busy=true;main.Enabled=desktop.Enabled=startMenu.Enabled=false;cancel.Text="Отменить";cancellation=new CancellationTokenSource();cancellation.CancelAfter(TimeSpan.FromMinutes(20));
   try{
    if(!Environment.Is64BitOperatingSystem)throw new IOException("Эта сборка предназначена для 64-разрядной Windows.");RequireClosed();var integration=new Integration();var installer=new Installer(layout,integration,Application.ExecutablePath,RequireClosed);
    if(uninstall){await Task.Run(()=>installer.Uninstall());ScheduleOwnRemoval(layout);done=true;title.Text="Veyra удалена";status.Text="Личный профиль сохранён.";main.Text="Готово";bar.Value=100;}
    else{
     var progress=new Progress<ProgressInfo>(value=>{status.Text=value.Text;bar.Value=value.Percent;bar.Invalidate();percent.Text=value.Percent<0?"":value.Percent+"%";if(value.Percent>=95)cancel.Enabled=false;});
     using(var network=new Network())await installer.Install(network,new Options{Desktop=desktop.Checked,StartMenu=startMenu.Checked},progress,cancellation.Token);
     done=true;title.Text="Всё готово";status.Text="Veyra установлена. Можно открывать браузер.";main.Text="Запустить Veyra";cancel.Text="Закрыть";
    }
   }catch(OperationCanceledException){status.Text=closeRequested?"Установка отменена.":"Загрузка отменена или истекло время ожидания.";bar.Value=0;percent.Text="";}
   catch(Exception error){status.Text=error is IOException?error.Message:"Не удалось завершить операцию. "+error.Message;bar.Value=0;percent.Text="";}
   finally{busy=false;cancellation.Dispose();cancellation=null;main.Enabled=true;desktop.Enabled=startMenu.Enabled=!done;cancel.Enabled=true;if(closeRequested)Close();}
  }
  static void ScheduleOwnRemoval(Layout value){
   // The helper only deletes this installer's fixed location, never the browser profile.
   string script=Path.Combine(Path.GetTempPath(),"VeyraUninstall-"+Guid.NewGuid().ToString("N")+".ps1");
   string text=@"param([string]$InstallRoot,[int]$InstallerProcess)
$ErrorActionPreference='Stop'
$expected=[IO.Path]::GetFullPath((Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Programs\Veyra')).TrimEnd('\')
$actual=[IO.Path]::GetFullPath($InstallRoot).TrimEnd('\')
if($actual -ne $expected){exit 1}
Get-Process -Id $InstallerProcess -ErrorAction SilentlyContinue | Wait-Process -ErrorAction SilentlyContinue
if(!(Test-Path -LiteralPath (Join-Path $actual '.veyra-managed'))){exit 1}
if((Get-Content -LiteralPath (Join-Path $actual '.veyra-managed') -TotalCount 1) -ne 'dev.veyra.browser/installer/1'){exit 1}
$rootItem=Get-Item -LiteralPath $actual
if($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint){exit 1}
foreach($name in @('VeyraSetup.exe','.veyra-managed')){Remove-Item -LiteralPath (Join-Path $actual $name) -Force -ErrorAction SilentlyContinue}
if(!(Get-ChildItem -LiteralPath $actual -Force | Select-Object -First 1)){Remove-Item -LiteralPath $actual}
Remove-Item -LiteralPath $PSCommandPath -Force
";
   File.WriteAllText(script,text,new UTF8Encoding(true));string powershell=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"WindowsPowerShell","v1.0","powershell.exe");Process.Start(new ProcessStartInfo(powershell,"-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \""+script+"\" -InstallRoot \""+value.Root+"\" -InstallerProcess "+Process.GetCurrentProcess().Id){UseShellExecute=false,CreateNoWindow=true});
  }
 }
}
