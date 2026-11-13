const w = window.wrappedJSObject;
const fn = f => exportFunction(f, w);
const define = (obj, key, descriptor) => { try { Object.defineProperty(obj, key, descriptor); } catch (_) {} };

window.addEventListener('message', event => {
  if (event.source !== window || event.data?.__veyraPresence !== true) return;
  if (event.data.type === 'page-world-fullscreen-ready') {
    browser.runtime.sendNativeMessage('veyra_presence', 'page-world-fullscreen-ready').catch(() => {});
  } else if (event.data.type === 'real-fullscreen-request') {
    browser.runtime.sendNativeMessage('veyra_presence', 'real-fullscreen-request').catch(() => {});
  }
});

browser.runtime.sendNativeMessage('veyra_presence', {}).then(config => {
  window.postMessage({ __veyraPresence: true, type: 'config', config }, '*');
}).catch(() => {});

let lastClipboardGesture = 0;
for (const name of ['pointerdown', 'keydown', 'click']) document.addEventListener(name, event => {
  if (event.isTrusted) lastClipboardGesture = Date.now();
}, true);
if (w.navigator.clipboard) {
  const denied = () => new w.DOMException('Clipboard text was not approved', 'NotAllowedError');
  const readText = fn(() => {
    if (Date.now() - lastClipboardGesture > 5000) return w.Promise.reject(denied());
    return new w.Promise((resolve, reject) => {
      browser.runtime.sendNativeMessage('veyra_presence', 'clipboard-read-request').then(text => {
        if (typeof text === 'string') resolve(text); else reject(denied());
      }, () => reject(denied()));
    });
  });
  define(w.navigator.clipboard, 'readText', { configurable: true, writable: true, value: readText });
  define(w.navigator.clipboard, 'read', { configurable: true, writable: true, value: fn(() => new w.Promise((resolve, reject) => {
    readText().then(text => {
      try { resolve([new w.ClipboardItem({ 'text/plain': new w.Blob([text], { type: 'text/plain' }) })]); }
      catch (_) { reject(denied()); }
    }, reject);
  })) });
}
