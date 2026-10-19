import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function viteHmrSuppressor(): Plugin {
  const suppressorCode = `
(function () {
  if (typeof window === 'undefined') return;

  // Suppress uncaught Vite HMR errors
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e && e.reason;
    var msg = (reason && (reason.message || String(reason))) || '';
    if (
      msg.indexOf('WebSocket closed without opened') !== -1 ||
      msg.indexOf('failed to connect to websocket') !== -1 ||
      (msg.indexOf('vite') !== -1 && msg.indexOf('websocket') !== -1)
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('error', function (e) {
    var msg = (e && (e.message || '')) || '';
    if (
      msg.indexOf('WebSocket closed without opened') !== -1 ||
      msg.indexOf('failed to connect to websocket') !== -1 ||
      (msg.indexOf('vite') !== -1 && msg.indexOf('websocket') !== -1)
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);

  // Intercept WebSocket for Vite HMR
  var OriginalWebSocket = window.WebSocket;
  if (!OriginalWebSocket) return;

  function CustomWebSocket(url, protocols) {
    var isViteHmr = false;
    if (typeof protocols === 'string') {
      isViteHmr = protocols === 'vite-hmr';
    } else if (Array.isArray(protocols)) {
      isViteHmr = protocols.indexOf('vite-hmr') !== -1;
    } else if (typeof url === 'string') {
      if (url.indexOf('vite-hmr') !== -1 || (url.slice(-1) === '/' && url.indexOf('/api/ws') === -1)) {
        isViteHmr = true;
      }
    }

    if (isViteHmr) {
      var target = new EventTarget();
      var handlers = {};
      target.url = url;
      target.protocol = 'vite-hmr';
      target.readyState = 0; // CONNECTING
      target.send = function () {};
      target.close = function () {
        target.readyState = 3; // CLOSED
        target.dispatchEvent(new Event('close'));
      };

      ['open', 'message', 'error', 'close'].forEach(function (type) {
        Object.defineProperty(target, 'on' + type, {
          get: function () { return handlers[type] || null; },
          set: function (fn) {
            if (handlers[type]) target.removeEventListener(type, handlers[type]);
            handlers[type] = fn;
            if (fn) target.addEventListener(type, fn);
          }
        });
      });

      setTimeout(function () {
        target.readyState = 1; // OPEN
        target.dispatchEvent(new Event('open'));
        try {
          target.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify({ type: 'connected' })
          }));
        } catch (_) {}
      }, 10);

      return target;
    }

    return new OriginalWebSocket(url, protocols);
  }

  CustomWebSocket.prototype = OriginalWebSocket.prototype;
  CustomWebSocket.CONNECTING = 0;
  CustomWebSocket.OPEN = 1;
  CustomWebSocket.CLOSING = 2;
  CustomWebSocket.CLOSED = 3;

  window.WebSocket = CustomWebSocket;
})();
  `.trim();

  return {
    name: 'vite-hmr-suppressor',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          {
            tag: 'script',
            attrs: { type: 'text/javascript' },
            children: suppressorCode,
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteHmrSuppressor(), react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: false
  }
});
