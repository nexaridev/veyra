(() => {
  'use strict';
  const defaults = { hideFocus: true, fakeFullscreen: true, realFullscreen: false };
  let options = { ...defaults }, activated = false, fakeFsEl = null, focusListeners = false, suppressedFocusReturn = false, suppressedVisibilityReturn = false;
  const d = document, elementProto = Element.prototype;
  const inherited = (obj, key) => { for (let p = obj; p; p = Object.getPrototypeOf(p)) { const desc = Object.getOwnPropertyDescriptor(p, key); if (desc) return desc; } return null; };
  const descriptors = {
    doc: Object.fromEntries(['fullscreenEnabled','webkitFullscreenEnabled','fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement','exitFullscreen','webkitExitFullscreen','hidden','webkitHidden','mozHidden','visibilityState','webkitVisibilityState','mozVisibilityState','hasFocus'].map(k => [k, Object.getOwnPropertyDescriptor(d, k)])),
    nativeHidden: inherited(d, 'hidden'), nativeVisibility: inherited(d, 'visibilityState'), nativeHasFocus: d.hasFocus,
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
    if (options.hideFocus) {
      for (const key of ['hidden','webkitHidden','mozHidden']) { try { Object.defineProperty(d, key, { configurable: true, get: () => false }); } catch (_) {} }
      for (const key of ['visibilityState','webkitVisibilityState','mozVisibilityState']) { try { Object.defineProperty(d, key, { configurable: true, get: () => 'visible' }); } catch (_) {} }
      try { Object.defineProperty(d, 'hasFocus', { configurable: true, writable: true, value: () => true }); } catch (_) {}
      if (!focusListeners) {
        focusListeners = true;
        const nativeHidden = () => { try { if (descriptors.nativeVisibility?.get) return descriptors.nativeVisibility.get.call(d) === 'hidden'; return descriptors.nativeHidden?.get ? descriptors.nativeHidden.get.call(d) === true : false; } catch (_) { return false; } };
        const nativeFocus = () => { try { return !!descriptors.nativeHasFocus?.call(d); } catch (_) { return true; } };
        const trap = event => {
          if (!options.hideFocus) return;
          const background = nativeHidden() || !nativeFocus();
          const visibility = ['visibilitychange','webkitvisibilitychange','mozvisibilitychange'].includes(event.type);
          const windowBlur = event.type === 'blur' && event.target === window;
          const windowFocus = event.type === 'focus' && event.target === window && suppressedFocusReturn;
          const hiddenChange = visibility && nativeHidden();
          const visibleReturn = visibility && !nativeHidden() && suppressedVisibilityReturn;
          const focusLeaving = event.type === 'focusout' && (background || event.relatedTarget === null && !nativeFocus());
          const lifecycle = ['pagehide','freeze'].includes(event.type) && background;
          const pointerBoundary = ['mouseenter','mouseleave'].includes(event.type) && event.relatedTarget === null && (event.target === window || event.target === d || event.target === d.documentElement);
          if (!hiddenChange && !visibleReturn && !windowBlur && !windowFocus && !focusLeaving && !lifecycle && !pointerBoundary) return;
          if (hiddenChange) suppressedVisibilityReturn = true;
          if (visibleReturn) suppressedVisibilityReturn = false;
          if (windowBlur) suppressedFocusReturn = true;
          if (windowFocus) suppressedFocusReturn = false;
          event.stopImmediatePropagation();
        };
        for (const type of ['visibilitychange','webkitvisibilitychange','mozvisibilitychange','blur','focus','focusout','pagehide','freeze','mouseenter','mouseleave']) window.addEventListener(type, trap, true);
      }
    } else {
      suppressedFocusReturn = false; suppressedVisibilityReturn = false;
      for (const key of ['hidden','webkitHidden','mozHidden','visibilityState','webkitVisibilityState','mozVisibilityState','hasFocus']) restore(d, key, descriptors.doc[key]);
    }
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
  apply(options);
  window.addEventListener('message', event => {
    if (event.source === window && event.data?.__veyraPresence === true && event.data.type === 'config') apply(event.data.config);
  });
})();
