let options = { hideFocus: true, fakeFullscreen: true, realFullscreen: false };
const w = window.wrappedJSObject, d = w.document;
const fn = f => exportFunction(f, w);
const define = (obj, key, descriptor) => { try { Object.defineProperty(obj, key, descriptor); } catch (_) {} };
const restore = (obj, key, descriptor) => { try { if (descriptor) Object.defineProperty(obj, key, descriptor); else delete obj[key]; } catch (_) {} };
const dispatch = (target, type) => { try { target.dispatchEvent(new w.Event(type, { bubbles: true })); } catch (_) {} };
let fakeFsEl = null;
const original = {
  fullscreenEnabled: Object.getOwnPropertyDescriptor(d, 'fullscreenEnabled'), webkitFullscreenEnabled: Object.getOwnPropertyDescriptor(d, 'webkitFullscreenEnabled'),
  fullscreenElement: Object.getOwnPropertyDescriptor(d, 'fullscreenElement'), webkitFullscreenElement: Object.getOwnPropertyDescriptor(d, 'webkitFullscreenElement'), webkitCurrentFullScreenElement: Object.getOwnPropertyDescriptor(d, 'webkitCurrentFullScreenElement'),
  hidden: Object.getOwnPropertyDescriptor(d, 'hidden'), visibilityState: Object.getOwnPropertyDescriptor(d, 'visibilityState'), hasFocus: d.hasFocus,
  exitFullscreen: Object.getOwnPropertyDescriptor(d, 'exitFullscreen'), webkitExitFullscreen: Object.getOwnPropertyDescriptor(d, 'webkitExitFullscreen'),
  requests: ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'].map(name => Object.getOwnPropertyDescriptor(w.Element.prototype, name)),
  video: w.HTMLVideoElement && Object.getOwnPropertyDescriptor(w.HTMLVideoElement.prototype, 'webkitEnterFullscreen')
};
function apply(next) {
  options = { ...options, ...(next || {}) };
  if (options.fakeFullscreen) {
    for (const key of ['fullscreenEnabled', 'webkitFullscreenEnabled']) define(d, key, { configurable: true, get: fn(() => true) });
    for (const key of ['fullscreenElement', 'webkitFullscreenElement', 'webkitCurrentFullScreenElement']) define(d, key, { configurable: true, get: fn(() => fakeFsEl) });
    const change = target => { dispatch(d, 'fullscreenchange'); dispatch(d, 'webkitfullscreenchange'); dispatch(target || d, 'fullscreenchange'); };
    const requestReal = () => { if (options.realFullscreen) browser.runtime.sendNativeMessage('veyra_presence', 'real-fullscreen-request').catch(() => {}); };
    const enter = function () { fakeFsEl = this; queueMicrotask(() => setTimeout(() => change(this), 0)); requestReal(); return Promise.resolve(); };
    const legacy = function () { fakeFsEl = this; queueMicrotask(() => setTimeout(() => change(this), 0)); requestReal(); };
    for (const name of ['requestFullscreen']) define(w.Element.prototype, name, { configurable: true, writable: true, value: fn(enter) });
    for (const name of ['webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen']) define(w.Element.prototype, name, { configurable: true, writable: true, value: fn(legacy) });
    if (w.HTMLVideoElement) define(w.HTMLVideoElement.prototype, 'webkitEnterFullscreen', { configurable: true, writable: true, value: fn(function () { fakeFsEl = this; queueMicrotask(() => setTimeout(() => { change(this); dispatch(this, 'webkitbeginfullscreen'); }, 0)); requestReal(); }) });
    const exit = fn(() => { const old = fakeFsEl; fakeFsEl = null; queueMicrotask(() => setTimeout(() => change(old), 0)); return Promise.resolve(); });
    define(d, 'exitFullscreen', { configurable: true, writable: true, value: exit });
    define(d, 'webkitExitFullscreen', { configurable: true, writable: true, value: exit });
  } else {
    for (const key of ['fullscreenEnabled', 'webkitFullscreenEnabled', 'fullscreenElement', 'webkitFullscreenElement', 'webkitCurrentFullScreenElement', 'exitFullscreen', 'webkitExitFullscreen']) restore(d, key, original[key]);
    original.requests.forEach((descriptor, index) => restore(w.Element.prototype, ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'][index], descriptor));
    if (w.HTMLVideoElement) restore(w.HTMLVideoElement.prototype, 'webkitEnterFullscreen', original.video);
    fakeFsEl = null;
  }
  if (options.hideFocus) {
    define(d, 'hidden', { configurable: true, get: fn(() => false) });
    define(d, 'visibilityState', { configurable: true, get: fn(() => 'visible') });
    define(d, 'hasFocus', { configurable: true, writable: true, value: fn(() => true) });
  } else {
    restore(d, 'hidden', original.hidden); restore(d, 'visibilityState', original.visibilityState);
    restore(d, 'hasFocus', original.hasFocus ? { configurable: true, writable: true, value: original.hasFocus } : null);
  }
}
window.addEventListener('blur', event => {
  if (!options.hideFocus) return;
  event.stopImmediatePropagation();
  setTimeout(() => { if (options.hideFocus) { dispatch(window, 'focus'); dispatch(d, 'visibilitychange'); } }, 50);
}, true);
apply(options); // Install defaults synchronously at document_start, before the page runs.
browser.runtime.sendNativeMessage('veyra_presence', {}).then(apply).catch(() => {});
