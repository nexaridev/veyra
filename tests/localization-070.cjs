const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),i18n=require('../src/locales.js');
const mobile=JSON.parse(fs.readFileSync(path.join(root,'android/app/src/main/assets/account-messages.json'),'utf8'));
for(const name of ['browser-v3.sql','mail-outbox-v3.sql']){const sql=fs.readFileSync(path.join(root,'infrastructure/supabase',name),'utf8');for(const match of sql.matchAll(/'error','([^']+)'/g)){const text=match[1];const en=i18n.translate(text,'en'),ru=i18n.translate(text,'ru');assert(!/[А-Яа-яЁё]/.test(en),name+': '+text);assert(/[А-Яа-яЁё]/.test(ru),name+': '+text);assert(mobile[text]?.en&&mobile[text]?.ru,'Android: '+text)}}
for(const [message,pattern] of [['fetch failed',/интернет/],['The operation was aborted due to timeout',/вовремя/],['Maximum 20 publications',/20/],['internal unknown error',/действие/]])assert.match(i18n.errorMessage(Error(message),'ru'),pattern);
for(const language of ['ru','en'])for(const message of ['fetch failed','Invalid profile','Неверный email или пароль.'])assert(i18n.errorMessage(Error(message),language));
console.log('PASS Russian and English service errors, network failures and Android message parity');
