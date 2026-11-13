(() => {
  'use strict';
  const defaults = { hideFocus: true, fakeFullscreen: true, realFullscreen: false };
  let options = { ...defaults }, activated = false, fakeFsEl = null;
  const d = document, elementProto = Element.prototype;
  const descriptors = {
    doc: Object.fromEntries(['fullscreenEnabled','webkitFullscreenEnabled','fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement','exitFullscreen','webkitExitFullscreen','hidden','visibilityState','hasFocus'].map(k => [k, Object.getOwnPropertyDescriptor(d, k)])),
    requests: Object.fromEntries(['requestFullscreen','webkitRequestFullscreen','mozRequestFullScreen','msRequestFullscreen'].map(k => [k, Object.getOwnPropertyDescriptor(elementProto, k)])),
    video: window.HTMLVideoElement && Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'webkitEnterFullscreen')
  };
  const restore = (obj, key, desc) => { try { if (desc) Object.defineProperty(obj, key, desc); else delete obj[key]; } catch (_) {} };
  const emit = (target, type) => { try { (target || d).dispatchEvent(new Event(type, { bubbles: true })); } catch (_) {} };
  const changed = target => { emit(d, 'fullscreenchange'); emit(d, 'webkitfullscreenchange'); emit(target, 'fullscreenchange'); };
  const nativeRequest = descriptors.requests.requestFullscreen?.value;
  const nativeExit = descriptors.doc.exitFullscreen?.value;
  function apply(next) {
    options = { ...options, ...(next || {}) };
    if (!activated) return;
    if (options.fakeFullscreen) {
      for (const key of ['fullscreenEnabled','webkitFullscreenEnabled']) {
        try { Object.defineProperty(d, key, { configurable: true, get: () => true }); } catch (_) {}
      }
      for (const key of ['fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement']) {
        try { Object.defineProperty(d, key, { configurable: true, get: () => fakeFsEl }); } catch (_) {}
      }
      const enter = function (...args) {
        const complete = () => { fakeFsEl = this; queueMicrotask(() => setTimeout(() => changed(this), 0)); };
        if (options.realFullscreen && nativeRequest) {
          const result = nativeRequest.apply(this, args);
          return Promise.resolve(result).then(value => { complete(); return value; });
        }
        complete();
        if (options.realFullscreen) window.postMessage({ __veyraPresence: true, type: 'real-fullscreen-request' }, '*');
        return Promise.resolve();
      };
      const legacy = function (...args) {
        if (options.realFullscreen && nativeRequest) { nativeRequest.apply(this, args); return; }
        fakeFsEl = this;
        queueMicrotask(() => setTimeout(() => changed(this), 0));
        if (options.realFullscreen) window.postMessage({ __veyraPresence: true, type: 'real-fullscreen-request' }, '*');
      };
      try { Object.defineProperty(elementProto, 'requestFullscreen', { configurable: true, writable: true, value: enter }); } catch (_) {}
      for (const key of ['webkitRequestFullscreen','mozRequestFullScreen','msRequestFullscreen']) {
        try { Object.defineProperty(elementProto, key, { configurable: true, writable: true, value: legacy }); } catch (_) {}
      }
      if (window.HTMLVideoElement) {
        try { Object.defineProperty(HTMLVideoElement.prototype, 'webkitEnterFullscreen', { configurable: true, writable: true, value: function () { fakeFsEl = this; queueMicrotask(() => setTimeout(() => { changed(this); emit(this, 'webkitbeginfullscreen'); }, 0)); if (options.realFullscreen) window.postMessage({ __veyraPresence: true, type: 'real-fullscreen-request' }, '*'); } }); } catch (_) {}
      }
      const exit = function () {
        const finish = () => { const old = fakeFsEl; fakeFsEl = null; queueMicrotask(() => setTimeout(() => changed(old), 0)); };
        if (options.realFullscreen && nativeExit) return Promise.resolve(nativeExit.call(d)).then(value => { finish(); return value; });
        finish();
        return Promise.resolve();
      };
      try { Object.defineProperty(d, 'exitFullscreen', { configurable: true, writable: true, value: exit }); } catch (_) {}
      try { Object.defineProperty(d, 'webkitExitFullscreen', { configurable: true, writable: true, value: exit }); } catch (_) {}
    } else {
      for (const key of ['fullscreenEnabled','webkitFullscreenEnabled','fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement','exitFullscreen','webkitExitFullscreen']) restore(d, key, descriptors.doc[key]);
      for (const key of Object.keys(descriptors.requests)) restore(elementProto, key, descriptors.requests[key]);
      if (window.HTMLVideoElement) restore(HTMLVideoElement.prototype, 'webkitEnterFullscreen', descriptors.video);
      fakeFsEl = null;
    }
    if (options.hideFocus) {
      try { Object.defineProperty(d, 'hidden', { configurable: true, get: () => false }); } catch (_) {}
      try { Object.defineProperty(d, 'visibilityState', { configurable: true, get: () => 'visible' }); } catch (_) {}
      try { Object.defineProperty(d, 'hasFocus', { configurable: true, writable: true, value: () => true }); } catch (_) {}
    } else {
      restore(d, 'hidden', descriptors.doc.hidden);
      restore(d, 'visibilityState', descriptors.doc.visibilityState);
      restore(d, 'hasFocus', descriptors.doc.hasFocus);
    }
  }
  function activate(event) {
    if (activated || !event.isTrusted) return;
    activated = true;
    apply(options);
    if (options.fakeFullscreen && d.fullscreenEnabled === true && Object.getOwnPropertyDescriptor(elementProto, 'requestFullscreen')?.value) {
      window.postMessage({ __veyraPresence: true, type: 'page-world-fullscreen-ready' }, '*');
    }
  }
  d.addEventListener('pointerdown', activate, true);
  d.addEventListener('touchend', activate, true);
  window.addEventListener('blur', event => {
    if (!activated || !options.hideFocus) return;
    event.stopImmediatePropagation();
    setTimeout(() => { if (options.hideFocus) { window.dispatchEvent(new Event('focus')); d.dispatchEvent(new Event('visibilitychange')); } }, 50);
  }, true);
  window.addEventListener('message', event => {
    if (event.source === window && event.data?.__veyraPresence === true && event.data.type === 'config') apply(event.data.config);
  });
})();
