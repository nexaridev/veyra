# Veyra 1.0.2 for Windows

Local HTML documents now open through Ctrl+O, Open HTML file in the menu, a file dropped onto the browser toolbar or home page, a file path entered in the address bar, or an HTML file passed to Veyra.exe. Windows registers Veyra as an Open with option for .html and .htm without changing your default association.

Local documents use an isolated persistent session for each project directory. Relative CSS, JavaScript and images work. Local pages do not receive Veyra's privileged interface or Node.js access. Local resource requests must stay within the selected project directory; application and profile directories, AppData and UNC paths are blocked. Camera and other permission requests are denied for local pages. Local HTML tabs are not restored automatically at startup. Drop files onto the toolbar when a website is covering the page area.

Verified with the actual Quiet Garden project: HTML, CSS, JavaScript, planting and local storage, absence of privileged APIs, denied internal files and other directories, Ctrl+O and second instance file arguments. Existing account, popup and close regressions passed. Windows 1.0.2 retains Discord support and other 1.0.1 features. Android remains 0.6.6 and maintenance tools remain 1.3.1. Google compatibility remains experimental.
