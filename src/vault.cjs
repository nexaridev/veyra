const fs = require('node:fs');
const crypto = require('node:crypto');
const {promisify} = require('node:util');
const derive = promisify(crypto.scrypt);

class PasswordVault {
  constructor(file, storage, changed = () => {}) {
    this.file = file;
    this.storage = storage;
    this.changed = changed;
    this.key = null;
    this.entries = null;
    this.salt = null;
    this.timer = null;
    this.busy = false;
    this.retryAt = 0;
    this.epoch = 0;
  }
  available() {
    return this.storage.isEncryptionAvailable() &&
      !(process.platform === 'linux' && this.storage.getSelectedStorageBackend() === 'basic_text');
  }
  status() {
    return {exists:fs.existsSync(this.file), unlocked:!!this.key, available:this.available(),
      count:this.entries?.length || 0, autoLockMinutes:5};
  }
  touch() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.lock(), 5 * 60 * 1000);
    this.timer.unref?.();
  }
  lock() {
    this.epoch++;
    clearTimeout(this.timer);
    this.key?.fill(0);
    this.key = null;
    this.entries = null;
    this.salt = null;
    this.changed();
  }
  async unlock(passphrase, create = false) {
    if (this.busy) throw Error('Хранилище уже открывается.');
    if (!this.available()) throw Error('Шифрование операционной системы недоступно. Пароли не сохраняются.');
    if (typeof passphrase !== 'string' || passphrase.length > 1024 || passphrase.length < (create ? 12 : 1))
      throw Error('Используй мастер-пароль длиной от 12 символов.');
    if (Date.now() < this.retryAt) throw Error('Подожди несколько секунд перед следующей попыткой.');
    if (create === fs.existsSync(this.file)) throw Error(create ? 'Хранилище уже существует.' : 'Сначала создай хранилище.');
    this.busy = true;
    const epoch = this.epoch;
    let key;
    try {
      let data;
      if (!create) {
        const outer = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        if (outer.version !== 1 || typeof outer.protected !== 'string') throw Error('Некорректный формат хранилища.');
        data = JSON.parse(this.storage.decryptString(Buffer.from(outer.protected, 'base64')));
      }
      const salt = create ? crypto.randomBytes(32) : Buffer.from(data.salt, 'base64');
      if (salt.length !== 32) throw Error('Некорректное хранилище.');
      key = await derive(passphrase, salt, 32, {N:32768, r:8, p:1, maxmem:64*1024*1024});
      let entries = [];
      if (!create) {
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'base64'));
        decipher.setAAD(Buffer.from('Veyra password vault v1'));
        decipher.setAuthTag(Buffer.from(data.tag, 'base64'));
        const plain = Buffer.concat([decipher.update(Buffer.from(data.data, 'base64')), decipher.final()]);
        try { entries = JSON.parse(plain.toString('utf8')); } finally { plain.fill(0); }
        if (!Array.isArray(entries)) throw Error('Некорректное хранилище.');
      }
      if (this.epoch !== epoch) throw Error('Операция отменена блокировкой.');
      this.key?.fill(0);
      this.key = key; this.salt = salt; this.entries = entries;
      if (create) this.persist();
      this.touch(); this.changed();
      return this.status();
    } catch (error) {
      key?.fill(0); this.key = null; this.entries = null;
      this.retryAt = Date.now()+2000;
      throw Error(create ? 'Не удалось создать зашифрованное хранилище.' : 'Неверный мастер-пароль либо хранилище недоступно этому пользователю Windows.');
    } finally { this.busy = false; }
  }
  assertOpen() {
    if (!this.key || !this.entries) throw Error('Сначала разблокируй менеджер паролей.');
    this.touch();
  }
  persist() {
    this.assertOpen();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from('Veyra password vault v1'));
    const plain = Buffer.from(JSON.stringify(this.entries));
    let encrypted;
    try { encrypted = Buffer.concat([cipher.update(plain), cipher.final()]); } finally { plain.fill(0); }
    const envelope = JSON.stringify({salt:this.salt.toString('base64'), iv:iv.toString('base64'),
      tag:cipher.getAuthTag().toString('base64'), data:encrypted.toString('base64')});
    const protectedData = this.storage.encryptString(envelope).toString('base64');
    fs.writeFileSync(this.file+'.tmp', JSON.stringify({version:1, protected:protectedData}), {mode:0o600});
    fs.renameSync(this.file+'.tmp', this.file);
  }
  list() {
    this.assertOpen();
    return this.entries.map(({id,origin,username,updated}) => ({id,origin,username,updated}));
  }
  save({id,origin,username,password}) {
    this.assertOpen();
    let url;
    try {url = new URL(origin);} catch {throw Error('Нужен корректный HTTPS-адрес сайта.');}
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Пароли сохраняются только для HTTPS-сайтов.');
    if (typeof username !== 'string' || username.length > 512 || typeof password !== 'string' || !password || password.length > 4096)
      throw Error('Проверь логин и пароль.');
    const prior = this.entries.find(e => e.id === id) || this.entries.find(e => e.origin === url.origin && e.username === username);
    const entry = {id:prior?.id || crypto.randomUUID(), origin:url.origin, username, password, updated:Date.now()};
    const next = this.entries.filter(e => e.id !== entry.id);
    next.unshift(entry);
    const previous = this.entries;
    this.entries = next;
    try {this.persist();} catch(error) {this.entries=previous;throw error;}
    this.changed(); return entry.id;
  }
  get(id) {
    this.assertOpen();
    const entry = this.entries.find(e => e.id === id);
    if (!entry) throw Error('Запись не найдена.');
    return entry;
  }
  remove(id) {
    this.assertOpen();
    const previous = this.entries;
    this.entries = this.entries.filter(e => e.id !== id);
    try {this.persist();} catch(error) {this.entries=previous;throw error;}
    this.changed();
  }
  generate(length = 24) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_+=';
    length = Math.max(16, Math.min(64, Number(length) || 24));
    let result;
    do {result=Array.from({length},()=>alphabet[crypto.randomInt(alphabet.length)]).join('');}
    while(!/[A-Z]/.test(result)||!/[a-z]/.test(result)||!/[0-9]/.test(result)||!/[!@#$%*_=+-]/.test(result));
    return result;
  }
}
module.exports = {PasswordVault};
