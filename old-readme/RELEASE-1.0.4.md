# Veyra 1.0.4 for Windows

Adds explicit permissions for isolated community widgets. Before installation, Veyra lists requested HTTPS origins and whether the widget wants isolated local storage, then requires confirmation. Previews receive neither permission. Runtime access is limited to fetch/XHR requests to exact approved HTTPS origins; widget storage is separated by widget ID. Cookies, browser profile data, files, clipboard and account access remain unavailable. The Supabase widget publication validator now accepts only this permission format.

Android remains 0.6.6.
